/**
 * AL-BAHJAH MANASIK UMROH - 40s cinematic event bumper.
 * One continuous world (persistent layers) + scene typography + transitions.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "./config/theme";
import { FPS, T } from "./config/timeline";
import { CAMERA } from "./config/camera";
import { loadAllFonts } from "./lib/fonts";
import { SkyBackground } from "./components/environment/SkyBackground";
import { GeometricPattern, DigitalBlueprint } from "./components/environment/DigitalBlueprint";
import { MegaMendungPattern } from "./components/environment/MegaMendungPattern";
import { VolumetricLight } from "./components/environment/VolumetricLight";
import { SkyEnergyArc, LandmarkConnectorArc } from "./components/environment/EnergyArc";
import { HorizonGlow } from "./components/environment/HorizonGlow";
import { DigitalCity } from "./components/environment/DigitalCity";
import { ParticleSystem } from "./components/environment/ParticleSystem";
import { LightStreak } from "./components/fx/LightStreak";
import { FullScreenSweep } from "./components/fx/FullScreenSweep";
import { Vignette } from "./components/fx/Vignette";
import { SoundDesign } from "./components/fx/SoundDesign";
import { Scene01Brand } from "./scenes/Scene01Brand";
import { Scene02Present } from "./scenes/Scene02Present";
import { Scene03Hati } from "./scenes/Scene03Hati";
import { Scene04Bertamu } from "./scenes/Scene04Bertamu";
import { Scene05Title } from "./scenes/Scene05Title";
import { Scene06Final } from "./scenes/Scene06Final";

loadAllFonts();

const HORIZON = 1080 * CAMERA.horizonY;

export const Bumper: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const between = (a: number, b: number) => t >= a && t < b;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.deepForest, overflow: "hidden" }}>
      {/* ---------- World (persistent, continuous) ---------- */}
      <SkyBackground />
      <GeometricPattern />
      <MegaMendungPattern />
      <VolumetricLight />
      <SkyEnergyArc />
      <HorizonGlow />
      <DigitalCity />
      <ParticleSystem />
      <LandmarkConnectorArc />
      <DigitalBlueprint />

      {/* ---------- Scene typography ---------- */}
      {between(T.logoParticlesStart - 0.1, T.logoOutEnd + 0.1) && <Scene01Brand />}
      {between(T.presentIn - 0.1, T.presentOut + 0.7) && <Scene02Present />}
      {between(T.hatiTextIn - 0.1, T.hatiOut + 0.7) && <Scene03Hati />}
      {between(T.bertamuIn - 0.1, T.bertamuOut + 0.7) && <Scene04Bertamu />}
      {t >= T.titleMaskStart && <Scene05Title />}
      {t >= T.logoTopIn && <Scene06Final />}

      {/* ---------- Transitions & light events ---------- */}
      <LightStreak start={6.15} duration={1.0} y={HORIZON} color={COLORS.cyan} scale={0.7} />
      <FullScreenSweep start={T.emeraldSweep1} duration={1.15} color={COLORS.neonEmerald} core={COLORS.cyan} strength={0.9} />
      <LightStreak start={T.streakLR} duration={1.05} y={HORIZON - 4} color={COLORS.neonEmerald} core="#E8FFF8" />
      <FullScreenSweep start={T.emeraldSweep2} duration={1.3} color={COLORS.neonEmerald} core={COLORS.gold} strength={1.15} />
      <LightStreak start={T.goldStreak} duration={0.95} y={440} color={COLORS.gold} core="#FFF8E0" scale={1.25} />
      <FullScreenSweep start={T.finalSweepStart} duration={1.6} color={COLORS.gold} core="#FFF4D0" strength={0.55} angle={22} />

      <Vignette />
      <SoundDesign />
    </AbsoluteFill>
  );
};
