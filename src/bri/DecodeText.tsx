/**
 * DecodeText: characters fade in and out in a random order (BRI rhythm)
 * without ever changing, moving or distorting a glyph.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { FPS } from "../config/timeline";
import { hash } from "../lib/random";

type Props = { text: string; style: React.CSSProperties; start: number; out?: number; spread?: number; seed?: number };

export const DecodeText: React.FC<Props> = ({ text, style, start, out, spread = 0.75, seed = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chars = Array.from(text);
  return (
    <span style={{ ...style, display: "inline-block", whiteSpace: "pre" }}>
      {chars.map((ch, i) => {
        if (ch === " ") return <span key={i}> </span>;
        // letters appear in a random order and fade out in a random order;
        // the glyphs themselves never change, move or distort
        const appear = start + hash(i * 31 + seed * 977) * spread;
        const inP = Math.max(0, Math.min(1, (t - appear) / 0.35));
        const exA = out !== undefined ? out + hash(i * 53 + seed * 131) * 0.4 : 1e9;
        const outP = Math.max(0, Math.min(1, (t - exA) / 0.3));
        const o = inP * inP * (3 - 2 * inP) * (1 - outP);
        return (
          <span key={i} style={{ display: "inline-block", opacity: o }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};
