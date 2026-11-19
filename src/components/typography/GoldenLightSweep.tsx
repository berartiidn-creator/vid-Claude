/**
 * GoldenLightSweep: a moving golden highlight restricted to glyphs (text) or
 * to an image's alpha (logo, title artwork).
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { FPS } from "../../config/timeline";
import { EASE, clamp01 } from "../../lib/anim";

const sweepGradient = (pos: number, intensity: number) =>
  `linear-gradient(105deg, rgba(255,240,190,0) ${pos - 14}%, rgba(214,179,74,${0.55 * intensity}) ${pos - 6}%, rgba(255,250,228,${0.98 * intensity}) ${pos}%, rgba(214,179,74,${0.55 * intensity}) ${pos + 6}%, rgba(255,240,190,0) ${pos + 14}%)`;

const sweepPos = (t: number, start: number, duration: number) => {
  const p = clamp01((t - start) / duration);
  return { p, pos: -20 + 140 * EASE.inOut(p), active: p > 0 && p < 1 };
};

/** Overlay for text: renders the same text with a gradient clipped to glyphs. */
export const TextSweep: React.FC<{ text: string; style: React.CSSProperties; start: number; duration?: number; intensity?: number }> = ({
  text,
  style,
  start,
  duration = 0.9,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const { pos, active } = sweepPos(frame / FPS, start, duration);
  if (!active) return null;
  return (
    <span
      aria-hidden
      style={{
        ...style,
        position: "absolute",
        left: 0,
        top: 0,
        whiteSpace: "pre",
        color: "transparent",
        textShadow: "none",
        backgroundImage: sweepGradient(pos, intensity),
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        pointerEvents: "none",
      }}
    >
      {text}
    </span>
  );
};

/** Overlay for images: gradient masked by the image alpha. */
export const ImageSweep: React.FC<{ src: string; start: number; duration?: number; intensity?: number; style?: React.CSSProperties }> = ({
  src,
  start,
  duration = 0.9,
  intensity = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const { pos, active } = sweepPos(frame / FPS, start, duration);
  if (!active) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: sweepGradient(pos, intensity),
        WebkitMaskImage: `url(${src})`,
        WebkitMaskSize: "100% 100%",
        maskImage: `url(${src})`,
        maskSize: "100% 100%",
        mixBlendMode: "screen",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
};
