/**
 * Centralised timeline. All values are in SECONDS and converted to frames with
 * `f()`. Every animation in the project reads its timing from here.
 */
import { VIDEO } from "./theme";

export const FPS = VIDEO.fps;
export const f = (seconds: number): number => Math.round(seconds * FPS);

export const SCENES = {
  s1Brand: { from: 0, to: 6 },
  s2Present: { from: 6, to: 10 },
  s3Hati: { from: 10, to: 16 },
  s4Bertamu: { from: 16, to: 22 },
  s5Title: { from: 22, to: 28 },
  s6Final: { from: 28, to: 40 },
} as const;

/** Beat sheet (seconds) following the storyboard brief. */
export const T = {
  // Scene 01
  horizonSpark: 0.15,
  particlesIn: 0.4,
  gridDrawStart: 1.0,
  gridDrawEnd: 2.1,
  buildingsRiseStart: 2.0,
  buildingsRiseEnd: 3.6,
  logoParticlesStart: 3.0,
  logoSolid: 4.0,
  logoSweepStart: 5.0,
  logoSweepEnd: 5.8,
  // Scene 02
  logoOutStart: 6.0,
  logoOutEnd: 6.8,
  presentIn: 7.0,
  presentLinesStart: 8.0,
  presentLinesEnd: 8.8,
  emeraldSweep1: 9.25,
  presentOut: 9.45,
  // Scene 03
  horizonBoost: 10.0,
  kaabaBuildStart: 11.0,
  kaabaBuildEnd: 12.3,
  domeBuildStart: 12.0,
  domeBuildEnd: 13.4,
  outlinesIlluminate: 13.0,
  energyArcStart: 13.1,
  hatiTextIn: 14.0,
  hatiHighlight: 15.0,
  hatiOut: 15.55,
  // Scene 04
  streakLR: 16.0,
  arcConnect: 16.2,
  landmarksFull: 17.0,
  particleWaves: 17.0,
  bertamuIn: 18.0,
  allahIn: 19.0,
  ornamentIn: 20.0,
  emeraldSweep2: 21.0,
  bertamuOut: 21.3,
  // Scene 05
  goldStreak: 22.0,
  titleMaskStart: 23.0,
  manasikIn: 23.45,
  umrohIn: 24.75,
  titleOrnament: 26.0,
  titleStable: 27.0,
  // Scene 06
  finalScaleStart: 28.0,
  finalScaleEnd: 29.0,
  logoTopIn: 29.0,
  rearrangeStart: 29.4,
  rearrangeEnd: 30.9,
  taglineIn: 31.0,
  finalSweepStart: 32.0,
  finalSweepEnd: 33.6,
  fullIllumination: 32.4,
  holdStart: 34.0,
  end: 40.0,
} as const;
