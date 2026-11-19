/** Final bright key visual: batik (Mega Mendung) pattern, logo, title, tagline. */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS } from "../config/timeline";
import { smoothstep } from "../lib/anim";
import { CLOUD } from "../components/environment/MegaMendungPattern";
import { LogoReveal } from "../components/typography/LogoReveal";
import { TaglinePlaque } from "../components/typography/TaglinePlaque";
import { BRITitle } from "./BRITitle";
import { TB } from "./config";

export const BatikPattern: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const op = smoothstep(TB.finalStart, TB.finalStart + 1.5, t);
  if (op <= 0) return null;
  const drift = (t * 6) % 220;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.16 * op }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="batik" width="440" height="200" patternUnits="userSpaceOnUse" patternTransform={`translate(${-drift} 0)`}>
            <g fill="none" stroke="#FFFFFF" strokeWidth="1.4">
              <path d={CLOUD} transform="translate(10 20) scale(0.5)" />
              <path d={CLOUD} transform="translate(30 32) scale(0.36)" />
              <path d={CLOUD} transform="translate(230 110) scale(0.5)" />
              <path d={CLOUD} transform="translate(250 122) scale(0.36)" />
            </g>
          </pattern>
          <linearGradient id="batikFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="0.72" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="batikMask">
            <rect width="1920" height="1080" fill="url(#batikFade)" />
          </mask>
        </defs>
        <rect width="1920" height="1080" fill="url(#batik)" mask="url(#batikMask)" />
      </svg>
    </AbsoluteFill>
  );
};

export const BRIFinal: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame / FPS < TB.finalStart) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <LogoReveal cx={960} cy={288} height={74} start={TB.kvLogoIn} solidAt={TB.kvLogoIn + 0.8} mode="mask" sweepStart={TB.goldenSweep} sweepDuration={0.9} />
      <BRITitle layout="oneLine" manasikIn={TB.kvTitleIn} umrohIn={TB.kvTitleIn + 0.25} swooshIn={TB.kvSwooshIn} sweepAt={TB.goldenSweep + 0.25} accentAt={TB.finalAccent} />
      <TaglinePlaque cx={960} cy={588} start={TB.kvTaglineIn} sweepAt={TB.goldenSweep + 0.55} />
    </AbsoluteFill>
  );
};
