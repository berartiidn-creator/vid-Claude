"""Lay an SFX track under a finished video and remix.
usage: add_sfx.py IN.mp4 CUES.json OUT.mp4
CUES.json: {"offset": 0.4, "cues": [{"t": 1.23, "file": "pop.wav", "gain_db": -26, "align": "start"|"peak", "lead": 0.0}, ...]}
 t is in SOURCE seconds; offset shifts to the output timeline (cover hold).
 align=peak puts the loudest point of the sound on t (good for whooshes and impacts).
"""
import json, subprocess, sys
import numpy as np
import soundfile as sf

IN, CUES, OUT = sys.argv[1:4]
cfg = json.load(open(CUES))
SR = 48000
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", IN],
                           capture_output=True, text=True).stdout)
track = np.zeros((int(dur * SR) + SR, 2), np.float32)


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


cache = {}
for c in cfg["cues"]:
    x = cache.setdefault(c["file"], load(c["file"]))
    if c.get("max_len"):
        n = int(c["max_len"] * SR)
        if len(x) > n:
            x = x[:n].copy()
            f = min(len(x), int(0.08 * SR))
            x[-f:] *= np.linspace(1, 0, f)[:, None]
    pk = np.abs(x).max() + 1e-9
    x = x / pk * 10 ** (c["gain_db"] / 20)          # gain_db = peak level in dBFS
    t = c["t"] + cfg.get("offset", 0) - c.get("lead", 0)
    if c.get("align") == "peak":
        env = np.abs(x).mean(1)
        t -= int(np.argmax(np.convolve(env, np.ones(480) / 480, "same"))) / SR
    s = int(round(t * SR))
    if s < 0:
        x = x[-s:]; s = 0
    e = min(len(track), s + len(x))
    track[s:e] += x[:e - s]

sf.write(OUT + ".sfx.wav", track[:int(dur * SR)], SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", IN, "-i", OUT + ".sfx.wav", "-filter_complex",
                "[0:a]aresample=48000[a];[a][1:a]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[m]",
                "-map", "0:v", "-map", "[m]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart", OUT], check=True)
print("ok", len(cfg["cues"]), "cues")
