import type { Seg } from "../../geometry/primitives";
import type { V3 } from "../../lib/camera3d";
import type { WireBatch } from "../../lib/wire";

export type SegStyle = { style: string; alpha: number; width: number } | null;

/**
 * Draws segments progressively. `field(p)` maps a world point to [0,1] reveal
 * order; everything with field <= progress is visible. Segments straddling the
 * reveal front are cut, and the front itself is brightened ("construction" line).
 */
export const drawReveal = (
  batch: WireBatch,
  segs: Seg[],
  field: (p: V3) => number,
  progress: number,
  styleOf: (s: Seg, midY: number) => SegStyle,
  frontBoost = 1.2,
) => {
  if (progress <= 0) return;
  for (const s of segs) {
    const fa = field(s.a);
    const fb = field(s.b);
    const lo = Math.min(fa, fb);
    if (lo > progress) continue;
    const st = styleOf(s, (s.a[1] + s.b[1]) / 2);
    if (!st) continue;
    let a = s.a;
    let b = s.b;
    const hi = Math.max(fa, fb);
    if (hi > progress && hi - lo > 1e-6) {
      const tt = (progress - lo) / (hi - lo);
      const [p0, p1] = fa <= fb ? [s.a, s.b] : [s.b, s.a];
      a = p0;
      b = [p0[0] + (p1[0] - p0[0]) * tt, p0[1] + (p1[1] - p0[1]) * tt, p0[2] + (p1[2] - p0[2]) * tt];
    }
    let alpha = st.alpha;
    if (progress < 1) {
      const dist = progress - (hi > progress ? progress : hi);
      const near = Math.max(0, 1 - dist / 0.06);
      alpha = Math.min(1, alpha * (1 + near * frontBoost));
    }
    batch.line(a, b, st.style, alpha, st.width);
  }
};
