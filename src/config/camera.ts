/**
 * Camera settings. Keyframes are [seconds, value] pairs, interpolated with a
 * smooth (ease-in-out) curve between each pair. World units: metres-ish.
 * The camera looks down +Z towards the horizon; +X is screen right.
 */
export type Key = [number, number];

export const CAMERA = {
  fovDeg: 40,
  /** Horizon position as a fraction of frame height (lens shift). */
  horizonY: 0.68,
  near: 0.6,
  fogNear: 140,
  fogFar: 760,
  /** Forward travel: slow push-in, then a move into the horizon (scene 2),
   * push-ins for scenes 3-5, stabilising for the final composition. */
  z: [
    [0, -78],
    [8.6, -64],
    [9.0, -63],
    [14.2, -34],
    [14.6, -33],
    [23.0, -22],
    [24.6, -12],
    [33.4, -6],
    [34.6, -3],
    [41.26, 0],
    [44.5, 1.6],
    [60, 2.8],
  ] as Key[],
  y: [
    [0, 8.5],
    [8.6, 7.6],
    [14.6, 6.6],
    [33, 6.2],
    [60, 6.1],
  ] as Key[],
  /** Gentle horizontal parallax drift (amplitude in world units). */
  driftAmplitude: [
    [0, 2.2],
    [41, 1.6],
    [45, 0.5],
    [60, 0.35],
  ] as Key[],
  driftPeriod: 27,
  /** Yaw (radians) follows the drift slightly for parallax. */
  yawFactor: 0.0035,
  pitch: 0,
};
