/** SCENE 03 - Sarana Mempersiapkan Hati (00:10-00:16). Architecture builds in the world layers. */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GOLD_GLOW, TEXT_GLOW, TYPE } from "../config/theme";
import { FPS, T } from "../config/timeline";
import { EASE, prog } from "../lib/anim";
import { TypographyReveal } from "../components/typography/TypographyReveal";
import { TextSweep } from "../components/typography/GoldenLightSweep";
import { GoldSwash } from "../components/typography/Ornament";

const Line: React.FC<{ top: number; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>{children}</div>
);

export const Scene03Hati: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const exit = T.hatiOut;
  const swash = prog(frame, T.hatiTextIn + 0.75, T.hatiTextIn + 1.5, EASE.inOut);
  const out = prog(frame, exit, exit + 0.5, EASE.in);
  const white = { ...TYPE.statement, textShadow: TEXT_GLOW };
  const gold = { ...TYPE.statementAccent, textShadow: GOLD_GLOW };
  const hatiScale = 0.9 + 0.1 * prog(frame, T.hatiTextIn + 0.45, T.hatiTextIn + 1.2, EASE.out);
  return (
    <AbsoluteFill>
      <Line top={262}>
        <TypographyReveal text="Sarana" style={white} start={T.hatiTextIn} stagger={0.04} exitStart={exit} />
      </Line>
      <Line top={330}>
        <TypographyReveal text="Mempersiapkan" style={white} start={T.hatiTextIn + 0.22} stagger={0.03} exitStart={exit + 0.04} />
      </Line>
      <Line top={398}>
        <span style={{ position: "relative", display: "inline-block", transform: `scale(${hatiScale})` }}>
          <TypographyReveal text="Hati" style={gold} start={T.hatiTextIn + 0.45} stagger={0.07} duration={0.8} blur={14} exitStart={exit + 0.08} />
          {t < exit + 0.1 && <TextSweep text="Hati" style={{ ...gold, display: "inline-block" }} start={T.hatiHighlight} duration={0.75} />}
        </span>
      </Line>
      <div style={{ position: "absolute", top: 510, left: 960 - 120, opacity: 1 - out }}>
        <GoldSwash width={240} progress={swash} />
      </div>
    </AbsoluteFill>
  );
};
