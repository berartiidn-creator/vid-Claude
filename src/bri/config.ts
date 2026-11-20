/**
 * "BRI-style" cut of the Manasik bumper (60 s): bright, misty, glass-tower
 * city in the Al-Bahjah emerald palette; a different camera shot per text
 * card, cut with light flashes, neon ribbons, decode/glitch typography, a
 * cloud whiteout and a bright final key visual. Times are seconds and sit on
 * accents of the edited backsound (public/audio/backsound_60s.wav).
 */
import type { V3 } from "../lib/camera3d";

export const CBD_Z = -2000; // Makkah tower district (shots 1-2), far from the sacred city
export const MADINAH_Z = -3600; // Madinah tower district (shot 3)

/** Backsound tempo grid: ~111 BPM, beat 0 on the first drop (20.85 s). */
export const BPM = 111;
export const BEAT = 60 / BPM;
export const BEAT0 = 20.85;
export const beatAt = (n: number) => BEAT0 + n * BEAT;

export const TB = {
  // cards
  logoIn: 0.6,
  logoOut: 4.15,
  cut1: 4.85,
  presentIn: 6.0,
  presentOut: 9.9,
  cut2: 11.12,
  hatiIn: 12.201,
  hatiOut: 18.147,
  cut3: 18.688,
  landmarksBuild: 18.788,
  drop: 20.85,
  allahIn: 21.391,
  allahOut: 26.255,
  cut5: 26.796,
  rasulIn: 27.336,
  rasulOut: 32.201,
  cut6: 32.742,
  manasikIn: 35.45,
  umrohIn: 36.2,
  swooshIn: 37.0,
  titleOut: 39.3,
  whiteoutStart: 39.2,
  finalStart: 41.26,
  kvLineDraw: 41.3,
  kvTitleIn: 42.95,
  kvLogoIn: 41.931,
  kvTaglineIn: 43.012,
  kvSwooshIn: 43.553,
  goldenSweep: 47.336,
  finalAccent: 53.76,
  end: 60,
};

export type Palette = {
  sky: string; // CSS background
  towerFillTop: string;
  towerFillBottom: string;
  lineAlpha: number;
  bloom: number;
  cloud: number; // cloud layer opacity
  textShadow: string;
};

export const PALETTES: Record<string, Palette> = {
  mist: {
    sky: "linear-gradient(180deg, #6CC7AE 0%, #33997E 30%, #17705A 64%, #0B4A3C 100%)",
    towerFillTop: "rgba(226,255,247,0.14)",
    towerFillBottom: "rgba(8,80,64,0.38)",
    lineAlpha: 1,
    bloom: 0.85,
    cloud: 0.34,
    textShadow: "0 2px 14px rgba(3,46,40,0.55), 0 0 2px rgba(3,46,40,0.4)",
  },
  teal: {
    sky: "linear-gradient(180deg, #3AA88B 0%, #1E7F67 38%, #0F5A49 72%, #0A4538 100%)",
    towerFillTop: "rgba(200,255,240,0.10)",
    towerFillBottom: "rgba(3,40,32,0.45)",
    lineAlpha: 1,
    bloom: 0.95,
    cloud: 0.22,
    textShadow: "0 2px 14px rgba(3,46,40,0.6), 0 0 2px rgba(3,46,40,0.45)",
  },
  night: {
    sky: "linear-gradient(180deg, #01110D 0%, #032E28 45%, #075B43 85%, #0B6E55 100%)",
    towerFillTop: "rgba(16,185,154,0.10)",
    towerFillBottom: "rgba(1,16,12,0.65)",
    lineAlpha: 1,
    bloom: 1.05,
    cloud: 0.12,
    textShadow: "0 0 18px rgba(16,185,154,0.45), 0 2px 10px rgba(0,0,0,0.6)",
  },
  bright: {
    sky: "linear-gradient(180deg, #9EE3D0 0%, #4DB89B 30%, #23947A 56%, #2FA387 66%, #146A56 76%, #0A4B3D 100%)",
    towerFillTop: "rgba(226,255,247,0.16)",
    towerFillBottom: "rgba(8,80,64,0.35)",
    lineAlpha: 0.9,
    bloom: 0.85,
    cloud: 0.42,
    textShadow: "0 2px 16px rgba(3,46,40,0.6), 0 0 2px rgba(3,46,40,0.45)",
  },
  kv: {
    sky: "linear-gradient(180deg, #BDF0E2 0%, #6CCDB3 24%, #2C9E83 50%, #39B192 66%, #157059 76%, #0B4D3F 100%)",
    towerFillTop: "rgba(226,255,247,0.16)",
    towerFillBottom: "rgba(8,80,64,0.35)",
    lineAlpha: 0.95,
    bloom: 0.9,
    cloud: 0,
    textShadow: "0 2px 16px rgba(3,46,40,0.6), 0 0 2px rgba(3,46,40,0.45)",
  },
};

type K = [number, number][];
export type Shot = {
  id: string;
  from: number;
  to: number;
  palette: keyof typeof PALETTES;
  /** what to draw */
  cbd?: boolean;
  city?: boolean;
  /** camera: either free (pos/yaw/pitch) or orbiting a target */
  pos?: { x: K; y: K; z: K };
  yaw?: K;
  pitch?: K;
  orbit?: { target: V3; angle: K; radius: K; height: K; yawOffset: number; pitchOffset: number };
  fov: number;
  cy: number;
};

export const DOME_TARGET: V3 = [39.4, 13, 88];
export const KAABA_TARGET: V3 = [-31.5, 6.5, 79];

export const SHOTS: Shot[] = [
  {
    id: "misty-ascent",
    from: 0,
    to: TB.cut1,
    palette: "mist",
    cbd: true,
    pos: { x: [[0, 6], [TB.cut1, 3]], y: [[0, 3], [TB.cut1, 18]], z: [[0, CBD_Z - 175], [TB.cut1, CBD_Z - 150]] },
    yaw: [[0, 0.05], [TB.cut1, -0.03]],
    pitch: [[0, 0.4], [TB.cut1, 0.47]],
    fov: 52,
    cy: 0.5,
  },
  {
    id: "night-rise",
    from: TB.cut1,
    to: TB.cut2,
    palette: "night",
    cbd: true,
    pos: { x: [[TB.cut1, -12], [TB.cut2, 10]], y: [[TB.cut1, 30], [TB.cut2, 165]], z: [[TB.cut1, CBD_Z - 70], [TB.cut2, CBD_Z - 5]] },
    yaw: [[TB.cut1, -0.28], [TB.cut2, 0.24]],
    pitch: [[TB.cut1, 0.55], [TB.cut2, 0.22]],
    fov: 56,
    cy: 0.5,
  },
  {
    id: "glide",
    from: TB.cut2,
    to: TB.cut3,
    palette: "teal",
    cbd: true,
    pos: { x: [[TB.cut2, -16], [TB.cut3, 12]], y: [[TB.cut2, 20], [TB.cut3, 30]], z: [[TB.cut2, MADINAH_Z - 110], [TB.cut3, MADINAH_Z + 20]] },
    yaw: [[TB.cut2, 0.1], [TB.cut3, -0.08]],
    pitch: [[TB.cut2, 0.13], [TB.cut3, 0.09]],
    fov: 50,
    cy: 0.5,
  },
  {
    id: "sacred-build",
    from: TB.cut3,
    to: TB.drop,
    palette: "kv",
    pos: { x: [[TB.cut3, 0], [TB.drop, 0]], y: [[TB.cut3, 8], [TB.drop, 7.6]], z: [[TB.cut3, -66], [TB.drop, -52]] },
    yaw: [[TB.cut3, 0], [TB.drop, 0]],
    pitch: [[TB.cut3, 0], [TB.drop, 0]],
    fov: 40,
    cy: 0.64,
  },
  {
    id: "kaaba-orbit",
    from: TB.drop,
    to: TB.cut5,
    palette: "kv",
    orbit: { target: KAABA_TARGET, angle: [[TB.drop, -0.62], [TB.cut5, -0.3]], radius: [[TB.drop, 50], [TB.cut5, 42]], height: [[TB.drop, 3.5], [TB.cut5, 5.5]], yawOffset: 0.3, pitchOffset: 0.05 },
    fov: 44,
    cy: 0.5,
  },
  {
    id: "dome-orbit",
    from: TB.cut5,
    to: TB.cut6,
    palette: "kv",
    orbit: { target: DOME_TARGET, angle: [[TB.cut5, 0.62], [TB.cut6, 0.3]], radius: [[TB.cut5, 66], [TB.cut6, 56]], height: [[TB.cut5, -3], [TB.cut6, -1]], yawOffset: -0.32, pitchOffset: 0.06 },
    fov: 44,
    cy: 0.5,
  },
  {
    id: "title-wide",
    from: TB.cut6,
    to: TB.finalStart,
    palette: "kv",
    pos: { x: [[TB.cut6, -2], [TB.finalStart, 1]], y: [[TB.cut6, 7.2], [TB.finalStart, 6.4]], z: [[TB.cut6, -30], [TB.finalStart, -4]] },
    yaw: [[TB.cut6, 0.01], [TB.finalStart, -0.01]],
    pitch: [[TB.cut6, 0], [TB.finalStart, 0]],
    fov: 40,
    cy: 0.68,
  },
  {
    id: "final-kv",
    from: TB.finalStart,
    to: TB.end + 1,
    palette: "kv",
    pos: { x: [[TB.finalStart, 0], [TB.end, 0]], y: [[TB.finalStart, 6.3], [TB.end, 6.1]], z: [[TB.finalStart, -1.5], [TB.end, 2.6]] },
    yaw: [[TB.finalStart, 0], [TB.end, 0]],
    pitch: [[TB.finalStart, 0], [TB.end, 0]],
    fov: 40,
    cy: 0.68,
  },
];

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];

/** Neon ribbon sweeps (start time, preset). */
export const RIBBONS: { at: number; kind: "laser" | "swirlL" | "swirlR" | "arc" }[] = [
  { at: 20.9, kind: "swirlL" },
  { at: 47.1, kind: "arc" },
];

/** Light flashes on cuts. */
export const FLASHES: { at: number; strength: number }[] = [
  { at: TB.cut1, strength: 0.4 },
  { at: TB.cut2, strength: 0.32 },
  { at: TB.cut3, strength: 0.25 },
  { at: TB.drop, strength: 0.5 },
  { at: TB.cut5, strength: 0.3 },
  { at: TB.cut6, strength: 0.3 },
  { at: TB.finalStart, strength: 0.35 },
];

/**
 * 2.5D camera over the key-visual plate for the landmark shots, so the Ka'bah
 * and the Green Dome are the same ones as in the ending. Keyframes [t, v]:
 * s = zoom, (fx, fy) = plate point placed at screen (sx, sy), ry = perspective yaw (deg).
 * seqFrom = when the key-visual loop's local clock starts (aligns its scans).
 */
export type PlateShot = { id: string; from: number; to: number; seqFrom: number; intro?: boolean; ease?: boolean; truck?: K; s: K; fx: K; fy: K; sx: K; sy: K; ry: K };

export const PLATE_SHOTS: PlateShot[] = [
  { id: "sacred-build", from: TB.cut3, to: TB.drop, seqFrom: TB.cut3, intro: true, truck: [[TB.cut3, -18], [TB.drop, 18]], s: [[TB.cut3, 1.14], [TB.drop, 1.06]], fx: [[TB.cut3, 960], [TB.drop, 960]], fy: [[TB.cut3, 640], [TB.drop, 630]], sx: [[TB.cut3, 960], [TB.drop, 960]], sy: [[TB.cut3, 600], [TB.drop, 590]], ry: [[TB.cut3, 0], [TB.drop, 0]] },
  { id: "kaaba", from: TB.drop, to: TB.cut5, seqFrom: TB.drop - 1.9, truck: [[TB.drop, 26], [TB.cut5, -26]], s: [[TB.drop, 1.62], [TB.cut5, 1.46]], fx: [[TB.drop, 265], [TB.cut5, 265]], fy: [[TB.drop, 683], [TB.cut5, 683]], sx: [[TB.drop, 380], [TB.cut5, 370]], sy: [[TB.drop, 620], [TB.cut5, 640]], ry: [[TB.drop, 3], [TB.cut5, 1]] },
  { id: "dome", from: TB.cut5, to: TB.cut6, seqFrom: TB.cut5 - 2.2, truck: [[TB.cut5, -26], [TB.cut6, 26]], s: [[TB.cut5, 1.62], [TB.cut6, 1.46]], fx: [[TB.cut5, 1705], [TB.cut6, 1705]], fy: [[TB.cut5, 661], [TB.cut6, 661]], sx: [[TB.cut5, 1560], [TB.cut6, 1580]], sy: [[TB.cut5, 600], [TB.cut6, 620]], ry: [[TB.cut5, -3], [TB.cut6, -1]] },
  // title shot flows straight into the final key visual (no cut): ease out to the full frame on the drop
  { id: "title", from: TB.cut6, to: TB.end + 1, seqFrom: TB.cut6 - 2.4, ease: true, truck: [[TB.cut6, 22], [TB.finalStart, -6], [TB.finalStart + 2.4, 14], [TB.end, -20]], s: [[TB.cut6, 1.36], [TB.finalStart, 1.2], [TB.finalStart + 2.4, 1.0], [TB.end, 1.024]], fx: [[TB.cut6, 960], [TB.end, 960]], fy: [[TB.cut6, 700], [TB.finalStart, 690], [TB.finalStart + 2.4, 540], [TB.end, 540]], sx: [[TB.cut6, 960], [TB.end, 960]], sy: [[TB.cut6, 740], [TB.finalStart, 720], [TB.finalStart + 2.4, 540], [TB.end, 540]], ry: [[TB.cut6, 0], [TB.end, 0]] },
];

/** Flying "selendang" (light fabric) passes in the earlier shots. */
export const SELENDANG: { at: number; preset: "riseL" | "riseR" | "across" | "low" | "wipe"; dur?: number; body?: number }[] = [
  // ambient passes (slow, ~2.6 bars)
  { at: 1.4, preset: "riseL" },
  { at: 13.6, preset: "riseR" },
  { at: 22.4, preset: "low" },
  { at: 49.6, preset: "riseR" },
  { at: 55.0, preset: "across" },
  // fabric wipes carrying each cut: 3 beats long, densest exactly on the cut
  ...[TB.cut1, TB.cut2, TB.cut3, TB.cut5, TB.cut6].map((c) => ({ at: c - 1.5 * BEAT, preset: "wipe" as const, dur: 3 * BEAT, body: 0.5 })),
];

/**
 * Organic camera: smooth deterministic "operator" drift (sum of incommensurate
 * sines, range about -1..1) and a speed ramp that makes every shot move faster
 * into and out of its cuts and slower while text is being read.
 */
export const drift = (t: number, seed: number) =>
  0.5 * Math.sin(t * 0.71 + seed) + 0.3 * Math.sin(t * 1.13 + seed * 2.1) + 0.2 * Math.sin(t * 1.97 + seed * 3.7);

export const RAMP = 0.55;
export const rampTime = (t: number, from: number, to: number) => {
  const p = Math.max(0, Math.min(1, (t - from) / (to - from)));
  return from + (p + (RAMP * Math.sin(2 * Math.PI * p)) / (2 * Math.PI)) * (to - from);
};

/** Cuts carried by motion blur (camera whip). */
export const CUTS = [TB.cut1, TB.cut2, TB.cut3, TB.cut5, TB.cut6];
export const whipAt = (t: number) => CUTS.reduce((m, c) => Math.max(m, Math.exp(-(((t - c) / 0.11) ** 2))), 0);
