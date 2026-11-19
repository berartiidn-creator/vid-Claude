"""Build derived logo assets from the ORIGINAL Al-Bahjah logo (no redrawing).

The supplied logo is a stacked (vertical) white PNG. The storyboard asks for a
horizontal lockup: symbol on the left, AL-BAHJAH + TOUR & TRAVEL on the right.
This script crops the three original pieces, places them side by side with the
original proportions, adds the thin divider rule shown in the storyboard, and
samples particle target points used by the LogoReveal particle effect.

Usage: python3 scripts/build_logo_assets.py
"""
import json
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
LOGO_DIR = ROOT / "public" / "assets" / "logo"
SRC = LOGO_DIR / "albahjah-logo-original.png"

# Crop boxes measured from the alpha channel of the original 2475x2576 PNG.
SYMBOL_BOX = (298, 0, 2177, 1825)
WORDMARK_BOX = (0, 1945, 2472, 2331)
TOURTRAVEL_BOX = (0, 2351, 2472, 2575)
ORIGINAL_LINE_GAP = 2351 - 2331  # gap between the two wordmark lines

SYMBOL_H = 1000
TEXT_BLOCK_RATIO = 0.62  # text block height relative to symbol height
GAP = 190
DIVIDER_W = 7


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    symbol = src.crop(SYMBOL_BOX)
    word = src.crop(WORDMARK_BOX)
    tt = src.crop(TOURTRAVEL_BOX)
    symbol.save(LOGO_DIR / "albahjah-symbol.png")
    word.save(LOGO_DIR / "albahjah-wordmark.png")
    tt.save(LOGO_DIR / "albahjah-tour-travel.png")

    s = SYMBOL_H / symbol.height
    symbol_r = symbol.resize((round(symbol.width * s), SYMBOL_H), Image.LANCZOS)

    natural_block_h = word.height + ORIGINAL_LINE_GAP + tt.height
    t = (SYMBOL_H * TEXT_BLOCK_RATIO) / natural_block_h
    word_r = word.resize((round(word.width * t), round(word.height * t)), Image.LANCZOS)
    tt_r = tt.resize((round(tt.width * t), round(tt.height * t)), Image.LANCZOS)
    block_h = word_r.height + round(ORIGINAL_LINE_GAP * t) + tt_r.height

    width = symbol_r.width + GAP + DIVIDER_W + GAP + word_r.width
    canvas = Image.new("RGBA", (width, SYMBOL_H), (0, 0, 0, 0))
    canvas.alpha_composite(symbol_r, (0, 0))

    div_x = symbol_r.width + GAP
    div_h = round(SYMBOL_H * 0.66)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle(
        (div_x, (SYMBOL_H - div_h) // 2, div_x + DIVIDER_W, (SYMBOL_H + div_h) // 2),
        fill=(255, 255, 255, 200),
    )

    tx = div_x + DIVIDER_W + GAP
    ty = (SYMBOL_H - block_h) // 2
    canvas.alpha_composite(word_r, (tx, ty))
    canvas.alpha_composite(tt_r, (tx, ty + word_r.height + round(ORIGINAL_LINE_GAP * t)))

    out_w = 2400
    final = canvas.resize((out_w, round(SYMBOL_H * out_w / width)), Image.LANCZOS)
    final.save(LOGO_DIR / "albahjah-logo-horizontal.png")

    # Particle targets (normalised 0..1) sampled from the lockup alpha.
    a = np.array(final)[:, :, 3]
    ys, xs = np.where(a > 140)
    rng = random.Random(7)
    idx = rng.sample(range(len(xs)), 2200)
    pts = [[round(xs[i] / final.width, 4), round(ys[i] / final.height, 4)] for i in idx]
    meta = {"aspect": round(final.width / final.height, 5), "points": pts}
    (ROOT / "src" / "data" / "logoPoints.json").write_text(json.dumps(meta))
    print("lockup", final.size, "aspect", meta["aspect"], "points", len(pts))


if __name__ == "__main__":
    main()
