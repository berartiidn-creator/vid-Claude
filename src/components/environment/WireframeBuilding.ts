/** WireframeBuilding: grows from the ground with a scanning construction line. */
import { COLORS } from "../../config/theme";
import { EASE, clamp01 } from "../../lib/anim";
import type { Building } from "../../geometry/buildings";
import { rectXZ, type Seg } from "../../geometry/primitives";
import type { WireBatch } from "../../lib/wire";

const tmp: Seg[] = [];

export const drawWireframeBuilding = (batch: WireBatch, b: Building, t: number, light: number, windows: number) => {
  const p = clamp01((t - b.riseStart) / b.riseDur);
  if (p <= 0) return;
  const hRev = EASE.out(p) * (b.height + 1.5);
  const scanY = ((t * b.scanSpeed + b.scanOffset) % (b.height + 40)) - 20;
  const blue = b.style === "blueprint";
  const edgeCol = blue ? COLORS.cyan : COLORS.neonEmerald;
  for (const s of b.segs) {
    const ya = s.a[1];
    const yb = s.b[1];
    const lo = Math.min(ya, yb);
    if (lo > hRev) continue;
    let a = s.a;
    let bb = s.b;
    const hi = Math.max(ya, yb);
    if (hi > hRev) {
      const [p0, p1] = ya <= yb ? [s.a, s.b] : [s.b, s.a];
      const tt = (hRev - lo) / (hi - lo);
      a = p0;
      bb = [p0[0] + (p1[0] - p0[0]) * tt, hRev, p0[2] + (p1[2] - p0[2]) * tt];
    }
    const my = (a[1] + bb[1]) / 2;
    const scan = Math.exp(-(((my - scanY) / 2.2) ** 2));
    let alpha: number;
    let col = edgeCol;
    let w = 1;
    switch (s.k) {
      case "edge":
        alpha = 0.62;
        w = 1.3;
        break;
      case "spire":
        alpha = 0.8;
        col = COLORS.cyan;
        break;
      case "floor":
        alpha = 0.16 + scan * 0.5;
        if (ya === yb) alpha *= clamp01((hRev - ya) / 3);
        break;
      default:
        alpha = 0.12 + scan * 0.3;
    }
    if (blue) alpha *= 0.85;
    batch.line(a, bb, col, alpha * light, w);
  }
  // construction scan ring at the reveal front
  if (p < 1) {
    tmp.length = 0;
    const [x0, x1, z0, z1] = b.footprint;
    rectXZ(tmp, (q) => q, x0, x1, z0, z1, hRev, "front");
    for (const s of tmp) batch.line(s.a, s.b, COLORS.cyan, 0.95, 1.8);
  }
  // lit windows
  if (windows > 0.01) {
    for (const w of b.windows) {
      if (w.p[1] > hRev - 1) continue;
      const fl = 0.55 + 0.45 * Math.sin(t * 0.9 + w.phase);
      batch.dot(w.p, 1.5, w.gold ? COLORS.goldLight : COLORS.cyan, (0.35 + 0.5 * fl) * windows);
    }
  }
};
