/** Layered sky + floor gradient (deep forest green dominant). */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CAMERA } from "../../config/camera";
import { COLORS } from "../../config/theme";
import { prog } from "../../lib/anim";

export const SkyBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = prog(frame, 0, 1.4);
  const hy = CAMERA.horizonY * 100;
  return (
    <AbsoluteFill style={{ background: "#010e0b" }}>
      <AbsoluteFill
        style={{
          opacity: 0.35 + 0.65 * appear,
          background: `linear-gradient(180deg, #010d0a 0%, #021d18 ${hy - 40}%, ${COLORS.deepForest} ${hy - 14}%, #054235 ${hy - 1.5}%, #04382d ${hy}%, #021a15 ${hy + 9}%, #010a08 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
