/**
 * ParticleSystem: deterministic 3D ambient particles (parallax via the shared
 * camera), orbiting particle waves around the landmarks, and the dotted
 * particle wave from the storyboard's opening frames.
 */
import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, VIDEO } from "../../config/theme";
import { FPS, T } from "../../config/timeline";
import { WORLD } from "../../config/world";
import { smoothstep } from "../../lib/anim";
import { cameraAt, project, type V3 } from "../../lib/camera3d";
import { mulberry32 } from "../../lib/random";

type P = { x: number; y: number; z: number; vy: number; s: number; ph: number; c: number };

const N = 380;
const DEPTH = 460;
const rnd = mulberry32(77);
const PARTS: P[] = Array.from({ length: N }, () => ({
  x: (rnd() - 0.5) * 320,
  y: rnd() * 70,
  z: rnd() * DEPTH,
  vy: 0.4 + rnd() * 1.4,
  s: 0.5 + rnd() * 1.6,
  ph: rnd() * 100,
  c: rnd(),
}));
const ORBIT = Array.from({ length: 260 }, () => ({ r: rnd(), h: rnd(), a: rnd() * Math.PI * 2, sp: 0.35 + rnd() * 0.5, s: 0.6 + rnd(), which: rnd() < 0.5 ? 0 : 1 }));

const sprite = (rgb: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, `rgba(${rgb},1)`);
  gr.addColorStop(0.25, `rgba(${rgb},0.6)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 32, 32);
  return c;
};

export const ParticleSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sprites = useRef<HTMLCanvasElement[] | null>(null);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (!sprites.current) sprites.current = [sprite("53,220,200"), sprite("16,185,154"), sprite("214,179,74"), sprite("239,255,249")];
    const [cyan, em, gold, white] = sprites.current;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, VIDEO.width, VIDEO.height);
    ctx.globalCompositeOperation = "lighter";
    const t = frame / FPS;
    const cam = cameraAt(frame);
    const appear = smoothstep(T.particlesIn, T.particlesIn + 1.8, t);

    // Ambient 3D field (recycled in depth as the camera travels)
    for (const p of PARTS) {
      const zr = (((p.z - cam.pos[2]) % DEPTH) + DEPTH) % DEPTH + 4;
      const y = (p.y + t * p.vy) % 70;
      const x = p.x + Math.sin(t * 0.4 + p.ph) * 1.6;
      const w: V3 = [x, y + 0.3, cam.pos[2] + zr];
      const q = project(cam, w);
      if (!q || q.x < -20 || q.x > VIDEO.width + 20 || q.y < -20 || q.y > VIDEO.height + 20) continue;
      const near = smoothstep(4, 22, zr) * (1 - smoothstep(DEPTH * 0.7, DEPTH, zr));
      const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + p.s) + p.ph);
      const a = appear * near * tw * 0.75;
      if (a < 0.02) continue;
      const size = Math.max(1.5, Math.min(14, (p.s * 260) / q.d));
      ctx.globalAlpha = a;
      ctx.drawImage(p.c < 0.06 ? gold : p.c < 0.5 ? em : p.c < 0.85 ? cyan : white, q.x - size / 2, q.y - size / 2, size, size);
    }

    // Particle waves around the landmarks (scene 4 onward)
    const ow = smoothstep(T.particleWaves, T.particleWaves + 1.2, t) * (1 - 0.45 * smoothstep(T.emeraldSweep2, T.goldStreak + 1, t));
    if (ow > 0.01) {
      const k = WORLD.kaaba.origin;
      const n = WORLD.nabawi.origin;
      for (const o of ORBIT) {
        const isK = o.which === 0;
        const c = isK ? k : ([n[0] - 2, 0, n[2] - 1] as V3);
        const rad = isK ? 10 + o.r * 9 : 8 + o.r * 6;
        const ang = o.a + t * o.sp * (isK ? -1 : 1);
        const hh = isK ? ((o.h * 16 + t * 1.6) % 16) + 0.3 : 9 + ((o.h * 12 + t * 1.2) % 12);
        const w: V3 = [c[0] + Math.cos(ang) * rad, hh, c[2] + Math.sin(ang) * rad];
        const q = project(cam, w);
        if (!q) continue;
        const fade = Math.sin((isK ? hh / 16 : (hh - 9) / 12) * Math.PI);
        ctx.globalAlpha = ow * fade * 0.85;
        const size = Math.max(2, (o.s * 220) / q.d);
        ctx.drawImage(isK && o.r < 0.3 ? gold : cyan, q.x - size / 2, q.y - size / 2, size, size);
      }
    }

    // Dotted particle wave (top-left), opening scenes only
    const wv = smoothstep(0.6, 2.6, t) * (1 - smoothstep(T.emeraldSweep1, T.horizonBoost + 0.6, t));
    if (wv > 0.01) {
      for (let j = 0; j < 16; j++) {
        for (let i = 0; i < 80; i++) {
          const x = -60 + i * 13 + j * 6;
          const y = 40 + j * 8 + 46 * Math.sin(i * 0.085 + j * 0.22 + t * 0.7) + 18 * Math.sin(i * 0.031 - t * 0.4);
          const fx = Math.exp(-(((x - 420) / 380) ** 2));
          const fy = Math.exp(-(((y - 150) / 110) ** 2));
          const a = wv * fx * fy * (0.35 + 0.35 * Math.sin(i * 0.7 + j + t * 2));
          if (a < 0.03) continue;
          ctx.globalAlpha = a;
          ctx.drawImage(j % 3 === 0 ? cyan : em, x - 2.5, y - 2.5, 5, 5);
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }, [frame]);

  return <canvas ref={ref} width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
};

export const PARTICLE_COLORS = COLORS;
