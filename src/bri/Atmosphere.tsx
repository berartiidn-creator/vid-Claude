/** Clouds, light flashes, HUD streaks and the bright horizon glow. */
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COLORS, rgba, VIDEO } from "../config/theme";
import { FPS } from "../config/timeline";
import { clamp01, EASE, smoothstep } from "../lib/anim";
import { project } from "../lib/camera3d";
import { hash } from "../lib/random";
import { FLASHES, PALETTES, shotAt, TB } from "./config";
import { shotCamera } from "./shotCamera";

const CLOUD = [0, 1, 2].map((i) => staticFile(`assets/bri/cloud-${i}.png`));

const Cloud: React.FC<{ i: number; x: number; y: number; w: number; opacity: number; tint?: string }> = ({ i, x, y, w, opacity }) =>
  opacity <= 0.01 ? null : <Img src={CLOUD[i % 3]} style={{ position: "absolute", left: x, top: y, width: w, height: w / 2, opacity: Math.min(1, opacity) }} />;

export const Clouds: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shot = shotAt(t);
  const pal = PALETTES[shot.palette];
  const k = pal.cloud;
  const layers: React.ReactNode[] = [];
  // ambient drifting mist bands (upper sky + low haze)
  for (let j = 0; j < 4; j++) {
    const sp = 14 + j * 9;
    const x = -600 + ((t * sp + j * 700) % 2600) - 300;
    const y = j % 2 === 0 ? -260 + j * 30 : 380 + j * 40;
    layers.push(<Cloud key={`a${j}`} i={j} x={x} y={y} w={2200} opacity={k * (j % 2 === 0 ? 0.55 : 0.32)} />);
  }
  // shot 2: clouds rushing past as the camera rises
  if (shot.cbd && shot.id === "night-rise") {
    const p = (t - shot.from) / (shot.to - shot.from);
    for (let j = 0; j < 3; j++) {
      const y = 1300 - ((p * 2600 + j * 900) % 2700);
      layers.push(<Cloud key={`n${j}`} i={j + 1} x={-400 + j * 500} y={y} w={2400} opacity={0.16} />);
    }
  }
  // opening misty pass and whiteout transition
  const open = 0; // opening now starts from the dark blueprint city
  const wo = smoothstep(TB.whiteoutStart, TB.whiteoutStart + 1.3, t) * (1 - smoothstep(TB.finalStart - 0.15, TB.finalStart + 1.1, t));
  const big = Math.max(open, wo);
  if (big > 0.01) {
    const grow = t < 5 ? 1 + t * 0.5 : 1 + (t - TB.whiteoutStart) * 0.8;
    for (let j = 0; j < 3; j++) {
      const w = 2600 * grow;
      layers.push(<Cloud key={`w${j}`} i={j} x={VIDEO.width / 2 - w / 2 + (j - 1) * 500 * grow} y={VIDEO.height / 2 - w / 4 + (j - 1) * 120} w={w} opacity={big * 1.1} />);
    }
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {layers}
      {big > 0.01 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(236,255,249,${0.95 * big}) 0%, rgba(190,240,226,${0.8 * big}) 55%, rgba(120,210,186,${0.6 * big}) 100%)` }} />}
    </AbsoluteFill>
  );
};

export const Flashes: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let a = 0;
  for (const f of FLASHES) {
    const d = t - f.at;
    if (d < -0.07 || d > 0.6) continue;
    const env = d < 0 ? smoothstep(-0.07, 0, d) : Math.exp(-d / 0.16);
    a = Math.max(a, env * f.strength);
  }
  const acc = t > TB.finalAccent - 0.05 && t < TB.finalAccent + 0.8 ? Math.exp(-Math.max(0, t - TB.finalAccent) / 0.25) * 0.35 : 0;
  a = Math.max(a, acc);
  if (a <= 0.01) return null;
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", background: `radial-gradient(ellipse at 50% 55%, rgba(240,255,250,${a}) 0%, rgba(53,220,200,${a * 0.6}) 60%, rgba(16,185,154,${a * 0.35}) 100%)` }} />;
};

export const HudLines: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shot = shotAt(t);
  if (shot.id !== "glide" && shot.id !== "title-wide" && shot.id !== "kaaba-orbit") return null;
  const vis = smoothstep(shot.from, shot.from + 0.6, t) * (1 - smoothstep(TB.whiteoutStart, TB.whiteoutStart + 0.5, t));
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: 22 }, (_, i) => {
        const y = 80 + hash(i * 7) * 860;
        const len = 80 + hash(i * 11) * 380;
        const sp = 260 + hash(i * 13) * 700;
        const x = ((t * sp + hash(i * 17) * 3000) % (VIDEO.width + len + 400)) - len - 200;
        const a = (0.15 + 0.35 * hash(i * 19)) * vis;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: len, height: 1.4, opacity: a, background: `linear-gradient(90deg, transparent, ${rgba(COLORS.white, 0.9)})` }} />;
      })}
    </AbsoluteFill>
  );
};

export const BrightHorizon: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shot = shotAt(t);
  if (!shot.city) return null;
  const cam = shotCamera(frame);
  const far = project(cam, [cam.pos[0] + cam.f[0] * 5000, cam.pos[1], cam.pos[2] + cam.f[2] * 5000]);
  if (!far) return null;
  const pulse = 0.85 + 0.15 * Math.sin(t * 1.6);
  const I = pulse * (shot.id === "final-kv" ? 1.1 : 0.9);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 1100px 260px at ${far.x}px ${far.y}px, rgba(220,255,245,${0.42 * I}) 0%, ${rgba(COLORS.neonEmerald, 0.22 * I)} 45%, transparent 80%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: far.y - 2, height: 4, filter: "blur(2px)", background: `linear-gradient(90deg, transparent, rgba(235,255,250,${0.55 * I}) 35%, rgba(255,255,255,${0.9 * I}) 50%, rgba(235,255,250,${0.55 * I}) 65%, transparent)` }} />
    </AbsoluteFill>
  );
};

export const fadeIn = (t: number, a: number, d = 0.5) => EASE.out(clamp01((t - a) / d));
