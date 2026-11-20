/**
 * AL-BAHJAH MANASIK UMROH - 15 s transition bumper (branding only, ends on the
 * key visual), cut to "BUMPER TRANSISI.mp3" (~140 BPM, starts at 1.0 s).
 *
 * It re-edits shots of the 60 s BRI-style bumper (same city, key visual, title,
 * logo, grade) on the transition music's accents: each SEGMENT plays a slice
 * of the source bumper with its text cards, audio, selendang and rack focus
 * switched off; cuts are carried by flashes, a whip blur and fabric wipes.
 */
import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import kvf from "../data/kvFinal.json";
import { FPS, f } from "../config/timeline";
import { smoothstep } from "../lib/anim";
import { Glint } from "../components/typography/Ornament";
import { BumperBRI } from "./BumperBRI";
import { Selendang, type SelendangPass } from "./Selendang";

export const TRANSITION = { durationSeconds: 15, musicAt: 1.0, beat: 60 / 140 };

/** target seconds [t0, t1) <- source bumper seconds starting at src */
export const SEGMENTS: { t0: number; t1: number; src: number; note: string }[] = [
  { t0: 0.0, t1: 1.0, src: 0.5, note: "Kabut terbuka di kota Makkah (riser)" },
  { t0: 1.0, t1: 3.47, src: 1.9, note: "Kamera naik di antara menara Makkah, bass masuk" },
  { t0: 3.47, t1: 5.85, src: 5.6, note: "Abraj Al-Bait malam, crane naik" },
  { t0: 5.85, t1: 6.45, src: 13.0, note: "Montase: Madinah, menara Nabawi dan payung" },
  { t0: 6.45, t1: 7.3, src: 22.6, note: "Montase: Ka'bah dengan god rays" },
  { t0: 7.3, t1: 8.15, src: 28.6, note: "Montase: Kubah Hijau" },
  { t0: 8.15, t1: 9.0, src: 33.2, note: "Montase: horizon kota suci" },
  { t0: 9.0, t1: 9.4, src: 18.75, note: "Jeda musik: napas gelap, garis kota" },
  { t0: 9.4, t1: 11.0, src: 34.85, note: "MANASIK UMROH terbuka, puncak di hit 11,0 dtk" },
  { t0: 11.0, t1: 15.0, src: 41.26, note: "Komposisi akhir: logo, tagline, swoosh, hold key visual" },
];

// whip blur on picture cuts only; the title (from 9.4 s) must stay sharp
const CUTS = SEGMENTS.slice(1).map((s) => s.t0).filter((c) => c < 9.4);
const FLASH: [number, number][] = [[1.0, 0.25], [3.47, 0.35], [5.85, 0.4], [6.45, 0.35], [7.3, 0.35], [8.15, 0.35], [9.4, 0.45], [11.0, 0.6]];
const PASSES: SelendangPass[] = [
  { at: -0.2, preset: "riseL", dur: 2.6 },
  { at: 3.47 - 0.65, preset: "wipe", dur: 1.3, body: 0.5 },
  { at: 9.4 - 0.65, preset: "wipe", dur: 1.3, body: 0.45 },
  { at: 12.9, preset: "riseR", dur: 3.4 },
];
const SFX: { at: number; file: string; volume: number }[] = [
  { at: 0.0, file: "audio/sfx/00_deep_intro.wav", volume: 0.3 },
  { at: 0.0, file: "audio/sfx/07_soft_whoosh.wav", volume: 0.4 },
  { at: 2.85, file: "audio/sfx/07_soft_whoosh.wav", volume: 0.3 },
  { at: 8.8, file: "audio/sfx/07_soft_whoosh.wav", volume: 0.3 },
  { at: 11.0, file: "audio/sfx/28_final_impact.wav", volume: 0.22 },
  { at: 12.7, file: "audio/sfx/32_golden_shimmer.wav", volume: 0.35 },
];

const Slice: React.FC<{ t0: number; t1: number; src: number }> = ({ t0, t1, src }) => (
  <Sequence from={f(t0)} durationInFrames={f(t1) - f(t0)} layout="none">
    <Sequence from={-f(src)} layout="none">
      <BumperBRI cards={false} audio={false} selendang={false} dof={false} flashes={false} />
    </Sequence>
  </Sequence>
);

export const TransitionBumper: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const whip = CUTS.reduce((m, c) => Math.max(m, Math.exp(-(((t - c) / 0.09) ** 2))), 0);
  const flash = FLASH.reduce((m, [c, k]) => Math.max(m, t >= c - 0.05 && t < c + 0.5 ? (t < c ? smoothstep(c - 0.05, c, t) : Math.exp(-(t - c) / 0.14)) * k : 0), 0);
  const breath = smoothstep(9.0, 9.12, t) * (1 - smoothstep(9.3, 9.42, t));
  const glint = (c: number) => Math.exp(-(((t - c) / 0.2) ** 2));
  const [tx, ty, tw, th] = kvf.title;
  return (
    <AbsoluteFill style={{ backgroundColor: "#032E28", overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="twhip" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${(14 * whip).toFixed(2)} ${(4 * whip).toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: whip > 0.03 ? "url(#twhip)" : undefined }}>
        {SEGMENTS.map((s) => (
          <Slice key={s.t0} t0={s.t0} t1={s.t1} src={s.src} />
        ))}
      </AbsoluteFill>
      <Selendang passes={PASSES} />
      {/* musical break: the frame breathes in before the title */}
      {breath > 0.01 && (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 20% at 50% 40%, rgba(255,236,180,${0.35 * breath}) 0%, rgba(1,14,11,${0.45 * breath}) 60%, rgba(1,10,8,${0.6 * breath}) 100%)` }} />
      )}
      {/* last musical hit: sparkle on the title ornaments */}
      {kvf.onions.map(([ox, oy], i) => (
        <Glint key={i} x={ox} y={oy + 6} size={74} intensity={glint(12.7 + i * 0.15)} rotate={15} />
      ))}
      <Glint x={tx + tw * 0.47} y={ty + th * 0.42} size={50} intensity={glint(12.85)} />
      {flash > 0.01 && (
        <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", background: `radial-gradient(ellipse 70% 55% at 50% 58%, rgba(255,246,222,${flash * 0.8}) 0%, rgba(214,179,74,${flash * 0.35}) 40%, rgba(16,185,154,${flash * 0.18}) 75%, transparent 100%)` }} />
      )}
      <Sequence from={f(TRANSITION.musicAt)} layout="none">
        <Html5Audio
          src={staticFile("audio/source/BUMPER TRANSISI.mp3")}
          volume={(fr) => 0.85 * interpolate(fr, [0, 3, durationInFrames - f(TRANSITION.musicAt) - 12, durationInFrames - f(TRANSITION.musicAt)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      </Sequence>
      {SFX.map((c, i) => (
        <Sequence key={i} from={f(c.at)} layout="none">
          <Html5Audio src={staticFile(c.file)} volume={c.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
