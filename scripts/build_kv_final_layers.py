"""Separate the key visual ("Background Loop") into animatable layers for the
final segment of the BRI-style bumper. Nothing is redrawn:

  kv-plate.png    key visual with logo, title, tagline plaque and swoosh removed
                  (row-wise interpolation of the surrounding sky, then softened)
  kv-plaque.png   the original plaque frame with its old text removed
  kv-swoosh.png   the original gold swoosh
  src/data/kvFinal.json  where the new title (IMG_2140), the logo, the plaque
                  and the swoosh sit, matched to the original layout

Requires: scripts/build_keyvisual_assets.py has been run (kv-base, kv-text).
Usage: python3 scripts/build_kv_final_layers.py
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
KV = ROOT / "public" / "assets" / "keyvisual"
OUT = ROOT / "public" / "assets" / "kvfinal"
S = 1920 / 1672


def rect(r):
    return [int(round(v * S)) for v in r]


def bbox(mask):
    ys, xs = np.where(mask)
    return [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    base = np.asarray(Image.open(KV / "kv-base.png").convert("RGB")).astype(np.float32)
    H, W, _ = base.shape
    text_a = np.asarray(Image.open(KV / "kv-text.png"))[:, :, 3].astype(np.float32) / 255
    glyph = np.asarray(Image.open(KV / "kv-glyph-mask.png"))[:, :, 3] > 128
    data = json.loads((ROOT / "src" / "data" / "keyvisual.json").read_text())
    rects = {k: [int(v) for v in r] for k, r in data["textRects"].items()}
    L = base @ np.array([0.2126, 0.7152, 0.0722], np.float32)

    # ---- plate: remove all typography -------------------------------------
    # whole typography areas (native rects), so glows and shadows go too
    clear = [(540, 100, 1125, 262), (325, 258, 1360, 446), (374, 438, 1310, 522), (555, 512, 1105, 574)]
    mask = np.zeros((H, W), bool)
    for r in clear:
        x0, y0, x1, y1 = rect(r)
        mask[y0:y1, x0:x1] = True
    mask |= ndimage.binary_dilation(text_a > 0.03, iterations=7)
    # Harmonic (Navier-Stokes) fill at quarter resolution from a "sky only"
    # version of the image (stars, ribbon tails and building highlights next to
    # the holes are flattened first), so the fill matches the sky on all sides
    # and leaves no darker or lighter box.
    med = np.stack([ndimage.median_filter(base[:, :, c], size=81) for c in range(3)], axis=2)
    Lm = med @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    bright = L > Lm + 10
    sky_src = np.where(bright[:, :, None], med, base)
    # row-wise interpolation between the cleaned sky on both sides of each hole
    fillimg = sky_src.copy()
    for y in range(H):
        row = mask[y]
        if not row.any():
            continue
        d = np.diff(np.concatenate([[0], row.astype(np.int8), [0]]))
        for a0, b0 in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
            left = np.median(sky_src[y, max(0, a0 - 28) : max(1, a0 - 4)], axis=0) if a0 > 4 else None
            right = np.median(sky_src[y, min(W - 1, b0 + 4) : min(W, b0 + 28)], axis=0) if b0 < W - 4 else None
            left = right if left is None else left
            right = left if right is None else right
            # cap the brighter side (glows, ribbon tails) to stay near the darker one
            la, lb = float(left @ [0.2126, 0.7152, 0.0722]), float(right @ [0.2126, 0.7152, 0.0722])
            if la - lb > 3:
                left = right + (left - right) * (3 / (la - lb))
            elif lb - la > 3:
                right = left + (right - left) * (3 / (lb - la))
            k = np.linspace(0, 1, b0 - a0)[:, None]
            fillimg[y, a0:b0] = left * (1 - k) + right * k
    up = np.stack([ndimage.gaussian_filter(fillimg[:, :, c], (10, 4)) for c in range(3)], axis=2)
    m3 = ndimage.gaussian_filter(ndimage.binary_dilation(mask, iterations=6).astype(np.float32), 6)[:, :, None]
    rng = np.random.default_rng(4)
    grain = rng.standard_normal((H, W, 1)).astype(np.float32) * 1.1
    plate = base * (1 - m3) + (up + grain) * m3
    Image.fromarray(np.clip(plate, 0, 255).astype(np.uint8)).save(OUT / "kv-plate.png", optimize=True)

    # ---- plaque frame without its text ------------------------------------
    px0, py0, px1, py1 = rects["plaque"]
    r, g, b = base[:, :, 0], base[:, :, 1], base[:, :, 2]
    gold = (r > 150) & (g > 105) & (b < 140) & (r > b + 45)
    zone = np.zeros_like(gold)
    zone[py0:py1, px0:px1] = True
    border = ndimage.binary_closing(gold & zone, iterations=2)
    body = ndimage.binary_fill_holes(border) & zone
    body = ndimage.binary_opening(body, iterations=2)
    inner = ndimage.binary_erosion(body, iterations=7)
    white = (L > 150) & ((base.max(2) - base.min(2)) < 80) & inner
    txt = ndimage.binary_dilation(white, iterations=2).astype(np.uint8) * 255
    bgr = cv2.cvtColor(np.clip(base, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
    clean = cv2.cvtColor(cv2.inpaint(bgr, txt, 5, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB).astype(np.float32)
    # smooth the plaque interior so no ghost of the old letters remains
    # rebuild the interior as a clean gradient: per-row median of non-text pixels
    sm = base.copy()
    ys, xs = np.where(inner)
    for y in range(ys.min(), ys.max() + 1):
        rowm = inner[y] & ~(txt[y] > 0)
        if rowm.sum() < 10:
            continue
        cols = base[y][rowm]
        xr = np.where(rowm)[0]
        # gentle left-to-right gradient from the two halves' medians
        mid = (xr.min() + xr.max()) / 2
        left = np.median(cols[xr < mid], axis=0)
        right = np.median(cols[xr >= mid], axis=0)
        xx = np.arange(W)
        k = np.clip((xx - xr.min()) / max(1, xr.max() - xr.min()), 0, 1)[:, None]
        sm[y] = left * (1 - k) + right * k
    sm = np.stack([ndimage.gaussian_filter1d(sm[:, :, c], 1.5, axis=0) for c in range(3)], axis=2)
    inner_f = ndimage.gaussian_filter(inner.astype(np.float32), 1.2)[:, :, None]
    clean = clean * (1 - inner_f) + sm * inner_f
    a = ndimage.gaussian_filter(ndimage.binary_dilation(body, iterations=2).astype(np.float32), 1.0)
    pl = np.dstack([clean, a * 255])
    bb = bbox(body)
    crop = pl[bb[1] - 6 : bb[3] + 7, bb[0] - 6 : bb[2] + 7]
    Image.fromarray(np.clip(crop, 0, 255).astype(np.uint8), "RGBA").save(OUT / "kv-plaque.png", optimize=True)
    plaque_box = [bb[0] - 6, bb[1] - 6, bb[2] + 7, bb[3] + 7]
    inner_bb = bbox(inner)

    # ---- swoosh ------------------------------------------------------------
    sx0, sy0, sx1, sy1 = rects["swoosh"]
    sz = np.zeros_like(gold)
    sz[sy0:sy1 + 10, sx0 - 30:sx1 + 10] = True
    bright_gold = ((r > 140) & (r > b + 30)) | (L > 200)
    below = np.zeros_like(gold)
    below[bbox(body)[3] + 2 :, :] = True
    sw = bright_gold & sz & below
    sw = ndimage.binary_closing(sw, iterations=3)
    sw = ndimage.binary_fill_holes(sw)
    lab, n = ndimage.label(sw)
    sizes = ndimage.sum(sw, lab, range(1, n + 1))
    sw = lab == (int(np.argmax(sizes)) + 1)
    sw = ndimage.binary_dilation(sw, iterations=3)
    sa = ndimage.gaussian_filter(sw.astype(np.float32), 1.6)
    swb = bbox(sw)
    pad = 8
    sw_rgba = np.dstack([base, sa * 255])[swb[1] - pad : swb[3] + pad, swb[0] - pad : swb[2] + pad]
    Image.fromarray(np.clip(sw_rgba, 0, 255).astype(np.uint8), "RGBA").save(OUT / "kv-swoosh.png", optimize=True)
    swoosh_box = [swb[0] - pad, swb[1] - pad, swb[2] + pad, swb[3] + pad]

    # ---- match new title (IMG_2140) to the original title -------------------
    tx0, ty0, tx1, ty1 = rects["title"]
    tz = np.zeros_like(glyph)
    tz[ty0:ty1, tx0:tx1] = True
    t_bb = bbox(glyph & tz)
    title = np.asarray(Image.open(ROOT / "public" / "assets" / "title" / "manasik-umroh-title-oneline.png").convert("RGBA"))
    n_bb = bbox(title[:, :, 3] > 128)
    s = (t_bb[2] - t_bb[0]) / (n_bb[2] - n_bb[0])
    title_box = [t_bb[0] - n_bb[0] * s, t_bb[1] - n_bb[1] * s, title.shape[1] * s, title.shape[0] * s]

    # ---- logo: centre + height of the original logo ------------------------
    lx0, ly0, lx1, ly1 = rects["logo"]
    lz = np.zeros_like(glyph)
    lz[ly0:ly1, lx0:lx1] = True
    l_bb = bbox(glyph & lz)

    # ---- depth mattes for parallax (alpha masks) ----------------------------
    plate_now = np.asarray(Image.open(OUT / "kv-plate.png").convert("RGB")).astype(np.float32)
    Lp = plate_now @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    med_p = ndimage.median_filter(Lp, size=61)
    struct = ndimage.binary_opening(Lp > med_p + 9, iterations=2)
    struct[:, :] &= True
    yy = np.arange(H)[:, None]
    horizon = int(data["horizon"][1])
    zone = (yy > 200) & (yy < horizon + 30)
    struct &= zone
    struct[: int(H * 0.36), int(W * 0.68) :] = False  # top-right ribbon stays in the sky layer
    tops = np.full(W, H, dtype=np.int32)
    for x in range(W):
        ys = np.where(struct[:, x])[0]
        if len(ys):
            tops[x] = ys.min()
    tops = ndimage.median_filter(tops, size=15)
    tops = ndimage.minimum_filter1d(tops, size=29)
    mid = (yy >= tops[None, :] - 14) & (yy < horizon + 40)
    mid_a = ndimage.gaussian_filter(mid.astype(np.float32), 7)
    near_a = np.clip((yy.astype(np.float32) - (horizon - 8)) / 46, 0, 1) * np.ones((1, W), np.float32)
    for name, arr in (("kv-depth-mid.png", mid_a), ("kv-depth-near.png", near_a)):
        img = np.dstack([np.full((H, W, 3), 255, np.uint8), (np.clip(arr, 0, 1) * 255).astype(np.uint8)])
        Image.fromarray(img, "RGBA").save(OUT / name, optimize=True)

    meta = {
        "plaque": plaque_box,
        "plaqueInner": inner_bb,
        "swoosh": swoosh_box,
        "title": [round(v, 2) for v in title_box],
        "titleGlyphs": t_bb,
        "logo": l_bb,
        "onions": [],
    }
    # gold onion tips of the new title (for glints), in screen px
    ta = title[:, :, 3] > 128
    tg = (title[:, :, 0] > 170) & (title[:, :, 2] < 140) & ta
    lab, n = ndimage.label(ndimage.binary_dilation(tg, iterations=2))
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(xs) > 200:
            meta["onions"].append([round(title_box[0] + xs.mean() * s, 1), round(title_box[1] + ys.min() * s, 1)])
    (ROOT / "src" / "data" / "kvFinal.json").write_text(json.dumps(meta, indent=2))
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
