/**
 * Holy-city tower districts for the opening shots (deterministic):
 *  - Makkah: Abraj Al-Bait clock tower (clock faces, crown, green dome, spire
 *    and crescent) with six podium towers, Masjidil Haram minarets and arcade
 *    in front, hotel towers on both sides.
 *  - Madinah: Masjid Nabawi minarets around the Green Dome, giant plaza
 *    umbrellas, hotel blocks lining both sides.
 */
import { CBD_Z, MADINAH_Z } from "../bri/config";
import type { V3 } from "../lib/camera3d";
import { hash, mulberry32, range } from "../lib/random";
import { addArcade, addMinaret } from "./landmarks";
import { boxEdges, circleXZ, polyline, rectXZ, seg, type Seg, type Xf } from "./primitives";

export type Win = { p: V3; ph: number; gold: boolean };
export type Tower = { segs: Seg[]; faces: { pts: V3[]; n: V3 }[]; windows: Win[]; x: number; z: number; h: number; lightAt: number; tint: number };

const boxFaces = (T: Xf, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  [
    { pts: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] as V3[], n: [0, 0, -1] as V3 },
    { pts: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]] as V3[], n: [1, 0, 0] as V3 },
    { pts: [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]] as V3[], n: [0, 0, 1] as V3 },
    { pts: [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]] as V3[], n: [-1, 0, 0] as V3 },
  ].map((f) => ({ pts: f.pts.map(T), n: f.n }));

/** Curtain-wall block: edges, floor lines, mullions, faces and window points. */
const block = (out: { segs: Seg[]; faces: Tower["faces"]; windows: Win[] }, T: Xf, hw: number, hd: number, y0: number, y1: number, seed: number, floor = 4.5) => {
  boxEdges(out.segs, T, -hw, hw, y0, y1, -hd, hd, "edge");
  for (let y = y0 + floor; y < y1 - 0.5; y += floor) rectXZ(out.segs, T, -hw, hw, -hd, hd, y, "floor");
  const nx = Math.max(3, Math.round((2 * hw) / 3.6));
  const nz = Math.max(3, Math.round((2 * hd) / 3.6));
  for (let i = 1; i < nx; i++) {
    const x = -hw + (2 * hw * i) / nx;
    seg(out.segs, T, [x, y0, -hd], [x, y1, -hd], "mull");
    seg(out.segs, T, [x, y0, hd], [x, y1, hd], "mull");
  }
  for (let i = 1; i < nz; i++) {
    const z = -hd + (2 * hd * i) / nz;
    seg(out.segs, T, [-hw, y0, z], [-hw, y1, z], "mull");
    seg(out.segs, T, [hw, y0, z], [hw, y1, z], "mull");
  }
  out.faces.push(...boxFaces(T, -hw, hw, y0, y1, -hd, hd));
  let k = 0;
  for (let y = y0 + floor / 2; y < y1 - 1; y += floor) {
    for (let i = 0; i < nx; i++) {
      if (hash(seed * 131 + k++) < 0.07) out.windows.push({ p: T([-hw + (2 * hw * (i + 0.5)) / nx, y, -hd - 0.2]), ph: hash(seed + k), gold: hash(seed * 7 + k) < 0.2 });
    }
  }
};

/** Pyramidal crown (Makkah hotel towers) */
const pyramid = (segs: Seg[], T: Xf, hw: number, hd: number, y: number, h: number) => {
  const apex: V3 = [0, y + h, 0];
  for (const [x, z] of [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]] as const) seg(segs, T, [x, y, z], apex, "edge");
  seg(segs, T, apex, [0, y + h + h * 0.6, 0], "spire");
};

const at = (x: number, z: number): Xf => (p) => [x + p[0], p[1], z + p[2]];

const mk = (x: number, z: number, h: number, lightAt: number, tint: number): Tower => ({ segs: [], faces: [], windows: [], x, z, h, lightAt, tint });

/* -------------------------------- Makkah -------------------------------- */
const makkah = (): Tower[] => {
  const out: Tower[] = [];
  const AZ = CBD_Z + 330;

  // Abraj Al-Bait clock tower
  const clock = mk(0, AZ, 560, 0.5, 0);
  const T = at(0, AZ);
  block(clock, T, 22, 22, 45, 250, 1);
  block(clock, T, 18, 18, 250, 330, 2);
  // clock block
  boxEdges(clock.segs, T, -17, 17, 330, 402, -17, 17, "edge");
  clock.faces.push(...boxFaces(T, -17, 17, 330, 402, -17, 17));
  const faceC = 366;
  const R = 13;
  for (const [nx, nz] of [[0, -1], [1, 0], [0, 1], [-1, 0]] as const) {
    const ring: V3[] = [];
    for (let i = 0; i <= 36; i++) {
      const a = (Math.PI * 2 * i) / 36;
      const u = Math.cos(a) * R;
      const v = Math.sin(a) * R;
      ring.push([nx * 17.3 + (nz !== 0 ? u : 0), faceC + v, nz * 17.3 + (nx !== 0 ? u : 0)]);
    }
    polyline(clock.segs, T, ring, "gold");
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      const p0: V3 = [nx * 17.4 + (nz !== 0 ? Math.cos(a) * R * 0.8 : 0), faceC + Math.sin(a) * R * 0.8, nz * 17.4 + (nx !== 0 ? Math.cos(a) * R * 0.8 : 0)];
      const p1: V3 = [nx * 17.4 + (nz !== 0 ? Math.cos(a) * R * 0.95 : 0), faceC + Math.sin(a) * R * 0.95, nz * 17.4 + (nx !== 0 ? Math.cos(a) * R * 0.95 : 0)];
      seg(clock.segs, T, p0, p1, "gold");
    }
    seg(clock.segs, T, [nx * 17.5, faceC, nz * 17.5], [nx * 17.5 + (nz !== 0 ? 0 : 0), faceC + 9, nz * 17.5], "gold");
    seg(clock.segs, T, [nx * 17.5, faceC, nz * 17.5], [nx * 17.5 + (nz !== 0 ? 6 : 0), faceC - 2, nz * 17.5 + (nx !== 0 ? 6 : 0)], "gold");
  }
  // crown: tapering ribs
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 * i) / 16;
    seg(clock.segs, T, [Math.cos(a) * 16, 402, Math.sin(a) * 16], [Math.cos(a) * 10, 440, Math.sin(a) * 10], i % 2 ? "mull" : "edge");
  }
  polyline(clock.segs, T, circleXZ(0, 0, 16, 402, 32), "gold");
  polyline(clock.segs, T, circleXZ(0, 0, 13, 421, 32), "mull");
  polyline(clock.segs, T, circleXZ(0, 0, 10, 440, 32), "gold");
  // small green dome
  for (let m = 0; m < 12; m++) {
    const a = (Math.PI * 2 * m) / 12;
    const pts: V3[] = [];
    for (let j = 0; j <= 6; j++) {
      const u = j / 6;
      const r = 9 * Math.sqrt(1 - u * u);
      pts.push([Math.cos(a) * r, 440 + u * 12, Math.sin(a) * r]);
    }
    polyline(clock.segs, T, pts, "dome");
  }
  // spire + crescent
  for (let i = 0; i < 8; i += 2) {
    const a = (Math.PI * 2 * i) / 8;
    seg(clock.segs, T, [Math.cos(a) * 3, 452, Math.sin(a) * 3], [0, 535, 0], "spire");
  }
  const cres: V3[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = -Math.PI * 0.15 + (Math.PI * 1.3 * i) / 12;
    cres.push([Math.cos(a) * 6, 545 + Math.sin(a) * 6, 0]);
  }
  polyline(clock.segs, T, cres, "gold");
  out.push(clock);

  // podium
  const pod = mk(0, AZ + 5, 45, 0.3, 1);
  block(pod, at(0, AZ + 5), 110, 60, 0, 45, 3, 7.5);
  out.push(pod);

  // six flanking hotel towers on the podium
  const flank: [number, number, number, number][] = [
    [-78, -32, 245, 16], [78, -32, 240, 16], [-82, 30, 230, 15], [82, 30, 236, 15], [-42, 52, 215, 14], [42, 52, 220, 14],
  ];
  flank.forEach(([dx, dz, h, w], i) => {
    const tw = mk(dx, AZ + dz, h + 30, 0.6 + i * 0.25, i % 2);
    const Tt = at(dx, AZ + dz);
    block(tw, Tt, w, w * 0.85, 45, h, 10 + i);
    pyramid(tw.segs, Tt, w * 0.85, w * 0.7, h, 26);
    out.push(tw);
  });

  // Masjidil Haram in front: minarets + arcade
  const haram = mk(0, CBD_Z + 160, 120, 1.4, 1);
  const mins: [number, number, number][] = [[-42, 150, 112], [42, 150, 112], [-90, 175, 104], [90, 175, 104], [-128, 120, 98], [128, 120, 98]];
  for (const [x, dz, h] of mins) addMinaret(haram.segs, [x, 0, CBD_Z + dz], h, 2.6);
  addArcade(haram.segs, [-150, 0, CBD_Z + 135], [150, 0, CBD_Z + 135], 9, 16, "arch");
  addArcade(haram.segs, [-150, 0, CBD_Z + 135], [-150, 0, CBD_Z + 230], 9, 16, "arch");
  addArcade(haram.segs, [150, 0, CBD_Z + 135], [150, 0, CBD_Z + 230], 9, 16, "arch");
  out.push(haram);

  // hotel towers on both sides
  const rnd = mulberry32(5);
  let seed = 40;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      const x = side * range(rnd, 175, 300);
      const z = CBD_Z + range(rnd, -60, 520);
      const h = range(rnd, 120, 210);
      const w = range(rnd, 14, 22);
      const tw = mk(x, z, h + 20, range(rnd, 0.2, 2.8), seed % 2);
      const Tt = at(x, z);
      block(tw, Tt, w, w * range(rnd, 0.7, 1.1), 0, h, seed++);
      if (rnd() < 0.55) pyramid(tw.segs, Tt, w * 0.8, w * 0.6, h, 16);
      else rectXZ(tw.segs, Tt, -w * 0.7, w * 0.7, -w * 0.5, w * 0.5, h + 6, "edge");
      out.push(tw);
    }
  }
  return out;
};

/* -------------------------------- Madinah -------------------------------- */
const madinah = (): Tower[] => {
  const out: Tower[] = [];
  const C = MADINAH_Z + 230;
  const lt = 11.2;

  // Masjid Nabawi minarets
  const nab = mk(0, C, 110, lt, 0);
  const mins: [number, number, number][] = [[-70, -60, 104], [70, -60, 104], [-70, 80, 104], [70, 80, 104], [-25, -85, 96], [25, -85, 96], [-110, 10, 92], [110, 10, 92]];
  for (const [x, dz, h] of mins) addMinaret(nab.segs, [x, 0, C + dz], h, 3);
  // Green Dome on its drum
  const T = at(0, C + 10);
  polyline(nab.segs, T, circleXZ(0, 0, 17, 18, 32), "dome");
  polyline(nab.segs, T, circleXZ(0, 0, 17, 26, 32), "dome");
  for (let m = 0; m < 20; m++) {
    const a = (Math.PI * 2 * m) / 20;
    const pts: V3[] = [];
    for (let j = 0; j <= 10; j++) {
      const u = j / 10;
      const r = 17 * Math.pow(Math.max(0, 1 - u * u), 0.55) * (1 + 0.1 * Math.sin(Math.PI * u * 0.9));
      pts.push([Math.cos(a) * r, 26 + u * 22, Math.sin(a) * r]);
    }
    polyline(nab.segs, T, pts, "domeMesh");
  }
  for (let j = 1; j <= 5; j++) {
    const u = j / 6;
    polyline(nab.segs, T, circleXZ(0, 0, 17 * Math.pow(1 - u * u, 0.55) * (1 + 0.1 * Math.sin(Math.PI * u * 0.9)), 26 + u * 22, 32), "dome");
  }
  seg(nab.segs, T, [0, 48, 0], [0, 56, 0], "gold");
  // prayer hall arcade around the dome
  addArcade(nab.segs, [-95, 0, C - 50], [95, 0, C - 50], 9, 14, "arch");
  out.push(nab);

  // giant umbrellas on the plaza
  const umb = mk(0, C - 120, 26, lt + 0.4, 1);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      const ux = -64 + i * 32;
      const uz = C - 150 + j * 30;
      const Tu = at(ux, uz);
      seg(umb.segs, Tu, [0, 0, 0], [0, 15, 0], "mull");
      const rim = circleXZ(0, 0, 13, 17, 16).map((p) => [p[0], p[1] + (Math.round(Math.atan2(p[2], p[0]) / (Math.PI / 8)) % 2 === 0 ? 1.5 : 0), p[2]] as V3);
      polyline(umb.segs, Tu, rim, "umbrella");
      for (let k = 0; k < 16; k += 2) {
        seg(umb.segs, Tu, [0, 15, 0], rim[k], "umbrellaMesh");
        seg(umb.segs, Tu, rim[k], [0, 22, 0], "umbrella");
      }
    }
  }
  out.push(umb);

  // hotel blocks lining both sides
  const rnd = mulberry32(9);
  let seed = 80;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const x = side * range(rnd, 130, 260);
      const z = MADINAH_Z + range(rnd, -200, 520);
      const h = range(rnd, 55, 115);
      const w = range(rnd, 18, 30);
      const tw = mk(x, z, h + 8, lt + range(rnd, 0, 2.6), seed % 2);
      const Tt = at(x, z);
      block(tw, Tt, w, w * range(rnd, 0.6, 1.0), 0, h, seed++, 4);
      rectXZ(tw.segs, Tt, -w, w, -w * 0.6, w * 0.6, h + 3, "edge");
      out.push(tw);
    }
  }
  return out;
};

let cache: Tower[] | null = null;
export const getHolyCity = (): Tower[] => {
  if (!cache) cache = [...makkah(), ...madinah()];
  return cache;
};
