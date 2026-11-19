/**
 * Lighting intensities over time ([seconds, value]). 1.0 = nominal.
 */
import type { Key } from "./camera";

export const LIGHTING = {
  horizonGlow: [
    [0, 0], [0.2, 0.25], [1.0, 0.55], [8.6, 0.65], [14.6, 0.7], [15.5, 1.15], [18, 1.0],
    [33.6, 1.05], [34.6, 1.25], [36, 1.0], [47, 1.0], [48, 1.2], [53.6, 1.2], [54.0, 1.4], [55.5, 1.15], [60, 1.1],
  ] as Key[],
  grid: [[0, 0.75], [14.6, 0.85], [34, 0.95], [47, 1.0], [48.4, 1.15], [60, 1.1]] as Key[],
  city: [[0, 0.8], [14.6, 0.72], [18, 0.62], [34, 0.66], [47, 0.68], [48.4, 0.85], [60, 0.8]] as Key[],
  windows: [[2.8, 0], [4.6, 0.65], [24, 0.8], [47, 0.85], [48.4, 1.15], [60, 1.1]] as Key[],
  landmarks: [[15.4, 0.55], [18, 0.8], [19, 0.9], [24.0, 0.95], [25.0, 1.25], [33, 1.15], [47, 1.15], [48.4, 1.35], [53.6, 1.35], [54.0, 1.55], [55.5, 1.32], [60, 1.3]] as Key[],
  gold: [[0, 0.6], [24, 0.8], [25, 1.0], [34, 1.1], [47, 1.0], [48.4, 1.25], [60, 1.2]] as Key[],
  bloom: [[0, 0.9], [34, 1.0], [48, 1.1], [60, 1.05]] as Key[],
  beams: [[0, 0], [2, 0.35], [15, 0.7], [25, 0.9], [48, 1.1], [60, 1.0]] as Key[],
};

/** Scene 4 focus: the Ka'bah glows during "Allah", the Green Dome during "Rasulullah". */
const win = (t: number, a: number, b: number, c: number, d: number) => {
  const up = Math.max(0, Math.min(1, (t - a) / (b - a)));
  const down = 1 - Math.max(0, Math.min(1, (t - c) / (d - c)));
  const x = Math.min(up, down);
  return x * x * (3 - 2 * x);
};
export const kaabaFocus = (t: number) => 1 + 0.4 * win(t, 25.8, 26.6, 29.0, 29.9);
export const domeFocus = (t: number) => 1 + 0.4 * win(t, 30.4, 31.2, 33.2, 34.0);
