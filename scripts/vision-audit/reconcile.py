#!/usr/bin/env python3
"""Merge per-sprite results into /tmp/audit-report.md and /tmp/audit-summary.json."""
import glob, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
has = lambda i: all(os.path.exists(os.path.join(ROOT, "apps/web/public/exercise-media", p)) for p in (f"{i}.webp", f"posters/{i}.jpg"))
rows = []
for f in sorted(glob.glob("/tmp/audit-results-*.json")):
    rows += json.load(open(f))["results"]
rows.sort(key=lambda r: r["names"][0].lower())
by = {"MISMATCH": [], "UNCLEAR": [], "MATCH": []}
for r in rows:
    by[r["verdict"]].append(r)

def slot(r): return " / ".join(r["names"])
L = ["# Exercise animation vision audit", "",
     f"Audited **{len(rows)}** unique EDB ids (118 slot/variation entries; `Band Pull Apart` skipped — uses an external `imgOverride`).",
     f"Vision: Claude Opus 5.5, in-session, on 5 numbered 5×4 sprite sheets (300px tiles, first frame) plus mid-rep frame strips for every suspect and every candidate.", "",
     f"| Verdict | Count |", "|---|---|", *[f"| {k} | {len(v)} |" for k, v in by.items()], "",
     "## MISMATCH — wrong exercise for the slot", ""]
def cands(r):
    out = []
    for c in r.get("candidates", []):
        if c["id"] == "__override__":
            out.append(f"  - _imgOverride_ — {c['name']} ({c['note']})")
        else:
            out.append(f"  - `{c['id']}` {c['name']} — {c['note']}{'' if c['assets'] else ' **(asset missing)**'}")
    return out
for r in by["MISMATCH"]:
    L += [f"### {slot(r)} — `{r['edbId']}` (EDB: _{r['edbName']}_)",
          f"- Declared: **{', '.join(r['expectedMuscle'])}** · {', '.join(r['equip'])}",
          f"- Actual: **{r['highlighted']}** — {r['observed']}",
          f"- Why: {r['reason']}", "- Candidates:", *cands(r), ""]
L += ["## UNCLEAR — close variant or contradicts a qualifier in the slot name (your call)", ""]
for r in by["UNCLEAR"]:
    L += [f"### {slot(r)} — `{r['edbId']}` (EDB: _{r['edbName']}_)",
          f"- Declared: **{', '.join(r['expectedMuscle'])}** · Actual: **{r['highlighted']}** — {r['observed']}",
          f"- Why: {r['reason']}", "- Candidates:", *cands(r), ""]
L += ["## MATCH", "", f"**{len(by['MATCH'])}** ids match: the highlighted muscle and the movement both fit the slot.", "",
      "Matches with a note:", ""]
L += [f"- {slot(r)} (`{r['edbId']}`): {r['note']}" for r in by["MATCH"] if r.get("note")]
L += ["", "## Method caveats", "",
      "- Red highlight follows EDB's anatomy convention: lunges and squats light up the quads even when the declared target is glutes. That alone was not counted as a mismatch.",
      "- Tiles were judged on the first frame; every suspect was re-checked on start, ¼, ½ and ¾ frames of the animated webp.",
      "- Candidates marked 'verified' were viewed frame by frame. 'Not visually checked' means a label-only match, and EDB labels are exactly what's unreliable here.",
      "- Posture qualifiers (seated/standing) are listed under UNCLEAR, not MISMATCH. The muscle is right and only the stance differs."]
open("/tmp/audit-report.md", "w").write("\n".join(L) + "\n")
summary = {"matched": len(by["MATCH"]), "mismatched": len(by["MISMATCH"]), "unclear": len(by["UNCLEAR"]),
           "details": [{k: r.get(k) for k in ("names", "edbId", "edbName", "expectedMuscle", "highlighted", "observed", "verdict", "reason", "note", "candidates")} for r in rows]}
json.dump(summary, open("/tmp/audit-summary.json", "w"), indent=1, ensure_ascii=False)
print({k: len(v) for k, v in by.items()})
