/** HorizonGlow: emerald/cyan light pool, horizon line and anamorphic lens glow. */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CAMERA } from "../../config/camera";
import { LIGHTING } from "../../config/lighting";
import { COLORS, rgba } from "../../config/theme";
import { FPS, T } from "../../config/timeline";
import { EASE, keyAt, prog } from "../../lib/anim";

export const HorizonGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const I = keyAt(LIGHTING.horizonGlow, t) * (1 + 0.03 * Math.sin(t * 2.3));
  const spark = prog(frame, T.horizonSpark, 1.4, EASE.out); // spreads from a point
  const hy = CAMERA.horizonY * 100;
  const w = 6 + 94 * spark;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${55 * spark + 4}% ${16 * spark + 2}% at 50% ${hy}%, ${rgba(COLORS.neonEmerald, 0.38 * I)} 0%, ${rgba(COLORS.emerald, 0.22 * I)} 45%, transparent 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${16 * spark + 2}% ${3.5 * spark + 0.8}% at 50% ${hy}%, ${rgba(COLORS.cyan, 0.75 * I)} 0%, ${rgba(COLORS.cyan, 0.15 * I)} 55%, transparent 80%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 2.6% 1.1% at 50% ${hy}%, rgba(245,255,250,${Math.min(1, 0.95 * I)}) 0%, rgba(245,255,250,0) 100%)`,
        }}
      />
      {/* horizon line */}
      <div
        style={{
          position: "absolute",
          left: `${50 - w / 2}%`,
          width: `${w}%`,
          top: `calc(${hy}% - 1px)`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${rgba(COLORS.cyan, 0.55 * I)} 30%, rgba(240,255,250,${Math.min(1, 0.95 * I)}) 50%, ${rgba(COLORS.cyan, 0.55 * I)} 70%, transparent)`,
        }}
      />
      {/* anamorphic streak */}
      <div
        style={{
          position: "absolute",
          left: `${50 - w * 0.4}%`,
          width: `${w * 0.8}%`,
          top: `calc(${hy}% - 4px)`,
          height: 8,
          filter: "blur(5px)",
          background: `linear-gradient(90deg, transparent, ${rgba(COLORS.cyan, 0.35 * I)} 40%, ${rgba(COLORS.white, 0.6 * I)} 50%, ${rgba(COLORS.cyan, 0.35 * I)} 60%, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
