import cv2, numpy as np, json, sys
src, out = sys.argv[1], sys.argv[2]
im = cv2.imread(src).astype(np.float32)
H, W = im.shape[:2]
M = np.array([255, 0, 255], np.float32)  # BGR magenta
# panels (x0,x1,y0,y1) above the white label pills
P = {'p01_ragu': (0, 378, 0, 428), 'p02_angkat': (386, 764, 0, 428), 'p03_turun': (772, 1150, 0, 428), 'p04_pena': (1158, 1536, 0, 428),
     'p05_merenung': (0, 318, 522, 932), 'p06_berani': (327, 626, 522, 932), 'p07_closeup': (636, 922, 522, 932), 'p08_dada': (932, 1186, 522, 932),
     'p09_rekan': (1196, 1536, 522, 932)}
meta = {}
for k, (x0, x1, y0, y1) in P.items():
    c = im[y0:y1, x0:x1].copy()
    b, g, r = c[:, :, 0], c[:, :, 1], c[:, :, 2]
    # magenta-ness: high R and B, low G
    d = np.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2)
    alpha = np.clip((d - 60) / 90.0, 0, 1)
    # decorations: orange marks and the dark-green arrow
    hsv = cv2.cvtColor(c.astype(np.uint8), cv2.COLOR_BGR2HSV)
    orange = (hsv[:, :, 0] > 5) & (hsv[:, :, 0] < 22) & (hsv[:, :, 1] > 150) & (hsv[:, :, 2] > 180)
    if k in ('p02_angkat', 'p06_berani'):
        hh, ww = orange.shape
        om = cv2.dilate(orange.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
        whiteish = (c.min(axis=2) > 190)
        region = np.zeros_like(orange); region[: int(hh * 0.42), int(ww * 0.55):] = True
        alpha[(orange | (om & whiteish)) & region] = 0
    if k == 'p03_turun':
        alpha[200:306, 252:340] = 0
    if k == 'p05_merenung':
        pink = (hsv[:, :, 0] > 135) & (hsv[:, :, 0] < 175) & (hsv[:, :, 1] > 60); pink[:, : int(pink.shape[1] * 0.62)] = False; pink[int(pink.shape[0] * 0.62):, :] = False
        c[pink] = np.array([150, 215, 255], np.float32); alpha[pink] = np.minimum(alpha[pink], 0.55)
        hsv = cv2.cvtColor(np.clip(c, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV)
    # despill: remove magenta from semi-transparent edge pixels
    a3 = np.maximum(alpha, 1e-3)[:, :, None]
    col = (c - (1 - a3) * M) / a3
    col = np.clip(col, 0, 255)
    edge = (alpha < 0.98)[:, :, None]
    lim = np.minimum(col[:, :, 0:1], col[:, :, 1:2] + 30); col[:, :, 0:1] = np.where(edge, lim, col[:, :, 0:1])
    lim = np.minimum(col[:, :, 2:3], col[:, :, 1:2] + 60); col[:, :, 2:3] = np.where(edge, np.maximum(lim, col[:, :, 2:3] * 0.85), col[:, :, 2:3])
    A = (alpha * 255).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats((A > 20).astype(np.uint8), 8)
    keep = np.zeros_like(A)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 300: keep[lab == i] = 1
    A = A * keep
    rgba = np.dstack([col.astype(np.uint8), A])
    ys, xs = np.where(A > 10); yy0, yy1, xx0, xx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    cv2.imwrite(f'{out}/{k}.png', rgba[yy0:yy1, xx0:xx1])
    meta[k] = dict(w=int(xx1 - xx0), h=int(yy1 - yy0))
json.dump(meta, open(f'{out}/meta.json', 'w'), indent=1); print(meta)
