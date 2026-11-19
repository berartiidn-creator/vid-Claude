"""Hook cover 1080x1920 for the PSB testimony video."""
import sys
import subprocess
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import logo_model as lm  # noqa: E402

DL, WORK, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SRC = DL + "/RAW/raw.mp4"
W, H = 1080, 1920
FD = DL + "/fonts/"
GREEN_D = (6, 52, 34)
YELLOW = (245, 197, 24)
GREEN_L = (52, 208, 129)

lm.OPK, lm.BODY_T = 11, 0.3
R = lm.Remover(WORK + "/logo_model.npz", WORK + "/regress.npz")


def grab(t, clean=True):
    n = int(round(t * 30))
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-vf", f"select=eq(n\\,{n})", "-vsync", "0",
                          "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(H, W, 3).copy()
    if clean and R.present(f) > 0.4:
        R.clean(f)
    return Image.fromarray(f)


def F(name, px):
    return ImageFont.truetype(FD + name, px)


# ---------- hero ----------
hero = grab(8.2)
# push in a little on the face
z = 1.05
hw, hh = int(W / z), int(H / z)
x0 = (W - hw) // 2
y0 = 30
hero = hero.crop((x0, y0, x0 + hw, y0 + hh)).resize((W, H), Image.LANCZOS)
hero = ImageEnhance.Contrast(hero).enhance(1.06)
hero = ImageEnhance.Color(hero).enhance(1.08)
cv = hero.convert("RGBA")

# ---------- grading: vignette + deep green bottom ----------
g = np.zeros((H, W, 4), np.uint8)
g[..., 0], g[..., 1], g[..., 2] = GREEN_D
yy = np.linspace(0, 1, H)[:, None]
t = np.clip((yy - 0.40) / 0.36, 0, 1)
a = (t * t * (3 - 2 * t)) * 0.96
g[..., 3] = (np.broadcast_to(a, (H, W)) * 255).astype(np.uint8)
cv.alpha_composite(Image.fromarray(g, "RGBA"))
vig = np.zeros((H, W, 4), np.uint8)
xx = np.linspace(-1, 1, W)[None, :]
yv = np.linspace(-1, 1, H)[:, None]
vig[..., 3] = (np.clip((xx ** 2 * 0.9 + yv ** 2 * 0.5) - 0.35, 0, 1) * 150).astype(np.uint8)
cv.alpha_composite(Image.fromarray(vig, "RGBA"))

# ---------- polaroid cards (editing + camera) ----------
def card(t, crop, w, label, angle):
    im = grab(t).crop(crop)
    h = int(w * im.height / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    b = 12
    c = Image.new("RGBA", (w + 2 * b, h + 2 * b + 46), (255, 255, 255, 255))
    c.paste(im, (b, b))
    d = ImageDraw.Draw(c)
    d.text((b + 4, h + b + 10), label, font=F("pjs800.ttf", 26), fill=GREEN_D)
    d.ellipse((c.width - b - 22, h + b + 17, c.width - b - 8, h + b + 31), fill=YELLOW)
    c = c.rotate(angle, resample=Image.BICUBIC, expand=True)
    sh = Image.new("RGBA", c.size, (0, 0, 0, 0))
    sh.putalpha(c.split()[3].point(lambda v: int(v * 0.55)).filter(ImageFilter.GaussianBlur(14)))
    return c, sh


c1, s1 = card(27.3, (120, 360, 1080, 1260), 290, "Editing Video", 6)
c2, s2 = card(29.0, (40, 360, 1000, 1260), 290, "Kamera", -7)
for c, s, (px, py) in [(c2, s2, (34, 846)), (c1, s1, (W - c1.width - 30, 840))]:
    cv.alpha_composite(s, (px + 8, py + 16))
    cv.alpha_composite(c, (px, py))

# ---------- type ----------
d = ImageDraw.Draw(cv)

# pill
pf = F("pjs800.ttf", 34)
ptxt = "TESTIMONI SANTRI"
tw = d.textlength(ptxt, font=pf) + 4 * (len(ptxt) - 1)
px0, py0 = (W - tw) / 2 - 34, 1196
d.rounded_rectangle((px0, py0, px0 + tw + 68, py0 + 64), radius=32, fill=YELLOW)
x = px0 + 34
for ch in ptxt:
    d.text((x, py0 + 46), ch, font=pf, fill=GREEN_D, anchor="ls")
    x += d.textlength(ch, font=pf) + 4

# headline with soft shadow layer
hl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
hd = ImageDraw.Draw(hl)
f1 = F("bebas.ttf", 176)
f2 = F("bebas.ttf", 214)
l1, l2 = "MONDOK, TAPI", "JAGO EDITING?"
hd.text((W / 2, 1432), l1, font=f1, fill=(255, 255, 255, 255), anchor="ms")
hd.text((W / 2, 1628), l2, font=f2, fill=YELLOW + (255,), anchor="ms")
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
shadow.putalpha(hl.split()[3].filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.6)))
cv.alpha_composite(shadow, (0, 6))
cv.alpha_composite(hl)

# underline accent under line 2
d.rounded_rectangle((W / 2 - 70, 1658, W / 2 + 70, 1668), radius=5, fill=GREEN_L)

sf = F("pjs500.ttf", 38)
sub = "Dengar langsung cerita santri Al-Bahjah Buyut"
d.text((W / 2, 1730), sub, font=sf, fill=(255, 255, 255, 235), anchor="ms")

# ---------- PSB header (same as the video) ----------
hdr = Image.open(WORK + "/header_full.png")
cv.alpha_composite(hdr)

cv.convert("RGB").save(OUT, quality=95)
print("ok")
