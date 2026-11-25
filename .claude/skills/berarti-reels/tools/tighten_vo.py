# Padatkan satu bagian VO yang terasa lambat (dipakai di C2: langkah 1 jadi 1,1 s lebih ringkas).
#   python3 -I tools/tighten_vo.py <proyek> --from 13.5 --to 23.0 [--keep 0.2] [--tempo 1.10] [--thr -34]
# Langkah:
#   1. Di rentang itu, setiap jeda hening yang lebih panjang dari --keep dipotong sampai tersisa --keep detik
#      (diukur dari energi audio, bukan dari timing kata; napas di atas --thr dB tidak dipotong).
#   2. Rentang itu dipercepat dengan atempo (nada suara tetap). Lebih dari 1.10 mulai terdengar terburu-buru.
#   3. src/words.json dipetakan ulang dengan peta waktu yang sama.
# Asli disimpan sekali sebagai public/vo_orig.mp3 dan src/words_orig.json, dan selalu jadi sumber, jadi aman diulang.
# Sesudahnya jalankan tools/sync.py. File VO tidak pernah di-commit ke repo.
import argparse, json, os, shutil, subprocess
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('proj'); ap.add_argument('--from', dest='a', type=float, required=True); ap.add_argument('--to', dest='b', type=float, required=True)
ap.add_argument('--keep', type=float, default=0.2); ap.add_argument('--tempo', type=float, default=1.10); ap.add_argument('--thr', type=float, default=-34)
o = ap.parse_args()
P = o.proj; SR = 48000
if not os.path.exists(f'{P}/public/vo_orig.mp3'): shutil.copy(f'{P}/public/vo.mp3', f'{P}/public/vo_orig.mp3')
if not os.path.exists(f'{P}/src/words_orig.json'): shutil.copy(f'{P}/src/words.json', f'{P}/src/words_orig.json')

def dec(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def stretch(x, k):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', f'atempo={k}', '-f', 'f32le', '-'],
                       input=x.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).copy()
xf = int(0.006 * SR)
def splice(parts):
    out = parts[0]
    for p in parts[1:]:
        r = np.linspace(0, 1, xf, dtype=np.float32)
        out = np.concatenate([out[:-xf], out[-xf:] * (1 - r) + p[:xf] * r, p[xf:]])
    return out

x = dec(f'{P}/public/vo_orig.mp3')
W = json.load(open(f'{P}/src/words_orig.json')); ws = W['words']
hop = int(0.005 * SR)
rms = np.sqrt(np.convolve(x * x, np.ones(hop) / hop, 'same'))[::hop]
quiet = rms < rms.max() * 10 ** (o.thr / 20)
cuts, k = [], int(o.a / 0.005)
while k < int(o.b / 0.005):
    if quiet[k]:
        s = k
        while k < len(quiet) and quiet[k]: k += 1
        L = (k - s) * 0.005
        if L > o.keep + 0.02:
            cuts.append((s * 0.005 + o.keep / 2, k * 0.005 - o.keep / 2))
    k += 1
segs, prev = [], 0.0
for c0, c1 in cuts:
    segs.append(x[int(prev * SR):int(c0 * SR)]); prev = c1
segs.append(x[int(prev * SR):])
y = splice(segs)
def m_cut(t):
    s = 0.0
    for c0, c1 in cuts:
        if t >= c1: s += (c1 - c0) - xf / SR
        elif t > c0: return c0 - s
    return t - s
A, B = m_cut(o.a), m_cut(o.b)
mid = stretch(y[int(A * SR):int(B * SR)], o.tempo)
z = splice([y[:int(A * SR)], mid, y[int(B * SR):]])
kk = (len(mid) / SR) / (B - A)
def m_all(t):
    u = m_cut(t)
    if u <= A: return u
    if u <= B: return A + (u - A) * kk
    return A + (B - A) * kk + (u - B) - xf / SR * 2
for w in ws:
    w['start'] = round(m_all(w['start']), 3); w['end'] = round(m_all(w['end']), 3)
for s in W.get('sentences', []):
    for key in ('start', 'end'):
        if key in s: s[key] = round(m_all(s[key]), 3)
old = W.get('duration', len(x) / SR); W['duration'] = round(len(z) / SR, 3)
json.dump(W, open(f'{P}/src/words.json', 'w'), ensure_ascii=False, indent=1)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', f'{P}/public/vo.mp3'],
               input=z.astype(np.float32).tobytes(), check=True)
print(f'{len(cuts)} jeda dipotong, tempo {o.tempo}: VO {old:.2f} s -> {W["duration"]:.2f} s (hemat {old - W["duration"]:.2f} s). Lanjut: tools/sync.py')
