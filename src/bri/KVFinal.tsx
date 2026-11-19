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
import { BEAT, PLATE_SHOTS, type PlateShot, TB } from "./config";
import { GodRays } from "./Details";

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
const LoopScene: React.FC<{ intro?: boolean }> = ({ intro = true }) => {
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

/** Sparkle points on the title: letter tops and the gold onions (fractions of the title box). */
const SPARKS: [number, number][] = [
  [0.05, 0.4], [0.165, 0.08], [0.26, 0.42], [0.37, 0.42], [0.47, 0.4], [0.57, 0.42], [0.7, 0.42], [0.84, 0.07], [0.95, 0.42],
];

/** Metallic shine on the title glyphs: a gold-tinted band with a white-hot core (normal blend, so it reads on white letters). */
const GlyphShine: React.FC<{ start: number; duration: number; src?: string; intensity?: number }> = ({ start, duration, src = TITLE, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = clamp01((t - start) / duration);
  if (p <= 0 || p >= 1) return null;
  const pos = -25 + 150 * EASE.inOut(p);
  const env = Math.min(1, Math.sin(Math.PI * p) * 1.6);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskSize: "100% 100%",
        maskImage: `url(${src})`,
        maskSize: "100% 100%",
        opacity: env * intensity,
        background: `linear-gradient(108deg, transparent ${pos - 16}%, rgba(196,150,52,0.75) ${pos - 8}%, rgba(255,226,150,0.95) ${pos - 3}%, rgba(255,255,248,1) ${pos}%, rgba(255,226,150,0.95) ${pos + 3}%, rgba(196,150,52,0.75) ${pos + 8}%, transparent ${pos + 16}%)`,
      }}
    />
  );
};

/** Anamorphic lens flare travelling across the title with a shine. */
const TitleFlare: React.FC<{ x0: number; x1: number; y: number; start: number; duration: number }> = ({ x0, x1, y, start, duration }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = clamp01((t - start) / duration);
  if (p <= 0 || p >= 1) return null;
  const x = x0 + (x1 - x0) * EASE.inOut(p);
  const env = Math.sin(Math.PI * p);
  const ghost = (k: number, r: number, a: number) => {
    const gx = 960 + (960 - x) * k;
    const gy = 540 + (540 - y) * k;
    return <div key={k} style={{ position: "absolute", left: gx - r, top: gy - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,236,180,${a * env}) 0%, rgba(214,179,74,${a * 0.5 * env}) 45%, transparent 70%)` }} />;
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {/* long anamorphic streak */}
      <div style={{ position: "absolute", left: x - 1100, width: 2200, top: y - 3, height: 6, filter: "blur(2px)", background: `linear-gradient(90deg, transparent, rgba(255,226,160,${0.45 * env}) 28%, rgba(255,255,248,${1 * env}) 50%, rgba(255,226,160,${0.45 * env}) 72%, transparent)` }} />
      <div style={{ position: "absolute", left: x - 650, width: 1300, top: y - 24, height: 48, filter: "blur(14px)", background: `linear-gradient(90deg, transparent, rgba(214,179,74,${0.45 * env}) 50%, transparent)` }} />
      {/* hot core + star cross */}
      <div style={{ position: "absolute", left: x - 150, top: y - 150, width: 300, height: 300, background: `radial-gradient(circle, rgba(255,255,252,${1 * env}) 0%, rgba(255,240,196,${0.75 * env}) 10%, rgba(214,179,74,${0.3 * env}) 30%, transparent 65%)` }} />
      <div style={{ position: "absolute", left: x - 2, top: y - 120, width: 4, height: 240, filter: "blur(1.5px)", background: `linear-gradient(180deg, transparent, rgba(255,250,235,${0.8 * env}) 50%, transparent)` }} />
      {/* subtle ghosts mirrored through the frame centre */}
      {ghost(0.45, 26, 0.18)}
      {ghost(0.85, 14, 0.22)}
      {ghost(1.3, 40, 0.1)}
    </AbsoluteFill>
  );
};

type TitleProps = { box?: number[]; start?: number; out?: number; sweepAt?: number; accentAt?: number; shines?: number[]; reflectUntil?: number };

/** New MANASIK UMROH artwork (IMG_2140): light line, slice-glitch in, optional glitch out. */
export const KVTitle: React.FC<TitleProps> = ({ box = kvf.title, start = TB.kvTitleIn, out, sweepAt = TB.goldenSweep, accentAt = TB.finalAccent, shines = [], reflectUntil }) => {
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
      {reflectUntil !== undefined && t < reflectUntil && (
        /* glassy floor reflection under the title (fades before the tagline arrives) */
        <div style={{ position: "absolute", left: x, top: y + h * 0.9 + h * 0.55, width: w, height: h, opacity: 0.22 * rev * (1 - smoothstep(reflectUntil - 0.8, reflectUntil, t)), transform: "scaleY(-0.55)", transformOrigin: "50% 0%", filter: "blur(1.2px)", WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)", maskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)" }}>
          <Img src={TITLE} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
      )}
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: rev * (1 - outP), WebkitMaskImage: mask, maskImage: mask, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.28))" }}>
        <Img src={TITLE} style={{ width: "100%", height: "100%", display: "block" }} />
        <ImageSweep src={TITLE} start={sweepAt} duration={1.4} intensity={0.6} />
        {shines.map((st, i) => (
          <GlyphShine key={i} start={st} duration={1.3} />
        ))}
      </div>
      {shines.map((st, i) => (
        <TitleFlare key={`f${i}`} x0={x - 120} x1={x + w + 120} y={y + h * 0.52} start={st} duration={1.25} />
      ))}
      {shines.map((st, i) =>
        SPARKS.map(([fx, fy], j) => (
          <Glint key={`s${i}-${j}`} x={x + fx * w} y={y + fy * h} size={30 + (j % 3) * 10} intensity={0.9 * Math.exp(-(((t - (st + 0.15 + fx * 1.0 + (j % 2) * 0.12)) / 0.16) ** 2))} rotate={(j * 23) % 45} />
        )),
      )}
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
  const inP = EASE.inOut(clamp01((t - TB.kvLogoIn) / 1.2));
  if (inP <= 0) return null;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: y0, width: w, height: h, opacity: inP, filter: `blur(${(1 - inP) * 4}px)` }}>
      <Img src={LOGO_SRC} style={{ width: "100%", height: "100%" }} />
      <GlyphShine src={LOGO_SRC} start={TB.kvLogoIn + 1.2} duration={1.4} intensity={0.55} />
      <GlyphShine src={LOGO_SRC} start={TB.goldenSweep + 0.3} duration={1.4} intensity={0.5} />
    </div>
  );
};

const Plaque: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [px0, py0, px1, py1] = kvf.plaque;
  const [ix0, iy0, ix1, iy1] = kvf.plaqueInner;
  const open = EASE.inOut(clamp01((t - TB.kvTaglineIn) / 1.1));
  if (open <= 0) return null;
  const txt = EASE.inOut(clamp01((t - TB.kvTaglineIn - 0.35) / 0.8));
  const inset = 50 * (1 - open);
  const style: React.CSSProperties = { fontFamily: "Poppins", fontStyle: "italic", fontWeight: 500, fontSize: 31, color: "#FFFFFF", whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,0.5)" };
  return (
    <>
      <div style={{ position: "absolute", left: px0, top: py0, width: px1 - px0, height: py1 - py0, opacity: Math.min(1, open * 1.6), clipPath: `inset(-10px ${inset}% -10px ${inset}%)` }}>
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
  const p = EASE.inOut(clamp01((t - TB.kvSwooshIn) / 1.2));
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
  const ez = shot.ease ? EASE.inOut : lin;
  const sc = keyAt(shot.s, t, ez);
  const fx = keyAt(shot.fx, t, ez);
  const fy = keyAt(shot.fy, t, ez);
  const hasRy = shot.ry.some((k) => k[1] !== 0);
  const m = hasRy ? 70 : 0;
  const dx = Math.min(-m, Math.max(1920 + m - sc * 1920, keyAt(shot.sx, t, ez) - sc * fx));
  const dy = Math.min(-m, Math.max(1080 + m - sc * 1080, keyAt(shot.sy, t, ez) - sc * fy));
  const ry = keyAt(shot.ry, t, lin);
  return (
    <AbsoluteFill style={{ transform: hasRy ? `perspective(2400px) rotateY(${ry}deg) scale(1.06)` : undefined, overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${sc})` }}>
        <Sequence from={f(shot.seqFrom)} layout="none">
          <LoopScene intro={shot.intro ?? false} />
        </Sequence>
        {shot.id === "kaaba" && <GodRays cx={265} cy={540} intensity={smoothstep(TB.allahIn - 0.2, TB.allahIn + 4 * BEAT, t) * (1 - smoothstep(TB.allahOut, TB.cut5, t))} />}
        {shot.id === "dome" && <GodRays cx={1705} cy={545} color="200,255,236" intensity={smoothstep(TB.rasulIn - 0.2, TB.rasulIn + 4 * BEAT, t) * (1 - smoothstep(TB.rasulOut, TB.cut6, t))} />}
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
      <Logo />
      <Plaque />
      <Swoosh />
    </AbsoluteFill>
  );
};
