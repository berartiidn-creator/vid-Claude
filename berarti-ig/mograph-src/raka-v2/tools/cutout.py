import cv2, numpy as np, sys, json
def load(p): return cv2.imread(p, cv2.IMREAD_COLOR)
def flood_bg(img, seeds, tol=10):
    h, w = img.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for (x, y) in seeds:
        cv2.floodFill(img.copy(), mask, (x, y), (0, 0, 0), (tol,) * 3, (tol,) * 3, cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8) | 4)
    return mask[1:-1, 1:-1] > 0
def key_color(img, bgr, tol):
    d = np.linalg.norm(img.astype(np.int32) - np.array(bgr, np.int32), axis=2)
    return d < tol
def save_rgba(img, bgmask, out, feather=1, largest=False):
    alpha = np.where(bgmask, 0, 255).astype(np.uint8)
    k = np.ones((3, 3), np.uint8)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, k)
    # keep largest components only (drop specks)
    n, lab, stats, _ = cv2.connectedComponentsWithStats((alpha > 0).astype(np.uint8), 8)
    keep = np.zeros_like(alpha)
    big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA])) if n > 1 else 0
    for i in range(1, n):
        if (largest and i == big) or (not largest and stats[i, cv2.CC_STAT_AREA] > 400): keep[lab == i] = 255
    alpha = keep
    if feather: alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA); rgba[:, :, 3] = alpha
    ys, xs = np.where(alpha > 10)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    cv2.imwrite(out, rgba[y0:y1, x0:x1])
    return dict(x0=int(x0), y0=int(y0), w=int(x1 - x0), h=int(y1 - y0))

def chair_mask(img):
    b, g, r = [img[:, :, i].astype(int) for i in range(3)]
    return (b - r > 6) & (g <= b + 2) & ((b + g + r) < 210)
