"""PSB header pass:
  1. remove the old burned-in centre logo (un-blend its shadow, rebuild the opaque body)
  2. remove the "PERTANYAAN n" pill on the white question cards
  3. lay the reference-style PSB header (+ top gradient) on top

usage: process.py DL WORK OUT.mp4 [--scale 540] [--start S --dur D] [--crf N]
"""
import argparse
import subprocess
import sys
import numpy as np
import cv2

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import logo_model as lm  # noqa: E402
import school_text as stx  # noqa: E402
import simple_fill as sfm  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("dl"); ap.add_argument("work"); ap.add_argument("out")
ap.add_argument("--scale", type=int, default=0)
ap.add_argument("--start", type=float, default=0)
ap.add_argument("--dur", type=float, default=0)
ap.add_argument("--crf", type=int, default=18)
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--preset", default="medium")
ap.add_argument("--cover", default="")
ap.add_argument("--cover-frames", type=int, default=24)
ap.add_argument("--xfade", type=int, default=6)
A = ap.parse_args()

lm.OPK, lm.BODY_T, lm.CLONE_T, lm.CLONE_MAXERR = 9, 0.3, 0.8, 12.0
SRC = A.dl + "/RAW/talking.mp4"
W, H = 1080, 1920
R = lm.Remover(A.work + "/tlogo_model.npz", A.work + "/tregress.npz")
SF = sfm.SimpleFill(A.work + "/tlogo_model.npz")



def load_rgba(p):
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    return cv2.cvtColor(im[..., :3], cv2.COLOR_BGR2RGB).astype(np.float32), im[..., 3:].astype(np.float32) / 255


HB = 460
hdr_rgb, hdr_a = load_rgba(A.work + "/header_full.png")
hdr_rgb, hdr_a = hdr_rgb[:HB], hdr_a[:HB]

# pill zone on the question cards
PX0, PX1, PY0, PY1 = 320, 760, 676, 796


PLATE = None


def remove_pill(f, settled):
    global PLATE
    box = f[PY0:PY1, PX0:PX1]
    b = box.astype(np.int16)
    green = (b[..., 1] - b[..., 0] > 25) & (b[..., 1] - b[..., 2] > 8) & (b[..., 1] < 210)
    if green.sum() < 25:
        if settled and green.sum() == 0:
            PLATE = box.astype(np.float32).copy()  # clean card background
        return False
    ys, xs = np.nonzero(green)
    m = np.zeros(green.shape, np.uint8)
    pad = 6
    cv2.rectangle(m, (max(xs.min() - pad, 0), max(ys.min() - pad, 0)),
                  (min(xs.max() + pad, m.shape[1] - 1), min(ys.max() + pad, m.shape[0] - 1)), 255, -1)
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))  # + soft shadow
    if PLATE is not None:
        inp = PLATE
    else:
        inp = cv2.GaussianBlur(cv2.inpaint(box, m, 15, cv2.INPAINT_TELEA).astype(np.float32), (0, 0), 8)
    fw = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 4)[..., None]
    fw = np.maximum(fw, (m[..., None] > 0) * 1.0)
    out = box.astype(np.float32) * (1 - fw) + inp * fw
    f[PY0:PY1, PX0:PX1] = np.clip(out + 0.5, 0, 255).astype(np.uint8)
    return True


dec = ["ffmpeg", "-v", "error"] + (["-ss", str(A.start)] if A.start else []) + ["-i", SRC]
dec += (["-t", str(A.dur)] if A.dur else []) + ["-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
p_in = subprocess.Popen(dec, stdout=subprocess.PIPE, bufsize=W * H * 3 * 2)

enc = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W}x{H}", "-r", str(A.fps), "-i", "-"]
enc += (["-ss", str(A.start)] if A.start else []) + ["-i", SRC] + (["-t", str(A.dur)] if A.dur else [])
vf = f"scale={A.scale}:-2:flags=lanczos," if A.scale else ""
CF = A.cover_frames if A.cover else 0
af = ["-af", f"adelay={int(CF * 1000 / A.fps)}:all=1"] if CF else []
enc += ["-map", "0:v", "-map", "1:a?", "-vf", vf + "format=yuv420p"] + af + [
        "-c:v", "libx264", "-preset", A.preset, "-crf", str(A.crf),
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", A.out]
p_out = subprocess.Popen(enc, stdin=subprocess.PIPE)

COVER = None
if A.cover:
    COVER = np.array(cv2.cvtColor(cv2.imread(A.cover), cv2.COLOR_BGR2RGB))
    for _ in range(CF):
        p_out.stdin.write(COVER.tobytes())


def cover_blend(f, k):
    """frame k of the cover->video transition: cover zooms in and fades out"""
    p = (k + 1) / (A.xfade + 1)
    e = p * p * (3 - 2 * p)
    sc = 1.0 + 0.08 * e
    M = cv2.getRotationMatrix2D((W / 2, H * 0.42), 0, sc)
    cz = cv2.warpAffine(COVER, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return (cz.astype(np.float32) * (1 - e) + f.astype(np.float32) * e).astype(np.uint8)


OUTRO = 24.62  # old logo starts its grow-into-end-card animation
vis = 1.0
n = 0
log = []
while True:
    buf = p_in.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()

    match = R.present(f)
    if match > 0.4:
        orig = f.copy()
        R.clean(f)
        if R.last_mode == "fill" and R.rejected:
            f[:] = orig
            SF.clean(f)


    top_y = f[:400:8, ::8].mean()
    tt = A.start + n / A.fps
    card = tt > OUTRO
    pill = False

    # header hidden over the white cards (the card already carries the logo)
    vis += np.clip((0.0 if card else 1.0) - vis, -1 / 8, 1 / 8)
    if vis > 0:
        a = hdr_a * vis
        f[:HB] = (f[:HB].astype(np.float32) * (1 - a) + hdr_rgb * a).astype(np.uint8)

    if COVER is not None and n < A.xfade:
        f = cover_blend(f, n)

    log.append("%d %.2f %d %d %.2f" % (n, match, top_y, pill, vis))
    p_out.stdin.write(f.tobytes())
    n += 1

p_out.stdin.close()
p_out.wait()
open(A.out + ".log", "w").write("\n".join(log))
print("frames", n)
