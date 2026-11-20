/**
 * Premium detail layers for the BRI-style cut:
 *  - GoldDust: soft foreground bokeh dust rising slowly (depth)
 *  - GodRays: volumetric rays fanning up from a landmark (plate coordinates)
 *  - dofAmount: background rack-focus while large text is on screen
 *  - ClosingBreath: the horizon swells and the frame exhales at the end
 * All timings follow the backsound beat grid (config BEAT).
 */
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { VIDEO } from "../config/theme";
import { FPS } from "../config/timeline";
import { smoothstep } from "../lib/anim";
import { mulberry32 } from "../lib/random";
import { BEAT, BEAT0, beatAt, CUTS, shotAt, TB } from "./config";

const rnd = mulberry32(4242);
const DUST = Array.from({ length: 64 }, () => ({ x: rnd() * 2100 - 90, y: rnd() * 1300, s: 5 + Math.pow(rnd(), 2.2) * 34, sp: 8 + rnd() * 18, sw: rnd() * 40, ph: rnd() * 100, a: 0.12 + rnd() * 0.3, gold: rnd() < 0.7 }));

const bokeh = (rgb: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},0.9)`);
  gr.addColorStop(0.55, `rgba(${rgb},0.45)`);
  gr.addColorStop(0.8, `rgba(${rgb},0.2)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return c;
};

export const GoldDust: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const spr = useRef<HTMLCanvasElement[] | null>(null);
  const t = frame / FPS;
  const shot = shotAt(t);
  const vis = shot.cbd ? 0.45 : 1;
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (!spr.current) spr.current = [bokeh("246,220,140"), bokeh("190,255,236")];
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, VIDEO.width, VIDEO.height);
    ctx.globalCompositeOperation = "lighter";
    const fadeIn = smoothstep(0.4, 2.5, t);
    for (const d of DUST) {
      const y = ((d.y - t * d.sp) % 1300 + 1300) % 1300 - 110;
      const x = d.x + Math.sin(t * 0.3 + d.ph) * d.sw;
      const tw = 0.7 + 0.3 * Math.sin(t * 0.9 + d.ph);
      ctx.globalAlpha = d.a * tw * vis * fadeIn;
      ctx.drawImage(spr.current[d.gold ? 0 : 1], x - d.s, y - d.s, d.s * 2, d.s * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }, [frame, t, vis]);
  return <canvas ref={ref} width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
};

/** Rays fanning upward from (cx, cy) in plate coordinates (rendered inside the plate camera). */
export const GodRays: React.FC<{ cx: number; cy: number; intensity: number; color?: string }> = ({ cx, cy, intensity, color = "255,236,180" }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (intensity <= 0.01) return null;
  const pulse = 0.85 + 0.15 * Math.sin((Math.PI * 2 * (t - BEAT0)) / (8 * BEAT)); // breathes over two bars
  const rays = [-46, -30, -17, -6, 5, 16, 29, 44];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", left: cx - 260, top: cy - 220, width: 520, height: 330, background: `radial-gradient(ellipse at 50% 70%, rgba(${color},${0.28 * intensity * pulse}) 0%, rgba(${color},${0.08 * intensity}) 45%, transparent 70%)`, filter: "blur(10px)" }} />
      {rays.map((a, i) => {
        const sway = Math.sin(t * 0.35 + i * 1.9) * 2.5;
        const w = 46 + (i % 3) * 22;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - w / 2,
              top: cy - 900,
              width: w,
              height: 900,
              transformOrigin: "50% 100%",
              transform: `rotate(${a + sway}deg)`,
              background: `linear-gradient(to top, rgba(${color},${0.32 * intensity * pulse}) 0%, rgba(${color},${0.1 * intensity}) 40%, transparent 85%)`,
              clipPath: "polygon(42% 100%, 58% 100%, 100% 0, 0 0)",
              filter: "blur(12px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** 0..1 background defocus while a text card or the title is being read. */
export const dofAmount = (t: number) => {
  const wins: [number, number][] = [
    [TB.logoIn + 0.3, TB.logoOut],
    [TB.presentIn + 0.3, TB.presentOut],
    [TB.hatiIn + 0.3, TB.hatiOut],
    [TB.allahIn + 0.3, TB.allahOut],
    [TB.rasulIn + 0.3, TB.rasulOut],
    [TB.manasikIn + 0.3, TB.finalStart],
  ];
  let f = 0;
  for (const [a, b] of wins) f = Math.max(f, Math.min(smoothstep(a, a + 2 * BEAT, t), 1 - smoothstep(b - BEAT, b + BEAT, t)));
  return f;
};

/** End: horizon light swells over a bar, then the frame exhales into the last frame. */
export const ClosingBreath: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const swell = smoothstep(56.4, 58.4, t) * (1 - smoothstep(58.6, 59.8, t));
  const dim = smoothstep(58.6, 60, t);
  if (swell <= 0.01 && dim <= 0.01) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(ellipse 60% 26% at 50% 74%, rgba(255,240,200,${0.45 * swell}) 0%, rgba(214,179,74,${0.2 * swell}) 45%, transparent 80%)` }} />
      <AbsoluteFill style={{ background: `rgba(1,14,11,${0.3 * dim})` }} />
    </AbsoluteFill>
  );
};

const DIRT = staticFile("assets/bri/lens-dirt.png");
const bump = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));

/** Lens dirt revealed only when strong light hits the lens (flares, blooms, the horizon). */
export const LensDirt: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const flares = Math.max(bump(t, beatAt(29) + 0.65, 0.45), bump(t, 39.75, 0.45), bump(t, TB.goldenSweep + 0.65, 0.5));
  const cuts = CUTS.reduce((m, c) => Math.max(m, bump(t, c, 0.18)), 0);
  const drop = Math.max(bump(t, TB.drop, 0.3), bump(t, TB.finalStart + 0.4, 0.5));
  const base = t > TB.cut3 ? 0.1 : 0.05;
  const close = smoothstep(56.4, 58.4, t) * (1 - smoothstep(58.6, 59.8, t));
  const k = Math.min(1, base + 0.75 * flares + 0.45 * cuts + 0.5 * drop + 0.5 * close);
  const cy = flares > 0.3 ? 410 : 760;
  const mask = `radial-gradient(ellipse 900px 520px at 960px ${cy}px, #000 0%, rgba(0,0,0,0.5) 45%, transparent 85%)`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: 0.55 * k, WebkitMaskImage: mask, maskImage: mask }}>
      <Img src={DIRT} style={{ width: "100%", height: "100%", filter: "sepia(0.6) saturate(1.4) hue-rotate(-12deg)" }} />
    </AbsoluteFill>
  );
};
