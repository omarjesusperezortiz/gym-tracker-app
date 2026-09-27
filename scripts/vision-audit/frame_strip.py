#!/usr/bin/env python3
"""Contact strip of frames (start / 1/4 / 1/2 / 3/4) from each animated webp, one row per id."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out, ids = sys.argv[1], sys.argv[2:]
T = int(os.environ.get("T", 280))
font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
sheet = Image.new("RGB", (T * 4, T * len(ids)), "white")
d = ImageDraw.Draw(sheet)
for r, i in enumerate(ids):
    im = Image.open(os.path.join(ROOT, "apps/web/public/exercise-media", f"{i}.webp"))
    n = getattr(im, "n_frames", 1)
    for c, f in enumerate([0, n // 4, n // 2, 3 * n // 4]):
        im.seek(f)
        sheet.paste(im.convert("RGB").resize((T, T)), (c * T, r * T))
    d.rectangle([0, r * T, 150, r * T + 30], fill="black")
    d.text((5, r * T + 3), i, font=font, fill="white")
sheet.save(out, quality=88)
print(out, sheet.size)
