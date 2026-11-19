/**
 * PerspectiveGrid: reflective floor converging toward the horizon, with
 * illuminated intersections and light pulses. Draws into a WireBatch.
 */
import { CAMERA } from "../../config/camera";
import { COLORS } from "../../config/theme";
import { T } from "../../config/timeline";
import { WORLD } from "../../config/world";
import { EASE, keyAt, smoothstep } from "../../lib/anim";
import type { Cam } from "../../lib/camera3d";
import { hash } from "../../lib/random";
import type { WireBatch } from "../../lib/wire";
import { LIGHTING } from "../../config/lighting";

export const drawPerspectiveGrid = (batch: WireBatch, cam: Cam, t: number) => {
  const { spacing: s, halfWidth: hw, far } = WORLD.grid;
  const I = keyAt(LIGHTING.grid, t);
  const p = smoothstep(T.gridDrawStart, T.gridDrawEnd, t);
  if (p <= 0) return;
  const pe = EASE.out(p);
  const camZ = cam.pos[2];
  const zStart = far - (far - (camZ + 1)) * pe;
  const h = cam.pos[1];
  // lateral reveal: lines spread from the centre outward as the grid draws
  const xReach = 40 + (hw - 40) * EASE.out(Math.min(1, p * 1.4));

  // Lines running toward the horizon, chunked so distance fog applies smoothly.
  const chunk = 70;
  for (let x = -hw; x <= hw + 0.01; x += s) {
    if (Math.abs(x) > xReach) continue;
    const idx = Math.round(x / s);
    const major = idx % 4 === 0;
    const centre = idx === 0;
    const edgeFade = 1 - Math.abs(x) / hw;
    const base = (centre ? 0.95 : major ? 0.5 : 0.26) * (0.35 + 0.65 * edgeFade) * I;
    for (let z = Math.max(zStart, camZ + 1); z < far; z += chunk) {
      const z1 = Math.min(far, z + chunk);
      batch.line([x, 0, z], [x, 0, z1], centre ? COLORS.cyan : COLORS.neonEmerald, base, centre ? 1.6 : 1);
    }
  }

  // Lines parallel to the horizon; fade out where they would alias.
  const z0 = Math.ceil(Math.max(zStart, camZ + 2) / s) * s;
  for (let z = z0; z < far; z += s) {
    const d = z - camZ;
    const idx = Math.round(z / s);
    const major = idx % 4 === 0;
    const px = (cam.focal * h * s * (major ? 4 : 1)) / (d * d);
    const aa = smoothstep(2.2, 9, px);
    if (aa <= 0.01) continue;
    const a = (major ? 0.5 : 0.24) * aa * I;
    batch.line([-xReach, 0, z], [xReach, 0, z], COLORS.neonEmerald, a, 1);
  }

  // Bright construction front while drawing
  if (p < 1) {
    batch.line([-xReach, 0, zStart], [xReach, 0, zStart], COLORS.cyan, 0.95 * (1 - p * 0.5), 2.2, false);
  }

  // Illuminated intersections near the camera
  for (let ix = -16; ix <= 16; ix++) {
    for (let iz = 1; iz <= 34; iz++) {
      const x = ix * s;
      const z = Math.ceil((camZ + 4) / s) * s + iz * s;
      if (z < zStart) continue;
      const hsh = hash(ix * 977 + Math.round(z / s) * 131);
      if (hsh > 0.16) continue;
      const tw = Math.pow(Math.sin(t * (1.2 + hsh * 6) + hsh * 40) * 0.5 + 0.5, 3);
      batch.dot([x, 0.02, z], 2.2, hsh < 0.03 ? COLORS.gold : COLORS.cyan, (0.25 + 0.75 * tw) * I);
    }
  }

  // Light pulses travelling toward the viewer along the grid
  if (p >= 1) {
    for (let i = 0; i < 14; i++) {
      const lane = Math.round((hash(i * 31 + 7) - 0.5) * 50) * s;
      const speed = 70 + hash(i * 17) * 90;
      const span = far - (camZ + 10);
      const zHead = far - ((t * speed + hash(i * 3) * span) % span);
      for (let k = 0; k < 6; k++) {
        const za = zHead + k * 5;
        batch.line([lane, 0.03, za], [lane, 0.03, za + 5], COLORS.cyan, (1 - k / 6) * 0.9 * I, 1.6);
      }
    }
    // lateral pulses spreading from the centre line
    for (let i = 0; i < 6; i++) {
      const z = Math.ceil((camZ + 40 + hash(i * 9) * 220) / s) * s;
      const xHead = (t * 40 + hash(i * 5) * 300) % 300;
      for (const sign of [-1, 1]) {
        for (let k = 0; k < 4; k++) {
          const xa = sign * (xHead - k * 4);
          batch.line([xa, 0.03, z], [xa - sign * 4, 0.03, z], COLORS.neonEmerald, (1 - k / 4) * 0.7 * I, 1.4);
        }
      }
    }
  }
};

export const GRID_INFO = { horizonY: CAMERA.horizonY };
