"""Generate soft volumetric cloud textures (original, procedural fBm noise).

Writes public/assets/bri/cloud-{0,1,2}.png: white RGB with alpha = cloud
density. Used for drifting mist and the cloud pass transitions.
Usage: python3 scripts/build_cloud_textures.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

OUT = Path(__file__).resolve().parent.parent / "public" / "assets" / "bri"
W, H = 1600, 800


def fbm(rng, octaves=6, base=4):
    acc = np.zeros((H, W), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        f = base * 2**o
        g = rng.random((int(H / W * f) + 3, f + 3)).astype(np.float32)
        layer = ndimage.zoom(g, (H / (g.shape[0] - 3), W / (g.shape[1] - 3)), order=3)[:H, :W]
        acc += layer * amp
        total += amp
        amp *= 0.55
    return acc / total


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for i, (seed, cover, soft) in enumerate([(11, 0.48, 0.16), (23, 0.52, 0.2), (37, 0.44, 0.14)]):
        rng = np.random.default_rng(seed)
        n = fbm(rng)
        yy, xx = np.mgrid[0:H, 0:W]
        # fade to the edges so a layer never shows a hard border
        edge = np.minimum.reduce([xx / (W * 0.18), (W - xx) / (W * 0.18), yy / (H * 0.22), (H - yy) / (H * 0.22), np.ones_like(xx, float)])
        dens = np.clip((n - cover) / soft, 0, 1) ** 1.4 * np.clip(edge, 0, 1)
        dens = ndimage.gaussian_filter(dens, 2.0)
        shade = 0.82 + 0.18 * np.clip((n - cover) / (soft * 2), 0, 1)
        rgb = np.dstack([shade * 255] * 3)
        img = np.dstack([rgb, dens * 255]).astype(np.uint8)
        Image.fromarray(img, "RGBA").save(OUT / f"cloud-{i}.png", optimize=True)
        print(f"cloud-{i}.png coverage={float((dens > 0.05).mean()):.2f}")


if __name__ == "__main__":
    main()
