"""Procedural lens-dirt texture (original): soft dust spots, rings and smudges,
denser toward the edges like a real front element. White RGB, alpha = dirt.
Revealed only when bright light (flares, blooms) hits the lens.
Usage: python3 scripts/build_lens_dirt.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "public" / "assets" / "bri" / "lens-dirt.png"
W, H = 1920, 1080


def main():
    rng = np.random.default_rng(77)
    img = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(img)
    for _ in range(420):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        edge = max(abs(x - W / 2) / (W / 2), abs(y - H / 2) / (H / 2))
        if rng.random() > 0.25 + 0.75 * edge:
            continue
        r = rng.uniform(3, 34) * (1.4 if rng.random() < 0.1 else 1)
        a = int(rng.uniform(20, 90))
        if rng.random() < 0.18:
            d.ellipse((x - r, y - r, x + r, y + r), outline=a, width=max(1, int(r / 7)))
        else:
            d.ellipse((x - r, y - r, x + r, y + r), fill=a)
    for _ in range(14):  # smudges
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        pts = [(x + rng.normal(0, 90), y + rng.normal(0, 40)) for _ in range(6)]
        d.line(pts, fill=int(rng.uniform(15, 40)), width=int(rng.uniform(14, 36)))
    img = img.filter(ImageFilter.GaussianBlur(2.2))
    a = np.asarray(img)
    rgba = np.dstack([np.full((H, W, 3), 255, np.uint8), a])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(OUT, optimize=True)
    print(OUT.name, float((a > 10).mean()))


if __name__ == "__main__":
    main()
