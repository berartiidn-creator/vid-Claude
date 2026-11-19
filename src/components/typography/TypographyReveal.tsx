/**
 * TypographyReveal: per-character (or per-word) cinematic reveal - rise, blur
 * and tracking settle - plus an optional synchronised exit.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { FPS } from "../../config/timeline";
import { EASE, clamp01 } from "../../lib/anim";

type Props = {
  text: string;
  style: React.CSSProperties;
  start: number; // seconds
  duration?: number; // per unit
  stagger?: number; // seconds between units
  order?: "ltr" | "center";
  split?: "chars" | "words";
  rise?: number;
  blur?: number;
  exitStart?: number;
  exitDuration?: number;
  unitStyle?: (i: number, unit: string) => React.CSSProperties | undefined;
};

export const TypographyReveal: React.FC<Props> = ({
  text,
  style,
  start,
  duration = 0.7,
  stagger = 0.045,
  order = "ltr",
  split = "chars",
  rise = 26,
  blur = 10,
  exitStart,
  exitDuration = 0.5,
  unitStyle,
}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const units = split === "chars" ? Array.from(text) : text.split(/(\s+)/);
  const n = units.length;
  const mid = (n - 1) / 2;
  const ex = exitStart !== undefined ? EASE.in(clamp01((t - exitStart) / exitDuration)) : 0;
  return (
    <span style={{ ...style, display: "inline-block", whiteSpace: "pre" }}>
      {units.map((u, i) => {
        const rank = order === "center" ? Math.abs(i - mid) : i;
        const p = EASE.out(clamp01((t - start - rank * stagger) / duration));
        const a = p * (1 - ex);
        const b = blur * (1 - p) + ex * 12;
        const y = rise * (1 - p) - ex * 18;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: a,
              transform: `translateY(${y}px) scale(${0.96 + 0.04 * p + ex * 0.04})`,
              filter: b > 0.05 ? `blur(${b}px)` : undefined,
              ...unitStyle?.(i, u),
            }}
          >
            {u}
          </span>
        );
      })}
    </span>
  );
};
