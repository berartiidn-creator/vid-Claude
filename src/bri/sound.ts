/** Sound for the BRI-style cut: the client's backsound + light SFX on cuts. */
import type { SoundCue } from "../config/sound";

export const BRI_SOUND_CUES: SoundCue[] = [
  { id: "intro", at: 0.0, file: "audio/sfx/00_deep_intro.wav", volume: 0.28, label: "Deep atmospheric intro", enabled: true },
  { id: "whoosh1", at: 4.2, file: "audio/sfx/07_soft_whoosh.wav", volume: 0.45, label: "Whoosh into shot 2", enabled: true },
  { id: "decode1", at: 6.0, file: "audio/sfx/02_digital_activation.wav", volume: 0.3, label: "Decode MEMPERSEMBAHKAN", enabled: true },
  { id: "whoosh2", at: 10.35, file: "audio/sfx/07_soft_whoosh.wav", volume: 0.45, label: "Whoosh into shot 3", enabled: true },
  { id: "decode2", at: 12.0, file: "audio/sfx/02_digital_activation.wav", volume: 0.26, label: "Decode HATI", enabled: true },
  { id: "scan", at: 18.9, file: "audio/sfx/11_holo_scan.wav", volume: 0.35, label: "Landmarks build", enabled: true },
  { id: "decode3", at: 21.3, file: "audio/sfx/02_digital_activation.wav", volume: 0.24, label: "Decode ALLAH", enabled: true },
  { id: "whoosh3", at: 26.35, file: "audio/sfx/07_soft_whoosh.wav", volume: 0.4, label: "Whoosh into dome shot", enabled: true },
  { id: "decode4", at: 27.4, file: "audio/sfx/02_digital_activation.wav", volume: 0.24, label: "Decode RASULULLAH", enabled: true },
  { id: "whoosh4", at: 32.4, file: "audio/sfx/07_soft_whoosh.wav", volume: 0.4, label: "Whoosh into title shot", enabled: true },
  { id: "typeImpact", at: 35.45, file: "audio/sfx/24_type_impact.wav", volume: 0.35, label: "MANASIK reveal", enabled: true },
  { id: "titleHit", at: 39.75, file: "audio/sfx/27_title_hit.wav", volume: 0.5, label: "Whiteout accent (music edit)", enabled: true },
  { id: "final", at: 41.26, file: "audio/sfx/28_final_impact.wav", volume: 0.32, label: "Final key visual", enabled: true },
  { id: "shimmer", at: 47.0, file: "audio/sfx/32_golden_shimmer.wav", volume: 0.45, label: "Golden sweep", enabled: true },
  { id: "closing", at: 53.76, file: "audio/sfx/32_golden_shimmer.wav", volume: 0.3, label: "Closing accent", enabled: true },
];
