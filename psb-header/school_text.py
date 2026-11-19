"""Swap the end-card line "SMP-IQu dan SMA-IQu" for "SMPIQu dan SMAIQu",
following the original slide-up + fade animation frame by frame."""
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

Y0, BH = 820, 240          # band holding the line
T0, T1 = 79.3, 84.95       # time window (s)
NEW = "SMPIQu dan SMAIQu"


class SchoolText:
    def __init__(self, band_raw, font_path):
        a = np.fromfile(band_raw, np.uint8).reshape(-1, BH, 1080, 3)
        mn = a[45:84].min(0).min(-1)                    # 80.0-81.3 s, fully visible
        self.core = cv2.erode((mn > 200).astype(np.uint8), np.ones((3, 3), np.uint8))
        glyph = (mn > 95).astype(np.uint8)
        self.mask = cv2.dilate(glyph, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
        k = self.core.astype(bool)
        r = (cv2.dilate(self.core, np.ones((15, 15), np.uint8)) > 0) & \
            ~(cv2.dilate(self.core, np.ones((7, 7), np.uint8)) > 0)
        self.ring = r
        # new line, supersampled
        S = 4
        F = ImageFont.truetype(font_path, 74 * S)
        im = Image.new("L", (1080 * S, BH * S), 0)
        d = ImageDraw.Draw(im)
        tw = d.textlength(NEW, font=F)
        d.text((539 * S - tw / 2, (941 - Y0) * S), NEW, font=F, fill=255, anchor="ls")
        self.new_a = np.array(im.resize((1080, BH), Image.LANCZOS)).astype(np.float32) / 255

    @staticmethod
    def _shift(m, dy):
        out = np.zeros_like(m)
        if dy >= 0:
            out[dy:] = m[:m.shape[0] - dy]
        else:
            out[:dy] = m[-dy:]
        return out

    def apply(self, f, t):
        if not (T0 <= t <= T1):
            return False
        band = f[Y0:Y0 + BH]
        g = band.astype(np.float32).mean(-1)
        best = None
        for dy in range(-8, 41):
            c = self._shift(self.core, dy).astype(bool)
            r = self._shift(self.ring.astype(np.uint8), dy).astype(bool)
            cm, rm = g[c].mean(), g[r].mean()
            al = (cm - rm) / max(255 - rm, 1)
            if best is None or al > best[0]:
                best = (al, dy)
        al, dy = best
        if al < 0.012:
            return False
        al = float(min(al / 0.97, 1.0))
        m = self._shift(self.mask, dy) * 255
        clean = cv2.inpaint(band, m, 5, cv2.INPAINT_TELEA).astype(np.float32)
        na = self._shift(self.new_a, dy)[..., None] * al
        out = clean * (1 - na) + 255.0 * na
        f[Y0:Y0 + BH] = np.clip(out + 0.5, 0, 255).astype(np.uint8)
        return True
