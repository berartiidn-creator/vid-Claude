/**
 * Selendang: a flying translucent light-fabric ribbon (many fine strands that
 * twist like cloth) with gold particles riding it, in the same emerald/gold
 * look as the ribbons of the key visual. Passes occasionally (config SELENDANG).
 */
import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { VIDEO } from "../config/theme";
import { FPS } from "../config/timeline";
import { clamp01, EASE } from "../lib/anim";
import { hash } from "../lib/random";
import { SELENDANG } from "./config";

type P = [number, number];
const PRESETS: Record<string, { pts: [P, P, P, P]; width: number }> = {
  // full-frame fabric wipe used to carry the cuts (densest over the frame centre at mid-pass)
  wipe: { pts: [[-700, 1450], [300, 1150], [1500, 50], [2700, -350]], width: 360 },
  riseL: { pts: [[-260, 1000], [520, 980], [760, 330], [2200, 120]], width: 92 },
  riseR: { pts: [[2180, 1000], [1400, 980], [1160, 330], [-280, 120]], width: 92 },
  across: { pts: [[-300, 380], [600, 120], [1250, 700], [2250, 300]], width: 80 },
  low: { pts: [[-300, 900], [500, 760], [1300, 1060], [2250, 820]], width: 100 },
};
const DUR = 5.6;
const STRANDS = 34;
const SAMPLES = 90;

const bez = (p: [P, P, P, P], u: number): P => {
  const v = 1 - u;
  return [
    v * v * v * p[0][0] + 3 * v * v * u * p[1][0] + 3 * v * u * u * p[2][0] + u * u * u * p[3][0],
    v * v * v * p[0][1] + 3 * v * v * u * p[1][1] + 3 * v * u * u * p[2][1] + u * u * u * p[3][1],
  ];
};

export type SelendangPass = (typeof SELENDANG)[number];

export const Selendang: React.FC<{ passes?: SelendangPass[] }> = ({ passes = SELENDANG }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement | null>(null);
  const t = frame / FPS;
  const durOf = (s: { dur?: number }) => s.dur ?? DUR;
  const active = passes.filter((s) => t >= s.at && t < s.at + durOf(s));

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (!glowRef.current) {
      glowRef.current = document.createElement("canvas");
      glowRef.current.width = VIDEO.width / 2;
      glowRef.current.height = VIDEO.height / 2;
    }
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, VIDEO.width, VIDEO.height);
    ctx.globalCompositeOperation = "lighter";
    for (const pass of active) {
      const pr = PRESETS[pass.preset];
      const D = durOf(pass);
      const p = clamp01((t - pass.at) / D);
      const head = EASE.inOut(p) * 1.45;
      const tail = head - (pass.preset === "wipe" ? 1.1 : 0.75);
      const env = Math.sin(Math.PI * p);
      const lt = t - pass.at;
      // centreline + normals
      const C: P[] = [];
      const Nrm: P[] = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const u = i / SAMPLES;
        const a = bez(pr.pts, u);
        const b = bez(pr.pts, Math.min(1, u + 0.005));
        const c0 = bez(pr.pts, Math.max(0, u - 0.005));
        const dx = b[0] - c0[0];
        const dy = b[1] - c0[1];
        const l = Math.hypot(dx, dy) || 1;
        const wave = 22 * Math.sin(Math.PI * 2 * (u * 1.4 - lt * 0.22));
        C.push([a[0] - (dy / l) * wave, a[1] + (dx / l) * wave]);
        Nrm.push([-dy / l, dx / l]);
      }
      // fabric body: translucent band between the edges
      {
        const top: P[] = [];
        const bot: P[] = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const u = i / SAMPLES;
          if (u < tail || u > head) continue;
          const twist = Math.cos(Math.PI * 2 * (u * 1.1 - lt * 0.12) + 0.6);
          const w = pr.width * (0.35 + 0.65 * Math.sin(Math.PI * clamp01((u - tail) / 0.75)));
          top.push([C[i][0] + Nrm[i][0] * w * twist, C[i][1] + Nrm[i][1] * w * twist]);
          bot.push([C[i][0] - Nrm[i][0] * w * twist, C[i][1] - Nrm[i][1] * w * twist]);
        }
        if (top.length > 2) {
          ctx.beginPath();
          top.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
          for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
          ctx.closePath();
          const gb = ctx.createLinearGradient(bez(pr.pts, Math.max(0, tail))[0], 0, bez(pr.pts, Math.min(1, head))[0], 0);
          gb.addColorStop(0, "rgba(16,185,154,0)");
          gb.addColorStop(0.5, "rgba(16,185,154,0.5)");
          gb.addColorStop(0.9, "rgba(214,179,74,0.55)");
          gb.addColorStop(1, "rgba(255,240,200,0.6)");
          ctx.fillStyle = gb;
          ctx.globalAlpha = (pass.body ?? 0.22) * env;
          ctx.fill();
        }
      }
      for (let k = 0; k < STRANDS; k++) {
        const v = (k / (STRANDS - 1)) * 2 - 1;
        const edge = Math.abs(v) > 0.9;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= SAMPLES; i++) {
          const u = i / SAMPLES;
          if (u < tail || u > head) {
            started = false;
            continue;
          }
          const twist = Math.cos(Math.PI * 2 * (u * 1.1 - lt * 0.12) + 0.6);
          const w = pr.width * (0.35 + 0.65 * Math.sin(Math.PI * clamp01((u - tail) / 0.75)));
          const off = v * w * twist;
          const x = C[i][0] + Nrm[i][0] * off;
          const y = C[i][1] + Nrm[i][1] * off;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        }
        const g = ctx.createLinearGradient(bez(pr.pts, Math.max(0, tail))[0], 0, bez(pr.pts, Math.min(1, head))[0], 0);
        g.addColorStop(0, "rgba(16,185,154,0)");
        g.addColorStop(0.45, "rgba(53,220,200,1)");
        g.addColorStop(0.85, "rgba(243,214,122,1)");
        g.addColorStop(1, "rgba(255,246,214,1)");
        ctx.strokeStyle = g;
        ctx.globalAlpha = (edge ? 0.95 : 0.3) * env;
        ctx.lineWidth = edge ? 2 : 1.1;
        ctx.stroke();
        if (k % 4 === 0) {
          ctx.globalAlpha = 0.06 * env;
          ctx.lineWidth = 14;
          ctx.stroke();
        }
      }
      // gold particles riding the fabric
      for (let j = 0; j < 240; j++) {
        const u = tail + hash(j * 7 + pass.at * 13) * (head - tail);
        if (u < 0 || u > 1) continue;
        const i = Math.round(u * SAMPLES);
        const v = (hash(j * 11) - 0.5) * 2.6;
        const drift = (lt - hash(j * 3) * D) * 12;
        const x = C[i][0] + Nrm[i][0] * v * pr.width + drift * 0.4;
        const y = C[i][1] + Nrm[i][1] * v * pr.width - drift * 0.6;
        const tw = 0.5 + 0.5 * Math.sin(lt * 3.5 + j);
        const sz = 1.2 + hash(j * 5) * 2.8;
        ctx.globalAlpha = tw * env * 0.9;
        ctx.fillStyle = hash(j * 17) < 0.75 ? "#F6DC8A" : "#BFFFF0";
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = tw * env * 0.18;
        ctx.beginPath();
        ctx.arc(x, y, sz * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // soft bloom so the fabric glows like the key-visual ribbons
    if (active.length) {
      const g = glowRef.current.getContext("2d")!;
      g.clearRect(0, 0, g.canvas.width, g.canvas.height);
      g.filter = "blur(6px)";
      g.drawImage(cv, 0, 0, g.canvas.width, g.canvas.height);
      g.filter = "none";
      ctx.globalAlpha = 0.9;
      ctx.drawImage(glowRef.current, 0, 0, VIDEO.width, VIDEO.height);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }, [frame, t, active]);

  if (!active.length) return null;
  return <canvas ref={ref} width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
};
