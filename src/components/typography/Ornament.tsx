/** Gold ornaments: side rules, swash underline, diamond divider, glints. */
import React from "react";
import { COLORS, rgba } from "../../config/theme";

export const GoldRule: React.FC<{ width: number; progress: number; dir: "left" | "right"; style?: React.CSSProperties }> = ({ width, progress, dir, style }) => (
  <div
    style={{
      width,
      height: 2,
      transformOrigin: dir === "left" ? "100% 50%" : "0% 50%",
      transform: `scaleX(${progress})`,
      background: `linear-gradient(${dir === "left" ? "270deg" : "90deg"}, ${COLORS.goldLight}, ${COLORS.gold} 35%, ${rgba(COLORS.gold, 0)})`,
      boxShadow: `0 0 8px ${rgba(COLORS.gold, 0.6)}`,
      ...style,
    }}
  />
);

/** Calligraphic swash drawn on with a stroke reveal (SVG). */
export const GoldSwash: React.FC<{ width: number; progress: number; glow?: number; diamond?: boolean }> = ({ width, progress, glow = 1, diamond = false }) => {
  const h = width * 0.16;
  const d = `M 2 ${h * 0.72} C ${width * 0.28} ${h * 0.05}, ${width * 0.55} ${h * 0.05}, ${width - 2} ${h * 0.42}`;
  const d2 = `M ${width * 0.12} ${h * 0.82} C ${width * 0.38} ${h * 0.42}, ${width * 0.66} ${h * 0.38}, ${width * 0.9} ${h * 0.55}`;
  return (
    <svg width={width} height={h} style={{ overflow: "visible", filter: `drop-shadow(0 0 ${6 * glow}px ${rgba(COLORS.gold, 0.7)})` }}>
      <defs>
        <linearGradient id={`sw${width}`} x1="0" x2="1">
          <stop offset="0" stopColor={COLORS.goldDeep} stopOpacity="0" />
          <stop offset="0.25" stopColor={COLORS.gold} />
          <stop offset="0.6" stopColor={COLORS.goldLight} />
          <stop offset="1" stopColor={COLORS.gold} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={`url(#sw${width})`} strokeWidth={3.2} strokeLinecap="round" pathLength={1} strokeDasharray={`${progress} 2`} />
      <path d={d2} fill="none" stroke={`url(#sw${width})`} strokeWidth={1.3} strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.max(0, progress * 1.2 - 0.2)} 2`} opacity={0.8} />
      {diamond && progress > 0.5 && (
        <path
          d={`M ${width / 2} ${h * 0.12 - 7} l 7 7 l -7 7 l -7 -7 z`}
          fill={COLORS.goldLight}
          opacity={Math.min(1, (progress - 0.5) * 2)}
        />
      )}
    </svg>
  );
};

/** Ornamental divider: two tapered rules with a centre diamond. */
export const OrnamentLine: React.FC<{ width: number; progress: number }> = ({ width, progress }) => (
  <div style={{ position: "relative", width, height: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
    <GoldRule width={width / 2 - 24} progress={progress} dir="left" />
    <div
      style={{
        width: 10,
        height: 10,
        transform: `rotate(45deg) scale(${progress})`,
        background: `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold})`,
        boxShadow: `0 0 12px ${rgba(COLORS.gold, 0.8)}`,
      }}
    />
    <GoldRule width={width / 2 - 24} progress={progress} dir="right" />
  </div>
);

/** Four-point star glint. */
export const Glint: React.FC<{ x: number; y: number; size: number; intensity: number; rotate?: number }> = ({ x, y, size, intensity, rotate = 0 }) =>
  intensity <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: intensity, transform: `rotate(${rotate}deg)`, mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, marginTop: -1, background: `linear-gradient(90deg, transparent, #fff, transparent)` }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, marginLeft: -1, background: `linear-gradient(180deg, transparent, #fff, transparent)` }} />
      <div style={{ position: "absolute", inset: "30%", borderRadius: "50%", background: `radial-gradient(circle, rgba(255,250,220,1), ${rgba(COLORS.gold, 0.5)} 40%, transparent 70%)` }} />
    </div>
  );
