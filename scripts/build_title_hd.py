"""Super-HD clean-up of the supplied one-line title (IMG_2140, 934x148).

- removes the dark-green semi-transparent fringe left by its background removal
  (it read as a dark halo / box around the title)
- upscales 3x: colours with Lanczos (edge colours extended from the glyph
  interiors so no dark rim is pulled in), coverage with bicubic + re-sharpened
  anti-aliased edges
Shape, spelling and proportions are unchanged (same aspect ratio).
Usage: python3 scripts/build_title_hd.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "assets" / "title" / "manasik-umroh-title-oneline.png"
OUT = ROOT / "public" / "assets" / "title" / "manasik-umroh-title-oneline-hd.png"
K = 3


def main():
    im = np.asarray(Image.open(SRC).convert("RGBA")).astype(np.float32)
    rgb, a = im[:, :, :3], im[:, :, 3] / 255
    L = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    # glyph coverage: keep bright (white/gold) pixels, drop the dark fringe
    cov = a * np.clip((L - 70) / 90, 0, 1)
    core = cov > 0.6
    # extend interior colours outward so resampling never mixes in dark rim
    _, (iy, ix) = ndimage.distance_transform_edt(~core, return_indices=True)
    rgb_ext = rgb[iy, ix]
    h, w = cov.shape
    big = (w * K, h * K)
    rgb_hd = np.asarray(Image.fromarray(np.clip(rgb_ext, 0, 255).astype(np.uint8)).resize(big, Image.LANCZOS)).astype(np.float32)
    cov_hd = np.asarray(Image.fromarray((cov * 255).astype(np.uint8)).resize(big, Image.BICUBIC)).astype(np.float32) / 255
    cov_hd = ndimage.gaussian_filter(cov_hd, 1.1)
    t = np.clip((cov_hd - 0.25) / 0.5, 0, 1)
    alpha = t * t * (3 - 2 * t)
    out = np.dstack([rgb_hd, alpha * 255]).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(OUT, optimize=True)
    print(OUT.name, out.shape[1], "x", out.shape[0])


if __name__ == "__main__":
    main()
