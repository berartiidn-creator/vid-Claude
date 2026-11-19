/** Glass-tower district (dense curtain-wall grids), deterministic. */
import { CBD_Z } from "../bri/config";
import type { V3 } from "../lib/camera3d";
import { mulberry32, range } from "../lib/random";
import { boxEdges, rectXZ, seg, type Seg } from "./primitives";

export type Tower = { segs: Seg[]; faces: { pts: V3[]; n: V3 }[]; x: number; z: number; h: number };

let cache: Tower[] | null = null;

export const getCBD = (): Tower[] => {
  if (cache) return cache;
  const rnd = mulberry32(77);
  const out: Tower[] = [];
  const spots: [number, number, number][] = [];
  let tries = 0;
  while (spots.length < 30 && tries < 600) {
    tries++;
    const side = rnd() < 0.5 ? -1 : 1;
    const x = side * range(rnd, 26, 210);
    const z = CBD_Z + range(rnd, -80, 420);
    const w = range(rnd, 20, 36);
    if (spots.some(([sx, sz, sw]) => Math.abs(sx - x) < (sw + w) / 2 + 6 && Math.abs(sz - z) < (sw + w) / 2 + 6)) continue;
    spots.push([x, z, w]);
  }
  // a few landmark towers on the centre line far away
  spots.push([0, CBD_Z + 520, 40], [-60, CBD_Z + 470, 30], [70, CBD_Z + 560, 34]);
  for (const [x, z, w] of spots) {
    const d = w * range(rnd, 0.75, 1.2);
    const h = range(rnd, 120, 290);
    const segs: Seg[] = [];
    const T = (p: V3): V3 => [x + p[0], p[1], z + p[2]];
    const hw = w / 2;
    const hd = d / 2;
    const body = h * range(rnd, 0.82, 0.92);
    boxEdges(segs, T, -hw, hw, 0, body, -hd, hd, "edge");
    for (let y = 4.5; y < body; y += 4.5) rectXZ(segs, T, -hw, hw, -hd, hd, y, "floor");
    const nx = Math.max(3, Math.round(w / 3.4));
    const nz = Math.max(3, Math.round(d / 3.4));
    for (let i = 1; i < nx; i++) {
      const xx = -hw + (w * i) / nx;
      seg(segs, T, [xx, 0, -hd], [xx, body, -hd], "mull");
      seg(segs, T, [xx, 0, hd], [xx, body, hd], "mull");
    }
    for (let i = 1; i < nz; i++) {
      const zz = -hd + (d * i) / nz;
      seg(segs, T, [-hw, 0, zz], [-hw, body, zz], "mull");
      seg(segs, T, [hw, 0, zz], [hw, body, zz], "mull");
    }
    // crown setback + spire
    const cw = hw * 0.7;
    const cd = hd * 0.7;
    boxEdges(segs, T, -cw, cw, body, h, -cd, cd, "edge");
    if (rnd() < 0.5) seg(segs, T, [0, h, 0], [0, h + h * 0.12, 0], "spire");
    const faces = [
      { pts: [[-hw, 0, -hd], [hw, 0, -hd], [hw, body, -hd], [-hw, body, -hd]] as V3[], n: [0, 0, -1] as V3 },
      { pts: [[hw, 0, -hd], [hw, 0, hd], [hw, body, hd], [hw, body, -hd]] as V3[], n: [1, 0, 0] as V3 },
      { pts: [[hw, 0, hd], [-hw, 0, hd], [-hw, body, hd], [hw, body, hd]] as V3[], n: [0, 0, 1] as V3 },
      { pts: [[-hw, 0, hd], [-hw, 0, -hd], [-hw, body, -hd], [-hw, body, hd]] as V3[], n: [-1, 0, 0] as V3 },
    ].map((f) => ({ pts: f.pts.map(T), n: f.n }));
    out.push({ segs, faces, x, z, h });
  }
  cache = out;
  return out;
};
