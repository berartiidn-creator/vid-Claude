/**
 * MANASIK UMROH artwork (supplied) with a BRI-style slice-glitch reveal.
 * `layout="stacked"` for the title shot, `layout="oneLine"` for the final KV.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import bands from "../data/titleBands.json";
import { FPS } from "../config/timeline";
import { clamp01, EASE, smoothstep } from "../lib/anim";
import { hash } from "../lib/random";
import { TITLE_LAYOUT } from "../components/typography/MainTitle";
import { ImageSweep } from "../components/typography/GoldenLightSweep";
import { Glint } from "../components/typography/Ornament";

const IW = bands.width;
const IH = bands.height;
const P0 = [IW / 2, IH / 2];
const SRC = {
  manasik: staticFile("assets/title/title-manasik.png"),
  umroh: staticFile("assets/title/title-umroh.png"),
  swoosh: staticFile("assets/title/title-swoosh.png"),
};
const N = 7;

const Sliced: React.FC<{ src: string; x: number; y: number; s: number; start: number; out?: number; seed: number; sweepAt?: number; wipe?: boolean }> = ({ src, x, y, s, start, out, seed, sweepAt, wipe }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < start) return null;
  const box: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: IW * s, height: IH * s, mixBlendMode: "plus-lighter" };
  if (wipe) {
    const p = EASE.inOut(clamp01((t - start) / 0.8));
    const o = out !== undefined ? 1 - smoothstep(out, out + 0.4, t) : 1;
    return (
      <div style={{ ...box, transform: `translate(${x}px, ${y}px)`, opacity: o, WebkitMaskImage: p < 1 ? `linear-gradient(90deg, #000 ${-10 + 115 * p}%, transparent ${-2 + 115 * p}%)` : undefined }}>
        <Img src={src} style={{ width: "100%", height: "100%" }} />
        {sweepAt !== undefined && <ImageSweep src={src} start={sweepAt} duration={1.1} intensity={0.7} />}
      </div>
    );
  }
  return (
    <>
      {Array.from({ length: N }, (_, k) => {
        const a = start + hash(k * 17 + seed) * 0.45;
        const p = clamp01((t - a) / 0.28);
        if (p <= 0) return null;
        let jitter = (1 - EASE.out(p)) * (hash(k * 5 + seed) < 0.5 ? -1 : 1) * 46;
        let op = p < 1 ? 0.5 + 0.5 * hash(frame * 3 + k + seed) : 1;
        if (out !== undefined) {
          const e = clamp01((t - out - hash(k * 23 + seed) * 0.3) / 0.22);
          if (e >= 1) return null;
          if (e > 0) {
            jitter = (hash(frame * 7 + k) - 0.5) * 70 * e;
            op = (1 - e) * (0.5 + 0.5 * hash(frame + k));
          }
        }
        const top = (k / N) * 100;
        const bot = 100 - ((k + 1) / N) * 100;
        return (
          <div key={k} style={{ ...box, transform: `translate(${x + jitter}px, ${y}px)`, opacity: op, clipPath: `inset(${top}% 0 ${bot}% 0)` }}>
            <Img src={src} style={{ width: "100%", height: "100%" }} />
            {sweepAt !== undefined && <ImageSweep src={src} start={sweepAt} duration={1.1} intensity={0.7} />}
          </div>
        );
      })}
    </>
  );
};

type Props = { layout: "stacked" | "oneLine"; manasikIn: number; umrohIn: number; swooshIn: number; out?: number; sweepAt?: number; accentAt?: number };

export const BRITitle: React.FC<Props> = ({ layout, manasikIn, umrohIn, swooshIn, out, sweepAt, accentAt }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const L = TITLE_LAYOUT;
  const one = layout === "oneLine";
  const s = one ? L.finalScale : 0.5;
  const [cx, cy] = one ? L.finalCenter : [960, 432];
  // slow push on the stacked title (BRI cards breathe toward the camera)
  const zoom = one ? 1 : 1 + 0.03 * clamp01((t - manasikIn) / 4);
  const sz = s * zoom;
  const mOff = one ? L.oneLine.manasik : [0, 0];
  const uOff = one ? L.oneLine.umroh : [0, 0];
  const pos = (off: number[]) => ({ x: cx + sz * (-P0[0] + off[0]), y: cy + sz * (-P0[1] + off[1]) });
  const m = pos(mOff);
  const u = pos(uOff);
  const swS = one ? L.swooshFinal.scale : sz;
  const swC = one ? L.swooshFinal.center : [cx + sz * (L.swooshAnchor[0] - P0[0]), cy + sz * (L.swooshAnchor[1] - P0[1])];
  const sw = { x: swC[0] - swS * L.swooshAnchor[0], y: swC[1] - swS * L.swooshAnchor[1] };
  const g = (c: number) => (accentAt !== undefined ? Math.exp(-(((t - c) / 0.22) ** 2)) : 0);
  const glow = smoothstep(manasikIn, umrohIn + 1, t) * (out !== undefined ? 1 - smoothstep(out, out + 0.4, t) : 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: cx - 640, top: cy - 230, width: 1280, height: 460, opacity: glow, background: "radial-gradient(ellipse at center, rgba(3,46,40,0.35) 0%, rgba(3,46,40,0.15) 45%, transparent 70%)", filter: "blur(18px)" }} />
      <AbsoluteFill style={{ isolation: "isolate" }}>
        <Sliced src={SRC.manasik} x={m.x} y={m.y} s={sz} start={manasikIn} out={out} seed={3} sweepAt={sweepAt} />
        <Sliced src={SRC.umroh} x={u.x} y={u.y} s={sz} start={umrohIn} out={out} seed={9} sweepAt={sweepAt} />
        <Sliced src={SRC.swoosh} x={sw.x} y={sw.y} s={swS} start={swooshIn} out={out} seed={13} sweepAt={sweepAt} wipe />
      </AbsoluteFill>
      {accentAt !== undefined && (
        <>
          <Glint x={m.x + sz * 632} y={m.y + sz * 14} size={64} intensity={g(accentAt + 0.05)} rotate={15} />
          <Glint x={u.x + sz * 1236} y={u.y + sz * 358} size={56} intensity={g(accentAt + 0.25)} />
          <Glint x={sw.x + swS * 1508} y={sw.y + swS * 664} size={60} intensity={g(accentAt + 0.45)} rotate={30} />
        </>
      )}
    </AbsoluteFill>
  );
};
