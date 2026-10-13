#!/usr/bin/env python3
"""
Make web-sized copies of every photo in website/images/.

  python3 tools/optimize-images.py

Writes (same file name as the original):
  website/images/web/<name>    max 1800px  - used in the lightbox / showcase
  website/images/thumb/<name>  max 900px   - used in gallery grids

Originals are never touched. Re-run after adding new photos. The site falls
back to the original file if an optimized copy is missing, so forgetting to
run this only costs page speed.
Requires Pillow:  pip3 install Pillow
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent / "website" / "images"
SKIP = {"logo.png", "mockup.png", "header.png"}
SIZES = {"web": 1800, "thumb": 900}

for name, size in SIZES.items():
    (ROOT / name).mkdir(exist_ok=True)

for src in sorted(ROOT.iterdir()):
    if not src.is_file() or src.name in SKIP or src.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        continue
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    for folder, size in SIZES.items():
        out = ROOT / folder / src.name
        if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
            continue
        copy = img.copy()
        copy.thumbnail((size, size), Image.LANCZOS)
        copy.save(out, "JPEG", quality=80, optimize=True, progressive=True)
    print("ok", src.name)
