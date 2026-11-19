/** Sound design: music bed + timed SFX cues from src/config/sound.ts. */
import React from "react";
import { Html5Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { MUSIC_BED, SOUND_CUES } from "../../config/sound";
import { f } from "../../config/timeline";

export const SoundDesign: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  return (
    <>
      {MUSIC_BED.enabled && (
        <Html5Audio
          src={staticFile(MUSIC_BED.file)}
          volume={(fr) => MUSIC_BED.volume * interpolate(fr, [0, 6, durationInFrames - MUSIC_BED.fadeOutSeconds * fps, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      )}
      {SOUND_CUES.filter((c) => c.enabled).map((c) => (
        <Sequence key={c.id} from={f(c.at)} name={`SFX ${c.label}`} layout="none">
          <Html5Audio src={staticFile(c.file)} volume={c.volume} />
        </Sequence>
      ))}
    </>
  );
};
