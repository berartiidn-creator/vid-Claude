/** SCENE 06 - Final branding composition (00:28-00:40). Title handled by MainTitle. */
import React from "react";
import { AbsoluteFill } from "remotion";
import { T } from "../config/timeline";
import { LogoReveal } from "../components/typography/LogoReveal";
import { TaglinePlaque } from "../components/typography/TaglinePlaque";

export const FINAL_LAYOUT = {
  logo: { cx: 960, cy: 288, height: 74 },
  tagline: { cx: 960, cy: 588 },
};

export const Scene06Final: React.FC = () => (
  <AbsoluteFill>
    <LogoReveal {...FINAL_LAYOUT.logo} start={T.logoTopIn} solidAt={T.logoTopIn + 0.9} mode="mask" sweepStart={T.finalSweepStart} sweepDuration={0.9} />
    <TaglinePlaque {...FINAL_LAYOUT.tagline} />
  </AbsoluteFill>
);
