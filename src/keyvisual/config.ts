/**
 * Key visual animation (10 s): timing, camera and intensity settings.
 * All times in seconds.
 */
export const KV = {
  durationSeconds: 10,
  fps: 30,
  /** Slow cinematic push-in on the background (typography stays locked). */
  push: { from: 1.0, to: 1.016, originX: 960, originY: 700 },
  /** Background exposure ramp as the city comes alive. */
  exposure: [[0, 0.9], [1.6, 1.0], [10, 1.0]] as [number, number][],
  timeline: {
    cityWake: [0.15, 2.4], // blueprint wipe lighting the buildings bottom -> top
    particlesIn: [0.0, 2.0],
    kaabaScan: [2.0, 3.7],
    domeScan: [2.3, 4.0],
    minaretsRise: [2.5, 4.3],
    horizonRise: [2.0, 4.0],
    ribbonsFull: [3.6, 5.6],
    cloudTrace: [4.0, 6.0],
    titleSweep: [6.0, 7.5],
    logoSweep: [6.35, 7.65],
    taglineSweep: [6.7, 7.9],
    peakLight: [6.0, 8.0],
    kaabaScan2: [6.3, 7.7],
    domeScan2: [6.5, 7.9],
  },
  audio: { enabled: true, file: "audio/keyvisual_ambient.wav", volume: 0.85 },
};

/** Ambient lighting multiplier: 1 baseline, lifts during the 6-8 s peak. */
export const peakLift = (t: number) => {
  const [a, b] = KV.timeline.peakLight;
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return 1 + 0.22 * Math.sin(Math.PI * x);
};
