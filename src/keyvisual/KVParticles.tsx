/**
 * KVParticles: deterministic canvas effects for the key visual:
 * window light pulses, grid-intersection cyan pulses, particles flowing from
 * the foreground toward the horizon, luminous dust, gold sparkles, minaret
 * beacons, and gold particles riding the ribbons.
 */
import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import data from "../data/keyvisual.json";
import { FPS } from "../config/timeline";
import { clamp01, smoothstep } from "../lib/anim";
import { hash, mulberry32 } from "../lib/random";
import { KV, peakLift } from "./config";

const [W, H] = data.size;
const rnd = mulberry32(911);
const FLOW = Array.from({ length: 150 }, () => ({ a: rnd() * Math.PI * 2, sp: 0.08 + rnd() * 0.08, off: rnd(), s: 0.6 + rnd() * 1.6, c: rnd() }));
const DUST = Array.from({ length: 130 }, () => ({ x: rnd() * W, y: rnd() * H, ph: rnd() * 50, s: 0.6 + rnd() * 1.2, a: 0.15 + rnd() * 0.35 }));
const GLINTS = Array.from({ length: 16 }, () => ({ x: rnd() * W, y: 60 + rnd() * (H - 120), t0: rnd() * 10, dur: 0.9 + rnd() * 0.8, s: 10 + rnd() * 16 }));
const RIB = { tr: Array.from({ length: 70 }, () => ({ u: rnd(), off: (rnd() - 0.5) * 2, sp: 0.03 + rnd() * 0.04, s: 0.7 + rnd() * 1.4, ph: rnd() * 40 })), bl: Array.from({ length: 80 }, () => ({ u: rnd(), off: (rnd() - 0.5) * 2, sp: 0.025 + rnd() * 0.035, s: 0.7 + rnd() * 1.4, ph: rnd() * 40 })) };

const sprite = (rgb: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, `rgba(${rgb},1)`);
  gr.addColorStop(0.3, `rgba(${rgb},0.55)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 32, 32);
  return c;
};

const polyAt = (line: number[][], u: number) => {
  const segs = line.slice(1).map((p, i) => Math.hypot(p[0] - line[i][0], p[1] - line[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = u * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const k = Math.min(1, d / segs[i]);
      const [ax, ay] = line[i];
      const [bx, by] = line[i + 1];
      const tx = (bx - ax) / segs[i];
      const ty = (by - ay) / segs[i];
      return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k, nx: -ty, ny: tx, tx, ty, s: u * total };
    }
    d -= segs[i];
  }
  return { x: line[0][0], y: line[0][1], nx: 0, ny: 1, tx: 1, ty: 0, s: 0 };
};

export const KVParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sp = useRef<Record<string, HTMLCanvasElement> | null>(null);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (!sp.current) sp.current = { cyan: sprite("53,220,200"), em: sprite("16,185,154"), gold: sprite("240,205,110"), white: sprite("239,255,249") };
    const S = sp.current;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    const t = frame / FPS;
    const tl = KV.timeline;
    const peak = peakLift(t);
    const [hx, hy] = data.horizon;
    const draw = (img: HTMLCanvasElement, x: number, y: number, size: number, a: number) => {
      if (a <= 0.01) return;
      ctx.globalAlpha = Math.min(1, a);
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    };

    // Window light pulses (only once the wake front has passed)
    const wake = clamp01((t - tl.cityWake[0]) / (tl.cityWake[1] - tl.cityWake[0]));
    const frontY = H * (1 - (-0.08 + 1.2 * wake));
    for (const [x, y, ph] of data.windows) {
      if (y < frontY) continue;
      const p = Math.pow(Math.max(0, Math.sin(Math.PI * 2 * (t / 5.2 + ph * 7.3))), 6);
      draw(ph < 0.15 ? S.gold : S.cyan, x, y, 13, (0.1 + 0.55 * p) * peak);
    }

    // Grid intersection cyan pulses (occasional)
    for (const [x, y, ph] of data.gridDots) {
      const cyc = 4.2 + ph * 2.5;
      const lt = ((t + ph * 9) % cyc) / 0.9;
      if (lt > 1) continue;
      const e = Math.sin(Math.PI * lt);
      draw(S.cyan, x, y, 18 + 26 * lt, 0.85 * e * smoothstep(0.6, 2, t));
      ctx.globalAlpha = 0.5 * (1 - lt) * smoothstep(0.6, 2, t);
      ctx.strokeStyle = "rgba(53,220,200,1)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(x, y, 6 + 30 * lt, (6 + 30 * lt) * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Particles flowing from the foreground toward the horizon
    const flowIn = smoothstep(tl.particlesIn[0], tl.particlesIn[1], t) * (0.55 + 0.45 * smoothstep(4, 6, t));
    for (const p of FLOW) {
      const z = (p.off + t * p.sp) % 1; // 0 = near the viewer, 1 = at the horizon
      const r = 1250 * Math.pow(1 - z, 1.7) + 4;
      const x = hx + Math.cos(p.a) * r;
      const y = hy + Math.sin(p.a) * r * 0.62;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      const size = 2 + p.s * 9 * (1 - z);
      const a = Math.pow(Math.sin(Math.PI * z), 0.8) * 0.55 * flowIn;
      draw(p.c < 0.12 ? S.gold : p.c < 0.6 ? S.em : S.cyan, x, y, size, a);
    }

    // Luminous dust
    for (const d of DUST) {
      const x = d.x + Math.sin(t * 0.35 + d.ph) * 14 + t * 3;
      const y = d.y + Math.cos(t * 0.28 + d.ph * 1.3) * 10 - t * 4;
      const tw = 0.6 + 0.4 * Math.sin(t * 1.4 + d.ph);
      draw(S.white, ((x % W) + W) % W, ((y % H) + H) % H, 3 + d.s * 3, d.a * tw * flowIn * 0.7);
    }

    // Gold sparkles (cross glints)
    for (const g of GLINTS) {
      const lt = ((t - g.t0 + 10) % 5) / g.dur;
      if (lt < 0 || lt > 1) continue;
      const e = Math.sin(Math.PI * lt) * smoothstep(0.5, 2, t);
      draw(S.gold, g.x, g.y, g.s * 1.2, 0.9 * e);
      ctx.globalAlpha = 0.8 * e;
      const grd = ctx.createLinearGradient(g.x - g.s, g.y, g.x + g.s, g.y);
      grd.addColorStop(0, "rgba(255,240,200,0)");
      grd.addColorStop(0.5, "rgba(255,245,215,1)");
      grd.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(g.x - g.s, g.y - 0.75, g.s * 2, 1.5);
      const grv = ctx.createLinearGradient(g.x, g.y - g.s, g.x, g.y + g.s);
      grv.addColorStop(0, "rgba(255,240,200,0)");
      grv.addColorStop(0.5, "rgba(255,245,215,1)");
      grv.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = grv;
      ctx.fillRect(g.x - 0.75, g.y - g.s, 1.5, g.s * 2);
    }

    // Minaret beacons once the light reaches the top
    const mr = clamp01((t - tl.minaretsRise[0]) / (tl.minaretsRise[1] - tl.minaretsRise[0]));
    data.minarets.forEach(([x0, y0, x1], i) => {
      const on = smoothstep(0.75 + i * 0.02, 1, mr);
      const br = 0.5 + 0.3 * Math.sin(t * 2 + i);
      draw(S.gold, (x0 + x1) / 2, y0 + 6, 26, on * br * peak);
    });

    // Gold particles riding the ribbons + travelling sheen
    const ampK = 0.45 + 0.55 * smoothstep(tl.ribbonsFull[0], tl.ribbonsFull[1], t);
    const omega = (Math.PI * 2) / 6.8;
    (["tr", "bl"] as const).forEach((key, fi) => {
      const rb = data.ribbons[key];
      const lam = fi === 0 ? 300 : 360;
      const ph0 = fi * 1.9;
      const ribIn = 0.5 + 0.5 * smoothstep(tl.ribbonsFull[0] - 0.5, tl.ribbonsFull[1], t);
      for (const p of RIB[key]) {
        const u = (p.u + t * p.sp) % 1;
        const q = polyAt(rb.line, u);
        const a1 = (Math.PI * 2 * q.s) / lam - omega * t + ph0;
        const d = rb.amp * ampK * (Math.sin(a1) + 0.35 * Math.sin(a1 * 1.83 - omega * 0.7 * t + 0.6));
        const off = p.off * rb.radius * 0.45;
        const x = q.x + q.nx * (off + d);
        const y = q.y + q.ny * (off + d);
        const tw = 0.5 + 0.5 * Math.sin(t * 3 + p.ph);
        draw(S.gold, x, y, 4 + p.s * 4, (0.35 + 0.5 * tw) * ribIn * Math.sin(Math.PI * u));
      }
      const hu = ((t / (fi === 0 ? 3.8 : 4.4)) + fi * 0.37) % 1;
      const h = polyAt(rb.line, hu);
      draw(S.gold, h.x, h.y, 150, 0.22 * ribIn * Math.sin(Math.PI * hu));
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    void hash;
  }, [frame]);

  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
};
