/**
 * KVBackground: the ORIGINAL key visual as the plate. Only the two light
 * ribbons ("selendang") move: a smooth local wave displacement is applied to
 * the original pixels around each ribbon's centreline, so nothing is redrawn.
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import data from "../data/keyvisual.json";
import { FPS } from "../config/timeline";
import { smoothstep } from "../lib/anim";
import { KV } from "./config";

export const KV_BASE = staticFile("assets/keyvisual/kv-base.png");
const [W, H] = data.size;

type Field = { x0: number; y0: number; w: number; h: number; wt: Float32Array; s: Float32Array; nx: Float32Array; ny: Float32Array; amp: number };

const cache = new Map<string, { pixels: Uint8ClampedArray; fields: Field[] }>();

const buildField = (line: number[][], radius: number, amp: number): Field => {
  const xs = line.map((p) => p[0]);
  const ys = line.map((p) => p[1]);
  const x0 = Math.max(0, Math.floor(Math.min(...xs) - radius - 4));
  const x1 = Math.min(W, Math.ceil(Math.max(...xs) + radius + 4));
  const y0 = Math.max(0, Math.floor(Math.min(...ys) - radius - 4));
  const y1 = Math.min(H, Math.ceil(Math.max(...ys) + radius + 4));
  const w = x1 - x0;
  const h = y1 - y0;
  const n = w * h;
  const wt = new Float32Array(n);
  const s = new Float32Array(n);
  const nx = new Float32Array(n);
  const ny = new Float32Array(n);
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const px = x0 + xx;
      const py = y0 + yy;
      let best = 1e9;
      let bs = 0;
      let bnx = 0;
      let bny = 1;
      for (let i = 0; i < line.length - 1; i++) {
        const [ax, ay] = line[i];
        const [bx, by] = line[i + 1];
        const vx = bx - ax;
        const vy = by - ay;
        const l2 = vx * vx + vy * vy;
        const tt = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2));
        const d = Math.hypot(px - (ax + vx * tt), py - (ay + vy * tt));
        if (d < best) {
          best = d;
          const l = Math.sqrt(l2);
          bs = cum[i] + tt * l;
          bnx = -vy / l;
          bny = vx / l;
        }
      }
      const k = yy * w + xx;
      const f = 1 - smoothstep(radius * 0.35, radius, best);
      wt[k] = f * f * (3 - 2 * f);
      s[k] = bs;
      nx[k] = bnx;
      ny[k] = bny;
    }
  }
  return { x0, y0, w, h, wt, s, nx, ny, amp };
};

export const KVBackground: React.FC<{ src?: string }> = ({ src = KV_BASE }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(cache.has(src));
  const [handle] = useState(() => (cache.has(src) ? null : delayRender("Loading key visual pixels")));

  useEffect(() => {
    if (cache.has(src)) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g = c.getContext("2d")!;
      g.drawImage(img, 0, 0, W, H);
      cache.set(src, {
        pixels: g.getImageData(0, 0, W, H).data,
        fields: [
          buildField(data.ribbons.tr.line, data.ribbons.tr.radius, data.ribbons.tr.amp),
          buildField(data.ribbons.bl.line, data.ribbons.bl.radius, data.ribbons.bl.amp),
        ],
      });
      setReady(true);
      if (handle !== null) continueRender(handle);
    };
    img.src = src;
  }, [handle, src]);

  useLayoutEffect(() => {
    const entry = cache.get(src);
    if (!ready || !entry || !ref.current) return;
    const srcPixels = entry.pixels;
    const fields = entry.fields;
    const ctx = ref.current.getContext("2d")!;
    const t = frame / FPS;
    const full = new ImageData(new Uint8ClampedArray(srcPixels), W, H);
    const [ra, rb] = KV.timeline.ribbonsFull;
    const ampK = 0.45 + 0.55 * smoothstep(ra, rb, t);
    const omega = (Math.PI * 2) / 6.8;
    fields.forEach((fl, fi) => {
      const out = full.data;
      const sp = srcPixels;
      const lam = fi === 0 ? 300 : 360;
      const ph = fi * 1.9;
      for (let yy = 0; yy < fl.h; yy++) {
        for (let xx = 0; xx < fl.w; xx++) {
          const k = yy * fl.w + xx;
          const wv = fl.wt[k];
          if (wv < 0.002) continue;
          const sArc = fl.s[k];
          const a1 = (Math.PI * 2 * sArc) / lam - omega * t + ph;
          const wave = Math.sin(a1) + 0.35 * Math.sin(a1 * 1.83 - omega * 0.7 * t + 0.6);
          const d = fl.amp * ampK * wv * wave;
          const dt = 0.3 * fl.amp * ampK * wv * Math.cos(a1);
          // tangent = (ny, -nx)
          const sxp = fl.x0 + xx - (fl.nx[k] * d + fl.ny[k] * dt);
          const syp = fl.y0 + yy - (fl.ny[k] * d - fl.nx[k] * dt);
          const ix = Math.max(0, Math.min(W - 2, Math.floor(sxp)));
          const iy = Math.max(0, Math.min(H - 2, Math.floor(syp)));
          const fx = Math.max(0, Math.min(1, sxp - ix));
          const fy = Math.max(0, Math.min(1, syp - iy));
          const i00 = (iy * W + ix) * 4;
          const i10 = i00 + 4;
          const i01 = i00 + W * 4;
          const i11 = i01 + 4;
          const o = ((fl.y0 + yy) * W + fl.x0 + xx) * 4;
          for (let c = 0; c < 3; c++) {
            const top = sp[i00 + c] * (1 - fx) + sp[i10 + c] * fx;
            const bot = sp[i01 + c] * (1 - fx) + sp[i11 + c] * fx;
            out[o + c] = top * (1 - fy) + bot * fy;
          }
        }
      }
    });
    ctx.putImageData(full, 0, 0);
  }, [frame, ready, src]);

  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />;
};
