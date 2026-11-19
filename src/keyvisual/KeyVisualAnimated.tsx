/**
 * AL-BAHJAH MANASIK UMROH - animated key visual (10 s, 1920x1080, 30 fps).
 * The supplied image is the plate. Background layers share a very slow
 * push-in; the typography layer is locked and never transformed.
 */
import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS } from "../config/timeline";
import { EASE, keyAt } from "../lib/anim";
import { KV } from "./config";
import { KVBackground } from "./KVBackground";
import { KVLightLayers } from "./KVLightLayers";
import { KVParticles } from "./KVParticles";
import { KVTypography } from "./KVTypography";

export const KeyVisualAnimated: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const p = EASE.inOut(Math.min(1, t / KV.durationSeconds));
  const scale = KV.push.from + (KV.push.to - KV.push.from) * p;
  const exposure = keyAt(KV.exposure, t);
  return (
    <AbsoluteFill style={{ backgroundColor: "#032E28", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `${KV.push.originX}px ${KV.push.originY}px` }}>
        <AbsoluteFill style={{ filter: exposure < 0.999 ? `brightness(${exposure})` : undefined }}>
          <KVBackground />
        </AbsoluteFill>
        <KVLightLayers />
        <KVParticles />
      </AbsoluteFill>
      <KVTypography />
      {KV.audio.enabled && (
        <Html5Audio
          src={staticFile(KV.audio.file)}
          volume={(f) => KV.audio.volume * interpolate(f, [0, 12, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      )}
    </AbsoluteFill>
  );
};
