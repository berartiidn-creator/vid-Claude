/**
 * Finishing pass for a premium, filmic look: soft vignette, subtle
 * deterministic film grain and a gentle warm lift in the highlights.
 */
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { mulberry32 } from "../lib/random";

const GW = 480;
const GH = 270;
let grains: ImageData[] | null = null;
const makeGrains = () => {
  const out: ImageData[] = [];
  for (let k = 0; k < 6; k++) {
    const rnd = mulberry32(300 + k);
    const d = new ImageData(GW, GH);
    for (let i = 0; i < GW * GH; i++) {
      const v = Math.round(128 + (rnd() + rnd() + rnd() - 1.5) * 90);
      d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v;
      d.data[i * 4 + 3] = 255;
    }
    out.push(d);
  }
  return out;
};

export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    if (!grains) grains = makeGrains();
    ref.current.getContext("2d")!.putImageData(grains[frame % grains.length], 0, 0);
  }, [frame]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 58%, rgba(1,14,11,0.42) 100%)" }} />
      {/* warm highlight lift */}
      <AbsoluteFill style={{ mixBlendMode: "soft-light", background: "linear-gradient(180deg, rgba(255,236,190,0.10) 0%, rgba(0,0,0,0) 45%, rgba(0,30,22,0.14) 100%)" }} />
      {/* film grain */}
      <canvas ref={ref} width={GW} height={GH} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "overlay", opacity: 0.07, imageRendering: "auto" }} />
    </AbsoluteFill>
  );
};
