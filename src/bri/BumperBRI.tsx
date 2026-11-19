/**
 * AL-BAHJAH MANASIK UMROH - 60 s bumper, BRI-reference style
 * (bright misty glass city, shot-per-card camera, decode typography,
 * neon ribbons, cloud whiteout, bright final key visual) in emerald.
 */
import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, f } from "../config/timeline";
import { MUSIC_BED } from "../config/sound";
import { loadAllFonts } from "../lib/fonts";
import { BRIWorld } from "./BRIWorld";
import { BrightHorizon, Clouds, Flashes, HudLines } from "./Atmosphere";
import { NeonRibbons, RingArcs } from "./NeonRibbons";
import { AllahCard, HatiCard, LogoCard, PresentCard, RasulCard } from "./BRICards";
import { BRITitle } from "./BRITitle";
import { BatikPattern, BRIFinal } from "./BRIFinal";
import { TB } from "./config";
import { BRI_SOUND_CUES } from "./sound";

loadAllFonts();

export const BumperBRI: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / FPS;
  const between = (a: number, b: number) => t >= a && t < b;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B4D3F", overflow: "hidden" }}>
      <BRIWorld />
      <BatikPattern />
      <BrightHorizon />
      <Clouds />
      <HudLines />
      <RingArcs />
      <NeonRibbons />

      {between(TB.logoIn - 0.1, TB.logoOut + 0.7) && <LogoCard />}
      {between(TB.presentIn - 0.1, TB.presentOut + 0.8) && <PresentCard />}
      {between(TB.hatiIn - 0.1, TB.hatiOut + 0.8) && <HatiCard />}
      {between(TB.allahIn - 0.1, TB.allahOut + 0.8) && <AllahCard />}
      {between(TB.rasulIn - 0.1, TB.rasulOut + 0.8) && <RasulCard />}
      {between(TB.manasikIn - 0.1, TB.titleOut + 0.8) && <BRITitle layout="stacked" manasikIn={TB.manasikIn} umrohIn={TB.umrohIn} swooshIn={TB.swooshIn} out={TB.titleOut} />}
      <BRIFinal />

      <Flashes />
      {MUSIC_BED.enabled && (
        <Html5Audio
          src={staticFile(MUSIC_BED.file)}
          volume={(fr) => MUSIC_BED.volume * interpolate(fr, [0, 4, durationInFrames - MUSIC_BED.fadeOutSeconds * fps, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      )}
      {BRI_SOUND_CUES.filter((c) => c.enabled).map((c) => (
        <Sequence key={c.id} from={f(c.at)} layout="none">
          <Html5Audio src={staticFile(c.file)} volume={c.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
