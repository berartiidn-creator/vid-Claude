import sys; sys.path.insert(0, ".")
import numpy as np, cv2
from logo_model import RH, RW
a = np.fromfile('../dl/reg2.raw', np.uint8).reshape(-1, RH, RW, 3)
t = np.arange(len(a)) / 8
bad = ((t > 1.3) & (t < 4)) | ((t > 17.8) & (t < 20.5)) | ((t > 37.4) & (t < 40))
a = a[~bad]
d = np.load('logo_model.npz')
sd = a.astype(np.float32).std(0).mean(-1)
core0 = (sd < 30).astype(np.uint8); core0[235:] = 0
el = lambda k: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
zone = cv2.dilate(core0, el(61))
known = (1 - zone).astype(np.float32)
known[250:] = 0  # bottom has other overlays
kd = cv2.GaussianBlur(known, (0, 0), 18)[..., None]
S = {k: np.zeros((RH, RW, 3), np.float64) for k in ['w', 'B', 'v', 'BB', 'Bv']}
ring = (cv2.dilate(zone, el(31)) > 0) & (known > 0)
for f in a:
    f = f.astype(np.float32)
    B = cv2.GaussianBlur(f * known[..., None], (0, 0), 18) / np.maximum(kd, 1e-4)
    # weight: how smooth is the surrounding ring (well-predicted background)
    hf = np.abs(f - cv2.GaussianBlur(f, (0, 0), 6))[ring].mean()
    w = 1.0 / (1.0 + (hf / 3.0) ** 2)
    S['w'] += w; S['B'] += w * B; S['v'] += w * f; S['BB'] += w * B * B; S['Bv'] += w * B * f
mB = S['B'] / S['w']; mv = S['v'] / S['w']
var = S['BB'] / S['w'] - mB ** 2
cov = S['Bv'] / S['w'] - mB * mv
k = np.clip(cov / np.maximum(var, 1), 0, 1.05)
kk = np.clip(k.mean(-1), 0, 1)
kk = np.where(zone > 0, kk, 1.0)
kk = cv2.GaussianBlur(kk.astype(np.float32), (0, 0), 0.8)
c = mv - kk[..., None] * mB  # = a*L
c = np.where((zone > 0)[..., None], c, 0)
np.savez_compressed('regress.npz', k=kk.astype(np.float32), c=c.astype(np.float32), zone=zone)
cv2.imwrite('k.png', cv2.resize((np.clip(1 - kk, 0, 1) * 255 * 2).clip(0, 255).astype(np.uint8), None, fx=2, fy=2))
print('done', np.percentile(kk[zone > 0], [1, 10, 50, 90]))
