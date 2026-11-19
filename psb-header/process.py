"""Remove the old centred header logo and lay the reference-style PSB header on top.

usage: process.py DL WORK OUT.mp4 [--scale 540] [--start S --dur D] [--crf N]
"""
import argparse
import subprocess
import numpy as np
import cv2

ap = argparse.ArgumentParser()
ap.add_argument("dl"); ap.add_argument("work"); ap.add_argument("out")
ap.add_argument("--scale", type=int, default=0)
ap.add_argument("--start", type=float, default=0)
ap.add_argument("--dur", type=float, default=0)
ap.add_argument("--crf", type=int, default=18)
ap.add_argument("--fps", type=int, default=30)
A = ap.parse_args()

SRC = A.dl + "/RAW/raw.mp4"
W, H = 1080, 1920
OX, OY, RW, RH = 370, 20, 360, 240  # ROI holding the old logo

# ---- static mask of old logo, built from temporal statistics ----
roi = np.fromfile(A.dl + "/reg.raw", np.uint8).reshape(-1, RH, RW, 3)
t = np.arange(len(roi)) / 3
keep = ~(((t > 1.3) & (t < 4)) | ((t > 17.8) & (t < 20.5)) | ((t > 37.4) & (t < 40)))
stack = roi[keep].astype(np.float32)
med = np.median(stack, 0)
std = stack.std(0).mean(-1)
core = (std < 18).astype(np.uint8)
wide = (std < 30).astype(np.uint8)
# include anti-aliasing + soft drop shadow around the logo
mask = cv2.dilate(wide, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))) * 255
feather = cv2.GaussianBlur(cv2.dilate(mask, np.ones((5, 5), np.uint8)).astype(np.float32) / 255, (0, 0), 3)[..., None]
core_idx = core.astype(bool)
med_core = med[core_idx]

hdr = cv2.imread(A.work + "/header_full.png", cv2.IMREAD_UNCHANGED)
hdr_rgb = cv2.cvtColor(hdr[..., :3], cv2.COLOR_BGR2RGB).astype(np.float32)
hdr_a = hdr[..., 3:].astype(np.float32) / 255.0
HB = 460  # header + gradient live in the top 460 px
hdr_rgb, hdr_a = hdr_rgb[:HB], hdr_a[:HB]

dec = ["ffmpeg", "-v", "error"]
if A.start:
    dec += ["-ss", str(A.start)]
dec += ["-i", SRC]
if A.dur:
    dec += ["-t", str(A.dur)]
dec += ["-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
p_in = subprocess.Popen(dec, stdout=subprocess.PIPE, bufsize=W * H * 3 * 2)

enc = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W}x{H}", "-r", str(A.fps), "-i", "-"]
enc += (["-ss", str(A.start)] if A.start else []) + ["-i", SRC]
if A.dur:
    enc += ["-t", str(A.dur)]
vf = f"scale={A.scale}:-2:flags=lanczos," if A.scale else ""
enc += ["-map", "0:v", "-map", "1:a?", "-vf", vf + "format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", str(A.crf),
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", A.out]
p_out = subprocess.Popen(enc, stdin=subprocess.PIPE)

hdr_vis = 1.0
n = 0
log = []
while True:
    buf = p_in.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()

    # 1) is the old logo on this frame?  (fraction of logo pixels matching)
    r = f[OY:OY + RH, OX:OX + RW]
    diff = np.abs(r[core_idx].astype(np.float32) - med_core).mean(-1)
    match = float((diff < 28).mean())
    if match > 0.4:
        inp = cv2.inpaint(r, mask, 9, cv2.INPAINT_TELEA).astype(np.float32)
        inp = cv2.GaussianBlur(inp, (0, 0), 5)
        out = r.astype(np.float32) * (1 - feather) + inp * feather
        f[OY:OY + RH, OX:OX + RW] = np.clip(out, 0, 255).astype(np.uint8)

    # 2) hide header over the white question cards (it would be invisible)
    top_y = f[:400:8, ::8].mean()
    target = 0.0 if top_y > 205 else 1.0
    hdr_vis += np.clip(target - hdr_vis, -1 / 6, 1 / 6)  # ~0.2 s fade

    if hdr_vis > 0:
        top = f[:HB].astype(np.float32)
        a = hdr_a * hdr_vis
        f[:HB] = (top * (1 - a) + hdr_rgb * a).astype(np.uint8)

    log.append((n, round(match, 2), round(top_y), round(hdr_vis, 2)))
    p_out.stdin.write(f.tobytes())
    n += 1

p_out.stdin.close()
p_out.wait()
with open(A.out + ".log", "w") as fh:
    for row in log:
        fh.write("%d %.2f %d %.2f\n" % row)
print("frames", n)
