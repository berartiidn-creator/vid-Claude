/** World layout: landmark placement and city generation parameters. */
import type { V3 } from "../lib/camera3d";

export const WORLD = {
  kaaba: { origin: [-31.5, 0, 79] as V3, yaw: 0.36, width: 12, depth: 10.5, height: 13 },
  nabawi: { origin: [41.5, 0, 90] as V3, yaw: -0.2 },
  /** Haram arcade: runs from behind the Ka'bah toward the centre horizon. */
  haramArcade: { from: [-19, 0, 98] as V3, to: [-10, 0, 330] as V3, bay: 4.2, height: 6.2 },
  haramMinarets: [
    { pos: [-50, 0, 104] as V3, h: 27 },
    { pos: [-44, 0, 128] as V3, h: 30 },
    { pos: [-19, 0, 168] as V3, h: 31 },
  ],
  /** Nabawi colonnade: from the mosque toward the centre horizon and outward. */
  nabawiArcade: [
    { from: [27, 0, 96] as V3, to: [11, 0, 330] as V3, bay: 4.2, height: 6.0 },
    { from: [55, 0, 86] as V3, to: [92, 0, 80] as V3, bay: 4.2, height: 6.0 },
  ],
  city: { seed: 2026, perSide: 34, zMin: 190, zMax: 600 },
  grid: { spacing: 6, halfWidth: 420, far: 900 },
};
