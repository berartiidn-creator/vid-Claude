import type { V3 } from "../lib/camera3d";

export type Seg = { a: V3; b: V3; k: string };
export type Xf = (p: V3) => V3;

/** Local -> world transform: translate to origin and rotate by yaw (radians). */
export const xform = (o: V3, yaw = 0): Xf => {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return (p) => [o[0] + p[0] * c + p[2] * s, o[1] + p[1], o[2] - p[0] * s + p[2] * c];
};

export const seg = (out: Seg[], T: Xf, a: V3, b: V3, k: string) => out.push({ a: T(a), b: T(b), k });

export const polyLoop = (out: Seg[], T: Xf, pts: V3[], k: string, closed = true) => {
  for (let i = 0; i < pts.length - 1; i++) seg(out, T, pts[i], pts[i + 1], k);
  if (closed) seg(out, T, pts[pts.length - 1], pts[0], k);
};

export const rectXZ = (out: Seg[], T: Xf, x0: number, x1: number, z0: number, z1: number, y: number, k: string) =>
  polyLoop(out, T, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], k);

export const boxEdges = (
  out: Seg[], T: Xf, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, k: string,
) => {
  rectXZ(out, T, x0, x1, z0, z1, y0, k);
  rectXZ(out, T, x0, x1, z0, z1, y1, k);
  for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]] as const) seg(out, T, [x, y0, z], [x, y1, z], k);
};

export const circleXZ = (cx: number, cz: number, r: number, y: number, n: number, a0 = 0, a1 = Math.PI * 2): V3[] => {
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
  }
  return pts;
};

export const polyline = (out: Seg[], T: Xf, pts: V3[], k: string) => polyLoop(out, T, pts, k, false);

/**
 * Arch in a vertical plane. `along` = unit direction of the arcade in local XZ,
 * centre = base centre of the opening.
 */
export const archPts = (center: V3, along: [number, number], halfW: number, springY: number, n = 8): V3[] => {
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI - (Math.PI * i) / n;
    const u = Math.cos(a) * halfW;
    const v = Math.sin(a) * halfW * 1.05;
    pts.push([center[0] + along[0] * u, springY + v, center[2] + along[1] * u]);
  }
  return pts;
};
