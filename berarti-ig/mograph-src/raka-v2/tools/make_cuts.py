import sys, json, cv2, numpy as np
sys.path.insert(0, sys.argv[1]); from cutout import *
R = sys.argv[2]; O = sys.argv[3]; meta = {}
# 1) meeting row (B_1.0): y 880..1244
im = load(f'{R}/fr/B_1.0.png')
row = im[880:1244].copy()
h, w = row.shape[:2]
bg = flood_bg(row, [(5, 5), (250, 5), (600, 5), (1070, 5), (600, 300), (560, 200), (620, 340)], tol=7)
chair = chair_mask(row)
bgm = bg | chair
for name, (a, b) in {'meet_hijabL': (0, 245), 'meet_arti': (270, 565), 'meet_curly': (640, 905), 'meet_hijabR': (880, 1080)}.items():
    sub = row[:, a:b].copy(); m = bgm[:, a:b].copy()
    if name == 'meet_curly': m[:, 240:] |= ~bgm[:, a + 240:b] & (sub[:, 240:, 2] > 150)  # trim hijab overlap on the right edge
    r = save_rgba(sub, m, f'{O}/{name}.png'); r['src_x'] = a; r['src_y'] = 880; meta[name] = r
# 2) close-up front bust (B_15): y 760..1430, x 200..880
im = load(f'{R}/src/B_15.png'); c = im[760:1395, 200:880].copy()
bg = flood_bg(c, [(5, 5), (670, 5), (5, 300), (670, 300)], tol=12)
meta['bust_front'] = save_rgba(c, bg, f'{O}/bust_front.png', largest=True)
# 3) dark green bust (B_33): y 980..1400, x 300..800
im = load(f'{R}/src/B_33.png'); c = im[980:1400, 300:800].copy()
bg = key_color(c, c[5, 5].tolist(), 28)
meta['bust_dark'] = save_rgba(c, bg, f'{O}/bust_dark.png', largest=True)
# 4) standing presenter (B_28.5): y 560..1400, x 30..520
im = load(f'{R}/src/B_28.5.png'); c = im[560:1400, 30:520].copy()
bg = flood_bg(c, [(5, 5), (480, 5), (5, 400), (480, 400), (5, 700), (480, 700), (5, 830), (480, 830)], tol=8)
meta['stand_present'] = save_rgba(c, bg, f'{O}/stand_present.png', largest=True)
# 5) seated at desk (A_17): y 860..1262, x 380..720
im = load(f'{R}/src/A_17.png'); c = im[860:1262, 380:720].copy()
bg = flood_bg(c, [(3, 3), (335, 3), (3, 200), (335, 200)], tol=8)
meta['desk_arti'] = save_rgba(c, bg | chair_mask(c), f'{O}/desk_arti.png', largest=True)
json.dump(meta, open(f'{O}/meta.json', 'w'), indent=1)
print(json.dumps(meta))
