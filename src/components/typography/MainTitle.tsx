/**
 * MainTitle: the supplied MANASIK UMROH artwork, split into three feathered
 * bands that rebuild the original exactly (plus-lighter in an isolated group).
 * Scene 5: cinematic mask reveal line by line. Scene 6: scales down and
 * rearranges into the one-line brand layout.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import bands from "../../data/titleBands.json";
import { COLORS, rgba } from "../../config/theme";
import { FPS, T } from "../../config/timeline";
import { EASE, clamp01, lerp, prog } from "../../lib/anim";
import { ImageSweep } from "./GoldenLightSweep";
import { Glint } from "./Ornament";

const IW = bands.width;
const IH = bands.height;
const P0 = [IW / 2, IH / 2];
const SRC = {
  manasik: staticFile("assets/title/title-manasik.png"),
  umroh: staticFile("assets/title/title-umroh.png"),
  swoosh: staticFile("assets/title/title-swoosh.png"),
};

/** Layout (editable). Offsets are in source-image pixels. */
export const TITLE_LAYOUT = {
  revealCenter: [960, 440] as [number, number],
  revealScale: 0.5,
  shrinkCenter: [960, 498] as [number, number],
  shrinkScale: 0.4,
  finalCenter: [960, 466] as [number, number],
  finalScale: 0.352,
  oneLine: { manasik: [-703, 132], umroh: [901, -135] },
  swooshFinal: { center: [960, 652] as [number, number], scale: 0.27 },
  swooshAnchor: [946, 701],
};

export const titleState = (t: number) => {
  const L = TITLE_LAYOUT;
  const shrink = EASE.inOut(clamp01((t - T.finalScaleStart) / (T.finalScaleEnd - T.finalScaleStart)));
  const rearr = EASE.cinematic(clamp01((t - T.rearrangeStart) / (T.rearrangeEnd - T.rearrangeStart)));
  let s = lerp(L.revealScale, L.shrinkScale, shrink);
  s = lerp(s, L.finalScale, rearr);
  const cx = lerp(lerp(L.revealCenter[0], L.shrinkCenter[0], shrink), L.finalCenter[0], rearr);
  const cy = lerp(lerp(L.revealCenter[1], L.shrinkCenter[1], shrink), L.finalCenter[1], rearr);
  const bump = Math.exp(-(((t - T.titleStable - 0.12) / 0.18) ** 2));
  return { s: s * (1 + 0.012 * bump), cx, cy, rearr, bump };
};

const Band: React.FC<{ src: string; x: number; y: number; s: number; mask?: string; filter?: string; sweep?: boolean; opacity?: number }> = ({ src, x, y, s, mask, filter, sweep, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: IW * s,
      height: IH * s,
      transform: `translate(${x}px, ${y}px)`,
      mixBlendMode: "plus-lighter",
      WebkitMaskImage: mask,
      maskImage: mask,
      filter,
      opacity,
    }}
  >
    <Img src={src} style={{ width: "100%", height: "100%", display: "block" }} />
    {sweep && <ImageSweep src={src} start={T.finalSweepStart + 0.25} duration={1.1} intensity={0.7} />}
  </div>
);

export const MainTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < T.titleMaskStart) return null;
  const { s, cx, cy, rearr, bump } = titleState(t);
  const L = TITLE_LAYOUT;
  const pos = (off: number[], lift = 0) => ({ x: cx + s * (-P0[0] + off[0]), y: cy + s * (-P0[1] + off[1]) + lift });
  const mOff = [L.oneLine.manasik[0] * rearr, L.oneLine.manasik[1] * rearr];
  const uOff = [L.oneLine.umroh[0] * rearr, L.oneLine.umroh[1] * rearr];
  const m = pos(mOff, -Math.sin(Math.PI * rearr) * 8);
  const u = pos(uOff, -Math.sin(Math.PI * rearr) * 34);

  // Reveal masks (scene 5)
  const line = prog(frame, T.titleMaskStart, T.manasikIn, EASE.out);
  const pm = prog(frame, T.manasikIn, T.manasikIn + 1.0, EASE.outSoft);
  const pu = prog(frame, T.umrohIn, T.umrohIn + 1.0, EASE.outSoft);
  const pw = prog(frame, T.titleOrnament, T.titleOrnament + 0.75, EASE.inOut);
  const yM = 396 - 420 * pm; // reveals upward from the centre line
  const yU = 396 + 330 * pu; // reveals downward
  const pct = (v: number) => `${((v / IH) * 100).toFixed(2)}%`;
  const maskM = pm < 1 ? `linear-gradient(to bottom, transparent 0%, transparent ${pct(yM - 70)}, #000 ${pct(yM)})` : undefined;
  const maskU = pu < 1 ? `linear-gradient(to bottom, #000 0%, #000 ${pct(yU)}, transparent ${pct(yU + 70)})` : undefined;
  const maskW = pw < 1 ? `linear-gradient(90deg, #000 ${-10 + 115 * pw}%, transparent ${-2 + 115 * pw}%)` : undefined;
  const fM = pm < 1 ? `blur(${(1 - pm) * 5}px) brightness(${1 + (1 - pm) * 0.9})` : bump > 0.02 ? `brightness(${1 + 0.25 * bump})` : undefined;
  const fU = pu < 1 ? `blur(${(1 - pu) * 5}px) brightness(${1 + (1 - pu) * 0.9})` : bump > 0.02 ? `brightness(${1 + 0.25 * bump})` : undefined;

  // Swoosh position: follows the title, then travels below the tagline plaque.
  const sw = EASE.cinematic(clamp01((t - T.rearrangeStart - 0.35) / (T.rearrangeEnd - T.rearrangeStart)));
  const swStack = { x: cx + s * (L.swooshAnchor[0] - P0[0]), y: cy + s * (L.swooshAnchor[1] - P0[1]) };
  const swS = lerp(s, L.swooshFinal.scale, sw);
  const swC = { x: lerp(swStack.x, L.swooshFinal.center[0], sw), y: lerp(swStack.y, L.swooshFinal.center[1], sw) };
  const swPos = { x: swC.x - swS * L.swooshAnchor[0], y: swC.y - swS * L.swooshAnchor[1] };

  const glow = prog(frame, T.titleOrnament, T.titleStable, EASE.inOut) * (1 - 0.35 * rearr) + 0.4 * bump;
  const lineVis = line * (1 - prog(frame, T.manasikIn + 0.3, T.umrohIn + 0.8));
  const edgeM = pm > 0 && pm < 1 ? Math.sin(Math.PI * pm) : 0;
  const edgeU = pu > 0 && pu < 1 ? Math.sin(Math.PI * pu) : 0;
  const titleW = 1700 * s;
  const glintI = (c: number) => Math.exp(-(((t - c) / 0.22) ** 2));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* soft glow behind the title */}
      <div
        style={{
          position: "absolute",
          left: cx - 620,
          top: cy - 260,
          width: 1240,
          height: 520,
          background: `radial-gradient(ellipse at center, ${rgba(COLORS.neonEmerald, 0.22 * glow)} 0%, ${rgba(COLORS.emerald, 0.12 * glow)} 40%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      {/* masking light line */}
      {lineVis > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: cx - (titleW / 2) * line,
            width: titleW * line,
            top: cy - 1.5,
            height: 3,
            opacity: lineVis,
            background: `linear-gradient(90deg, transparent, ${COLORS.gold} 20%, #FFF6D8 50%, ${COLORS.gold} 80%, transparent)`,
            boxShadow: `0 0 18px ${rgba(COLORS.gold, 0.9)}, 0 0 40px ${rgba(COLORS.gold, 0.5)}`,
          }}
        />
      )}
      <AbsoluteFill style={{ isolation: "isolate" }}>
        {pm > 0 && <Band src={SRC.manasik} x={m.x} y={m.y} s={s} mask={maskM} filter={fM} sweep />}
        {pu > 0 && <Band src={SRC.umroh} x={u.x} y={u.y} s={s} mask={maskU} filter={fU} sweep />}
        {pw > 0 && <Band src={SRC.swoosh} x={swPos.x} y={swPos.y} s={swS} mask={maskW} sweep />}
      </AbsoluteFill>
      {/* reveal edge lights */}
      {edgeM > 0 && (
        <div style={{ position: "absolute", left: cx - titleW / 2, width: titleW, top: cy + s * (yM - P0[1]) - 1, height: 2, opacity: edgeM, background: `linear-gradient(90deg, transparent, #FFF3C8 30%, #fff 50%, #FFF3C8 70%, transparent)`, boxShadow: `0 0 16px ${rgba(COLORS.gold, 0.9)}` }} />
      )}
      {edgeU > 0 && (
        <div style={{ position: "absolute", left: cx - titleW / 2, width: titleW, top: cy + s * (yU - P0[1]) - 1, height: 2, opacity: edgeU, background: `linear-gradient(90deg, transparent, #FFF3C8 30%, #fff 50%, #FFF3C8 70%, transparent)`, boxShadow: `0 0 16px ${rgba(COLORS.gold, 0.9)}` }} />
      )}
      {/* ornament glints */}
      {rearr < 0.05 && (
        <>
          <Glint x={m.x + s * 632} y={m.y + s * 14} size={70} intensity={glintI(T.titleOrnament + 0.2) + 0.6 * glintI(T.titleStable + 0.1)} rotate={15} />
          <Glint x={u.x + s * 1236} y={u.y + s * 358} size={60} intensity={glintI(T.titleOrnament + 0.45) + 0.6 * glintI(T.titleStable + 0.2)} />
          <Glint x={swPos.x + swS * 1508} y={swPos.y + swS * 664} size={80} intensity={glintI(T.titleOrnament + 0.75)} rotate={30} />
        </>
      )}
    </AbsoluteFill>
  );
};
