/**
 * SCENE 04 - two statements (00:23.8-00:34.2):
 *   A) "Bertamu kepada" / "Allah"            (the Ka'bah is emphasised)
 *   B) "Bertamu kepada" / "Rasulullah ﷺ"     (the Green Dome is emphasised)
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONTS, GOLD_GLOW, TEXT_GLOW, TYPE } from "../config/theme";
import { FPS, T } from "../config/timeline";
import { EASE, prog } from "../lib/anim";
import { TypographyReveal } from "../components/typography/TypographyReveal";
import { TextSweep } from "../components/typography/GoldenLightSweep";
import { OrnamentLine } from "../components/typography/Ornament";

const SALAWAT = "ﷺ"; // ﷺ

type FrameProps = { lineIn: number; goldIn: number; ornamentIn: number; sweepAt: number; out: number; gold: string; salawat?: boolean };

const Statement: React.FC<FrameProps> = ({ lineIn, goldIn, ornamentIn, sweepAt, out, gold, salawat }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const orn = prog(frame, ornamentIn, ornamentIn + 0.8, EASE.out);
  const outP = prog(frame, out, out + 0.5, EASE.in);
  const white = { ...TYPE.statement, fontSize: 58, textShadow: TEXT_GLOW };
  const goldStyle = { ...TYPE.statementAccent, fontSize: 84, textShadow: GOLD_GLOW };
  const sIn = prog(frame, goldIn + 0.55, goldIn + 1.1, EASE.out);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 268, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <TypographyReveal text="Bertamu kepada" style={white} start={lineIn} stagger={0.035} exitStart={out} />
      </div>
      <div style={{ position: "absolute", top: 334, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "baseline" }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          <TypographyReveal text={gold} style={goldStyle} start={goldIn} stagger={0.05} duration={0.8} blur={14} exitStart={out + 0.05} />
          {t < out && <TextSweep text={gold} style={{ ...goldStyle, display: "inline-block" }} start={sweepAt} duration={0.9} />}
        </span>
        {salawat && (
          <span
            style={{
              fontFamily: FONTS.arabic,
              fontSize: 70,
              color: goldStyle.color,
              textShadow: GOLD_GLOW,
              marginLeft: 20,
              lineHeight: 1,
              display: "inline-block",
              opacity: sIn * (1 - outP),
              transform: `translateY(${-8 + 10 * (1 - sIn)}px) scale(${0.85 + 0.15 * sIn})`,
              filter: sIn < 1 ? `blur(${(1 - sIn) * 8}px)` : undefined,
            }}
          >
            {SALAWAT}
          </span>
        )}
      </div>
      <div style={{ position: "absolute", top: 462, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - outP }}>
        <OrnamentLine width={420} progress={orn} />
      </div>
    </AbsoluteFill>
  );
};

export const Scene04Bertamu: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <>
      {t >= T.bertamuIn - 0.1 && t < T.allahOut + 0.7 && (
        <Statement lineIn={T.bertamuIn} goldIn={T.allahIn} ornamentIn={T.ornamentIn} sweepAt={T.ornamentIn + 0.3} out={T.allahOut} gold="Allah" />
      )}
      {t >= T.rasulBertamuIn - 0.1 && t < T.bertamuOut + 0.7 && (
        <Statement lineIn={T.rasulBertamuIn} goldIn={T.rasulIn} ornamentIn={T.rasulOrnamentIn} sweepAt={T.rasulSweep} out={T.bertamuOut} gold="Rasulullah" salawat />
      )}
    </>
  );
};
