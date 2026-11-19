"""Prepend a still cover to a video with a zoom+fade transition; audio shifted to stay in sync.
usage: embed_cover.py SRC COVER OUT [--hold 0.8] [--xfade 0.2] [--crf 20]"""
import argparse, json, subprocess
import numpy as np, cv2
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("cover"); ap.add_argument("out")
ap.add_argument("--hold", type=float, default=0.8); ap.add_argument("--xfade", type=float, default=0.2)
ap.add_argument("--crf", type=int, default=20); ap.add_argument("--preset", default="fast")
A = ap.parse_args()
info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                  "stream=width,height,r_frame_rate", "-of", "json", A.src],
                                 capture_output=True, text=True).stdout)["streams"][0]
W, H = info["width"], info["height"]
num, den = map(int, info["r_frame_rate"].split("/")); fps = num / den
HOLD, XF = int(round(A.hold * fps)), int(round(A.xfade * fps))
cov = cv2.cvtColor(cv2.imread(A.cover), cv2.COLOR_BGR2RGB)
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", A.src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       stdout=subprocess.PIPE, bufsize=W * H * 6)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                        "-r", info["r_frame_rate"], "-i", "-", "-i", A.src, "-map", "0:v", "-map", "1:a?",
                        "-af", f"adelay={int(HOLD * 1000 / fps)}:all=1", "-c:v", "libx264", "-preset", A.preset,
                        "-crf", str(A.crf), "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                        "-movflags", "+faststart", A.out], stdin=subprocess.PIPE)
for _ in range(HOLD):
    enc.stdin.write(cov.tobytes())
n = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3:
        break
    f = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    if n < XF:
        p = (n + 1) / (XF + 1); e = p * p * (3 - 2 * p)
        M = cv2.getRotationMatrix2D((W / 2, H * 0.42), 0, 1 + 0.08 * e)
        cz = cv2.warpAffine(cov, M, (W, H), borderMode=cv2.BORDER_REFLECT)
        f = (cz.astype(np.float32) * (1 - e) + f.astype(np.float32) * e).astype(np.uint8)
    enc.stdin.write(f.tobytes()); n += 1
enc.stdin.close(); enc.wait()
print("frames", n, "fps", fps)
