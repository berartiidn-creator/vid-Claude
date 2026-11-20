"""Mix the bumper soundtrack with ffmpeg exactly as the Remotion composition
does (music bed with its volume envelope + SFX cues at frame-rounded times).
Used when an audio-only Remotion render is too heavy for the composition.
Usage: python3 scripts/mix_audio.py <cues.json> <out.wav> [duration_s] [fps]
cues.json = {"music": MUSIC_BED, "cues": [SoundCue...]} (exported from src/bri/sound.ts)
"""
import json
import subprocess
import sys

cues_path, out = sys.argv[1], sys.argv[2]
dur = float(sys.argv[3]) if len(sys.argv) > 3 else 60.0
fps = int(sys.argv[4]) if len(sys.argv) > 4 else 30
d = json.load(open(cues_path))
m = d["music"]
args = ["ffmpeg", "-v", "error", "-y", "-i", f"public/{m['file']}"]
filters = [f"[0:a]aresample=48000,volume={m['volume']},afade=t=in:st=0:d={4 / fps:.4f},afade=t=out:st={dur - m['fadeOutSeconds']:.4f}:d={m['fadeOutSeconds']}[m]"]
labels = ["[m]"]
for i, c in enumerate(d["cues"], start=1):
    args += ["-i", f"public/{c['file']}"]
    ms = round(round(c["at"] * fps) / fps * 1000)
    filters.append(f"[{i}:a]aresample=48000,volume={c['volume']},adelay={ms}|{ms}[c{i}]")
    labels.append(f"[c{i}]")
filters.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:dropout_transition=0,atrim=0:{dur},alimiter=limit=0.95:level=false[out]")
args += ["-filter_complex", ";".join(filters), "-map", "[out]", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", out]
subprocess.run(args, check=True)
print("mixed", len(labels), "sources ->", out)
