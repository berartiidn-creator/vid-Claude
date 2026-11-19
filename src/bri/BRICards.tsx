/**
 * Text cards (premium pass): one typographic system that matches the title
 * artwork. Kicker = Montserrat 500, small, widely tracked; key word = Cinzel
 * with a gold gradient fill. Reveal = soft mask opening from the centre plus
 * fade; exit = fade. Glyphs never change, move or distort.
 */
import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { FONTS } from "../config/theme";
import { FPS } from "../config/timeline";
import { clamp01, EASE } from "../lib/anim";
import { LOGO_ASPECT, LOGO_SRC } from "../components/typography/LogoReveal";
import { TextSweep } from "../components/typography/GoldenLightSweep";
import { GoldRule } from "../components/typography/Ornament";
import { BEAT, BEAT0, TB } from "./config";

const GOLD_FILL = "linear-gradient(180deg, #FFF4CF 0%, #F0D488 38%, #D6B34A 62%, #B08A2C 100%)";
const SOFT_SHADOW = "drop-shadow(0 2px 10px rgba(1,20,16,0.55))";

/** Mask-open reveal from the centre + fade; fade-out exit. */
const Elegant: React.FC<{ start: number; out: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ start, out, dur = 1.1, children, style }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = EASE.inOut(clamp01((t - start) / dur));
  const o = EASE.inOut(clamp01((t - out) / 0.7));
  if (p <= 0 || o >= 1) return null;
  const half = 3 + 57 * p;
  const mask = p < 1 ? `linear-gradient(90deg, transparent ${50 - half - 8}%, #000 ${50 - half}%, #000 ${50 + half}%, transparent ${50 + half + 8}%)` : undefined;
  return <div style={{ display: "inline-block", opacity: Math.min(1, p * 1.4) * (1 - o), WebkitMaskImage: mask, maskImage: mask, ...style }}>{children}</div>;
};

export const LogoCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inP = EASE.inOut(clamp01((t - TB.logoIn) / 1.3));
  const outP = EASE.inOut(clamp01((t - TB.logoOut) / 0.7));
  if (inP <= 0 || outP >= 1) return null;
  const h = 132;
  const w = h * LOGO_ASPECT;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 960 - w / 2, top: 470 - h / 2, width: w, height: h, opacity: inP * (1 - outP), filter: `blur(${(1 - inP) * 6}px) ${SOFT_SHADOW}` }}>
        <Img src={LOGO_SRC} style={{ width: "100%", height: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

export const PresentCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const rules = EASE.out(clamp01((t - TB.presentIn - 0.6) / 1.0)) * (1 - EASE.inOut(clamp01((t - TB.presentOut) / 0.7)));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 482, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div style={{ opacity: rules }}>
          <GoldRule width={150} progress={rules} dir="left" />
        </div>
        <Elegant start={TB.presentIn} out={TB.presentOut} dur={1.3}>
          <span style={{ fontFamily: FONTS.title, fontWeight: 500, fontSize: 46, letterSpacing: "0.5em", paddingLeft: "0.5em", color: "#F4FFFB", filter: SOFT_SHADOW }}>MEMPERSEMBAHKAN</span>
        </Elegant>
        <div style={{ opacity: rules }}>
          <GoldRule width={150} progress={rules} dir="right" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Soft gold glow behind the key word, breathing once every two bars. */
const Breath: React.FC<{ start: number; out: number }> = ({ start, out }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const on = EASE.inOut(clamp01((t - start - 0.6) / 1.2)) * (1 - EASE.inOut(clamp01((t - out) / 0.7)));
  if (on <= 0.01) return null;
  const b = 0.6 + 0.4 * Math.sin((Math.PI * 2 * (t - BEAT0)) / (8 * BEAT));
  return <div style={{ position: "absolute", left: "50%", top: "50%", width: 640, height: 220, transform: "translate(-50%, -50%)", background: `radial-gradient(ellipse at center, rgba(214,179,74,${0.24 * on * b}) 0%, rgba(214,179,74,${0.08 * on * b}) 45%, transparent 72%)`, filter: "blur(8px)", pointerEvents: "none" }} />;
};

const TwoLine: React.FC<{ cx: number; top: number; l1: string; l2: string; start: number; out: number; big?: number; salawat?: boolean }> = ({ cx, top, l1, l2, start, out, big = 104, salawat }) => {
  const keyStyle: React.CSSProperties = { fontFamily: FONTS.title, fontWeight: 600, fontSize: big, letterSpacing: "0.06em", lineHeight: 1.05, whiteSpace: "nowrap" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: cx - 900, width: 1800, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Elegant start={start} out={out} dur={1.1}>
          <span style={{ fontFamily: FONTS.sans, fontWeight: 500, fontSize: 25, letterSpacing: "0.42em", paddingLeft: "0.42em", color: "rgba(244,255,251,0.94)", filter: SOFT_SHADOW }}>{l1}</span>
        </Elegant>
        <div style={{ position: "relative", display: "flex", alignItems: "center", marginTop: 10 }}>
          <Breath start={start} out={out} />
          <Elegant start={start + 0.45} out={out + 0.05} dur={1.3} style={{ position: "relative", filter: "drop-shadow(0 3px 12px rgba(1,20,16,0.6)) drop-shadow(0 0 18px rgba(214,179,74,0.25))" }}>
            <span style={{ ...keyStyle, color: "transparent", backgroundImage: GOLD_FILL, WebkitBackgroundClip: "text", backgroundClip: "text", display: "inline-block" }}>{l2}</span>
            <TextSweep text={l2} style={keyStyle} start={start + 4 * BEAT} duration={4 * BEAT} intensity={0.9} />
          </Elegant>
          {salawat && (
            <Elegant start={start + 1.2} out={out + 0.1} dur={0.9}>
              <span style={{ fontFamily: FONTS.arabic, fontSize: big * 0.72, color: "#F0D488", marginLeft: 22, lineHeight: 1, display: "inline-block", filter: SOFT_SHADOW }}>{"ﷺ"}</span>
            </Elegant>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const HatiCard: React.FC = () => <TwoLine cx={960} top={392} l1="SARANA MEMPERSIAPKAN" l2="HATI" start={TB.hatiIn} out={TB.hatiOut} />;
export const AllahCard: React.FC = () => <TwoLine cx={1270} top={330} l1="BERTAMU KEPADA" l2="ALLAH" start={TB.allahIn} out={TB.allahOut} />;
export const RasulCard: React.FC = () => <TwoLine cx={650} top={330} l1="BERTAMU KEPADA" l2="RASULULLAH" start={TB.rasulIn} out={TB.rasulOut} big={92} salawat />;
