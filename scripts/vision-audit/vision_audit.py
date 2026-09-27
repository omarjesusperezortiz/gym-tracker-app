#!/usr/bin/env python3
"""Send one sprite sheet to Claude vision and save per-tile verdicts.

Usage: vision_audit.py <sprite-num> [model]
Reads /tmp/audit-sprite-NN.{jpg,json}; writes /tmp/audit-results-NN.json.
Uses ANTHROPIC_API_KEY explicitly (never an OAuth token).
"""
import base64, json, os, re, sys
import anthropic

PRICES = {"claude-sonnet-4-5": (3.0, 15.0), "claude-opus-5-5": (4.0, 20.0), "claude-sonnet-5": (2.0, 10.0)}
MAX_CALL_COST = 0.20

num = int(sys.argv[1])
model = sys.argv[2] if len(sys.argv) > 2 else "claude-sonnet-4-5"
meta = json.load(open(f"/tmp/audit-sprite-{num:02d}.json"))
img = base64.standard_b64encode(open(f"/tmp/audit-sprite-{num:02d}.jpg", "rb").read()).decode()

expected = "\n".join(
    f'{m["n"]}: slot name(s) {" / ".join(repr(x) for x in m["names"])}; '
    f'declared target muscle: {", ".join(m["expectedMuscle"])}; equipment: {", ".join(m["equip"]) or "?"}'
    for m in meta
)
prompt = f"""I'm auditing a fitness app's exercise animations. Each numbered tile is the first frame of a 3D anatomy render for one exercise. The red-highlighted body part is the primary worked muscle.

Some tiles are mislabeled upstream (e.g. an entry named "One-Arm Dumbbell Row" was actually an upright row). A tile is a MISMATCH if EITHER the red muscle clearly contradicts the declared target, OR the pose/equipment/movement clearly shows a different exercise than the slot name (even if the muscle is similar). Remember it's only the first frame, so judge the setup/start position, not the full rep. Use UNCLEAR when you genuinely can't tell (tiny highlight, ambiguous start position).

For each numbered tile report:
- n: the tile number
- highlighted: the muscles that look highlighted in red
- observed: a short description of the pose/equipment/likely exercise you actually see
- verdict: MATCH / MISMATCH / UNCLEAR
- reason: one short sentence (required for MISMATCH/UNCLEAR)

Here's what each tile SHOULD be:
{expected}

Output STRICT JSON only, no prose, no code fences: [{{"n":1,"highlighted":"...","observed":"...","verdict":"MATCH","reason":""}}, ...]"""

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
resp = client.messages.create(
    model=model,
    max_tokens=8000,
    messages=[{"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": img}},
        {"type": "text", "text": prompt},
    ]}],
)
pin, pout = PRICES.get(model, (5.0, 25.0))
cost = resp.usage.input_tokens / 1e6 * pin + resp.usage.output_tokens / 1e6 * pout
text = "".join(b.text for b in resp.content if b.type == "text")
m = re.search(r"\[.*\]", text, re.S)
results = json.loads(m.group(0)) if m else []
byn = {m["n"]: m for m in meta}
for r in results:
    r.update({k: byn[r["n"]][k] for k in ("names", "edbId", "expectedMuscle", "equip", "edbName", "tables")} if r.get("n") in byn else {})
out = {"sprite": num, "model": model, "stop_reason": resp.stop_reason,
       "usage": {"input": resp.usage.input_tokens, "output": resp.usage.output_tokens}, "cost_usd": round(cost, 4),
       "results": results}
json.dump(out, open(f"/tmp/audit-results-{num:02d}.json", "w"), indent=1)
print(f"sprite {num:02d} {model}: {len(results)}/{len(meta)} tiles, in={resp.usage.input_tokens} out={resp.usage.output_tokens} cost=${cost:.4f} stop={resp.stop_reason}")
if cost > MAX_CALL_COST:
    print("BUDGET EXCEEDED — stopping"); sys.exit(2)
