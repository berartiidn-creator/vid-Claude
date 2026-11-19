/**
 * Centralised timeline. All values are in SECONDS and converted to frames with
 * `f()`. Every animation in the project reads its timing from here.
 */
import { VIDEO } from "./theme";

export const FPS = VIDEO.fps;
export const f = (seconds: number): number => Math.round(seconds * FPS);

export const SCENES = {
  s1Brand: { from: 0, to: 8.6 },
  s2Mempersembahkan: { from: 8.6, to: 14.6 },
  s3Hati: { from: 14.6, to: 23.8 },
  s4Bertamu: { from: 23.8, to: 34.2 },
  s5Title: { from: 34.2, to: 41.26 },
  s6Final: { from: 41.26, to: 60 },
} as const;

/**
 * Beat sheet (seconds) for the 60 s cut. Key moments sit on accents of the
 * edited backsound (see scripts/edit_backsound.sh): logo 4.85, first drop
 * 20.85, MANASIK 35.45, music edit 39.75, second drop 41.26, closing hit 53.76.
 */
export const T = {
  // Scene 01 - brand introduction
  horizonSpark: 0.15,
  particlesIn: 0.5,
  gridDrawStart: 1.1,
  gridDrawEnd: 2.6,
  buildingsRiseStart: 2.4,
  buildingsRiseEnd: 4.6,
  logoParticlesStart: 3.6,
  logoSolid: 4.85,
  logoSweepStart: 6.3,
  logoSweepEnd: 7.3,
  // Scene 02 - MEMPERSEMBAHKAN
  logoOutStart: 8.6,
  logoOutEnd: 9.5,
  presentIn: 9.8,
  presentLinesStart: 11.2,
  presentLinesEnd: 12.2,
  emeraldSweep1: 13.6,
  presentOut: 13.85,
  // Scene 03 - Sarana Mempersiapkan Hati
  horizonBoost: 14.6,
  kaabaBuildStart: 15.4,
  kaabaBuildEnd: 17.2,
  domeBuildStart: 16.6,
  domeBuildEnd: 18.5,
  outlinesIlluminate: 18.0,
  energyArcStart: 18.2,
  hatiTextIn: 20.85,
  hatiHighlight: 22.5,
  hatiOut: 23.25,
  // Scene 04 - Bertamu kepada Allah / Rasulullah
  streakLR: 23.55,
  arcConnect: 23.8,
  landmarksFull: 24.65,
  particleWaves: 24.65,
  bertamuIn: 25.45,
  allahIn: 26.25,
  ornamentIn: 27.0,
  allahOut: 29.2,
  rasulBertamuIn: 30.05,
  rasulIn: 30.8,
  rasulOrnamentIn: 31.6,
  rasulSweep: 32.2,
  bertamuOut: 33.4,
  emeraldSweep2: 33.5,
  // Scene 05 - main title
  goldStreak: 34.4,
  titleMaskStart: 35.0,
  manasikIn: 35.45,
  umrohIn: 36.8,
  titleOrnament: 38.2,
  titleStable: 39.75,
  // Scene 06 - final branding
  finalScaleStart: 41.26,
  finalScaleEnd: 42.5,
  logoTopIn: 42.5,
  rearrangeStart: 43.0,
  rearrangeEnd: 45.0,
  taglineIn: 45.2,
  finalSweepStart: 47.0,
  finalSweepEnd: 49.4,
  fullIllumination: 47.5,
  holdStart: 49.4,
  finalAccent: 53.76,
  end: 60.0,
} as const;
