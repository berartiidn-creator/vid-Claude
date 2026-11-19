/** SCENE 01 - Brand introduction (00:00-00:06). Environment builds in the world layers. */
import React from "react";
import { T } from "../config/timeline";
import { LogoReveal } from "../components/typography/LogoReveal";

export const SCENE1_LOGO = { cx: 960, cy: 430, height: 148 };

export const Scene01Brand: React.FC = () => (
  <LogoReveal
    {...SCENE1_LOGO}
    start={T.logoParticlesStart}
    solidAt={T.logoSolid}
    sweepStart={T.logoSweepStart}
    sweepDuration={T.logoSweepEnd - T.logoSweepStart}
    exitStart={T.logoOutStart}
    exitDuration={T.logoOutEnd - T.logoOutStart}
  />
);
