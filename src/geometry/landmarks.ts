/**
 * Procedural sacred architecture: Ka'bah, Masjid Nabawi (Green Dome, minarets,
 * colonnades) and the Masjidil Haram arcade. All geometry is generated once.
 */
import { WORLD } from "../config/world";
import type { V3 } from "../lib/camera3d";
import { archPts, boxEdges, circleXZ, polyLoop, polyline, rectXZ, seg, type Seg, type Xf, xform } from "./primitives";

export type Face = { pts: V3[]; kind: "wall" | "band" | "roof" | "door" };

export type Landmark = {
  segs: Seg[];
  faces: Face[];
  /** points sampled on dome surface, used for silhouette fill */
  hullPts?: V3[];
  height: number;
  footprint: V3[];
  center: V3;
  top: V3;
};

/* ------------------------------ Ka'bah ------------------------------ */
let kaabaCache: Landmark | null = null;
export const getKaaba = (): Landmark => {
  if (kaabaCache) return kaabaCache;
  const { origin, yaw, width: W, depth: D, height: H } = WORLD.kaaba;
  const T = xform(origin, yaw);
  const segs: Seg[] = [];
  const faces: Face[] = [];
  const hw = W / 2;
  const hd = D / 2;
  // Shadharwan base plinth
  boxEdges(segs, T, -hw - 0.6, hw + 0.6, 0, 0.55, -hd - 0.6, hd + 0.6, "base");
  // Main volume
  boxEdges(segs, T, -hw, hw, 0, H, -hd, hd, "edge");
  // Holographic mesh on walls
  const bandLo = 8.6;
  const bandHi = 9.9;
  for (let y = 1.4; y < H - 0.3; y += 1.4) {
    if (y > bandLo - 0.3 && y < bandHi + 0.3) continue;
    rectXZ(segs, T, -hw, hw, -hd, hd, y, "mesh");
  }
  const nx = 8;
  const nz = 7;
  for (let i = 1; i < nx; i++) {
    const x = -hw + (W * i) / nx;
    seg(segs, T, [x, 0, -hd], [x, H, -hd], "mesh");
    seg(segs, T, [x, 0, hd], [x, H, hd], "mesh");
  }
  for (let i = 1; i < nz; i++) {
    const z = -hd + (D * i) / nz;
    seg(segs, T, [-hw, 0, z], [-hw, H, z], "mesh");
    seg(segs, T, [hw, 0, z], [hw, H, z], "mesh");
  }
  // Roof grid
  for (let i = 1; i < 4; i++) {
    const x = -hw + (W * i) / 4;
    seg(segs, T, [x, H, -hd], [x, H, hd], "mesh");
  }
  // Gold hizam band
  rectXZ(segs, T, -hw - 0.04, hw + 0.04, -hd - 0.04, hd + 0.04, bandLo, "gold");
  rectXZ(segs, T, -hw - 0.04, hw + 0.04, -hd - 0.04, hd + 0.04, bandHi, "gold");
  // calligraphy suggestion: rhythmic ticks + diamonds within the band
  const bandMid = (bandLo + bandHi) / 2;
  const tick = (x: number, z: number, nxv: number, nzv: number) => {
    seg(segs, T, [x, bandLo + 0.25, z], [x, bandHi - 0.25, z], "goldDetail");
    seg(segs, T, [x - nxv * 0.25, bandMid, z - nzv * 0.25], [x + nxv * 0.25, bandMid, z + nzv * 0.25], "goldDetail");
  };
  for (let i = 0; i <= 18; i++) {
    const x = -hw + (W * i) / 18;
    tick(x, -hd - 0.05, 1, 0);
    tick(x, hd + 0.05, 1, 0);
  }
  for (let i = 0; i <= 15; i++) {
    const z = -hd + (D * i) / 15;
    tick(-hw - 0.05, z, 0, 1);
    tick(hw + 0.05, z, 0, 1);
  }
  // Lower calligraphy panels (thin gold lines below band)
  for (const y of [6.9, 7.3]) {
    for (const [x0, x1] of [[-hw + 0.6, -hw + 2.6], [hw - 2.6, hw - 0.6]]) {
      seg(segs, T, [x0, y, -hd - 0.05], [x1, y, -hd - 0.05], "goldDetail");
    }
  }
  // Door (front-right of the -Z face) with frame
  const dx0 = 1.6;
  const dx1 = 4.0;
  const dy0 = 2.1;
  const dy1 = 6.6;
  const fz = -hd - 0.06;
  polyLoop(segs, T, [[dx0, dy0, fz], [dx1, dy0, fz], [dx1, dy1, fz], [dx0, dy1, fz]], "gold");
  polyLoop(segs, T, [[dx0 + 0.3, dy0 + 0.3, fz], [dx1 - 0.3, dy0 + 0.3, fz], [dx1 - 0.3, dy1 - 0.3, fz], [dx0 + 0.3, dy1 - 0.3, fz]], "goldDetail");
  seg(segs, T, [(dx0 + dx1) / 2, dy0 + 0.3, fz], [(dx0 + dx1) / 2, dy1 - 0.3, fz], "goldDetail");
  for (let y = dy0 + 0.9; y < dy1 - 0.4; y += 0.9) seg(segs, T, [dx0 + 0.3, y, fz], [dx1 - 0.3, y, fz], "goldDetail");
  // Hajar al-Aswad frame at the corner
  const cornerPts: V3[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (Math.PI * 2 * i) / 10;
    cornerPts.push([hw + 0.08, 1.5 + Math.sin(a) * 0.45, -hd + 0.0 + Math.cos(a) * 0.3]);
  }
  polyline(segs, T, cornerPts, "gold");
  // Hijr Ismail (semi-circular low wall) on +X side
  const hijr = circleXZ(hw + 0.2, 0, 4.4, 1.3, 16, -Math.PI / 2, Math.PI / 2);
  const hijrLow = circleXZ(hw + 0.2, 0, 4.4, 0, 16, -Math.PI / 2, Math.PI / 2);
  polyline(segs, T, hijr.map((p) => [p[0] + 0.0, p[1], p[2] * 1.15] as V3).map((p) => [hw + (p[0] - hw) * 1, p[1], p[2]] as V3), "edge");
  for (let i = 0; i < hijr.length; i += 2) seg(segs, T, [hijrLow[i][0], 0, hijrLow[i][2] * 1.15], [hijr[i][0], 1.3, hijr[i][2] * 1.15], "mesh");
  // Mataf rings on the floor (local centre)
  for (const r of [11, 15, 20, 26]) polyline(segs, T, circleXZ(0, 0, r, 0.02, 72), "ring");

  // Faces for dark solid fill (4 walls + roof) and band
  const wall = (pts: V3[]) => faces.push({ pts: pts.map(T), kind: "wall" });
  wall([[-hw, 0, -hd], [hw, 0, -hd], [hw, H, -hd], [-hw, H, -hd]]);
  wall([[hw, 0, -hd], [hw, 0, hd], [hw, H, hd], [hw, H, -hd]]);
  wall([[hw, 0, hd], [-hw, 0, hd], [-hw, H, hd], [hw, H, hd]]);
  wall([[-hw, 0, hd], [-hw, 0, -hd], [-hw, H, -hd], [-hw, H, hd]]);
  faces.push({ pts: ([[-hw, H, -hd], [hw, H, -hd], [hw, H, hd], [-hw, H, hd]] as V3[]).map(T), kind: "roof" });
  const band = (pts: V3[]) => faces.push({ pts: pts.map(T), kind: "band" });
  band([[-hw, bandLo, -hd], [hw, bandLo, -hd], [hw, bandHi, -hd], [-hw, bandHi, -hd]]);
  band([[hw, bandLo, -hd], [hw, bandLo, hd], [hw, bandHi, hd], [hw, bandHi, -hd]]);
  band([[hw, bandLo, hd], [-hw, bandLo, hd], [-hw, bandHi, hd], [hw, bandHi, hd]]);
  band([[-hw, bandLo, hd], [-hw, bandLo, -hd], [-hw, bandHi, -hd], [-hw, bandHi, hd]]);
  faces.push({ pts: ([[dx0, dy0, fz], [dx1, dy0, fz], [dx1, dy1, fz], [dx0, dy1, fz]] as V3[]).map(T), kind: "door" });

  kaabaCache = {
    segs,
    faces,
    height: H,
    footprint: ([[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd]] as V3[]).map(T),
    center: T([0, H / 2, 0]),
    top: T([0, H, 0]),
  };
  return kaabaCache;
};

/* ------------------------------ Minaret ------------------------------ */
export const addMinaret = (segs: Seg[], base: V3, h: number, r = 1.25, k = "minaret") => {
  const T = xform(base, 0);
  const oct = (rad: number, y: number) => circleXZ(0, 0, rad, y, 8, Math.PI / 8, Math.PI / 8 + Math.PI * 2);
  const shaftTop = h * 0.74;
  // base plinth
  boxEdges(segs, T, -r * 1.45, r * 1.45, 0, h * 0.12, -r * 1.45, r * 1.45, k);
  const ring0 = oct(r, h * 0.12);
  const ring1 = oct(r, shaftTop);
  for (let i = 0; i < 8; i++) seg(segs, T, ring0[i], ring1[i], k);
  for (let y = h * 0.12; y < shaftTop; y += 2.4) polyline(segs, T, oct(r, y), `${k}Mesh`);
  // balconies
  for (const fy of [0.42, 0.62, shaftTop / h]) {
    const y = h * fy;
    polyline(segs, T, oct(r * 1.75, y), k);
    polyline(segs, T, oct(r * 1.75, y + 0.7), `${k}Mesh`);
    const a = oct(r * 1.75, y);
    const b = oct(r, y - 1.0);
    for (let i = 0; i < 8; i += 2) seg(segs, T, a[i], b[i], `${k}Mesh`);
  }
  // upper slimmer shaft
  const up0 = oct(r * 0.72, shaftTop);
  const up1 = oct(r * 0.72, h * 0.88);
  for (let i = 0; i < 8; i++) seg(segs, T, up0[i], up1[i], k);
  polyline(segs, T, up1, k);
  // spire cone
  for (let i = 0; i < 8; i += 2) seg(segs, T, up1[i], [0, h * 0.97, 0], k);
  seg(segs, T, [0, h * 0.97, 0], [0, h * 1.02, 0], "gold");
  // crescent finial
  const cres: V3[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI * 0.15 + (Math.PI * 1.3 * i) / 8;
    cres.push([Math.cos(a) * 0.55, h * 1.04 + 0.55 + Math.sin(a) * 0.55, 0]);
  }
  polyline(segs, T, cres, "gold");
};

/* ------------------------------ Arcade ------------------------------ */
export const addArcade = (segs: Seg[], from: V3, to: V3, bay: number, height: number, k = "arch", domes = true) => {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dz);
  const ux = dx / len;
  const uz = dz / len;
  const n = Math.floor(len / bay);
  const I: Xf = (p) => p;
  const spring = height * 0.62;
  const halfW = bay * 0.36;
  const p = (s: number, y: number, off = 0): V3 => [from[0] + ux * s - uz * off, y, from[2] + uz * s + ux * off];
  // roof + parapet + base lines
  seg(segs, I, p(0, height), p(n * bay, height), k);
  seg(segs, I, p(0, height + 0.8), p(n * bay, height + 0.8), `${k}Mesh`);
  seg(segs, I, p(0, 0), p(n * bay, 0), `${k}Mesh`);
  // depth: second row line set back
  seg(segs, I, p(0, height, 3), p(n * bay, height, 3), `${k}Mesh`);
  for (let i = 0; i <= n; i++) {
    const s = i * bay;
    seg(segs, I, p(s, 0), p(s, height), k);
    if (i % 2 === 0) seg(segs, I, p(s, height), p(s, height, 3), `${k}Mesh`);
    if (i < n) {
      const c = p(s + bay / 2, 0);
      const pts = archPts(c, [ux, uz], halfW, spring, 8);
      polyline(segs, I, pts, k);
      seg(segs, I, [pts[0][0], 0, pts[0][2]], pts[0], `${k}Mesh`);
      seg(segs, I, [pts[8][0], 0, pts[8][2]], pts[8], `${k}Mesh`);
      if (domes && i % 2 === 0) {
        // small roof dome
        const dc = p(s + bay / 2, height + 0.8, 1.5);
        const prof: V3[] = [];
        for (let j = 0; j <= 6; j++) {
          const a = Math.PI - (Math.PI * j) / 6;
          prof.push([dc[0] + ux * Math.cos(a) * 1.3, dc[1] + Math.sin(a) * 1.2, dc[2] + uz * Math.cos(a) * 1.3]);
        }
        polyline(segs, I, prof, `${k}Mesh`);
      }
    }
  }
};

/* ------------------------------ Masjid Nabawi ------------------------------ */
let nabawiCache: Landmark | null = null;
export const getNabawi = (): Landmark => {
  if (nabawiCache) return nabawiCache;
  const { origin, yaw } = WORLD.nabawi;
  const T = xform(origin, yaw);
  const segs: Seg[] = [];
  const faces: Face[] = [];
  // Prayer hall block
  const hw = 12;
  const hd = 9;
  const hh = 7;
  boxEdges(segs, T, -hw, hw, 0, hh, -hd, hd, "edge");
  rectXZ(segs, T, -hw, hw, -hd, hd, hh + 0.9, "mesh");
  for (const [x, z] of [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]] as const) seg(segs, T, [x, hh, z], [x, hh + 0.9, z], "mesh");
  // crenellation on the front parapet
  for (let i = 0; i <= 24; i++) {
    const x = -hw + i;
    seg(segs, T, [x, hh + 0.9, -hd], [x, hh + 1.4, -hd], "mesh");
  }
  // front arcade (7 arches)
  const n = 7;
  const bay = (hw * 2) / n;
  for (let i = 0; i < n; i++) {
    const cx = -hw + bay * (i + 0.5);
    const pts = archPts([cx, 0, -hd - 0.02], [1, 0], bay * 0.36, 3.6, 8);
    polyline(segs, T, pts, "arch");
    seg(segs, T, [pts[0][0], 0, pts[0][2]], pts[0], "arch");
    seg(segs, T, [pts[8][0], 0, pts[8][2]], pts[8], "arch");
  }
  for (let y = 1.6; y < hh; y += 1.6) seg(segs, T, [-hw, y, hd], [hw, y, hd], "mesh");
  // side face mesh (left, facing city centre)
  for (let i = 1; i < 6; i++) {
    const z = -hd + (2 * hd * i) / 6;
    seg(segs, T, [-hw, 0, z], [-hw, hh, z], "mesh");
  }
  // Drum + Green Dome
  const dc: V3 = [-2.5, hh + 0.9, -1.5];
  const R = 6.2;
  const drumH = 2.4;
  const drumBot = circleXZ(dc[0], dc[2], R * 0.98, dc[1], 24);
  const drumTop = circleXZ(dc[0], dc[2], R * 0.98, dc[1] + drumH, 24);
  polyline(segs, T, drumBot, "dome");
  polyline(segs, T, drumTop, "dome");
  for (let i = 0; i < 24; i += 2) seg(segs, T, drumBot[i], drumTop[i], "domeMesh");
  // windows on drum
  for (let i = 0; i < 24; i += 3) {
    const a = (Math.PI * 2 * i) / 24;
    const wx = dc[0] + Math.cos(a) * R * 0.99;
    const wz = dc[2] + Math.sin(a) * R * 0.99;
    seg(segs, T, [wx, dc[1] + 0.5, wz], [wx, dc[1] + drumH - 0.5, wz], "dome");
  }
  const y0 = dc[1] + drumH;
  const domeH = R * 1.3;
  const profile = (u: number) => {
    // slightly bulbous dome with a pointed crown
    const r = R * Math.pow(Math.max(0, 1 - u * u), 0.55) * (1 + 0.1 * Math.sin(Math.PI * u * 0.9));
    return r;
  };
  const merid = 20;
  const par = 9;
  const hull: V3[] = [];
  for (let m = 0; m < merid; m++) {
    const a = (Math.PI * 2 * m) / merid;
    const pts: V3[] = [];
    for (let j = 0; j <= 14; j++) {
      const u = j / 14;
      const r = profile(u);
      const p: V3 = [dc[0] + Math.cos(a) * r, y0 + u * domeH, dc[2] + Math.sin(a) * r];
      pts.push(p);
      hull.push(T(p));
    }
    polyline(segs, T, pts, "domeMesh");
  }
  for (let j = 1; j <= par; j++) {
    const u = j / (par + 1);
    polyline(segs, T, circleXZ(dc[0], dc[2], profile(u), y0 + u * domeH, 32), j % 3 === 0 ? "dome" : "domeMesh");
  }
  polyline(segs, T, circleXZ(dc[0], dc[2], R, y0, 32), "dome");
  // Finial + crescent
  const topY = y0 + domeH;
  seg(segs, T, [dc[0], topY, dc[2]], [dc[0], topY + 3.2, dc[2]], "gold");
  polyline(segs, T, circleXZ(dc[0], dc[2], 0.35, topY + 1.4, 8), "gold");
  const cres: V3[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI * 0.1 + (Math.PI * 1.2 * i) / 10;
    cres.push([dc[0] + Math.cos(a) * 0.75, topY + 3.9 + Math.sin(a) * 0.75, dc[2]]);
  }
  polyline(segs, T, cres, "gold");
  // Small roof domes (silver dome row)
  for (const [x, z] of [[7, 4], [7, -4], [-9, 5]] as const) {
    for (let m = 0; m < 8; m++) {
      const a = (Math.PI * 2 * m) / 8;
      const pts: V3[] = [];
      for (let j = 0; j <= 5; j++) {
        const u = j / 5;
        const r = 2.0 * Math.sqrt(1 - u * u);
        pts.push([x + Math.cos(a) * r, hh + 0.9 + u * 2.0, z + Math.sin(a) * r]);
      }
      polyline(segs, T, pts, "mesh");
    }
    polyline(segs, T, circleXZ(x, z, 2.0, hh + 0.9, 16), "mesh");
  }
  // Minarets of the mosque
  const minaretLocal: [number, number, number][] = [
    [10.5, -7.5, 28],
    [-11, 7.5, 26],
    [-11, -7.5, 23],
  ];
  for (const [x, z, h] of minaretLocal) addMinaret(segs, T([x, 0, z]), h, 1.2);
  // Extra minarets in the wider complex
  addMinaret(segs, [origin[0] + 34, 0, origin[2] + 26], 31, 1.2);
  addMinaret(segs, [origin[0] + 14, 0, origin[2] + 70], 33, 1.2);
  // Colonnades
  for (const a of WORLD.nabawiArcade) addArcade(segs, a.from, a.to, a.bay, a.height, "arch");

  // Fill faces (hall walls)
  faces.push({ pts: ([[-hw, 0, -hd], [hw, 0, -hd], [hw, hh, -hd], [-hw, hh, -hd]] as V3[]).map(T), kind: "wall" });
  faces.push({ pts: ([[-hw, 0, hd], [-hw, 0, -hd], [-hw, hh, -hd], [-hw, hh, hd]] as V3[]).map(T), kind: "wall" });

  nabawiCache = {
    segs,
    faces,
    hullPts: hull,
    height: topY + 5,
    footprint: ([[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd]] as V3[]).map(T),
    center: T([dc[0], y0 + domeH * 0.4, dc[2]]),
    top: T([dc[0], topY + 4, dc[2]]),
  };
  return nabawiCache;
};

/* ------------------------------ Masjidil Haram surroundings ------------------------------ */
let haramCache: Seg[] | null = null;
export const getHaram = (): Seg[] => {
  if (haramCache) return haramCache;
  const segs: Seg[] = [];
  const a = WORLD.haramArcade;
  addArcade(segs, a.from, a.to, a.bay, a.height, "arch");
  // second storey, set back
  addArcade(segs, [a.from[0] - 4, 0, a.from[2] + 2], [a.to[0] - 4, 0, a.to[2] + 2], a.bay, a.height * 1.7, "archMesh", false);
  // curving riwaq behind the Ka'bah
  const k = WORLD.kaaba.origin;
  const ring = circleXZ(k[0], k[2], 27, 0, 40, Math.PI * 0.12, Math.PI * 0.66);
  for (let i = 0; i < ring.length - 1; i++) {
    const p0 = ring[i];
    const p1 = ring[i + 1];
    seg(segs, (p) => p, [p0[0], 6, p0[2]], [p1[0], 6, p1[2]], "arch");
    seg(segs, (p) => p, [p0[0], 0, p0[2]], [p0[0], 6, p0[2]], "archMesh");
    const mid: V3 = [(p0[0] + p1[0]) / 2, 0, (p0[2] + p1[2]) / 2];
    const dx = p1[0] - p0[0];
    const dz = p1[2] - p0[2];
    const l = Math.hypot(dx, dz);
    polyline(segs, (p) => p, archPts(mid, [dx / l, dz / l], l * 0.38, 3.8, 6), "archMesh");
  }
  for (const m of WORLD.haramMinarets) addMinaret(segs, m.pos, m.h, 1.3);
  haramCache = segs;
  return segs;
};
