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
import { BrightHorizon, Clouds, Flashes } from "./Atmosphere";
import { NeonRibbons } from "./NeonRibbons";
import { Grade } from "./Grade";
import { ClosingBreath, dofAmount, GoldDust, LensDirt } from "./Details";
import { FullScreenSweep } from "../components/fx/FullScreenSweep";
import { COLORS } from "../config/theme";
import { AllahCard, HatiCard, LogoCard, PresentCard, RasulCard } from "./BRICards";
import { KVFinalTypography, KVTitle, PlateShots } from "./KVFinal";
import { Selendang } from "./Selendang";
import { beatAt, TB, whipAt } from "./config";
import { BRI_SOUND_CUES } from "./sound";

loadAllFonts();

export const BumperBRI: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = frame / FPS;
  const between = (a: number, b: number) => t >= a && t < b;
  const whip = whipAt(t);
  return (
    <AbsoluteFill style={{ backgroundColor: "#032E28", overflow: "hidden" }}>
      {/* background rack-focus while text is being read */}
      {/* camera whip: directional motion blur on every cut */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="whip" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${(12 * whip).toFixed(2)} ${(4 * whip).toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: [whip > 0.03 ? "url(#whip)" : "", dofAmount(t) > 0.02 ? `blur(${(1.8 * dofAmount(t)).toFixed(2)}px)` : ""].join(" ").trim() || undefined }}>
        <BRIWorld />
        {/* natural grade on the key visual: less candy saturation, a touch more contrast */}
        <AbsoluteFill style={{ filter: "saturate(0.88) contrast(1.06) brightness(0.98)" }}>
          <PlateShots />
        </AbsoluteFill>
        <BrightHorizon />
        <Clouds />
      </AbsoluteFill>
      <NeonRibbons />
      <Selendang />
      <GoldDust />

      {between(TB.logoIn - 0.1, TB.logoOut + 0.7) && <LogoCard />}
      {between(TB.presentIn - 0.1, TB.presentOut + 0.8) && <PresentCard />}
      {between(TB.hatiIn - 0.1, TB.hatiOut + 0.8) && <HatiCard />}
      {between(TB.allahIn - 0.1, TB.allahOut + 0.8) && <AllahCard />}
      {between(TB.rasulIn - 0.1, TB.rasulOut + 0.8) && <RasulCard />}

      <Flashes />
      <FullScreenSweep start={TB.finalStart - 0.2} duration={1.6} color={COLORS.gold} core="#FFF4D0" strength={0.45} angle={20} />
      <KVFinalTypography />
      {/* MANASIK UMROH: one continuous title from its reveal to the last frame */}
      {t >= TB.manasikIn - 0.5 && <KVTitle start={TB.manasikIn} sweepAt={TB.goldenSweep} accentAt={TB.finalAccent} shines={[beatAt(29), 39.75 - 0.65, TB.goldenSweep]} reflectUntil={TB.kvTaglineIn} />}
      <ClosingBreath />
      <LensDirt />
      <Grade />
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
