/** Text cards of the BRI-style cut: clean bold sans, decode in, glitch out. */
import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { FONTS } from "../config/theme";
import { FPS } from "../config/timeline";
import { clamp01, EASE, smoothstep } from "../lib/anim";
import { LOGO_ASPECT, LOGO_SRC } from "../components/typography/LogoReveal";
import { DecodeText } from "./DecodeText";
import { PALETTES, shotAt, TB } from "./config";

const GOLD_TEXT = "#F3DE9A";

const useShadow = () => {
  const frame = useCurrentFrame();
  return PALETTES[shotAt(frame / FPS).palette].textShadow;
};

export const LogoCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inP = EASE.out(clamp01((t - TB.logoIn) / 0.9));
  const outP = EASE.in(clamp01((t - TB.logoOut) / 0.6));
  if (inP <= 0 || outP >= 1) return null;
  const h = 150;
  const w = h * LOGO_ASPECT;
  const scale = 1.06 - 0.06 * inP + 0.025 * clamp01((t - TB.logoIn) / 4) + 0.1 * outP;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 960 - w / 2,
          top: 470 - h / 2,
          width: w,
          height: h,
          opacity: inP * (1 - outP),
          transform: `scale(${scale})`,
          filter: `blur(${(1 - inP) * 12 + outP * 14}px) drop-shadow(0 2px 14px rgba(3,46,40,0.55))`,
        }}
      >
        <Img src={LOGO_SRC} style={{ width: "100%", height: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

const Block: React.FC<{ cx: number; top: number; zoomFrom: number; children: React.ReactNode }> = ({ cx, top, zoomFrom, children }) => {
  const frame = useCurrentFrame();
  const z = 1 + 0 * clamp01((frame / FPS - zoomFrom) / 5);
  return (
    <div style={{ position: "absolute", left: cx - 900, width: 1800, top, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${z})`, transformOrigin: `900px 60px` }}>
      {children}
    </div>
  );
};

export const PresentCard: React.FC = () => {
  const shadow = useShadow();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Block cx={960} top={480} zoomFrom={TB.presentIn}>
        <DecodeText text="MEMPERSEMBAHKAN" start={TB.presentIn} out={TB.presentOut} spread={0.8} seed={2} style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 66, letterSpacing: "0.2em", paddingLeft: "0.2em", color: "#FFFFFF", textShadow: shadow }} />
      </Block>
    </AbsoluteFill>
  );
};

const TwoLine: React.FC<{ cx: number; top: number; l1: string; l2: string; start: number; out: number; seed: number; big?: number; salawat?: boolean }> = ({ cx, top, l1, l2, start, out, seed, big = 118, salawat }) => {
  const shadow = useShadow();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sIn = smoothstep(start + 0.9, start + 1.4, t) * (1 - smoothstep(out + 0.1, out + 0.4, t));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Block cx={cx} top={top} zoomFrom={start}>
        <DecodeText text={l1} start={start} out={out} spread={0.7} seed={seed} style={{ fontFamily: FONTS.sans, fontWeight: 600, fontSize: 40, letterSpacing: "0.22em", paddingLeft: "0.22em", color: "#FFFFFF", textShadow: shadow }} />
        <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
          <DecodeText text={l2} start={start + 0.4} out={out + 0.05} spread={0.6} seed={seed + 5} style={{ fontFamily: FONTS.sans, fontWeight: 800, fontSize: big, letterSpacing: "0.05em", lineHeight: 1.05, color: GOLD_TEXT, textShadow: shadow }} />
          {salawat && (
            <span style={{ fontFamily: FONTS.arabic, fontSize: big * 0.78, color: GOLD_TEXT, marginLeft: 22, lineHeight: 1, opacity: sIn, textShadow: shadow, filter: sIn < 1 ? `blur(${(1 - sIn) * 8}px)` : undefined }}>{"ﷺ"}</span>
          )}
        </div>
      </Block>
    </AbsoluteFill>
  );
};

export const HatiCard: React.FC = () => <TwoLine cx={960} top={392} l1="SARANA MEMPERSIAPKAN" l2="HATI" start={TB.hatiIn} out={TB.hatiOut} seed={7} />;
export const AllahCard: React.FC = () => <TwoLine cx={1270} top={330} l1="BERTAMU KEPADA" l2="ALLAH" start={TB.allahIn} out={TB.allahOut} seed={11} />;
export const RasulCard: React.FC = () => <TwoLine cx={650} top={330} l1="BERTAMU KEPADA" l2="RASULULLAH" start={TB.rasulIn} out={TB.rasulOut} seed={19} big={100} salawat />;
