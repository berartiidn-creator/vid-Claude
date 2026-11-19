/** Neon light ribbons (bundles of thin glowing strands) and rotating ring arcs. */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { FPS } from "../config/timeline";
import { clamp01, EASE, smoothstep } from "../lib/anim";
import { RIBBONS, TB } from "./config";

type P = [number, number];
const PRESETS: Record<string, { pts: [P, P, P, P]; dur: number; spread: number }> = {
  laser: { pts: [[-200, 760], [500, 560], [1300, 420], [2150, 230]], dur: 1.1, spread: 18 },
  swirlL: { pts: [[-150, 980], [520, 1060], [760, 360], [120, 80]], dur: 1.7, spread: 9 },
  swirlR: { pts: [[2070, 980], [1400, 1060], [1160, 360], [1800, 80]], dur: 1.7, spread: 9 },
  arc: { pts: [[-150, 640], [520, 40], [1400, 40], [2070, 640]], dur: 1.9, spread: 7 },
};

const Ribbon: React.FC<{ at: number; kind: string; id: number }> = ({ at, kind, id }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const pr = PRESETS[kind];
  const p = clamp01((t - at) / pr.dur);
  if (p <= 0 || p >= 1) return null;
  const head = EASE.inOut(p) * 1.35;
  const len = 0.5;
  const env = Math.sin(Math.PI * p);
  const strands = 6;
  const [a, b, c, d] = pr.pts;
  const paths = Array.from({ length: strands }, (_, i) => {
    const o = (i - (strands - 1) / 2) * pr.spread;
    const w = Math.sin(i * 1.7) * 0.35 + 1;
    return `M${a[0]} ${a[1] + o} C${b[0] + o * 2 * w} ${b[1] - o * 3}, ${c[0] - o * 2} ${c[1] + o * 2 * w}, ${d[0]} ${d[1] + o}`;
  });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <filter id={`rb${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g style={{ mixBlendMode: "screen" }}>
        {paths.map((dp, i) => {
          const lag = i * 0.025;
          const off = -(head - lag - len);
          const common = { d: dp, fill: "none", pathLength: 1, strokeDasharray: `${len} 3`, strokeDashoffset: off, strokeLinecap: "round" as const };
          return (
            <g key={i}>
              <path {...common} stroke={COLORS.cyan} strokeWidth={6} opacity={0.35 * env} filter={`url(#rb${id})`} />
              <path {...common} stroke={i % 3 === 0 ? "#FFFFFF" : "#B9FFF0"} strokeWidth={i % 3 === 0 ? 2 : 1.2} opacity={0.95 * env} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export const NeonRibbons: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {RIBBONS.map((r, i) => (
      <Ribbon key={i} id={i} at={r.at} kind={r.kind} />
    ))}
  </AbsoluteFill>
);

/** Rotating 3D-looking ring arcs at the frame edges during the title shot. */
export const RingArcs: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const vis = smoothstep(TB.cut6 + 0.3, TB.cut6 + 1.3, t) * (1 - smoothstep(TB.whiteoutStart, TB.whiteoutStart + 0.6, t));
  if (vis <= 0.01) return null;
  const draw = smoothstep(TB.cut6 + 0.3, TB.cut6 + 1.8, t);
  const ring = (cx: number, cy: number, rx: number, ry: number, rot: number, w: number, k: number, key: string) => (
    <ellipse
      key={key}
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="none"
      stroke="url(#ringG)"
      strokeWidth={w}
      pathLength={1}
      strokeDasharray={`${0.42 * draw} 1`}
      strokeDashoffset={-(t * 0.09 * k) % 1}
      transform={`rotate(${rot} ${cx} ${cy})`}
    />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: vis, mixBlendMode: "screen" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="0.5" stopColor={COLORS.cyan} stopOpacity="0.8" />
            <stop offset="1" stopColor={COLORS.neonEmerald} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {ring(1930, 470, 230, 330, 12, 14, 1, "a")}
        {ring(1930, 470, 180, 270, -8, 6, -1.4, "b")}
        {ring(1930, 470, 280, 380, 25, 2.5, 0.8, "c")}
        {ring(-10, 520, 210, 300, -12, 3, -1, "d")}
      </svg>
    </AbsoluteFill>
  );
};
