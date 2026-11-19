"""Split the supplied MANASIK UMROH title artwork into three feathered bands
(MANASIK, UMROH, gold swoosh). The bands are full-size layers whose alpha masks
sum to exactly 1, so stacked with `mix-blend-mode: plus-lighter` they rebuild
the original artwork pixel-for-pixel, and can also move independently.

Usage: python3 scripts/build_title_assets.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
TITLE_DIR = ROOT / "public" / "assets" / "title"
SRC = TITLE_DIR / "manasik-umroh-title.png"

FEATHER = 2.5
LETTER_LUMA = 150  # white / gold glyph pixels (excludes the dark green plate)


def band_of(cy: float) -> int:
    if cy < 395:
        return 0  # MANASIK (+ top ornament)
    if cy > 680:
        return 2  # gold swoosh
    return 1  # UMROH (+ O ornament)


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    arr = np.asarray(img).astype(np.float32)
    from scipy import ndimage

    alpha = arr[:, :, 3]
    luma = arr[:, :, :3].mean(axis=2)
    glyph = (alpha > 200) & (luma > LETTER_LUMA)
    labels, n = ndimage.label(glyph)
    centroids = ndimage.center_of_mass(glyph, labels, range(1, n + 1))
    sizes = ndimage.sum(glyph, labels, range(1, n + 1))
    band_glyph = [np.zeros_like(glyph) for _ in range(3)]
    for i, ((cy, _cx), size) in enumerate(zip(centroids, sizes), start=1):
        if size < 30:
            continue
        band_glyph[band_of(cy)] |= labels == i
    # every pixel (plate, glow) belongs to the band of its nearest glyph
    dists = np.stack([ndimage.distance_transform_edt(~g) for g in band_glyph])
    owner = np.argmin(dists, axis=0)
    masks = []
    for b in range(3):
        m = Image.fromarray(((owner == b) * 255).astype(np.uint8), "L")
        masks.append(np.asarray(m.filter(ImageFilter.GaussianBlur(FEATHER))).astype(np.float32))
    total = np.maximum(sum(masks), 1e-3)
    meta = {"width": w, "height": h, "bands": {}}
    for name, m in zip(("manasik", "umroh", "swoosh"), masks):
        n = m / total
        out = arr.copy()
        out[:, :, 3] = arr[:, :, 3] * n
        im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")
        im.save(TITLE_DIR / f"title-{name}.png", optimize=True)
        a = out[:, :, 3] > 60
        ys, xs = np.where(a)
        meta["bands"][name] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    (ROOT / "src" / "data" / "titleBands.json").write_text(json.dumps(meta, indent=2))
    print(meta)


if __name__ == "__main__":
    main()
