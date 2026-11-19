/** TaglinePlaque: dark emerald rounded plaque with thin gold outline. */
import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, rgba, TYPE } from "../../config/theme";
import { FPS, T } from "../../config/timeline";
import { EASE, prog } from "../../lib/anim";
import { TextSweep } from "./GoldenLightSweep";

export const TAGLINE = "Umroh Bersama Al-Bahjah, Bernilai Sedekah & Dakwah";

export const TaglinePlaque: React.FC<{ cx: number; cy: number; start?: number; sweepAt?: number }> = ({ cx, cy, start = T.taglineIn, sweepAt = T.finalSweepStart + 0.55 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const open = prog(frame, start, start + 0.7, EASE.cinematic);
  const txt = prog(frame, start + 0.3, start + 1.1, EASE.inOut);
  if (open <= 0) return null;
  const inset = 50 * (1 - open);
  const borderGlow = 0.35 + 0.65 * Math.exp(-(((t - start - 0.5) / 0.4) ** 2)) + 0.15 * Math.sin(t * 1.2);
  const textStyle: React.CSSProperties = { ...TYPE.tagline, textShadow: "0 1px 6px rgba(0,0,0,0.6)" };
  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: cy,
        transform: "translate(-50%, -50%)",
        clipPath: `inset(-20px ${inset}% -20px ${inset}% round 999px)`,
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "14px 40px 15px",
          borderRadius: 999,
          border: `1.5px solid ${rgba(COLORS.gold, 0.9)}`,
          background: `linear-gradient(180deg, rgba(6,64,52,0.92), rgba(3,40,33,0.94))`,
          boxShadow: `0 0 ${14 + 10 * borderGlow}px ${rgba(COLORS.gold, 0.22 * borderGlow)}, inset 0 0 14px ${rgba(COLORS.neonEmerald, 0.18)}, 0 6px 24px rgba(0,0,0,0.45)`,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            position: "relative",
            display: "inline-block",
            WebkitMaskImage: txt < 1 ? `linear-gradient(90deg, #000 ${-10 + 120 * txt}%, transparent ${120 * txt}%)` : undefined,
          }}
        >
          <span style={textStyle}>{TAGLINE}</span>
          <TextSweep text={TAGLINE} style={textStyle} start={sweepAt} duration={1.0} />
        </span>
      </div>
    </div>
  );
};
