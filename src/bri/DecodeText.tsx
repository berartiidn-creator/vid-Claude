/**
 * DecodeText: characters appear in random order, each flickering through a
 * scrambled glyph before locking; exit scrambles (some mirrored) and drops out.
 * Layout never shifts: the real glyph always holds the space.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { FPS } from "../config/timeline";
import { hash } from "../lib/random";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type Props = { text: string; style: React.CSSProperties; start: number; out?: number; spread?: number; seed?: number };

export const DecodeText: React.FC<Props> = ({ text, style, start, out, spread = 0.75, seed = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chars = Array.from(text);
  return (
    <span style={{ ...style, display: "inline-block", whiteSpace: "pre" }}>
      {chars.map((ch, i) => {
        if (ch === " ") return <span key={i}> </span>;
        const appear = start + hash(i * 31 + seed * 977) * spread;
        const settle = appear + 0.2;
        const exA = out !== undefined ? out + hash(i * 53 + seed * 131) * 0.45 : 1e9;
        const exB = exA + 0.16;
        let vis = 0;
        let glyph: string | null = null;
        let mirror = false;
        let dx = 0;
        if (t >= appear && t < settle) {
          vis = 0.45 + 0.55 * hash(frame * 3 + i);
          glyph = CHARSET[Math.floor(hash(frame * 13 + i * 7) * CHARSET.length)];
        } else if (t >= settle && t < exA) {
          vis = 1;
        } else if (t >= exA && t < exB) {
          vis = 0.4 + 0.6 * hash(frame * 5 + i);
          mirror = hash(i * 3 + seed) < 0.45;
          glyph = hash(frame + i) < 0.5 ? ch : CHARSET[Math.floor(hash(frame * 17 + i) * CHARSET.length)];
          dx = (hash(frame * 7 + i) - 0.5) * 14;
        }
        return (
          <span key={i} style={{ position: "relative", display: "inline-block" }}>
            <span style={{ opacity: glyph === null ? vis : 0 }}>{ch}</span>
            {glyph !== null && (
              <span style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", opacity: vis, transform: `translateX(${dx}px) scaleX(${mirror ? -1 : 1})` }}>{glyph}</span>
            )}
          </span>
        );
      })}
    </span>
  );
};
