import { Easing } from "remotion";
import { FPS } from "../config/timeline";
import type { Key } from "../config/camera";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  outSoft: Easing.bezier(0.33, 1, 0.68, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  cinematic: Easing.bezier(0.77, 0, 0.18, 1),
  linear: (t: number) => t,
};

/** Normalised progress between two times (seconds) for the given frame. */
export const prog = (
  frame: number,
  startSec: number,
  endSec: number,
  ease: (t: number) => number = EASE.inOut,
): number => {
  const t = frame / FPS;
  if (t <= startSec) return 0;
  if (t >= endSec) return 1;
  return ease((t - startSec) / (endSec - startSec));
};

/** Piecewise keyframe interpolation (seconds -> value), eased per segment. */
export const keyAt = (keys: Key[], tSec: number, ease: (t: number) => number = EASE.inOut): number => {
  if (tSec <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (tSec <= t1) return lerp(v0, v1, ease((tSec - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
};

/** Fade window: rises over [a,b], holds, falls over [c,d]. */
export const window4 = (frame: number, a: number, b: number, c: number, d: number, ease = EASE.inOut) =>
  Math.min(prog(frame, a, b, ease), 1 - prog(frame, c, d, ease));

export const sec = (frame: number) => frame / FPS;
