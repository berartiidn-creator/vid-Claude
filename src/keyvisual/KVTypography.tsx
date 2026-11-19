/**
 * KVTypography: the original logo, title, tagline plaque and swoosh as ONE
 * locked layer (no transform, no distortion), plus a subtle golden light sweep
 * restricted to the glyph pixels.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import data from "../data/keyvisual.json";
import { FPS } from "../config/timeline";
import { EASE, clamp01 } from "../lib/anim";
import { KV } from "./config";

const TEXT = staticFile("assets/keyvisual/kv-text.png");
const GLYPH = staticFile("assets/keyvisual/kv-glyph-mask.png");
const [W, H] = data.size;

const Sweep: React.FC<{ rect: number[]; win: number[]; intensity: number }> = ({ rect, win, intensity }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = clamp01((t - win[0]) / (win[1] - win[0]));
  if (p <= 0 || p >= 1) return null;
  const [x0, y0, x1, y1] = rect;
  const pos = x0 - 160 + (x1 - x0 + 320) * EASE.inOut(p);
  const env = Math.sin(Math.PI * p) * intensity;
  return (
    <AbsoluteFill
      style={{
        WebkitMaskImage: `url(${GLYPH})`,
        WebkitMaskSize: "100% 100%",
        maskImage: `url(${GLYPH})`,
        maskSize: "100% 100%",
        clipPath: `inset(${y0 - 10}px ${W - x1 - 10}px ${H - y1 - 10}px ${x0 - 10}px)`,
        mixBlendMode: "screen",
        background: `linear-gradient(108deg, transparent ${pos - 120}px, rgba(214,179,74,${0.45 * env}) ${pos - 45}px, rgba(255,248,222,${0.9 * env}) ${pos}px, rgba(214,179,74,${0.45 * env}) ${pos + 45}px, transparent ${pos + 120}px)`,
      }}
    />
  );
};

export const KVTypography: React.FC = () => {
  const r = data.textRects;
  const tl = KV.timeline;
  const plaque = [r.plaque[0], r.plaque[1], r.swoosh[2] > r.plaque[2] ? r.swoosh[2] : r.plaque[2], r.swoosh[3]];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={TEXT} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
      <Sweep rect={r.title} win={tl.titleSweep} intensity={0.85} />
      <Sweep rect={r.logo} win={tl.logoSweep} intensity={0.8} />
      <Sweep rect={plaque} win={tl.taglineSweep} intensity={0.7} />
    </AbsoluteFill>
  );
};
