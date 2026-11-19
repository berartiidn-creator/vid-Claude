/**
 * EnergyArc: luminous arc with draw-on, layered glow and travelling highlight.
 * `SkyEnergyArc` = the big arc over the city; `LandmarkConnectorArc` links the
 * Ka'bah and the Green Dome (tracks their projected positions).
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../config/theme";
import { FPS, T } from "../../config/timeline";
import { EASE, prog, smoothstep, window4 } from "../../lib/anim";
import { getKaaba, getNabawi } from "../../geometry/landmarks";
import { projectAt } from "../../lib/projector";
import { LIGHTING } from "../../config/lighting";
import { keyAt } from "../../lib/anim";

type ArcProps = {
  id: string;
  d: string;
  draw: number; // 0..1
  intensity: number;
  head: number; // 0..1 travelling highlight position
  gradient: [string, string, string];
  width?: number;
  gx: [number, number];
};

export const EnergyArc: React.FC<ArcProps> = ({ id, d, draw, intensity, head, gradient, width = 2, gx }) => {
  if (draw <= 0 || intensity <= 0) return null;
  const dash = { strokeDasharray: `${draw} 2`, pathLength: 1 } as const;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={`g-${id}`} gradientUnits="userSpaceOnUse" x1={gx[0]} y1={0} x2={gx[1]} y2={0}>
          <stop offset="0" stopColor={gradient[0]} stopOpacity={0} />
          <stop offset="0.25" stopColor={gradient[0]} stopOpacity={0.9} />
          <stop offset="0.5" stopColor={gradient[1]} stopOpacity={1} />
          <stop offset="0.78" stopColor={gradient[2]} stopOpacity={0.85} />
          <stop offset="1" stopColor={gradient[2]} stopOpacity={0} />
        </linearGradient>
        <filter id={`b1-${id}`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id={`b2-${id}`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>
      <g style={{ mixBlendMode: "screen" }}>
        <path d={d} fill="none" stroke={`url(#g-${id})`} strokeWidth={width * 9} opacity={0.35 * intensity} filter={`url(#b1-${id})`} {...dash} />
        <path d={d} fill="none" stroke={`url(#g-${id})`} strokeWidth={width * 2.5} opacity={0.7 * intensity} filter={`url(#b2-${id})`} {...dash} />
        <path d={d} fill="none" stroke={`url(#g-${id})`} strokeWidth={width} opacity={Math.min(1, intensity)} {...dash} />
        {head > 0 && head < 1 && (
          <>
            <path
              d={d}
              fill="none"
              stroke="#F4FFFB"
              strokeWidth={width * 2.2}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.05 2"
              strokeDashoffset={-(head * draw - 0.05)}
              opacity={0.9 * intensity}
              filter={`url(#b2-${id})`}
            />
            <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray="0.03 2" strokeDashoffset={-(head * draw - 0.03)} opacity={intensity} />
          </>
        )}
      </g>
    </svg>
  );
};

const ellipsePath = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 120) => {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const x = cx + Math.cos(a) * rx;
    const y = cy - Math.sin(a) * ry;
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
};

const SKY_D = ellipsePath(1240, 1320, 1420, 1290, Math.PI * 0.86, Math.PI * 0.12);
const SKY_D2 = ellipsePath(1240, 1360, 1460, 1300, Math.PI * 0.84, Math.PI * 0.2);

export const SkyEnergyArc: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const draw = prog(frame, T.energyArcStart, T.energyArcStart + 1.4, EASE.cinematic);
  const pulse =
    1 +
    0.5 * Math.exp(-(((t - T.arcConnect) / 0.5) ** 2)) +
    0.6 * Math.exp(-(((t - T.goldStreak) / 0.5) ** 2)) +
    0.4 * Math.exp(-(((t - T.finalSweepStart - 0.6) / 0.7) ** 2));
  const I = (0.75 + 0.1 * Math.sin(t * 1.1)) * pulse * Math.min(1.2, keyAt(LIGHTING.landmarks, t));
  const head = t > T.energyArcStart ? ((t - T.energyArcStart) / 3.2) % 1 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <EnergyArc id="sky2" d={SKY_D2} draw={draw} intensity={I * 0.35} head={0} gradient={[COLORS.emerald, COLORS.neonEmerald, COLORS.emerald]} width={1.2} gx={[0, 1920]} />
      <EnergyArc id="sky" d={SKY_D} draw={draw} intensity={I} head={head} gradient={[COLORS.neonEmerald, "#BFFFF0", COLORS.neonEmerald]} width={2.2} gx={[0, 1920]} />
    </AbsoluteFill>
  );
};

export const LandmarkConnectorArc: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const vis = window4(frame, T.arcConnect, T.arcConnect + 0.2, T.emeraldSweep2, T.emeraldSweep2 + 0.8);
  if (vis <= 0) return null;
  const a = projectAt(frame, getKaaba().top);
  const b = projectAt(frame, getNabawi().top);
  if (!a || !b) return null;
  const midX = (a.x + b.x) / 2;
  // apex kept low (just above the landmarks) so the arc never crosses the typography
  const apex = Math.min(a.y, b.y) - 75;
  const ctrlY = 2 * (apex - (a.y + b.y) / 4);
  const d = `M${a.x.toFixed(1)} ${(a.y - 6).toFixed(1)} Q${midX.toFixed(1)} ${ctrlY.toFixed(1)} ${b.x.toFixed(1)} ${(b.y - 6).toFixed(1)}`;
  const draw = prog(frame, T.arcConnect, T.arcConnect + 0.9, EASE.cinematic);
  const head = t > T.arcConnect ? ((t - T.arcConnect) / 1.6) % 1 : 0;
  const I = vis * (0.8 + 0.4 * smoothstep(T.landmarksFull, T.landmarksFull + 0.6, t));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <EnergyArc id="conn" d={d} draw={draw} intensity={I} head={head} gradient={[COLORS.gold, COLORS.cyan, COLORS.neonEmerald]} width={1.8} gx={[a.x, b.x]} />
    </AbsoluteFill>
  );
};
