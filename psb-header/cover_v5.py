"""Cover v2: editorial layout (rule of thirds, cut-out subject, brand gradient, negative space).
usage: cover_v2.py DL WORK NAME OUT"""
import sys, json, subprocess
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import logo_model as lm  # noqa: E402

DL, WORK, NAME, OUT = sys.argv[1:5]
V2 = WORK + "/v2/"
W, H = 1080, 1920
FD = DL + "/fonts/"
YEL = (245, 197, 24)
GD = (4, 36, 25)
GM = (12, 92, 58)
GL = (52, 208, 129)
WHITE = (255, 255, 255)

lm.OPK, lm.BODY_T = 11, 0.3
_R = None


def F(n, px):
    return ImageFont.truetype(FD + n, int(px))


def grab(src, n, clean=False):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", DL + "/RAW/" + src, "-vf", f"select=eq(n\\,{n})",
                          "-vsync", "0", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(H, W, 3).copy()
    if clean:
        global _R
        _R = _R or lm.Remover(WORK + "/logo_model.npz", WORK + "/regress.npz")
        if _R.present(f) > 0.4:
            _R.clean(f)
    return Image.fromarray(f)


CFG = {
    "testi": dict(eyebrow="TESTIMONI SANTRI", lines=["MONDOK,", "TAPI JAGO", "EDITING?"],
                  sub="Dengar langsung cerita santri Al-Bahjah Buyut",
                  cards=[("raw.mp4", 819, (120, 360, 1080, 1260), "Editing Video", True),
                         ("raw.mp4", 870, (40, 360, 1000, 1260), "Kamera", True)],
                  keep=None),
    "promo": dict(eyebrow="PSB 2027/2028 DIBUKA", lines=["PESANTREN,", "TAPI SIAP", "DIGITAL!"],
                  sub="SMPIQu dan SMAIQu  ·  Kuota terbatas",
                  cards=[("promo.mp4", 20, (0, 175, 1080, 1290), "Tahfidz Qur'an", False),
                         ("promo.mp4", 200, (0, 330, 1080, 1330), "Lab Komputer", False)],
                  keep=(0, 230, 760, 1300)),
    "talk": dict(eyebrow="CERITA SANTRI", lines=["TERNYATA DI", "PONDOK BISA", "JADI EDITOR!"],
                 sub="Belajar agama sekaligus skill digital",
                 cards=[("promo.mp4", 1580, (0, 330, 1080, 1250), "Konten Dakwah", False),
                        ("talking.mp4", 512, (150, 290, 1010, 1060), "Broadcasting", False)],
                 keep=None),
}
C = CFG[NAME]
face = max(json.load(open(V2 + "faces.json"))[NAME], key=lambda b: b["w"] * (b["x"] < 760))

# ---------------- photo with its real background ----------------
SAFE_L, SAFE_R, SAFE_T, SAFE_B = 72, 936, 250, 1500
TX, TY, TW = 540, 600, 330
src = Image.open(V2 + NAME + ".png").convert("RGB")
s = max(1.0, TW / face["w"])
sw, sh = int(W * s), int(H * s)
ox = int(np.clip(TX - face["ex"] * s, W - sw, 0))
oy = int(np.clip(TY - face["ey"] * s, H - sh, 0))
big = src.resize((sw, sh), Image.LANCZOS)
cv_ = Image.new("RGB", (W, H))
cv_.paste(big, (ox, oy))
if NAME == "promo" and s > 1:
    # the promo footage carries the PSB header: keep it crisp (unscaled)
    band = np.zeros((H, W), np.uint8); band[:232] = 255
    band[232:342] = np.linspace(255, 0, 110).astype(np.uint8)[:, None]
    cv_.paste(src, (0, 0), Image.fromarray(band))
a = np.array(cv_).astype(np.float32)
a = np.clip((a - 128) * 1.06 + 128 + np.array([3, 2, -2]), 0, 255)
yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
# soft vignette at the sides
xx = np.mgrid[0:H, 0:W][1].astype(np.float32)
vig = np.clip(((xx - W / 2) / (W / 2)) ** 2 * 0.35, 0, 0.35)[..., None]
a = a * (1 - vig)
# brand green only from the face down into the type zone
t = np.clip((yy - 760) / 460, 0, 1)
t = (t * t * (3 - 2 * t))[..., None]
deep = np.array((4, 34, 23), np.float32)
mid = np.array((10, 78, 50), np.float32)
grad = mid * (1 - np.clip((yy - 1050) / 350, 0, 1)[..., None]) + deep * np.clip((yy - 1050) / 350, 0, 1)[..., None]
a = a * (1 - t * 0.97) + grad * t * 0.97
cv_ = Image.fromarray(a.astype(np.uint8)).convert("RGBA")

# ---------------- type (lower third, left aligned) ----------------
d = ImageDraw.Draw(cv_)
X = SAFE_L
hl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
hd = ImageDraw.Draw(hl)


def fit(txt, size, maxw):
    f = F("bebas.ttf", size)
    while hd.textlength(txt, font=f) > maxw:
        size -= 2
        f = F("bebas.ttf", size)
    return f


COLW = 220
COL_L = SAFE_R - COLW - 30 - 18  # leftmost extent of the tilted card stack
TXTW = COL_L - 30 - X
size = min(fit(l, 170, TXTW).size for l in C["lines"])
hf = F("bebas.ttf", size)
LB = SAFE_B - 10 - 96  # last baseline; subtitle baseline lands on SAFE_B - 10
base = LB - (len(C["lines"]) - 1) * int(size * 0.9)
lead = int(size * 0.9)
for i, l in enumerate(C["lines"]):
    col = YEL if i == len(C["lines"]) - 1 else WHITE
    hd.text((X - 4, base + i * lead), l, font=hf, fill=col + (255,), anchor="ls")
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
shadow.putalpha(hl.split()[3].filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.55)))
cv_.alpha_composite(shadow, (0, 8))
cv_.alpha_composite(hl)
# ---- card column: top = cap-top of line 1, bottom = baseline of the last line
cap = hd.textbbox((0, 0), "H", font=hf, anchor="ls")[1]
top, bot = base + cap, base + (len(C["lines"]) - 1) * lead
CW = COLW
ch = int((bot - top) * 0.56)
for i, (srcv, n, crop, label, clean) in enumerate(C["cards"]):
    im = grab(srcv, n, clean).crop(crop)
    ar = CW / ch
    iw, ih = im.size
    if iw / ih > ar:
        nw = int(ih * ar); im = im.crop(((iw - nw) // 2, 0, (iw - nw) // 2 + nw, ih))
    else:
        nh = int(iw / ar); im = im.crop((0, (ih - nh) // 2, iw, (ih - nh) // 2 + nh))
    im = im.resize((CW, ch), Image.LANCZOS).convert("RGBA")
    g2 = np.zeros((ch, CW, 4), np.uint8)
    ramp = np.clip((np.arange(ch) - ch * 0.55) / (ch * 0.45), 0, 1)
    if i == 0:
        ramp = ramp[::-1]
    g2[..., 3] = (ramp * 170).astype(np.uint8)[:, None]
    im.alpha_composite(Image.fromarray(g2, "RGBA"))
    dd = ImageDraw.Draw(im)
    lf = F("pjs800.ttf", 21)
    lw_ = dd.textlength(label, font=lf)
    ly = 12 if i == 0 else ch - 46
    dd.rounded_rectangle((12, ly, 12 + lw_ + 42, ly + 34), radius=17, fill=(255, 255, 255, 240))
    dd.ellipse((25, ly + 12, 35, ly + 22), fill=YEL)
    dd.text((43, ly + 25), label, font=lf, fill=GD, anchor="ls")
    b = 7
    card = Image.new("RGBA", (CW + 2 * b, ch + 2 * b), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle((0, 0, card.width - 1, card.height - 1), radius=24, fill=(255, 255, 255, 255))
    m = Image.new("L", (CW, ch), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, CW - 1, ch - 1), radius=18, fill=255)
    card.paste(im, (b, b), m)
    ang = (5, -4)[i]
    card = card.rotate(ang, resample=Image.BICUBIC, expand=True)
    shd = Image.new("RGBA", card.size, (0, 0, 0, 0))
    shd.putalpha(card.split()[3].filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.55)))
    # card 1 high-left, card 2 low-right; they overlap at the corners
    px = (SAFE_R - card.width - 30, SAFE_R - card.width + 4)[i]
    py = (top - 44, bot - card.height + 48)[i]
    cv_.alpha_composite(shd, (px + 6, py + 14))
    cv_.alpha_composite(card, (px, py))
d = ImageDraw.Draw(cv_)
yb = base + (len(C["lines"]) - 1) * lead + 34
d.rounded_rectangle((X, yb, X + 96, yb + 8), radius=4, fill=GL)
d.text((X, yb + 62), C["sub"], font=F("pjs500.ttf", 34), fill=(235, 245, 238), anchor="ls")
EY = base + cap - 26 - 50
ef = F("pjs800.ttf", 26)
et = C["eyebrow"]
tw = sum(d.textlength(ch, font=ef) for ch in et) + 3.5 * (len(et) - 1)
d.rounded_rectangle((X, EY, X + tw + 44, EY + 50), radius=25, fill=YEL)
x = X + 22
for ch in et:
    d.text((x, EY + 35), ch, font=ef, fill=GD, anchor="ls")
    x += d.textlength(ch, font=ef) + 3.5



# ---------------- header + grain ----------------
if NAME != "promo":
    cv_.alpha_composite(Image.open(WORK + "/header_full.png"))
rng = np.random.default_rng(7)
g = rng.normal(0, 3.5, (H, W, 1)).astype(np.float32)
out = np.clip(np.array(cv_.convert("RGB")).astype(np.float32) + g, 0, 255).astype(np.uint8)
Image.fromarray(out).save(OUT)
print("ok", NAME, round(s, 2))
