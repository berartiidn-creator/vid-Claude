/**
 * WireBatch: projects 3D line segments, clips them against the near plane,
 * applies distance fog, and batches strokes by style for fast Canvas2D drawing.
 */
import { smoothstep } from "./anim";
import type { Cam, V3 } from "./camera3d";
import { toView } from "./camera3d";

type Bucket = { path: Path2D; style: string | CanvasGradient; width: number; alpha: number; fill: boolean };

export type WireOpts = {
  fogNear: number;
  fogFar: number;
  mirror?: boolean;
  alphaScale?: number;
  /** Scale line width with proximity. */
  depthWidth?: boolean;
};

export class WireBatch {
  private buckets = new Map<string, Bucket>();
  private styles = new Map<string, CanvasGradient>();
  constructor(public cam: Cam, public opts: WireOpts) {}

  registerStyle(key: string, g: CanvasGradient) {
    this.styles.set(key, g);
  }

  private bucket(styleKey: string, width: number, alpha: number, fill: boolean): Bucket {
    const aq = Math.round(alpha * 24) / 24;
    const wq = Math.round(width * 4) / 4;
    const key = `${fill ? "F" : "S"}|${styleKey}|${wq}|${aq}`;
    let b = this.buckets.get(key);
    if (!b) {
      b = { path: new Path2D(), style: this.styles.get(styleKey) ?? styleKey, width: wq, alpha: aq, fill };
      this.buckets.set(key, b);
    }
    return b;
  }

  fog(d: number) {
    return 1 - smoothstep(this.opts.fogNear, this.opts.fogFar, d);
  }

  private view(p: V3): V3 {
    return toView(this.cam, this.opts.mirror ? [p[0], -p[1], p[2]] : p);
  }

  line(a: V3, b: V3, style: string, alpha: number, width = 1, fogOn = true) {
    alpha *= this.opts.alphaScale ?? 1;
    if (alpha < 0.012) return;
    let va = this.view(a);
    let vb = this.view(b);
    const n = this.cam.near;
    if (va[2] < n && vb[2] < n) return;
    if (va[2] < n || vb[2] < n) {
      const t = (n - va[2]) / (vb[2] - va[2]);
      const c: V3 = [va[0] + (vb[0] - va[0]) * t, va[1] + (vb[1] - va[1]) * t, n];
      if (va[2] < n) va = c;
      else vb = c;
    }
    const d = (va[2] + vb[2]) / 2;
    if (fogOn) alpha *= this.fog(d);
    if (alpha < 0.012) return;
    let w = width;
    if (this.opts.depthWidth) w = width * Math.max(0.6, Math.min(2.4, 70 / d));
    const { focal, cx, cy } = this.cam;
    const x1 = cx + (focal * va[0]) / va[2];
    const y1 = cy - (focal * va[1]) / va[2];
    const x2 = cx + (focal * vb[0]) / vb[2];
    const y2 = cy - (focal * vb[1]) / vb[2];
    const bk = this.bucket(style, w, Math.min(1, alpha), false);
    bk.path.moveTo(x1, y1);
    bk.path.lineTo(x2, y2);
  }

  polyline(pts: V3[], style: string, alpha: number, width = 1, closed = false) {
    for (let i = 0; i < pts.length - 1; i++) this.line(pts[i], pts[i + 1], style, alpha, width);
    if (closed && pts.length > 2) this.line(pts[pts.length - 1], pts[0], style, alpha, width);
  }

  dot(p: V3, size: number, style: string, alpha: number, fogOn = true) {
    alpha *= this.opts.alphaScale ?? 1;
    const v = this.view(p);
    if (v[2] < this.cam.near) return;
    if (fogOn) alpha *= this.fog(v[2]);
    if (alpha < 0.015) return;
    const s = Math.max(0.8, Math.min(5, (size * 90) / v[2]));
    const x = this.cam.cx + (this.cam.focal * v[0]) / v[2];
    const y = this.cam.cy - (this.cam.focal * v[1]) / v[2];
    const bk = this.bucket(style, 1, Math.min(1, alpha), true);
    bk.path.rect(x - s / 2, y - s / 2, s, s);
  }

  flush(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const b of this.buckets.values()) {
      ctx.globalAlpha = b.alpha;
      if (b.fill) {
        ctx.fillStyle = b.style;
        ctx.fill(b.path);
      } else {
        ctx.strokeStyle = b.style;
        ctx.lineWidth = b.width;
        ctx.stroke(b.path);
      }
    }
    ctx.restore();
    this.buckets.clear();
  }
}

/** Project a list of world points; returns screen points (skips hidden). */
export const projectPoly = (cam: Cam, pts: V3[], mirror = false): { x: number; y: number }[] | null => {
  const out: { x: number; y: number }[] = [];
  for (const p of pts) {
    const v = toView(cam, mirror ? [p[0], -p[1], p[2]] : p);
    if (v[2] < cam.near) return null;
    out.push({ x: cam.cx + (cam.focal * v[0]) / v[2], y: cam.cy - (cam.focal * v[1]) / v[2] });
  }
  return out;
};

/** Andrew's monotone chain convex hull (screen space). */
export const convexHull = (pts: { x: number; y: number }[]) => {
  const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return p;
  const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: typeof p = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: typeof p = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
};

/** Bloom compositing: wide + tight blur passes (downsampled) then sharp. */
export class Bloom {
  private small: HTMLCanvasElement;
  private mid: HTMLCanvasElement;
  constructor(private w: number, private h: number) {
    this.small = document.createElement("canvas");
    this.small.width = Math.round(w / 4);
    this.small.height = Math.round(h / 4);
    this.mid = document.createElement("canvas");
    this.mid.width = Math.round(w / 2);
    this.mid.height = Math.round(h / 2);
  }

  composite(dst: CanvasRenderingContext2D, src: HTMLCanvasElement, strength = 1) {
    const sc = this.small.getContext("2d")!;
    sc.clearRect(0, 0, this.small.width, this.small.height);
    sc.filter = "blur(5px)";
    sc.drawImage(src, 0, 0, this.small.width, this.small.height);
    sc.filter = "none";
    const mc = this.mid.getContext("2d")!;
    mc.clearRect(0, 0, this.mid.width, this.mid.height);
    mc.filter = "blur(2.5px)";
    mc.drawImage(src, 0, 0, this.mid.width, this.mid.height);
    mc.filter = "none";

    dst.save();
    dst.imageSmoothingEnabled = true;
    dst.globalCompositeOperation = "lighter";
    dst.globalAlpha = Math.min(1, 0.6 * strength);
    dst.drawImage(this.small, 0, 0, this.w, this.h);
    dst.globalAlpha = Math.min(1, 0.6 * strength);
    dst.drawImage(this.mid, 0, 0, this.w, this.h);
    dst.globalAlpha = 1;
    dst.drawImage(src, 0, 0);
    dst.restore();
  }
}
