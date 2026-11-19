import React from "react";
import { AbsoluteFill } from "remotion";

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse 75% 70% at 50% 52%, transparent 55%, rgba(0,8,6,0.55) 100%)",
    }}
  />
);
