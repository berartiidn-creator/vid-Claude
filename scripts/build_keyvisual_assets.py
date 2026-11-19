"""Build animation layers from the supplied key visual (no redrawing).

Everything is derived from public/assets/keyvisual/keyvisual-original.png:
  kv-base.png         1920x1080 Lanczos upscale (the animated background plate)
  kv-text.png         static typography layer (logo, title, tagline plaque, swoosh)
  kv-glyph-mask.png   glyph-only mask for the golden light sweep
  kv-lines-*.png      bright line-structure masks per region (city, kaaba, dome,
                      minarets, floor, clouds, ribbons) used to light the
                      existing linework without changing its shape
  src/data/keyvisual.json  window lights, grid dots, ribbon centrelines, anchors

Usage: python3 scripts/build_keyvisual_assets.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
KV = ROOT / "public" / "assets" / "keyvisual"
SRC = KV / "keyvisual-original.png"
W, H = 1920, 1080

# ---- Regions in ORIGINAL image pixels (1672 x 941) -------------------------
TEXT_RECTS = {
    "logo": (545, 105, 1120, 258),
    "title": (330, 262, 1355, 442),
    "plaque": (378, 440, 1306, 520),
    "swoosh": (585, 515, 1090, 566),
}
PLAQUE_BODY = (382, 445, 1303, 517)
KAABA = [(90, 525), (205, 466), (370, 513), (372, 714), (240, 724), (90, 708)]
DOME = {"c": (1485, 576), "r": 116, "finial": (1466, 422, 1504, 482), "ymax": 655}
MINARETS = [
    (112, 205, 208, 482),  # clock tower (left)
    (396, 535, 418, 692),
    (512, 598, 530, 692),
    (1242, 598, 1264, 692),
    (1292, 565, 1314, 692),
    (1338, 490, 1368, 692),
    (1566, 292, 1648, 650),
    (1648, 500, 1672, 692),
]
CITY = [(0, 200, 400, 702), (395, 548, 1285, 702), (1262, 290, 1672, 702)]
FLOOR = (0, 700, 1672, 941)
CLOUDS = [(0, 0, 480, 245), (1170, 35, 1500, 185)]
RIBBON_TR = [(1160, 285), (1250, 250), (1330, 238), (1400, 250), (1460, 262), (1520, 235), (1570, 195), (1610, 140), (1650, 90), (1690, 45)]
RIBBON_BL = [(-20, 776), (100, 795), (200, 820), (300, 850), (400, 870), (480, 852), (540, 832), (620, 845), (700, 880), (790, 930)]


def sx(v):
    return v * W / 1672


def sy(v):
    return v * H / 941


def rect_mask(rects, shape):
    m = Image.new("L", (shape[1], shape[0]), 0)
    d = ImageDraw.Draw(m)
    for x0, y0, x1, y1 in rects:
        d.rectangle((sx(x0), sy(y0), sx(x1), sy(y1)), fill=255)
    return np.asarray(m) > 0


def poly_mask(pts, shape):
    m = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(m).polygon([(sx(x), sy(y)) for x, y in pts], fill=255)
    return np.asarray(m) > 0


def dome_mask(shape):
    m = Image.new("L", (shape[1], shape[0]), 0)
    d = ImageDraw.Draw(m)
    cx, cy = DOME["c"]
    r = DOME["r"]
    d.ellipse((sx(cx - r), sy(cy - r), sx(cx + r), sy(cy + r)), fill=255)
    x0, y0, x1, y1 = DOME["finial"]
    d.rectangle((sx(x0), sy(y0), sx(x1), sy(y1)), fill=255)
    a = np.asarray(m) > 0
    a[int(sy(DOME["ymax"])) :, :] = False
    return a


def save_mask(name, arr, blur=0.0):
    a = np.clip(arr, 0, 1)
    im = Image.fromarray((a * 255).astype(np.uint8), "L")
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    rgba = Image.merge("RGBA", (Image.new("L", im.size, 255),) * 3 + (im,))
    rgba.save(KV / name, optimize=True)
    print(name, f"coverage={float((np.asarray(im) > 20).mean()):.3f}")


def main():
    src = Image.open(SRC).convert("RGB")
    base = src.resize((W, H), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=2))
    base.save(KV / "kv-base.png", optimize=True)
    rgb = np.asarray(base).astype(np.float32)
    L = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    shape = L.shape
    hp = L - ndimage.gaussian_filter(L, 5)
    lines = np.clip((hp - 5) / 38, 0, 1) ** 0.85
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)

    text_zone = rect_mask(TEXT_RECTS.values(), shape)
    kaaba = poly_mask(KAABA, shape)
    dome = dome_mask(shape)
    minarets = rect_mask(MINARETS, shape)
    city = rect_mask(CITY, shape) & ~kaaba & ~dome & ~minarets & ~text_zone
    floor = rect_mask([FLOOR], shape)
    clouds = rect_mask(CLOUDS, shape) & ~text_zone

    # ---- Typography: glyph cores and the static layer -----------------------
    white = (L > 165) & ((mx - mn) < 75)
    gold = (rgb[:, :, 0] > 165) & (rgb[:, :, 1] > 115) & (rgb[:, :, 2] < 140) & (rgb[:, :, 0] > rgb[:, :, 2] + 55)
    glyph = (white | gold) & text_zone
    glyph = ndimage.binary_opening(glyph, iterations=1)
    save_mask("kv-glyph-mask.png", glyph.astype(np.float32), blur=0.6)
    static = ndimage.binary_dilation(glyph, iterations=11)
    static = ndimage.binary_fill_holes(static)
    static |= rect_mask([PLAQUE_BODY], shape)
    static &= ndimage.binary_dilation(text_zone, iterations=6)
    alpha = np.asarray(Image.fromarray((static * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
    text_rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    Image.fromarray(text_rgba, "RGBA").save(KV / "kv-text.png", optimize=True)
    print("kv-text.png")

    # ---- Line masks per region ----------------------------------------------
    save_mask("kv-lines-city.png", lines * city, 0.5)
    save_mask("kv-lines-kaaba.png", np.clip(lines * 1.3, 0, 1) * kaaba, 0.5)
    save_mask("kv-lines-dome.png", np.clip(lines * 1.4, 0, 1) * dome, 0.5)
    save_mask("kv-lines-minarets.png", np.clip(lines * 1.3, 0, 1) * (minarets & ~text_zone), 0.5)
    save_mask("kv-lines-floor.png", lines * floor, 0.6)
    arch = np.maximum.reduce([lines * city, np.clip(lines * 1.3, 0, 1) * kaaba, np.clip(lines * 1.4, 0, 1) * dome, np.clip(lines * 1.3, 0, 1) * (minarets & ~text_zone)])
    save_mask("kv-lines-arch.png", arch, 0.5)
    cl_hp = L - ndimage.gaussian_filter(L, 3)
    cloud_lines = np.clip((cl_hp - 1.2) / 6, 0, 1) * clouds
    save_mask("kv-lines-clouds.png", cloud_lines, 0.8)
    save_mask("kv-shape-dome.png", dome.astype(np.float32), 6)
    save_mask("kv-shape-kaaba.png", kaaba.astype(np.float32), 3)

    # ---- Points: window lights and grid intersection dots -------------------
    def peaks(region, thr_l, thr_hp, size, limit, seed):
        hp3 = L - ndimage.gaussian_filter(L, 3)
        cand = region & (L > thr_l) & (hp3 > thr_hp)
        mxf = ndimage.maximum_filter(np.where(cand, L, 0), size=size)
        ys, xs = np.where(cand & (L == mxf))
        rng = np.random.default_rng(seed)
        idx = rng.permutation(len(xs))[:limit]
        return [[int(xs[i]), int(ys[i]), round(float(rng.random()), 3)] for i in idx]

    windows = peaks(city | minarets, 150, 22, 9, 170, 3)
    grid_dots = peaks(floor & (np.arange(W)[None, :] > 0), 185, 35, 21, 90, 5)

    def dist_to(line, px, py):
        best = 1e9
        for (ax, ay), (bx, by) in zip(line, line[1:]):
            ax, ay, bx, by = sx(ax), sy(ay), sx(bx), sy(by)
            vx, vy = bx - ax, by - ay
            t = max(0.0, min(1.0, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)))
            best = min(best, float(np.hypot(px - (ax + vx * t), py - (ay + vy * t))))
        return best

    # grid dots on the bottom-left ribbon would not follow its wave
    grid_dots = [d for d in grid_dots if dist_to(RIBBON_BL, d[0], d[1]) > sx(95) * 1.15]

    data = {
        "size": [W, H],
        "scale": [W / 1672, H / 941],
        "windows": windows,
        "gridDots": grid_dots,
        "horizon": [sx(838), sy(694)],
        "kaabaBox": [sx(90), sy(466), sx(372), sy(724)],
        "domeCenter": [sx(DOME["c"][0]), sy(DOME["c"][1])],
        "domeRadius": sx(DOME["r"]),
        "minarets": [[sx(a), sy(b), sx(c), sy(d)] for a, b, c, d in MINARETS],
        "ribbons": {
            "tr": {"line": [[sx(x), sy(y)] for x, y in RIBBON_TR], "box": [sx(1140), sy(20), W, sy(330)], "radius": sx(75), "amp": 9},
            "bl": {"line": [[sx(x), sy(y)] for x, y in RIBBON_BL], "box": [0, sy(705), sx(800), H], "radius": sx(95), "amp": 10},
        },
        "textRects": {k: [sx(a), sy(b), sx(c), sy(d)] for k, (a, b, c, d) in TEXT_RECTS.items()},
    }
    (ROOT / "src" / "data" / "keyvisual.json").write_text(json.dumps(data))
    print("windows", len(windows), "gridDots", len(grid_dots))


if __name__ == "__main__":
    main()
