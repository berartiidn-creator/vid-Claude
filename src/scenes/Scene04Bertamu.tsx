/** SCENE 04 - Bertamu kepada Allah dan Rasulullah ﷺ (00:16-00:22). */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONTS, GOLD_GLOW, TEXT_GLOW, TYPE } from "../config/theme";
import { FPS, T } from "../config/timeline";
import { EASE, prog } from "../lib/anim";
import { TypographyReveal } from "../components/typography/TypographyReveal";
import { TextSweep } from "../components/typography/GoldenLightSweep";
import { OrnamentLine } from "../components/typography/Ornament";

const SALAWAT = "ﷺ"; // ﷺ

export const Scene04Bertamu: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const exit = T.bertamuOut;
  const orn = prog(frame, T.ornamentIn, T.ornamentIn + 0.8, EASE.out);
  const out = prog(frame, exit, exit + 0.5, EASE.in);
  const white = { ...TYPE.statement, fontSize: 58, textShadow: TEXT_GLOW };
  const gold = { ...TYPE.statementAccent, fontSize: 74, textShadow: GOLD_GLOW };
  const salawatIn = prog(frame, T.allahIn + 0.75, T.allahIn + 1.3, EASE.out);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 268, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <TypographyReveal text="Bertamu kepada" style={white} start={T.bertamuIn} stagger={0.035} split="chars" exitStart={exit} />
      </div>
      <div style={{ position: "absolute", top: 336, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "baseline" }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          <TypographyReveal text="Allah dan Rasulullah" style={gold} start={T.allahIn} stagger={0.03} duration={0.75} exitStart={exit + 0.05} />
          {t < exit && <TextSweep text="Allah dan Rasulullah" style={{ ...gold, display: "inline-block" }} start={T.ornamentIn + 0.25} duration={0.9} />}
        </span>
        <span
          style={{
            fontFamily: FONTS.arabic,
            fontSize: 64,
            color: gold.color,
            textShadow: GOLD_GLOW,
            marginLeft: 18,
            lineHeight: 1,
            display: "inline-block",
            opacity: salawatIn * (1 - out),
            transform: `translateY(${-6 + 10 * (1 - salawatIn)}px) scale(${0.85 + 0.15 * salawatIn})`,
            filter: salawatIn < 1 ? `blur(${(1 - salawatIn) * 8}px)` : undefined,
          }}
        >
          {SALAWAT}
        </span>
      </div>
      <div style={{ position: "absolute", top: 448, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - out }}>
        <OrnamentLine width={420} progress={orn} />
      </div>
    </AbsoluteFill>
  );
};
