/**
 * Sound design integration. Every cue is an editable placeholder file in
 * public/audio. The placeholders are ORIGINAL procedurally synthesised sounds
 * (scripts/generate_audio.py) - replace any file with licensed audio of the
 * same name, or point `file` elsewhere, and re-render.
 */
export type SoundCue = {
  id: string;
  at: number; // seconds
  file: string; // relative to public/
  volume: number; // 0..1
  label: string;
  enabled: boolean;
};

export const MUSIC_BED = {
  file: "audio/music_bed.wav",
  volume: 0.8,
  enabled: true,
  fadeOutSeconds: 2.5,
};

export const SOUND_CUES: SoundCue[] = [
  { id: "intro", at: 0.0, file: "audio/sfx/00_deep_intro.wav", volume: 0.85, label: "Deep atmospheric intro", enabled: true },
  { id: "activate", at: 2.0, file: "audio/sfx/02_digital_activation.wav", volume: 0.55, label: "Digital activation", enabled: true },
  { id: "logo", at: 4.0, file: "audio/sfx/04_logo_impact.wav", volume: 0.8, label: "Logo reveal impact", enabled: true },
  { id: "whoosh", at: 6.7, file: "audio/sfx/07_soft_whoosh.wav", volume: 0.6, label: "Soft cinematic whoosh", enabled: true },
  { id: "scan", at: 11.0, file: "audio/sfx/11_holo_scan.wav", volume: 0.5, label: "Holographic scanning", enabled: true },
  { id: "rise", at: 16.0, file: "audio/sfx/16_rising_ambience.wav", volume: 0.6, label: "Rising cinematic ambience", enabled: true },
  { id: "mainTransition", at: 22.0, file: "audio/sfx/22_main_impact.wav", volume: 0.9, label: "Main transition impact", enabled: true },
  { id: "typeImpact", at: 24.0, file: "audio/sfx/24_type_impact.wav", volume: 0.7, label: "Typography reveal impact", enabled: true },
  { id: "titleHit", at: 27.0, file: "audio/sfx/27_title_hit.wav", volume: 0.55, label: "Title stabilise accent", enabled: true },
  { id: "final", at: 28.0, file: "audio/sfx/28_final_impact.wav", volume: 0.9, label: "Final branding impact", enabled: true },
  { id: "shimmer", at: 32.0, file: "audio/sfx/32_golden_shimmer.wav", volume: 0.6, label: "Golden shimmer", enabled: true },
  { id: "sustain", at: 34.0, file: "audio/sfx/34_ambient_sustain.wav", volume: 0.6, label: "Ambient cinematic sustain", enabled: true },
];
