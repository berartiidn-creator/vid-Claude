/** LightStreak: a travelling light with long tail and anamorphic flare. */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rgba } from "../../config/theme";
import { FPS } from "../../config/timeline";
import { EASE, clamp01 } from "../../lib/anim";

type Props = { start: number; duration: number; y: number; color: string; core?: string; scale?: number; from?: number; to?: number };

export const LightStreak: React.FC<Props> = ({ start, duration, y, color, core = "#FFFFFF", scale = 1, from = -400, to = 2320 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = clamp01((t - start) / duration);
  if (p <= 0 || p >= 1) return null;
  const e = EASE.inOut(p);
  const x = from + (to - from) * e;
  const env = Math.sin(Math.PI * p);
  const tail = 900 * scale;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {/* tail */}
      <div
        style={{
          position: "absolute",
          left: x - tail,
          top: y - 2 * scale,
          width: tail,
          height: 4 * scale,
          background: `linear-gradient(90deg, transparent, ${rgba(color, 0.5 * env)} 70%, ${rgba(color, 0.95 * env)})`,
          filter: "blur(1px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - tail * 0.7,
          top: y - 12 * scale,
          width: tail * 0.7,
          height: 24 * scale,
          background: `linear-gradient(90deg, transparent, ${rgba(color, 0.35 * env)})`,
          filter: `blur(${10 * scale}px)`,
        }}
      />
      {/* head */}
      <div
        style={{
          position: "absolute",
          left: x - 160 * scale,
          top: y - 45 * scale,
          width: 320 * scale,
          height: 90 * scale,
          background: `radial-gradient(ellipse at center, ${rgba(core, 0.95 * env)} 0%, ${rgba(color, 0.55 * env)} 22%, transparent 70%)`,
        }}
      />
      {/* anamorphic flare */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y - 1,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${rgba(color, 0.35 * env)} ${(x / 1920) * 100}%, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
