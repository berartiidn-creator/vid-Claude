/** SCENE 02 - PRESENT (00:06-00:10). */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, rgba, TEXT_GLOW, TYPE } from "../config/theme";
import { FPS, T } from "../config/timeline";
import { EASE, prog } from "../lib/anim";
import { TypographyReveal } from "../components/typography/TypographyReveal";
import { GoldRule } from "../components/typography/Ornament";

export const Scene02Present: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const lines = prog(frame, T.presentLinesStart, T.presentLinesEnd, EASE.out);
  const out = prog(frame, T.presentOut, T.presentOut + 0.55, EASE.in);
  const pulse = prog(frame, T.presentLinesStart + 0.2, T.presentLinesStart + 0.9, EASE.out);
  const breathe = 0.75 + 0.25 * Math.sin((t - T.presentLinesStart) * 3.2);
  const style = { ...TYPE.present, textShadow: TEXT_GLOW, paddingLeft: TYPE.present.letterSpacing };
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 34 }}>
        <div style={{ opacity: 1 - out }}>
          <GoldRule width={190} progress={lines} dir="left" />
        </div>
        <TypographyReveal text="PRESENT" style={style} start={T.presentIn} stagger={0.07} duration={0.8} order="center" rise={0} blur={14} exitStart={T.presentOut} exitDuration={0.55} />
        <div style={{ opacity: 1 - out }}>
          <GoldRule width={190} progress={lines} dir="right" />
        </div>
      </div>
      {/* golden light pulse below */}
      <div
        style={{
          position: "absolute",
          top: 478,
          left: 960 - 170,
          width: 340,
          height: 26,
          opacity: pulse * (1 - out) * breathe,
          background: `radial-gradient(ellipse at center, rgba(255,246,214,0.95) 0%, ${rgba(COLORS.gold, 0.7)} 18%, ${rgba(COLORS.gold, 0.15)} 50%, transparent 72%)`,
          transform: `scaleX(${0.3 + 0.7 * pulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 490,
          left: 960 - 120 * pulse,
          width: 240 * pulse,
          height: 1.5,
          opacity: (1 - out) * pulse,
          background: `linear-gradient(90deg, transparent, ${COLORS.goldLight}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
