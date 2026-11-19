"""Build the PSB header overlay (1080x1920 RGBA) matching the reference layout."""
import sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

DL = sys.argv[1]
OUT = sys.argv[2]
S = 3  # supersample
W, H = 1080, 1920
F = DL + "/fonts/pjs%d.ttf"

# ---- white logo from asset ----
lg = np.array(Image.open(DL + "/ASET/logo.png").convert("RGBA")).astype(int)
r, g, b, a = lg[..., 0], lg[..., 1], lg[..., 2], lg[..., 3]
yellow = (r > 180) & (g > 140) & (b < 120) & (a > 0)
green = (g > r + 30) & (g > b + 30) & (a > 0)
# green directly hugging yellow = letter outline -> drop it so letters stay readable
near_y = cv2.dilate(yellow.astype(np.uint8), np.ones((15, 15), np.uint8)) > 0
outline = green & near_y & ~yellow
keep = (yellow | green) & ~outline
alpha = (keep * a).astype(np.uint8)
alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
ys, xs = np.nonzero(alpha > 10)
alpha = alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
logo = Image.new("RGBA", (alpha.shape[1], alpha.shape[0]), (255, 255, 255, 0))
logo.putalpha(Image.fromarray(alpha))
LOGO_BOX = (66, 90, 174, 157)  # x0,y0,x1,y1 in final px (reference)
lw = LOGO_BOX[2] - LOGO_BOX[0]
lh = round(logo.height * lw / logo.width)
logo = logo.resize((lw * S, lh * S), Image.LANCZOS)
logo_y = (LOGO_BOX[1] + LOGO_BOX[3]) / 2 - lh / 2

# ---- canvas ----
cv = Image.new("RGBA", (W * S, 320 * S), (0, 0, 0, 0))
d = ImageDraw.Draw(cv)


def font(w, px):
    return ImageFont.truetype(F % w, round(px * S))


def text(x, y_baseline, s, f, fill, spacing=0, anchor="ls"):
    if spacing == 0:
        d.text((x * S, y_baseline * S), s, font=f, fill=fill, anchor=anchor)
        return
    # manual tracking
    widths = [d.textlength(c, font=f) for c in s]
    total = sum(widths) + spacing * S * (len(s) - 1)
    cx = x * S - (total / 2 if anchor[0] == "m" else 0)
    for c, wd in zip(s, widths):
        d.text((cx, y_baseline * S), c, font=f, fill=fill, anchor="l" + anchor[1])
        cx += wd + spacing * S


cv.alpha_composite(logo, (LOGO_BOX[0] * S, round(logo_y * S)))

f1 = font(400, 19.5)
text(190, 113, "Lembaga Pengembangan Da’wah", f1, (238, 238, 238, 255))
f2 = font(800, 27.6)
text(190, 145, "Al-Bahjah", f2, (255, 255, 255, 255))
bw = d.textlength("Al-Bahjah ", font=f2) / S
text(190 + bw, 145, "Buyut", f2, (52, 208, 129, 255))

f3 = font(800, 16)
text(930, 118, "PSB 2027/2028", f3, (243, 201, 26, 255), spacing=2.6, anchor="ms")
f4 = font(500, 16.4)
text(930, 138, "SMPIQu dan SMAIQu", f4, (255, 255, 255, 255), anchor="ms")

cv = cv.resize((W, 320), Image.LANCZOS)

# soft drop shadow
sh_a = cv.split()[3].filter(ImageFilter.GaussianBlur(3))
shadow = Image.new("RGBA", cv.size, (0, 0, 0, 0))
shadow.putalpha(sh_a.point(lambda v: int(v * 0.45)))
hdr = Image.new("RGBA", cv.size, (0, 0, 0, 0))
hdr.alpha_composite(shadow, (0, 2))
hdr.alpha_composite(cv)

# top dark gradient (reference darkens top ~420px)
GH = 440
grad = np.zeros((GH, W, 4), np.uint8)
t = np.linspace(0, 1, GH)
al = (1 - (3 * t ** 2 - 2 * t ** 3)) * 0.50 * 255
grad[..., 3] = al[:, None].astype(np.uint8)
gimg = Image.fromarray(grad, "RGBA")

full = Image.new("RGBA", (W, H), (0, 0, 0, 0))
full.alpha_composite(gimg)
full.alpha_composite(hdr)
full.save(OUT + "/header_full.png")  # gradient + text
only = Image.new("RGBA", (W, H), (0, 0, 0, 0))
only.alpha_composite(hdr)
only.save(OUT + "/header_text.png")
gonly = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gonly.alpha_composite(gimg)
gonly.save(OUT + "/header_grad.png")
print("ok", lw, lh)
