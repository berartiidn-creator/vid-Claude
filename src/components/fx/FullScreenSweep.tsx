/**
 * FullScreenSweep: cinematic diagonal light sweep used as scene transition.
 * Combines a broad soft band, a bright core and a short exposure lift.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rgba } from "../../config/theme";
import { FPS } from "../../config/timeline";
import { EASE, clamp01 } from "../../lib/anim";

type Props = { start: number; duration: number; color: string; core: string; strength?: number; angle?: number };

export const FullScreenSweep: React.FC<Props> = ({ start, duration, color, core, strength = 1, angle = 18 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = clamp01((t - start) / duration);
  if (p <= 0 || p >= 1) return null;
  const e = EASE.inOut(p);
  const x = -60 + 220 * e; // percent of width
  const env = Math.sin(Math.PI * p) * strength;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-30%",
          height: "160%",
          left: `${x - 30}%`,
          width: "60%",
          transform: `skewX(${-angle}deg)`,
          background: `linear-gradient(90deg, transparent 0%, ${rgba(color, 0.18 * env)} 30%, ${rgba(color, 0.42 * env)} 47%, ${rgba(core, 0.75 * env)} 50%, ${rgba(color, 0.42 * env)} 53%, ${rgba(color, 0.18 * env)} 70%, transparent 100%)`,
          filter: "blur(18px)",
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at ${x}% 55%, ${rgba(color, 0.22 * env)}, transparent 70%)` }} />
    </AbsoluteFill>
  );
};
