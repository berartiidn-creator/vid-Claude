/**
 * MegaMendungPattern: Cirebon cloud motif built from nested, concentric cloud
 * contours with curled ends. Draws on with a stroke reveal, then drifts gently.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../config/theme";
import { FPS, T } from "../../config/timeline";
import { EASE, prog } from "../../lib/anim";

const CLOUD =
  "M 60 152 C 22 152 14 116 44 106 C 38 72 82 54 108 74 C 118 36 178 24 198 60 C 218 30 282 34 284 74 C 314 60 354 84 338 114 C 368 118 372 152 344 154 Z";
const CURL_L = "M 60 152 C 34 154 26 128 44 122 C 58 118 64 136 52 140 C 46 142 42 136 47 132";
const CURL_R = "M 344 154 C 364 150 366 130 350 126 C 338 124 334 140 344 142 C 349 143 352 138 348 134";
const SCALES = [1, 0.84, 0.68, 0.52, 0.36];
const CX = 196;
const CY = 118;

const Cloud: React.FC<{ draw: number; opacity: number }> = ({ draw, opacity }) => (
  <g opacity={opacity}>
    {SCALES.map((s, i) => (
      <path
        key={i}
        d={CLOUD}
        transform={`translate(${CX * (1 - s)} ${CY * (1 - s) + i * 3}) scale(${s})`}
        fill={i === SCALES.length - 1 ? "rgba(16,185,154,0.06)" : "none"}
        stroke={i === 0 ? COLORS.gold : COLORS.neonEmerald}
        strokeOpacity={i === 0 ? 0.5 : 0.55 - i * 0.08}
        strokeWidth={(i === 0 ? 1.3 : 1.1) / s}
        pathLength={1}
        strokeDasharray={`${Math.min(1, draw * 1.3 - i * 0.07)} 2`}
      />
    ))}
    <path d={CURL_L} fill="none" stroke={COLORS.gold} strokeOpacity={0.5} strokeWidth={1.4} pathLength={1} strokeDasharray={`${draw} 2`} />
    <path d={CURL_R} fill="none" stroke={COLORS.gold} strokeOpacity={0.5} strokeWidth={1.4} pathLength={1} strokeDasharray={`${draw} 2`} />
  </g>
);

export const MegaMendungPattern: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const draw = prog(frame, T.horizonBoost + 0.2, T.horizonBoost + 2.2, EASE.outSoft);
  if (draw <= 0) return null;
  const drift = Math.sin(t * 0.35) * 6;
  const op = 0.6;
  const group = (
    <>
      <g transform={`translate(${-24 + drift} -4) scale(1.32)`}>
        <Cloud draw={draw} opacity={op} />
      </g>
      <g transform={`translate(${330 - drift * 0.6} -34) scale(0.7)`}>
        <Cloud draw={Math.max(0, draw - 0.15)} opacity={op * 0.7} />
      </g>
    </>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 6px rgba(16,185,154,0.35))" }}>
        {group}
        <g transform="translate(1920 0) scale(-1 1)">{group}</g>
      </svg>
    </AbsoluteFill>
  );
};
