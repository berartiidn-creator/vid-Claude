"""Model of the burned-in old logo:  v = a*L + (1-a)*B   (a = alpha, L = logo colour incl. shadow).

Estimated from hundreds of frames with varying backgrounds: std(v) = (1-a)*std(B),
mean(v) = a*L + (1-a)*mean(B); mean(B)/std(B) are interpolated from the unaffected
surroundings. Removal = un-blend where a is moderate, inpaint only the opaque core.
"""
import numpy as np
import cv2

OX, OY, RW, RH = 330, 0, 440, 300
OPK, HALO_GAIN = 5, 1.0
CORR_MAX = 8
BODY_T = 0.5
CLONE_T = 4.0
CLONE_MAXERR = 1e9


def build(reg_path, save_path):
    a = np.fromfile(reg_path, np.uint8).reshape(-1, RH, RW, 3)
    t = np.arange(len(a)) / 8
    bad = ((t > 1.3) & (t < 4)) | ((t > 17.8) & (t < 20.5)) | ((t > 37.4) & (t < 40))
    a = a[~bad].astype(np.float32)
    mean, std = a.mean(0), a.std(0)
    sd = std.mean(-1)
    core0 = (sd < 30).astype(np.uint8)
    core0[235:] = 0  # bottom of ROI holds other overlays, not the logo
    aff = cv2.dilate(core0, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61)))
    w = (1 - aff).astype(np.float32)
    den = cv2.GaussianBlur(w, (0, 0), 25)[..., None]
    mB = cv2.GaussianBlur(mean * w[..., None], (0, 0), 25) / den
    sB = cv2.GaussianBlur(std * w[..., None], (0, 0), 25) / den

    oma = np.clip(std / np.maximum(sB, 1), 0, 1).mean(-1)
    alpha = 1 - oma
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.7)
    # confine to the logo + its halo
    zone = cv2.dilate(core0, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (51, 51)))
    zone = cv2.GaussianBlur(zone.astype(np.float32), (0, 0), 4)
    alpha = np.clip((alpha - 0.04) / 0.96, 0, 1) * zone

    L = (mean - (1 - alpha[..., None]) * mB) / np.maximum(alpha[..., None], 0.05)
    L = np.clip(L, 0, 255)
    # halo: shadow colour is smooth; denoise it
    Ls = cv2.GaussianBlur(L, (0, 0), 2)
    halo = (alpha < 0.6)[..., None]
    L = np.where(halo, Ls, L)

    body = ((sd < 30) & (core0 > 0)) | (alpha > 0.55)
    opaque = cv2.dilate(body.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (OPK, OPK)))
    alpha = np.where(opaque > 0, alpha, np.clip(alpha * HALO_GAIN, 0, 0.95))
    np.savez_compressed(save_path, alpha=alpha.astype(np.float32), L=L.astype(np.float32),
                        opaque=opaque, core=(sd < 18) & (core0 > 0), mean=mean)


class Remover:
    def __init__(self, path, reg_path):
        d = np.load(path)
        g = np.load(reg_path)
        a_old = d["alpha"]
        aL_old = d["alpha"][..., None] * d["L"]
        a_reg = 1 - g["k"]
        bad = np.abs(a_reg - a_old) > 0.2
        bad = cv2.dilate(bad.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        a = np.where(bad, a_old, a_reg)
        self.alpha = a[..., None]
        self.aL = np.where(bad[..., None], aL_old, g["c"])
        wide = cv2.dilate(d["core"].astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
        # inconsistent pixels: logo colour present but alpha says "no logo"
        incons = (np.abs(self.aL).mean(-1) > 6 + 120 * a)
        body = (a > BODY_T) | (a_old > BODY_T) | (a_reg > BODY_T) | wide | incons
        body = cv2.morphologyEx(body.astype(np.uint8), cv2.MORPH_CLOSE,
                                cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
        op = cv2.dilate(body, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (OPK, OPK)))
        self.opaque = op * 255
        self.core = d["core"].astype(bool)
        self.mcore = d["mean"][self.core]
        self.inv = 1 / np.maximum(1 - self.alpha, 0.3)
        # blend unblended -> inpainted across the opaque boundary
        op8 = (self.opaque > 0).astype(np.uint8)
        el = lambda k: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
        self.known = (1 - cv2.dilate(op8, el(45))).astype(np.float32)
        self.kden = np.maximum(cv2.GaussianBlur(self.known, (0, 0), 30), 1e-3)[..., None]
        mm = cv2.dilate(op8, el(31))
        self.memb_mask = mm * 255
        self.membW = cv2.GaussianBlur(cv2.erode(mm, el(9)).astype(np.float32), (0, 0), 4)[..., None]
        cm = cv2.dilate(op8, el(15))
        self.clone_mask = cm * 255
        self.clone_ring = (cv2.dilate(cm, el(21)) - cm) * 255
        self.ring = (cv2.dilate(op8, el(81)) > 0) & (self.known > 0)
        self.zoneW = cv2.GaussianBlur(cv2.dilate(op8, el(25)).astype(np.float32), (0, 0), 8)[..., None]
        self.wf = cv2.GaussianBlur(cv2.dilate(self.opaque, np.ones((3, 3), np.uint8)).astype(np.float32) / 255,
                                   (0, 0), 1.2)[..., None]

    def clone_fill(self, f, prev=None):
        """Textured backgrounds: copy matching texture from elsewhere in the frame."""
        ys, xs = np.nonzero(self.clone_mask)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        hm = self.clone_mask[y0:y1, x0:x1]
        ring = self.clone_ring[y0:y1, x0:x1] > 0
        gy0, gx0 = OY + y0, OX + x0
        hh, ww = y1 - y0, x1 - x0
        H, W = f.shape[:2]
        tgt = f[gy0:gy0 + hh, gx0:gx0 + ww].astype(np.float32)
        best = None
        cands = [(dy, dx) for dy in range(-40, 241, 20) for dx in range(-420, 421, 20)
                 if (abs(dx) >= ww + 4 or dy >= hh + 4)]
        if prev is not None:
            cands = [prev] + cands
        for dy, dx in cands:
            sy, sx = gy0 + dy, gx0 + dx
            if sy < 0 or sx < 0 or sy + hh > H or sx + ww > W:
                continue
            src = f[sy:sy + hh, sx:sx + ww].astype(np.float32)
            if src.shape != tgt.shape:
                continue
            e = float(np.abs(src[ring] - tgt[ring]).mean())
            if not np.isfinite(e):
                continue
            if prev is not None and (dy, dx) == prev:
                e *= 0.85  # temporal stickiness
            if best is None or e < best[0]:
                best = (e, dy, dx)
        self.rejected = best is not None and best[0] > CLONE_MAXERR
        if best is None or best[0] > CLONE_MAXERR:
            return f, None
        _, dy, dx = best
        src = f[gy0 + dy:gy0 + dy + hh, gx0 + dx:gx0 + dx + ww].copy()
        center = (gx0 + ww // 2, gy0 + hh // 2)
        out = cv2.seamlessClone(src, f, hm, center, cv2.NORMAL_CLONE)
        return out, (dy, dx)

    def present(self, f):
        r = f[OY:OY + RH, OX:OX + RW][self.core].astype(np.float32)
        return float((np.abs(r - self.mcore).mean(-1) < 28).mean())

    prev_off = None

    def clean(self, f):
        r = f[OY:OY + RH, OX:OX + RW].astype(np.float32)
        hf0 = np.abs(r - cv2.GaussianBlur(r, (0, 0), 4))[self.ring].mean()
        self.rejected = False
        if hf0 > CLONE_T:  # textured background -> clone matching texture
            try:
                c, off = self.clone_fill(f.copy(), self.prev_off)
            except cv2.error:
                c, off = f, None
            if off is not None and self.present(c) < 0.2:
                self.prev_off = off
                f[OY:OY + RH, OX:OX + RW] = c[OY:OY + RH, OX:OX + RW]
                self.last_mode = "clone"
                return f
        self.prev_off = None
        self.last_mode = "fill"
        B = np.clip((r - self.aL) * self.inv, 0, 255)
        B8 = B.astype(np.uint8)
        inp = cv2.inpaint(B8, self.opaque, 7, cv2.INPAINT_TELEA).astype(np.float32)
        out = B * (1 - self.wf) + inp * self.wf
        # tone match against the untouched surroundings; strength follows how
        # smooth the surroundings are (sky/bokeh -> full, textured -> light)
        interp = cv2.GaussianBlur(out * self.known[..., None], (0, 0), 30) / self.kden
        hf = np.abs(r - cv2.GaussianBlur(r, (0, 0), 4))[self.ring].mean()
        sw = float(np.exp(-(hf / 2.5) ** 2))
        low = cv2.GaussianBlur(out, (0, 0), 7 + 23 * (1 - sw))
        lim = CORR_MAX + 14 * sw
        corr = np.clip(interp - low, -lim, lim)
        out = out + corr * self.zoneW * (0.6 + 0.4 * sw)
        # smooth backgrounds (sky / bokeh): rebuild the zone as a seamless membrane
        # interpolated from its border, then put the fine grain back
        mw = float(np.clip((sw - 0.45) / 0.35, 0, 1))
        if mw > 0:
            q = 4
            small = cv2.resize(out, (RW // q, RH // q), interpolation=cv2.INTER_AREA)
            ms = cv2.resize(self.memb_mask, (RW // q, RH // q), interpolation=cv2.INTER_NEAREST)
            fill = cv2.inpaint(np.clip(small, 0, 255).astype(np.uint8), ms, 6, cv2.INPAINT_NS).astype(np.float32)
            # few smoothing passes inside the hole only (harmonic-like)
            for _ in range(40):
                bl = cv2.blur(fill, (3, 3))
                fill = np.where(ms[..., None] > 0, bl, small)
            memb = cv2.GaussianBlur(cv2.resize(fill, (RW, RH), interpolation=cv2.INTER_CUBIC), (0, 0), 3)
            detail = out - cv2.GaussianBlur(out, (0, 0), 2.5)
            out = out * (1 - self.membW * mw) + (memb + detail * 0.7) * self.membW * mw
        # keep untouched pixels bit-exact
        a = self.alpha
        keep = (a < 0.004) & (self.zoneW < 0.004) & (self.membW < 0.004)
        out = np.where(keep, r, out)
        f[OY:OY + RH, OX:OX + RW] = np.clip(out + 0.5, 0, 255).astype(np.uint8)
        return f
