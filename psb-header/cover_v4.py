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

# ---------------- background ----------------
src = Image.open(V2 + NAME + ".png").convert("RGB")
alpha = Image.open(V2 + NAME + "_a.png").convert("L")
if C["keep"]:
    k = np.zeros((H, W), np.float32)
    x0, y0, x1, y1 = C["keep"]
    k[y0:y1, x0:x1] = 1
    k = cv2.GaussianBlur(k, (0, 0), 25)
    k2 = np.ones((H, W), np.float32)
    k = k * cv2.GaussianBlur(k2, (0, 0), 4)
    alpha = Image.fromarray((np.array(alpha) * k).astype(np.uint8))

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# diagonal brand gradient: light emerald top-right -> deep green bottom-left
t = np.clip(((H - yy) / H) * 0.75 + (xx / W) * 0.25, 0, 1)[..., None]
grad = np.array(GD, np.float32) * (1 - t) + np.array(GM, np.float32) * t
blur = np.array(src.filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
lum = blur.mean(-1, keepdims=True)
tinted = lum / 255 * np.array([90, 190, 130], np.float32)
bg = grad * 0.72 + tinted * 0.28

# placement: eyes on the upper-third line, face on the right-third line
TX, TY, TW = 540, 560, 300
SAFE_L, SAFE_R, SAFE_T, SAFE_B = 72, 936, 250, 1500
s = TW / face["w"]
ex, ey = face["ex"], face["ey"]

# warm glow behind the head
d2 = ((xx - TX) ** 2 + (yy - (TY - 40)) ** 2) / (560 ** 2)
glow = np.exp(-d2 * 2.2)[..., None]
bg = bg + glow * (np.array(YEL, np.float32) - bg) * 0.42
# bottom fade to deep green for the type
fb = np.clip((yy - 780) / 480, 0, 1) ** 1.3
bg = bg * (1 - fb[..., None]) + np.array((3, 28, 19), np.float32) * fb[..., None]
cv_ = Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8)).convert("RGBA")

# concentric rings around the head (thin, very subtle)
ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rd = ImageDraw.Draw(ring)
for r, a in [(250, 70), (340, 46), (440, 30), (560, 18)]:
    rd.ellipse((TX - r, TY - 40 - r, TX + r, TY - 40 + r), outline=(255, 255, 255, a), width=2)
cv_.alpha_composite(ring)

# watermark logo (white), large, cropped by the left edge
lg = np.array(Image.open(DL + "/ASET/logo.png").convert("RGBA")).astype(int)
r_, g_, b_, a_ = lg[..., 0], lg[..., 1], lg[..., 2], lg[..., 3]
mark = (((r_ > 180) & (g_ > 140) & (b_ < 120)) | ((g_ > r_ + 30) & (g_ > b_ + 30))) & (a_ > 0)
wm = Image.new("RGBA", (lg.shape[1], lg.shape[0]), (255, 255, 255, 0))
wm.putalpha(Image.fromarray((mark * 20).astype(np.uint8)))
wm = wm.resize((900, 900), Image.LANCZOS).rotate(-8, resample=Image.BICUBIC, expand=True)
pass  # watermark dropped: keeps the negative space clean

# ---------------- subject ----------------
sw, sh = int(W * s), int(H * s)
subj = src.resize((sw, sh), Image.LANCZOS).convert("RGBA")
sa = alpha.resize((sw, sh), Image.LANCZOS)
ox, oy = int(TX - ex * s), int(TY - ey * s)
layer_a = Image.new("L", (W, H), 0)
layer_a.paste(sa, (ox, oy))
A = np.array(layer_a).astype(np.float32) / 255
A *= 1 - np.clip((yy - 820) / 300, 0, 1)  # fade body into the type zone
layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
layer.paste(subj, (ox, oy))
L = np.array(layer).astype(np.float32)
# tighten matte + decontaminate edge colours (pull from the subject interior)
A = np.clip((A - 0.12) / 0.8, 0, 1)
A = cv2.erode(A, np.ones((3, 3), np.uint8))
A = cv2.GaussianBlur(A, (0, 0), 0.9)
inner = (A > 0.97).astype(np.float32)
num = cv2.GaussianBlur(L[..., :3] * inner[..., None], (0, 0), 6)
den = cv2.GaussianBlur(inner, (0, 0), 6)[..., None]
inner_col = num / np.maximum(den, 1e-3)
ew = ((A > 0.01) & (A < 0.97) & (den[..., 0] > 0.02)).astype(np.float32)[..., None]
L[..., :3] = L[..., :3] * (1 - ew * 0.75) + inner_col * ew * 0.75
# gentle grade on the subject: a touch of warmth + contrast
L[..., :3] = np.clip((L[..., :3] - 128) * 1.06 + 128 + np.array([4, 2, -3]), 0, 255)
# shadow
sh_a = cv2.GaussianBlur(A, (0, 0), 22)
sh_img = np.zeros((H, W, 4), np.float32)
sh_img[..., :3] = (2, 20, 12)
sh_img[..., 3] = np.roll(sh_a, 18, axis=0) * 0.55 * 255
cv_.alpha_composite(Image.fromarray(sh_img.astype(np.uint8), "RGBA"))
# rim light (warm) along the silhouette
edge = np.clip(A - cv2.erode(A, np.ones((5, 5), np.uint8)), 0, 1)
edge = cv2.GaussianBlur(edge, (0, 0), 3) * (1 - np.clip((yy - 800) / 300, 0, 1))
rim = np.zeros((H, W, 4), np.float32)
rim[..., :3] = (255, 226, 140)
rim[..., 3] = np.clip(edge * 0.28, 0, 1) * 255
L[..., 3] = A * 255
cv_.alpha_composite(Image.fromarray(L.astype(np.uint8), "RGBA"))
cv_.alpha_composite(Image.fromarray(rim.astype(np.uint8), "RGBA"))

# photo cards are placed after the headline is measured (see below)
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


COLW, GAP = 204, 44
TXTW = SAFE_R - X - COLW - GAP
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
cx0 = SAFE_R - COLW
ch = (bot - top - 16) // 2
for i, (srcv, n, crop, label, clean) in enumerate(C["cards"]):
    im = grab(srcv, n, clean).crop(crop)
    # centre-crop to the slot aspect
    ar = COLW / ch
    iw, ih = im.size
    if iw / ih > ar:
        nw = int(ih * ar); im = im.crop(((iw - nw) // 2, 0, (iw - nw) // 2 + nw, ih))
    else:
        nh = int(iw / ar); im = im.crop((0, (ih - nh) // 2, iw, (ih - nh) // 2 + nh))
    im = im.resize((COLW, ch), Image.LANCZOS).convert("RGBA")
    y = top + i * (ch + 16)
    m = Image.new("L", (COLW, ch), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, COLW - 1, ch - 1), radius=22, fill=255)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sm = Image.new("L", (W, H), 0); sm.paste(m, (cx0, y + 10))
    sh.putalpha(sm.filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * 0.55)))
    cv_.alpha_composite(sh)
    # bottom scrim + label pill inside the photo
    g2 = np.zeros((ch, COLW, 4), np.uint8)
    g2[..., 3] = (np.clip((np.arange(ch) - ch * 0.55) / (ch * 0.45), 0, 1) * 170).astype(np.uint8)[:, None]
    im.alpha_composite(Image.fromarray(g2, "RGBA"))
    dd = ImageDraw.Draw(im)
    lf = F("pjs800.ttf", 20)
    lw_ = dd.textlength(label, font=lf)
    dd.rounded_rectangle((12, ch - 44, 12 + lw_ + 40, ch - 12), radius=16, fill=(255, 255, 255, 240))
    dd.ellipse((24, ch - 33, 34, ch - 23), fill=YEL)
    dd.text((42, ch - 21), label, font=lf, fill=GD, anchor="ls")
    cv_.paste(im, (cx0, y), m)
    ImageDraw.Draw(cv_).rounded_rectangle((cx0, y, cx0 + COLW - 1, y + ch - 1), radius=22,
                                          outline=(255, 255, 255, 200), width=3)
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
cv_.alpha_composite(Image.open(WORK + "/header_text.png"))
rng = np.random.default_rng(7)
g = rng.normal(0, 5, (H, W, 1)).astype(np.float32)
out = np.clip(np.array(cv_.convert("RGB")).astype(np.float32) + g, 0, 255).astype(np.uint8)
Image.fromarray(out).save(OUT)
print("ok", NAME, round(s, 2))
