"""Score + paper foley + the user's voice-over → out/mix.wav. Run with the library's Python from the library root."""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
LIB = os.environ.get('LIB', '.')
sys.path.insert(0, LIB)
from core.audio import sampler as S, pluck as P
from core.audio import sfx as X
from core.audio.sfx import SR, add

HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; EV = ev['ev']
words = json.load(open(os.path.join(HERE, 'words.json')))['words']
N = int(DUR * SR) + SR
rng = np.random.default_rng(5)

# ---------------- voice ----------------
vo_wav = os.path.join(HERE, 'out', 'vo.wav')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(HERE, 'audio', 'voiceover.mp3'), '-ar', str(SR), '-ac', '1', vo_wav], check=True)
vo, _ = sf.read(vo_wav, dtype='float32')
vo = sosfilt(butter(2, 90, 'high', fs=SR, output='sos'), vo).astype(np.float32)
vo = X.compress(vo, thr=.2, ratio=3.0)
vo = vo / (np.abs(vo).max() + 1e-9) * .8
voice = np.zeros((N, 2), np.float32); add(voice, vo, 0.0, 1.0, 0)

# speech mask for ducking (300 ms smoothing)
mask = np.zeros(N, np.float32)
for w in words:
    a, b = int((w['start'] - .08) * SR), int((w['end'] + .15) * SR); mask[max(0, a):b] = 1
k = int(.3 * SR); ker = np.ones(k, np.float32) / k
mask = np.convolve(mask, ker, 'same')

# ---------------- score ----------------
BPM = 92; B = 60 / BPM
notes = []   # (t, inst, pitch, dur, vel, pan)
def sec(t0, t1): return np.arange(t0, t1 - 1e-6, B)
CH = {'F': ['F3', 'A3', 'C4', 'F4', 'A4', 'C5'], 'Dm': ['D3', 'F3', 'A3', 'D4', 'F4', 'A4'], 'Bb': ['Bb2', 'D3', 'F3', 'Bb3', 'D4', 'F4'], 'C': ['C3', 'E3', 'G3', 'C4', 'E4', 'G4'], 'Gm': ['G2', 'Bb2', 'D3', 'G3', 'Bb3', 'D4'], 'A': ['A2', 'C#3', 'E3', 'A3', 'C#4', 'E4']}
def prog(t0, t1, seq):
    out = []; i = 0
    for t in np.arange(t0, t1 - 1e-6, 4 * B): out.append((t, seq[i % len(seq)])); i += 1
    return out
mb = []   # music box notes, rendered with pluck (t, pitch, vel)

# 1. meeting (0–5.5): light pizzicato ostinato
for t, c in prog(0.0, 5.45, ['F', 'Dm']):
    for j in range(8):
        tt = t + j * B / 2
        if tt > 5.4: break
        notes.append((tt, 'violins_pizz', CH[c][3 + j % 3], .3, .32 + .05 * (j % 2 == 0), .25))
    notes.append((t, 'cellos_pizz', CH[c][0], .6, .5, -.2)); notes.append((t + 2 * B, 'cellos_pizz', CH[c][2], .6, .4, -.2))
# 2. morning + the thought (5.6–14.7): harp arpeggios + clarinet line; glock on the idea
for t, c in prog(5.6, 14.6, ['F', 'C', 'Dm', 'Bb'] if True else []):
    for j, n in enumerate([0, 1, 2, 3]):
        notes.append((t + j * B, 'harp', CH[c][n + 1], 1.6, .4, -.1))
mel = [(5.7, 'A4', 1.3), (7.0, 'C5', 1.3), (8.3, 'F5', .7), (9.0, 'E5', 1.0), (10.1, 'D5', 1.2), (11.4, 'C5', 1.3), (12.8, 'Bb4', .9), (13.7, 'A4', .9)]
for t, p, d in mel: notes.append((t, 'clarinet', p, d, .45, .15))
for i, p in enumerate(['C6', 'F6', 'A6']): notes.append((8.9 + i * .1, 'glockenspiel', p, 1.5, .5, .3))
# 3. the hand goes up and down (14.7–16.3), then silence
notes.append((14.75, 'harp', 'D4', 2, .45, 0)); notes.append((15.0, 'harp', 'A4', 2, .4, 0)); notes.append((15.9, 'clarinet', 'F4', .45, .35, 0)); notes.append((15.95, 'clarinet', 'E4', .3, .3, 0))
# 4. everyone nods (16.9–21.4): tighter pizzicato, minor
for t, c in prog(16.9, 21.3, ['Dm', 'Bb', 'Gm', 'A']):
    for j in range(16):
        tt = t + j * B / 4
        if tt > 21.25: break
        notes.append((tt, 'violins_pizz', CH[c][3 + (j % 4 if j % 4 < 3 else 1)], .25, .28 + .1 * (j % 4 == 0), .2))
    notes.append((t, 'cellos_pizz', CH[c][0], .6, .55, -.2)); notes.append((t + 2 * B, 'cellos_pizz', CH[c][0], .6, .45, -.2))
# 5. night (21.8–27.7): music box alone
for t, p in [(21.9, 'A5'), (22.55, 'F5'), (23.2, 'D5'), (24.5, 'E5'), (25.15, 'F5'), (25.8, 'A5'), (26.45, 'G5'), (27.1, 'E5')]: mb.append((t, p, .55))
for t, p in [(21.9, 'D4'), (24.5, 'A3'), (27.1, 'C#4')]: mb.append((t, p, .35))
# 6. understanding (28.1–40.2): music box + clarinet + glock, brightening to F major
for t, c in prog(28.15, 40.1, ['F', 'C', 'Dm', 'Bb']):
    for j in range(4): mb.append((t + j * B, CH[c][3 + j % 3].replace('3', '5').replace('4', '5'), .4))
    notes.append((t, 'harp', CH[c][0], 2.5, .35, -.1))
for t, p, d in [(29.6, 'A4', 1.6), (31.3, 'C5', 1.6), (32.9, 'D5', 1.5), (34.5, 'F5', .8), (35.3, 'E5', 1.6), (37.2, 'C5', 1.2), (38.4, 'F5', 1.8)]: notes.append((t, 'clarinet', p, d, .5, .15))
for i, p in enumerate(['F6', 'A6', 'C7', 'F7']): notes.append((T := 28.82 + i * .09, 'glockenspiel', p, 1.6, .45, .3))
for i, p in enumerate(['C6', 'F6', 'A6']): notes.append((39.5 + i * .12, 'glockenspiel', p, 1.6, .45, .3))
# 7. next meeting (40.4–44.7): full, major
for t, c in prog(40.4, 44.7, ['F', 'Bb']):
    for j in range(8):
        tt = t + j * B / 2
        if tt > 44.65: break
        notes.append((tt, 'violins_pizz', CH[c][3 + j % 3], .3, .4, .25))
    notes.append((t, 'cellos_pizz', CH[c][0], .6, .55, -.2)); notes.append((t + 2 * B, 'cellos_pizz', CH[c][2], .6, .45, -.2))
for t, p, d in [(40.5, 'F4', .6), (41.2, 'A4', .6), (41.9, 'C5', 1.2), (43.2, 'F5', 1.3)]: notes.append((t, 'clarinet', p, d, .55, .15))
for i, p in enumerate(['F6', 'A6', 'C7']): notes.append((43.15 + i * .1, 'glockenspiel', p, 1.6, .5, .3))
# 8. close (44.8–52.3): music box + clarinet, ends on F
for t, p in [(44.9, 'C6'), (45.55, 'A5'), (46.2, 'F5'), (46.85, 'G5'), (47.5, 'A5'), (48.8, 'C6'), (49.45, 'A5'), (50.1, 'G5'), (50.9, 'F5')]: mb.append((t, p, .5))
for t, p, d in [(44.9, 'A4', 2.5), (47.6, 'C5', 2.4), (50.0, 'A4', 2.2)]: notes.append((t, 'clarinet', p, d, .42, .15))
for p in ['F3', 'C4', 'F4', 'A4']: notes.append((50.9, 'harp', p, 1.4, .45, 0))
notes.append((50.95, 'glockenspiel', 'F6', 1.4, .4, .3))

score = S.render(notes, dur=DUR + 1, master=False)
score = np.pad(score, ((0, max(0, N - len(score))), (0, 0)))[:N]
for t, p, v in mb:
    x = P.pluck('music_box', p, None, vel=v); add(score, x, t, .55, .1)
# silences before the hesitation and before the turn
for a, b in [(16.3, 16.9), (27.7, 28.1)]:
    g = np.ones(N, np.float32); ia, ib = int(a * SR), int(b * SR); g[ia:ib] = 0
    f = int(.15 * SR); g[max(0, ia - f):ia] = np.linspace(1, 0, min(f, ia)); score *= g[:, None]
score = S.room(score, size=.35, mix=.16)
score = score / (np.abs(score).max() + 1e-9) * .5
duck = 1 - .45 * np.clip(mask, 0, 1)
score *= duck[:, None]

# ---------------- foley ----------------
fx = np.zeros((N, 2), np.float32)
def crinkle(d=.12, v=1.0): x = X.bp(X.noise(d), 1800, 7000) * X.env_exp(d, d / 4) * v; return x.astype(np.float32)
def tink(f=2400, d=.25, v=.4): t = X.t_(d); return (np.sin(2 * np.pi * f * t) * np.exp(-t / .05) * v).astype(np.float32)
def blip(f, v=.18): t = X.t_(.045); w = np.sign(np.sin(2 * np.pi * f * t)) * np.exp(-t / .02) * v; return X.lp(w, 3500).astype(np.float32)
def roll(d, v=.5): t = X.t_(d); return (X.bp(X.noise(d), 600, 3000) * (.4 + .6 * np.sin(np.pi * t / d)) * v).astype(np.float32)
G = dict(pop=.45, fold=.35, page=.5, creak=.6, thump=.8, tick=.25, ding=.35, string=.35, dim=.4, sign=.7, check=.4, sparkle=.4, slide=.3, unroll=.35, step=.3, blip=.5, spin=.25)
for e in EV:
    t, ty = e['t'], e['type']; g = G.get(ty, .3); pan = float(rng.uniform(-.3, .3))
    if ty == 'pop': add(fx, X.pop(1.0), t, g, pan); add(fx, crinkle(.1, .6), t, g, pan)
    elif ty == 'fold': add(fx, X.whoosh(.25, .6), t, g * .6, pan); add(fx, crinkle(.18, .5), t, g, pan)
    elif ty == 'page': add(fx, X.whoosh(max(.4, e.get('d', 1.0)), 1.0), t, g, 0); add(fx, crinkle(.35, .7), t + .2, g, .2); add(fx, crinkle(.25, .5), t + e.get('d', 1.0) * .8, g, -.2)
    elif ty == 'creak': add(fx, X.creak(1.0), t, g, 0)
    elif ty == 'thump': add(fx, X.thump(1.0, 70), t, g, 0); add(fx, crinkle(.2, .4), t, g, 0)
    elif ty == 'tick': add(fx, X.click(1.8, .5), t, g, .3)
    elif ty == 'spin':
        for i in range(14): add(fx, X.click(2.0, .4), t + i * e.get('d', .6) / 14, g, .3)
    elif ty == 'ding': add(fx, X.ding(1.0), t, g, .2)
    elif ty == 'string': add(fx, tink(2600, .3, .5), t, g, pan); add(fx, X.whoosh(.2, .4), t, g * .5, pan)
    elif ty == 'dim': tt = X.t_(.6); add(fx, (np.sin(2 * np.pi * (520 - 300 * tt) * tt) * np.exp(-tt / .25) * .4).astype(np.float32), t, g, 0)
    elif ty == 'sign': add(fx, X.thump(1.0, 90), t, g, 0); add(fx, tink(1900, .25, .4), t + .05, g, -.3); add(fx, tink(2100, .25, .4), t + .09, g, .3)
    elif ty == 'check': add(fx, X.pop(1.0), t, g, pan); add(fx, tink(1600 + 300 * rng.random(), .2, .4), t + .02, g, pan)
    elif ty == 'sparkle':
        for i in range(8): add(fx, tink(2200 + 400 * i, .3, .25), t + i * .09, g, float(rng.uniform(-.5, .5)))
    elif ty == 'slide': add(fx, roll(e.get('d', 1.0), .4), t, g, 0)
    elif ty == 'unroll': add(fx, roll(e.get('d', .8), .6), t, g, 0)
    elif ty == 'step': add(fx, X.step(.6), t, g, pan); add(fx, crinkle(.06, .4), t, g, pan)
    elif ty == 'blip': add(fx, blip(560 if e.get('who') == 'raka' else 330), t, g, -.2 if e.get('who') == 'raka' else .2)
fx = np.stack([X.limit(fx[:, 0], .5), X.limit(fx[:, 1], .5)], 1)

# ---------------- ambience ----------------
amb = np.zeros((N, 2), np.float32)
room = X.lp(X.brown(DUR + 1), 400).astype(np.float32); room = room / (np.abs(room).max() + 1e-9) * .05
add(amb, room, 0, 1, 0)
for s in np.arange(2.3, 21.2, 1.0): add(amb, X.click(1.4, .25), s, .12, .4)       # wall clock in the meeting
for s in np.arange(41.5, 48.5, 1.0): add(amb, X.click(1.4, .25), s, .12, .4)
night = X.bp(X.noise(18.2), 3500, 6000).astype(np.float32) * .012
t = X.t_(18.2); night *= (.5 + .5 * np.sin(2 * np.pi * 7 * t) ** 8)
add(amb, night, 21.9, 1, -.3)

mix = voice * 1.0 + score + fx * .9 + amb
peak = np.abs(mix).max(); mix = mix / peak * .89
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int(DUR * SR)], SR)
print('mix.wav', mix.shape, 'peak', peak)
print('\n'.join(S.credits(sorted({n[1] for n in notes}))))
