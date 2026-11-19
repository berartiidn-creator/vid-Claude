/**
 * MosqueArchitecture: Masjidil Haram surroundings (arcades, riwaq, minarets)
 * that frame the Ka'bah. Reveals outward from the Ka'bah toward the horizon.
 */
import { LIGHTING } from "../../config/lighting";
import { COLORS } from "../../config/theme";
import { T } from "../../config/timeline";
import { WORLD } from "../../config/world";
import { EASE, keyAt, smoothstep } from "../../lib/anim";
import type { V3 } from "../../lib/camera3d";
import { getHaram } from "../../geometry/landmarks";
import type { WireBatch } from "../../lib/wire";
import { drawReveal } from "./reveal";

const field = (p: V3) => {
  const o = WORLD.kaaba.origin;
  const dist = Math.hypot(p[0] - o[0], p[2] - o[2]);
  return Math.min(1, 0.55 * (p[1] / 44) + 0.45 * (dist / 240));
};

export const drawMosqueArchitecture = (batch: WireBatch, t: number) => {
  const P = EASE.inOut(smoothstep(T.kaabaBuildStart + 0.25, T.domeBuildEnd, t));
  if (P <= 0) return;
  const L = keyAt(LIGHTING.landmarks, t);
  const G = keyAt(LIGHTING.gold, t);
  drawReveal(batch, getHaram(), field, P, (s) => {
    switch (s.k) {
      case "arch":
        return { style: COLORS.neonEmerald, alpha: 0.55 * L, width: 1.2 };
      case "minaret":
        return { style: COLORS.neonEmerald, alpha: 0.75 * L, width: 1.3 };
      case "gold":
        return { style: COLORS.gold, alpha: 0.9 * G, width: 1.5 };
      default:
        return { style: COLORS.neonEmerald, alpha: 0.18 * L, width: 1 };
    }
  });
};
