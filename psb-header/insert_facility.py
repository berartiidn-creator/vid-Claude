"""Insert a new facility card ("Ranjang Pribadi") into the Promo facility list,
renumber all facility cards from /07 to /08, and splice a matching VO line.

usage: insert_facility.py DL WORK PHOTO OUT.mp4 [--crf 20 --preset fast]
"""
import argparse, subprocess
import numpy as np
import cv2
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("dl"); ap.add_argument("work"); ap.add_argument("photo"); ap.add_argument("out")
ap.add_argument("--crf", type=int, default=20); ap.add_argument("--preset", default="fast")
A = ap.parse_args()

SRC = A.dl + "/RAW/promo.mp4"
W, H, FPS = 1080, 1920, 60
CUT = 2109                 # first frame of "Makan Tiga Kali Sehari"
NINS = 92                  # 3 beats @117.5 bpm
TOTAL = 8
NEW_IDX = 2
TITLE = "Ranjang Pribadi"
WORDS = ["ranjang", "pribadi,"]
VO_START, VO_SPLIT = 0.12, 0.48   # s into the insert / s into the TTS clip
FD = A.dl + "/fonts/"
YEL = (251, 203, 10)

CARDS = [(2046, 2108, 1), (2109, 2195, 3), (2196, 2306, 4), (2307, 2369, 5),
         (2370, 2438, 6), (2439, 2483, 7), (2484, 2627, 8)]


def F(w, px):
    return ImageFont.truetype(FD + f"pjs{w}.ttf", px)


# ---------------- label + progress bar ----------------
def draw_label(idx):
    S = 3
    im = Image.new("RGBA", (W * S, 80 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f = F(800, 26 * S)
    x, y0 = 69 * S, 1190
    for ch in f"FASILITAS {idx:02d} / {TOTAL:02d}":
        d.text((x, (1227 - y0) * S), ch, font=f, fill=YEL + (255,), anchor="ls")
        x += d.textlength(ch, font=f) + 5 * S
    x0, x1, gap = 70, 1010, 10
    sw = (x1 - x0 - gap * (TOTAL - 1)) / TOTAL
    for k in range(TOTAL):
        a = x0 + k * (sw + gap)
        col = YEL + (255,) if k < idx else (255, 255, 255, 80)
        d.rounded_rectangle((a * S, (1247 - y0) * S, (a + sw) * S, (1253 - y0) * S), radius=3 * S, fill=col)
    im = im.resize((W, 80), Image.LANCZOS)
    full = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    full.paste(im, (0, y0))
    return np.array(full).astype(np.float32)


LABELS = {i: draw_label(i) for i in range(1, TOTAL + 1)}
# erase mask: old label text box + old bar
ERASE = np.zeros((H, W), np.uint8)
ERASE[1203:1233, 64:385] = 255
ERASE[1244:1256, 64:1016] = 255
EY0, EY1 = 1195, 1262


def comp(f, rgba):
    a = rgba[..., 3:4] / 255.0
    return (f.astype(np.float32) * (1 - a) + rgba[..., :3] * a)


def renumber(f, idx):
    band = f[EY0:EY1]
    yel = ((band[..., 0] > 200) & (band[..., 1] > 150) & (band[..., 2] < 100)).sum()
    if yel < 300:
        return f
    m = ERASE[EY0:EY1]
    inp = cv2.inpaint(band, m, 4, cv2.INPAINT_TELEA)
    f[EY0:EY1] = inp
    return np.clip(comp(f, LABELS[idx]) + 0.5, 0, 255).astype(np.uint8)


# ---------------- inserted card ----------------
photo = Image.open(A.photo).convert("RGB")
pw, ph = photo.size
hdr_grad = np.array(Image.open(A.work + "/header_grad.png")).astype(np.float32)
hdr = np.array(Image.open(A.work + "/promo_hdr.png")).astype(np.float32)
yy = np.arange(H, dtype=np.float32)[:, None]
dark = np.clip((yy - 900) / 380, 0, 1) * 0.48 + np.clip((yy - 1300) / 620, 0, 1) * 0.2
dark_top = np.clip((260 - yy) / 260, 0, 1) * 0.0


def ease(t):
    return t * t * (3 - 2 * t)


rng = np.random.default_rng(3)
TITLE_DELAY = rng.uniform(0, 0.24, len(TITLE))
tf = F(800, 84 * 2)
cap_f = F(800, 42 * 2)


def title_layer(t):
    S = 2
    im = Image.new("RGBA", (W * S, 140 * S), (0, 0, 0, 0))
    x = 70 * S
    d0 = ImageDraw.Draw(im)
    for i, ch in enumerate(TITLE):
        p = float(np.clip((t - TITLE_DELAY[i]) / 0.14, 0, 1))
        if p > 0 and ch != " ":
            g = Image.new("RGBA", im.size, (0, 0, 0, 0))
            ImageDraw.Draw(g).text((x, (1347 - 1260) * S), ch, font=tf, fill=(255, 255, 255, int(255 * ease(p))),
                                   anchor="ls")
            if p < 1:
                g = g.filter(ImageFilter.GaussianBlur((1 - p) * 10))
            im.alpha_composite(g)
        x += d0.textlength(ch, font=tf) - 3 * S
    im = im.resize((W, 140), Image.LANCZOS)
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sh.putalpha(im.split()[3].filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * 0.35)))
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.alpha_composite(sh, (0, 1263))
    out.alpha_composite(im, (0, 1260))
    return np.array(out).astype(np.float32)


TITLES = {}


def caption_layer(active):
    S = 2
    d0 = ImageDraw.Draw(Image.new("L", (1, 1)))
    sp = d0.textlength(" ", font=cap_f)
    widths = [d0.textlength(w, font=cap_f) for w in WORDS]
    tw = (sum(widths) + sp * (len(WORDS) - 1)) / S
    padx = 32
    pw_ = tw + 2 * padx
    x0 = 540 - pw_ / 2
    im = Image.new("RGBA", (W * S, 120 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((x0 * S, (1580 - 1560) * S, (x0 + pw_) * S, (1665 - 1560) * S), radius=22 * S,
                        fill=(8, 32, 19, 238), outline=(40, 80, 52, 255), width=2 * S)
    x = (x0 + padx) * S
    for i, w in enumerate(WORDS):
        col = YEL if i == active else (255, 255, 255)
        d.text((x, (1640 - 1560) * S), w, font=cap_f, fill=col + (255,), anchor="ls")
        x += widths[i] + sp
    im = im.resize((W, 120), Image.LANCZOS)
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.alpha_composite(im, (0, 1560))
    return np.array(out).astype(np.float32)


CAPS = {k: caption_layer(k) for k in (-1, 0, 1)}
LBL = LABELS[NEW_IDX]


def inserted_frame(k):
    t = k / FPS
    p = k / (NINS - 1)
    # slow pan across the room + gentle push-in
    z = 1.0 + 0.05 * p
    vh = ph / z
    vw = vh * W / H
    cx = pw * (0.40 + 0.20 * ease(p))
    x0 = np.clip(cx - vw / 2, 0, pw - vw)
    y0 = (ph - vh) / 2
    fr = photo.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + vw, y0 + vh))
    fr = fr.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    f = np.array(fr).astype(np.float32)
    f = np.clip((f - 128) * 1.04 + 126, 0, 255)
    f = f * (1 - dark[..., None])
    f = comp(f, hdr_grad)
    f = comp(f, hdr)
    f = comp(f, LBL)
    ti = min(int(t * 30), 30)
    if ti not in TITLES:
        TITLES[ti] = title_layer(ti / 30)
    f = comp(f, TITLES[ti])
    vo_t = t - VO_START
    act = -1
    if 0 <= vo_t < VO_SPLIT:
        act = 0
    elif VO_SPLIT <= vo_t < 1.09:
        act = 1
    f = comp(f, CAPS[act])
    return np.clip(f + 0.5, 0, 255).astype(np.uint8)


# ---------------- audio ----------------
def build_audio(path):
    mix, sr = sf.read(A.work + "/promo_audio.wav")
    inst, _ = sf.read(A.work + "/sep/promo_audio_(Instrumental)_UVR-MDX-NET-Inst_HQ_3.wav")
    cut = int(round(CUT / FPS * sr))
    n = int(round(NINS / FPS * sr))
    bed = inst[cut - n:cut].copy()
    vo, vsr = sf.read(A.work + "/vo/rp.fx.wav")
    if vo.ndim == 1:
        vo = np.stack([vo, vo], 1)
    s0 = int(VO_START * sr)
    bed[s0:s0 + len(vo)] += vo[:max(0, n - s0)]
    xf = int(0.02 * sr)
    r = np.linspace(0, 1, xf)[:, None]
    a = mix[:cut].copy()
    b = mix[cut:].copy()
    # equal-power crossfades at both joins
    head = bed[:xf] * np.sin(r * np.pi / 2) + mix[cut:cut + xf] * np.cos(r * np.pi / 2)
    tail = b[:xf] * np.sin(r * np.pi / 2) + inst[cut - xf:cut] * 0 + bed[-xf:] * np.cos(r * np.pi / 2)
    out = np.concatenate([a, head, bed[xf:-xf], tail, b[xf:]])
    sf.write(path, np.clip(out, -1, 1), sr, subtype="PCM_16")


build_audio(A.work + "/promo_ins_audio.wav")

# ---------------- video ----------------
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       stdout=subprocess.PIPE, bufsize=W * H * 6)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                        "-r", str(FPS), "-i", "-", "-i", A.work + "/promo_ins_audio.wav", "-map", "0:v", "-map", "1:a",
                        "-c:v", "libx264", "-preset", A.preset, "-crf", str(A.crf), "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", A.out],
                       stdin=subprocess.PIPE)
idx_of = {}
for a, b, i in CARDS:
    for k in range(a, b + 1):
        idx_of[k] = i
n = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    if n == CUT:
        for k in range(NINS):
            enc.stdin.write(inserted_frame(k).tobytes())
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
    if n in idx_of:
        f = renumber(f, idx_of[n])
    enc.stdin.write(f.tobytes())
    n += 1
enc.stdin.close(); enc.wait()
print("frames", n + NINS)
