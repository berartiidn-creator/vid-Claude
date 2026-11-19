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
    [6, -64],
    [6.4, -63],
    [9.6, -34],
    [10, -33],
    [15.4, -22],
    [16.8, -12],
    [21.6, -6],
    [22.6, -3],
    [28, 0],
    [30.5, 1.6],
    [40, 2.6],
  ] as Key[],
  y: [
    [0, 8.5],
    [6, 7.6],
    [10, 6.6],
    [22, 6.2],
    [40, 6.1],
  ] as Key[],
  /** Gentle horizontal parallax drift (amplitude in world units). */
  driftAmplitude: [
    [0, 2.2],
    [28, 1.6],
    [31, 0.5],
    [40, 0.35],
  ] as Key[],
  driftPeriod: 19,
  /** Yaw (radians) follows the drift slightly for parallax. */
  yawFactor: 0.0035,
  pitch: 0,
};
