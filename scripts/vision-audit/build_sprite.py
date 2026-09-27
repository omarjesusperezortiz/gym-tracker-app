#!/usr/bin/env python3
"""Build numbered sprite sheets of EDB posters for the vision audit.

Reads /tmp/vision-audit/entries.json (extracted from exerciseMedia.ts), groups
slots by EDB id, and writes /tmp/audit-sprite-NN.jpg + .json (tile -> meta).
"""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
POSTERS = os.path.join(ROOT, "apps/web/public/exercise-media/posters")
COLS, ROWS, TILE = 5, 4, 300
PER = COLS * ROWS

entries = json.load(open("/tmp/vision-audit/entries.json"))
edb = {x["id"]: x for x in json.load(open(os.path.join(ROOT, "apps/web/public/edb/exercises.json")))}

groups = {}
for e in entries:
    if e["override"]:
        continue
    groups.setdefault(e["edbId"], []).append(e)
items = []
for eid, es in groups.items():
    items.append({
        "edbId": eid,
        "names": [e["name"] for e in es],
        "tables": sorted({e["table"] for e in es}),
        "expectedMuscle": sorted({e["target"] for e in es}),
        "equip": sorted({e["equip"] for e in es if e["equip"]}),
        "edbName": edb[eid]["name"],
    })
items.sort(key=lambda x: x["names"][0].lower())

font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 30)

def tile(eid):
    im = Image.open(os.path.join(POSTERS, f"{eid}.jpg")).convert("RGB")
    # trim near-white margins, then pad back to square
    bg = Image.new("RGB", im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert("L").point(lambda p: 255 if p > 20 else 0)
    box = diff.getbbox()
    if box:
        im = im.crop(box)
    s = max(im.size) + 16
    sq = Image.new("RGB", (s, s), (255, 255, 255))
    sq.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    return sq.resize((TILE, TILE), Image.LANCZOS)

only = int(sys.argv[1]) if len(sys.argv) > 1 else None
for si in range(0, len(items), PER):
    num = si // PER + 1
    if only and num != only:
        continue
    chunk = items[si:si + PER]
    rows = (len(chunk) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * TILE, rows * TILE), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    meta = []
    for i, it in enumerate(chunk):
        n = si + i + 1
        x, y = (i % COLS) * TILE, (i // COLS) * TILE
        sheet.paste(tile(it["edbId"]), (x, y))
        d.rectangle([x, y, x + TILE - 1, y + TILE - 1], outline=(160, 160, 160), width=2)
        d.rectangle([x + 2, y + 2, x + 62, y + 40], fill=(20, 20, 20))
        d.text((x + 8, y + 5), str(n), font=font, fill=(255, 255, 255))
        meta.append({"n": n, **it})
    sheet.save(f"/tmp/audit-sprite-{num:02d}.jpg", quality=90)
    json.dump(meta, open(f"/tmp/audit-sprite-{num:02d}.json", "w"), indent=1)
    print(f"sprite {num:02d}: tiles {si+1}-{si+len(chunk)} {sheet.size}")
