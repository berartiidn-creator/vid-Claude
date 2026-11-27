# Sinkronkan data turunan VO untuk proyek BERARTI Reels.
#   python3 -I tools/sync.py <proyek>
# Menulis:
#   src/env.json      amplitudo VO per frame ('v') dan bukaan mulut halus ('open'): dipakai lip-sync dan ducking musik
#   src/project.json  durasi = akhir kata terakhir + 1,5 s (ruang untuk ending yang kembali ke cover)
# Jalankan ulang setiap kali public/vo.mp3 atau src/words.json berubah.
import json, math, subprocess, sys
import numpy as np

proj = sys.argv[1]
fps = 30
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{proj}/public/vo.mp3', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = 16000 // fps
n = len(a) // hop
rms = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
ref = np.percentile(rms[rms > 0.01], 90)
v = np.convolve(np.clip(rms / ref, 0, 1), [0.25, 0.5, 0.25], mode='same')
o = np.zeros_like(v); s = 0.0
for i, x in enumerate(v):
    k = 0.65 if x > s else 0.35          # buka cepat, tutup lebih lembut
    s += (x - s) * k; o[i] = s
json.dump({'fps': fps, 'v': [round(float(x), 3) for x in v], 'open': [round(float(x), 3) for x in o]}, open(f'{proj}/src/env.json', 'w'))

words = json.load(open(f'{proj}/src/words.json'))['words']
dur = math.ceil((words[-1]['end'] + 1.5) * 10) / 10
pj = json.load(open(f'{proj}/src/project.json')); pj['durationSeconds'] = dur
json.dump(pj, open(f'{proj}/src/project.json', 'w'))
print(f'env.json {n} frame, durasi komposisi {dur} s (VO {len(a) / 16000:.2f} s)')
for i, w in enumerate(words):
    print(f"{i}:{w['word']}@{w['start']:.2f}", end='  ' if (i + 1) % 8 else '\n')
print()
