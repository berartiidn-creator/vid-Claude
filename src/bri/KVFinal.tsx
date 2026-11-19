/**
 * Final segment (41.26-60 s): the client's "Background Loop" key visual,
 * cleaned of its typography (kv-plate.png) and kept alive with the key-visual
 * loop layers (lights, ribbon warp, particles). BRI-style ending: skyline
 * line-draw, then the new MANASIK UMROH title (IMG_2140), logo, tagline
 * plaque and swoosh build in; long hold with sweeps and accents.
 */
import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import kvf from "../data/kvFinal.json";
import { COLORS, rgba } from "../config/theme";
import { f, FPS } from "../config/timeline";
import { clamp01, EASE, keyAt, smoothstep } from "../lib/anim";
import { KV } from "../keyvisual/config";
import { KVBackground } from "../keyvisual/KVBackground";
import { KVLightLayers } from "../keyvisual/KVLightLayers";
import { KVParticles } from "../keyvisual/KVParticles";
import { LOGO_ASPECT, LOGO_SRC } from "../components/typography/LogoReveal";
import { ImageSweep, TextSweep } from "../components/typography/GoldenLightSweep";
import { Glint } from "../components/typography/Ornament";
import { PLATE_SHOTS, type PlateShot, TB } from "./config";

const PLATE = staticFile("assets/kvfinal/kv-plate.png");
const PLAQUE = staticFile("assets/kvfinal/kv-plaque.png");
const SWOOSH = staticFile("assets/kvfinal/kv-swoosh.png");
const TITLE = staticFile("assets/title/manasik-umroh-title-oneline-hd.png");
const DEPTH_MID = staticFile("assets/kvfinal/kv-depth-mid.png");
const DEPTH_NEAR = staticFile("assets/kvfinal/kv-depth-near.png");
const LINES = staticFile("assets/keyvisual/kv-lines-arch.png");
const FLOOR = staticFile("assets/keyvisual/kv-lines-floor.png");
export const TAGLINE_KV = "Umrah Bersama Al-Bahjah, Bernilai Sedekah & Da\u2019wah";

const Masked: React.FC<{ mask: string; background: string; opacity: number }> = ({ mask, background, opacity }) =>
  opacity <= 0.01 ? null : (
    <AbsoluteFill style={{ WebkitMaskImage: `url(${mask})`, WebkitMaskSize: "100% 100%", maskImage: `url(${mask})`, maskSize: "100% 100%", background, opacity, mixBlendMode: "screen" }} />
  );

/** Background loop scene (local clock starts when its Sequence starts). */
const LoopScene: React.FC<{ intro?: boolean; dim?: number }> = ({ intro = true, dim = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS; // local
  const p = EASE.inOut(Math.min(1, t / KV.durationSeconds));
  const scale = KV.push.from + (KV.push.to - KV.push.from) * p;
  const exposure = keyAt(KV.exposure, t);
  // BRI-style intro: dark plate, skyline lines drawn in from both sides
  const dark = intro ? 0.72 * (1 - smoothstep(0.7, 1.8, t)) : 0;
  const R = 50 * EASE.inOut(clamp01((t - 0.05) / 1.25));
  const drawBg = `linear-gradient(90deg, #EFFFF9 0%, #EFFFF9 ${R}%, transparent ${R + 4}%, transparent ${96 - R}%, #EFFFF9 ${100 - R}%, #EFFFF9 100%)`;
  const lineOp = intro ? 0.95 * (1 - smoothstep(1.3, 2.2, t)) : 0;
  const bpShift = (t * 30) % 1200;
  const bpGrad = `repeating-linear-gradient(105deg, ${rgba(COLORS.neonEmerald, 1)} ${bpShift - 1200}px, ${rgba(COLORS.cyan, 1)} ${bpShift - 600}px, ${rgba(COLORS.neonEmerald, 1)} ${bpShift}px)`;
  // very subtle 3-layer parallax: sky (far), city + landmarks (mid), floor (near)
  const pk = smoothstep(intro ? 2.2 : 0, intro ? 3.4 : 0.01, t);
  const ox = 7 * Math.sin((Math.PI * 2 * t) / 15) * pk;
  const oy = 2.5 * Math.sin((Math.PI * 2 * t) / 19 + 1) * pk;
  const layer = (k: number, mask?: string) => (
    <AbsoluteFill
      style={{
        transform: `translate(${ox * k}px, ${oy * k}px)`,
        WebkitMaskImage: mask ? `url(${mask})` : undefined,
        WebkitMaskSize: "100% 100%",
        maskImage: mask ? `url(${mask})` : undefined,
        maskSize: "100% 100%",
      }}
    >
      <AbsoluteFill style={{ filter: exposure < 0.999 ? `brightness(${exposure})` : undefined }}>
        <KVBackground src={PLATE} />
      </AbsoluteFill>
      {dim > 0.01 && (
        <>
          {/* blueprint mode: plate sinks into the dark, wireframe lines stay lit */}
          <AbsoluteFill style={{ background: "#01120E", opacity: 0.84 * dim }} />
          <Masked mask={LINES} background={bpGrad} opacity={0.95 * dim} />
          <Masked mask={FLOOR} background={bpGrad} opacity={0.55 * dim} />
        </>
      )}
      <KVLightLayers />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ transform: `scale(${scale * 1.01})`, transformOrigin: `${KV.push.originX}px ${KV.push.originY}px` }}>
      {layer(0.25)}
      {layer(0.6, DEPTH_MID)}
      {layer(1, DEPTH_NEAR)}
      {dark > 0.01 && <AbsoluteFill style={{ background: `rgba(1,22,17,${dark})` }} />}
      <Masked mask={LINES} background={drawBg} opacity={lineOp} />
      <Masked mask={FLOOR} background={drawBg} opacity={lineOp * 0.7} />
      <AbsoluteFill style={{ transform: `translate(${ox}px, ${oy}px)` }}>
        <KVParticles />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type TitleProps = { box?: number[]; start?: number; out?: number; sweepAt?: number; accentAt?: number };

/** New MANASIK UMROH artwork (IMG_2140): light line, slice-glitch in, optional glitch out. */
export const KVTitle: React.FC<TitleProps> = ({ box = kvf.title, start = TB.kvTitleIn, out, sweepAt = TB.goldenSweep, accentAt = TB.finalAccent }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [x, y, w, h] = box;
  const k0 = w / kvf.title[2];
  if (t < start - 0.4) return null;
  if (out !== undefined && t > out + 0.7) return null;
  const line = EASE.out(clamp01((t - (start - 0.4)) / 0.45)) * (1 - smoothstep(start + 0.5, start + 1.1, t));
  const rev = EASE.inOut(clamp01((t - start) / 1.0));
  const outP = out !== undefined ? EASE.inOut(clamp01((t - out) / 0.6)) : 0;
  const half = 4 + 56 * rev; // % half-width of the soft reveal window, from the centre outward
  const mask = rev < 1 ? `linear-gradient(90deg, transparent ${50 - half - 6}%, #000 ${50 - half}%, #000 ${50 + half}%, transparent ${50 + half + 6}%)` : undefined;
  const glint = (c: number) => Math.exp(-(((t - c) / 0.22) ** 2));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {line > 0.01 && (
        <div style={{ position: "absolute", left: x + w / 2 - (w / 2) * line, width: w * line, top: y + h * 0.62 - 1.5, height: 3, opacity: line, background: `linear-gradient(90deg, transparent, ${COLORS.gold} 20%, #FFF6D8 50%, ${COLORS.gold} 80%, transparent)`, boxShadow: `0 0 18px ${rgba(COLORS.gold, 0.9)}` }} />
      )}
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: rev * (1 - outP), WebkitMaskImage: mask, maskImage: mask, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.28))" }}>
        <Img src={TITLE} style={{ width: "100%", height: "100%", display: "block" }} />
        <ImageSweep src={TITLE} start={sweepAt} duration={1.4} intensity={0.6} />
      </div>
      {kvf.onions.map(([ox, oy], i) => (
        <Glint key={i} x={x + (ox - kvf.title[0]) * k0} y={y + (oy - kvf.title[1]) * k0 + 6} size={70} intensity={glint(start + 0.9 + i * 0.2) + glint(accentAt + i * 0.2)} rotate={15} />
      ))}
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [x0, y0, x1, y1] = kvf.logo;
  const h = y1 - y0;
  const w = h * LOGO_ASPECT;
  const cx = (x0 + x1) / 2;
  const inP = EASE.out(clamp01((t - TB.kvLogoIn) / 0.8));
  if (inP <= 0) return null;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: y0, width: w, height: h, opacity: inP, filter: `blur(${(1 - inP) * 4}px)` }}>
      <Img src={LOGO_SRC} style={{ width: "100%", height: "100%" }} />
      <ImageSweep src={LOGO_SRC} start={TB.goldenSweep + 0.25} duration={1.2} intensity={0.6} />
    </div>
  );
};

const Plaque: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [px0, py0, px1, py1] = kvf.plaque;
  const [ix0, iy0, ix1, iy1] = kvf.plaqueInner;
  const open = EASE.cinematic(clamp01((t - TB.kvTaglineIn) / 0.7));
  if (open <= 0) return null;
  const txt = EASE.inOut(clamp01((t - TB.kvTaglineIn - 0.35) / 0.8));
  const inset = 50 * (1 - open);
  const style: React.CSSProperties = { fontFamily: "Poppins", fontStyle: "italic", fontWeight: 500, fontSize: 31, color: "#FFFFFF", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,0.5)" };
  return (
    <>
      <div style={{ position: "absolute", left: px0, top: py0, width: px1 - px0, height: py1 - py0, clipPath: `inset(-10px ${inset}% -10px ${inset}%)` }}>
        <Img src={PLAQUE} style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ position: "absolute", left: ix0, top: iy0, width: ix1 - ix0, height: iy1 - iy0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ position: "relative", display: "inline-block", WebkitMaskImage: txt < 1 ? `linear-gradient(90deg, #000 ${-10 + 120 * txt}%, transparent ${120 * txt}%)` : undefined }}>
          <span style={style}>{TAGLINE_KV}</span>
          <TextSweep text={TAGLINE_KV} style={style} start={TB.goldenSweep + 0.5} duration={1.3} intensity={0.6} />
        </span>
      </div>
    </>
  );
};

const Swoosh: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [x0, y0, x1, y1] = kvf.swoosh;
  const p = EASE.inOut(clamp01((t - TB.kvSwooshIn) / 0.8));
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x0, top: y0, width: x1 - x0, height: y1 - y0, WebkitMaskImage: p < 1 ? `linear-gradient(90deg, #000 ${-10 + 115 * p}%, transparent ${-2 + 115 * p}%)` : undefined }}>
      <Img src={SWOOSH} style={{ width: "100%", height: "100%" }} />
      <ImageSweep src={SWOOSH} start={TB.goldenSweep + 0.7} duration={1.1} intensity={0.7} />
    </div>
  );
};

/** 2.5D camera over the plate (zoom / pan / slight perspective yaw). */
const PlateShotView: React.FC<{ shot: PlateShot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const lin = (v: number) => v;
  const sc = keyAt(shot.s, t, lin);
  const fx = keyAt(shot.fx, t, lin);
  const fy = keyAt(shot.fy, t, lin);
  const m = 70;
  const dx = Math.min(-m, Math.max(1920 + m - sc * 1920, keyAt(shot.sx, t, lin) - sc * fx));
  const dy = Math.min(-m, Math.max(1080 + m - sc * 1080, keyAt(shot.sy, t, lin) - sc * fy));
  const ry = keyAt(shot.ry, t, lin);
  return (
    <AbsoluteFill style={{ transform: `perspective(2400px) rotateY(${ry}deg) scale(1.06)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${sc})` }}>
        <Sequence from={f(shot.seqFrom)} layout="none">
          <LoopScene intro={shot.intro ?? false} dim={shot.dim ? keyAt(shot.dim, t, (v) => v) : 0} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Landmark shots (18.8-41.26 s): the same Ka'bah and Green Dome as the ending. */
export const PlateShots: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shot = PLATE_SHOTS.find((p) => t >= p.from && t < p.to);
  return shot ? <PlateShotView key={shot.id} shot={shot} /> : null;
};

/** Ending background (key-visual loop). Typography is a separate top layer. */
export const KVFinal: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame / FPS < TB.finalStart - 0.05) return null;
  return (
    <AbsoluteFill>
      <Sequence from={f(TB.finalStart)} layout="none">
        <LoopScene />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Ending typography: always above ribbons and particles so it stays readable. */
export const KVFinalTypography: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame / FPS < TB.finalStart - 0.05) return null;
  return (
    <AbsoluteFill>
      <KVTitle />
      <Logo />
      <Plaque />
      <Swoosh />
    </AbsoluteFill>
  );
};
