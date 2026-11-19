/**
 * WireframeBuilding geometry + the DigitalCity generator (deterministic).
 */
import { WORLD } from "../config/world";
import { T as TL } from "../config/timeline";
import type { V3 } from "../lib/camera3d";
import { mulberry32, range } from "../lib/random";
import { boxEdges, rectXZ, seg, type Seg, xform } from "./primitives";

export type Win = { p: V3; phase: number; gold: boolean };

export type Building = {
  segs: Seg[];
  windows: Win[];
  x: number;
  z: number;
  w: number;
  d: number;
  height: number;
  riseStart: number;
  riseDur: number;
  scanSpeed: number;
  scanOffset: number;
  style: "glass" | "blueprint";
  footprint: [number, number, number, number];
};

type Spec = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  tiers: number;
  spire: boolean;
  style: "glass" | "blueprint";
  seed: number;
};

export const makeBuilding = (s: Spec, riseStart: number, riseDur: number): Building => {
  const rnd = mulberry32(s.seed);
  const segs: Seg[] = [];
  const windows: Win[] = [];
  const T = xform([s.x, 0, s.z], 0);
  let y0 = 0;
  let hw = s.w / 2;
  let hd = s.d / 2;
  const floor = 3.2;
  for (let t = 0; t < s.tiers; t++) {
    const th = t === 0 ? s.h * (s.tiers === 1 ? 1 : range(rnd, 0.55, 0.7)) : (s.h - y0) * (t === s.tiers - 1 ? 1 : 0.6);
    const y1 = Math.min(s.h, y0 + th);
    boxEdges(segs, T, -hw, hw, y0, y1, -hd, hd, "edge");
    // Floor lines
    for (let y = y0 + floor; y < y1 - 0.5; y += floor) rectXZ(segs, T, -hw, hw, -hd, hd, y, "floor");
    // Mullions on the two faces seen from the city axis
    const nm = Math.max(1, Math.round(s.w / 3.2));
    for (let i = 1; i < nm; i++) {
      const x = -hw + (2 * hw * i) / nm;
      seg(segs, T, [x, y0, -hd], [x, y1, -hd], "mull");
    }
    const nmd = Math.max(1, Math.round(s.d / 3.2));
    const sideX = s.x < 0 ? hw : -hw;
    for (let i = 1; i < nmd; i++) {
      const z = -hd + (2 * hd * i) / nmd;
      seg(segs, T, [sideX, y0, z], [sideX, y1, z], "mull");
    }
    // Lit windows
    for (let y = y0 + floor / 2; y < y1 - 1; y += floor) {
      for (let i = 0; i < nm; i++) {
        if (rnd() < 0.28) {
          const x = -hw + (2 * hw * (i + 0.5)) / nm;
          windows.push({ p: T([x, y, -hd]), phase: rnd() * 100, gold: rnd() < 0.12 });
        }
      }
      for (let i = 0; i < nmd; i++) {
        if (rnd() < 0.2) {
          const z = -hd + (2 * hd * (i + 0.5)) / nmd;
          windows.push({ p: T([sideX, y, z]), phase: rnd() * 100, gold: rnd() < 0.12 });
        }
      }
    }
    y0 = y1;
    hw *= range(rnd, 0.62, 0.82);
    hd *= range(rnd, 0.62, 0.82);
    if (y0 >= s.h - 0.1) break;
  }
  if (s.spire) {
    seg(segs, T, [0, y0, 0], [0, y0 + s.h * 0.18, 0], "spire");
  }
  return {
    segs,
    windows,
    x: s.x,
    z: s.z,
    w: s.w,
    d: s.d,
    height: s.spire ? y0 + s.h * 0.18 : y0,
    riseStart,
    riseDur,
    scanSpeed: range(rnd, 6, 12),
    scanOffset: rnd() * 200,
    style: s.style,
    footprint: [s.x - s.w / 2, s.x + s.w / 2, s.z - s.d / 2, s.z + s.d / 2],
  };
};

let cityCache: Building[] | null = null;

/** Generates the layered skyline: two flanking clusters + a low far skyline. */
export const getCity = (): Building[] => {
  if (cityCache) return cityCache;
  const rnd = mulberry32(WORLD.city.seed);
  const out: Building[] = [];
  const { zMin, zMax, perSide } = WORLD.city;
  const riseA = TL.buildingsRiseStart;
  const riseB = TL.buildingsRiseEnd;
  let seed = 100;
  for (const side of [-1, 1]) {
    for (let i = 0; i < perSide; i++) {
      const z = range(rnd, zMin, zMax);
      const minX = 30 + (z - zMin) * 0.04;
      const maxX = Math.min(0.62 * (z + 70), 330);
      const ax = range(rnd, minX, maxX);
      const outer = (ax - minX) / (maxX - minX);
      const h = range(rnd, 12, 30) + outer * range(rnd, 8, 42) + (rnd() < 0.12 ? 22 : 0);
      const w = range(rnd, 8, 17);
      const d = range(rnd, 8, 17);
      const delay = riseA + (1 - outer) * 0.5 + rnd() * (riseB - riseA - 0.9);
      out.push(
        makeBuilding(
          {
            x: side * ax, z, w, d, h,
            tiers: rnd() < 0.45 ? 2 : rnd() < 0.4 ? 3 : 1,
            spire: rnd() < 0.25,
            style: rnd() < 0.18 ? "blueprint" : "glass",
            seed: seed++,
          },
          delay,
          range(rnd, 0.7, 1.1),
        ),
      );
    }
  }
  // Far low skyline across the horizon (behind the landmarks).
  for (let i = 0; i < 22; i++) {
    const z = range(rnd, 520, 760);
    const side = i % 2 === 0 ? -1 : 1;
    const ax = range(rnd, 26, 340);
    out.push(
      makeBuilding(
        { x: side * ax, z, w: range(rnd, 10, 22), d: range(rnd, 10, 22), h: range(rnd, 10, 34), tiers: 1, spire: false, style: "glass", seed: seed++ },
        riseA + rnd() * 1.2,
        0.9,
      ),
    );
  }
  // Sort far -> near for nicer overdraw
  out.sort((a, b) => b.z - a.z);
  cityCache = out;
  return out;
};
