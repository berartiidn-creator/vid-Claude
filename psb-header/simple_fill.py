import numpy as np, cv2
DIL = 11
class SimpleFill:
    """For logos without shadow: inpaint the glyph mask, soften the fill, feather the seam."""
    def __init__(self, npz, ox=330, oy=0):
        d = np.load(npz)
        g = (d["opaque"] > 0).astype(np.uint8)
        el = lambda k: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
        self.m = cv2.dilate(g, el(DIL)) * 255
        self.fw = np.maximum(cv2.GaussianBlur(cv2.dilate(self.m, el(5)).astype(np.float32) / 255, (0, 0), 2.5),
                             (self.m > 0).astype(np.float32))[..., None]
        self.core = d["core"].astype(bool); self.mc = d["mean"][self.core]
        self.ox, self.oy = ox, oy
        self.h, self.w = self.m.shape
    def present(self, f):
        r = f[self.oy:self.oy + self.h, self.ox:self.ox + self.w][self.core].astype(np.float32)
        return float((np.abs(r - self.mc).mean(-1) < 28).mean())
    def clean(self, f):
        r = f[self.oy:self.oy + self.h, self.ox:self.ox + self.w]
        small = cv2.resize(r, (self.w // 2, self.h // 2), interpolation=cv2.INTER_AREA)
        ms = cv2.resize(self.m, (self.w // 2, self.h // 2), interpolation=cv2.INTER_NEAREST)
        fill = cv2.inpaint(small, ms, 8, cv2.INPAINT_NS)
        fill = cv2.resize(fill, (self.w, self.h), interpolation=cv2.INTER_CUBIC).astype(np.float32)
        fill = cv2.GaussianBlur(fill, (0, 0), 3)
        out = r.astype(np.float32) * (1 - self.fw) + fill * self.fw
        f[self.oy:self.oy + self.h, self.ox:self.ox + self.w] = np.clip(out + .5, 0, 255).astype(np.uint8)
        self.last_mode = "simple"
        return f
