/**
 * LogoReveal: the ORIGINAL Al-Bahjah logo (horizontal lockup assembled from
 * the supplied artwork) revealed by particles converging from the horizon,
 * with optional golden sweep and a dissolve exit. `mode="mask"` is a quieter
 * reveal used for the final composition.
 */
import React, { useLayoutEffect, useRef } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import logoData from "../../data/logoPoints.json";
import { COLORS, rgba, VIDEO } from "../../config/theme";
import { FPS } from "../../config/timeline";
import { CAMERA } from "../../config/camera";
import { EASE, clamp01, prog } from "../../lib/anim";
import { hash } from "../../lib/random";
import { ImageSweep } from "./GoldenLightSweep";

export const LOGO_SRC = staticFile("assets/logo/albahjah-logo-horizontal.png");
export const LOGO_ASPECT = logoData.aspect;

type Props = {
  cx: number;
  cy: number;
  height: number;
  start: number; // particles start / mask start
  solidAt: number;
  sweepStart?: number;
  sweepDuration?: number;
  exitStart?: number;
  exitDuration?: number;
  mode?: "particles" | "mask";
};

const PTS = logoData.points as [number, number][];

export const LogoReveal: React.FC<Props> = ({ cx, cy, height, start, solidAt, sweepStart, sweepDuration = 0.8, exitStart, exitDuration = 0.8, mode = "particles" }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ref = useRef<HTMLCanvasElement>(null);
  const w = height * LOGO_ASPECT;
  const left = cx - w / 2;
  const top = cy - height / 2;
  const ex = exitStart !== undefined ? clamp01((t - exitStart) / exitDuration) : 0;
  const exE = EASE.in(ex);

  useLayoutEffect(() => {
    if (mode !== "particles") return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, VIDEO.width, VIDEO.height);
    ctx.globalCompositeOperation = "lighter";
    const hy = VIDEO.height * CAMERA.horizonY;
    const travel = 1.0;
    PTS.forEach(([px, py], i) => {
      const h1 = hash(i * 7 + 1);
      const h2 = hash(i * 13 + 5);
      const h3 = hash(i * 29 + 3);
      const tx = left + px * w;
      const ty = top + py * height;
      const delay = h1 * (solidAt - start - travel + 0.35);
      const p = clamp01((t - start - delay) / travel);
      let x: number;
      let y: number;
      let a: number;
      if (ex <= 0) {
        if (p <= 0) return;
        const e = EASE.out(p);
        const fromHorizon = h2 < 0.62;
        const sx = fromHorizon ? VIDEO.width / 2 + (h3 - 0.5) * 900 : tx + Math.cos(h3 * 6.283) * (300 + h2 * 500);
        const sy = fromHorizon ? hy + (h1 - 0.5) * 30 : ty + Math.sin(h3 * 6.283) * (200 + h2 * 300);
        const swirl = Math.sin(Math.PI * e) * (h1 - 0.5) * 140;
        x = sx + (tx - sx) * e + swirl;
        y = sy + (ty - sy) * e - Math.sin(Math.PI * e) * 40 * h2;
        a = Math.min(1, p * 3) * (1 - clamp01((t - solidAt - 0.15) / 0.7));
      } else {
        const dx = tx - cx;
        const dy = ty - cy;
        const sp = 0.6 + h1 * 1.4;
        x = tx + dx * exE * sp * 0.9 + (h2 - 0.5) * 120 * exE;
        y = ty + dy * exE * sp * 0.9 - 80 * exE * h3;
        a = Math.sin(Math.PI * Math.min(1, ex * 1.25)) * 0.9;
      }
      if (a <= 0.02) return;
      ctx.globalAlpha = a;
      ctx.fillStyle = h3 < 0.15 ? COLORS.goldLight : h3 < 0.55 ? COLORS.cyan : COLORS.white;
      const s = 1.6 + h2 * 1.4;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    });
    ctx.globalAlpha = 1;
  }, [frame, mode, left, top, w, height, cx, cy, start, solidAt, ex, exE, t]);

  const solid = mode === "particles" ? prog(frame, solidAt - 0.45, solidAt + 0.35, EASE.outSoft) : prog(frame, start, solidAt, EASE.out);
  const blur = (1 - solid) * 10 + exE * 14;
  const opacity = solid * (1 - exE);
  const scale = 1 + exE * 0.22 + (1 - solid) * 0.03;
  const maskPos = mode === "mask" ? -10 + 125 * solid : 200;
  const glowA = solid * (1 - exE) * 0.5;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - w * 0.75,
          top: cy - height * 1.3,
          width: w * 1.5,
          height: height * 2.6,
          background: `radial-gradient(ellipse at center, ${rgba(COLORS.neonEmerald, 0.28 * glowA)} 0%, ${rgba(COLORS.emerald, 0.12 * glowA)} 40%, transparent 70%)`,
          filter: "blur(10px)",
        }}
      />
      {mode === "particles" && <canvas ref={ref} width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0 }} />}
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: w,
          height,
          opacity,
          transform: `scale(${scale}) translateY(${-exE * 14}px)`,
          filter: blur > 0.05 ? `blur(${blur}px) drop-shadow(0 0 14px ${rgba(COLORS.neonEmerald, 0.45)})` : `drop-shadow(0 0 14px ${rgba(COLORS.neonEmerald, 0.45)})`,
          WebkitMaskImage: mode === "mask" && solid < 1 ? `linear-gradient(90deg, #000 ${maskPos - 10}%, transparent ${maskPos + 5}%)` : undefined,
        }}
      >
        <Img src={LOGO_SRC} style={{ width: "100%", height: "100%", display: "block" }} />
        {sweepStart !== undefined && <ImageSweep src={LOGO_SRC} start={sweepStart} duration={sweepDuration} />}
      </div>
    </>
  );
};
