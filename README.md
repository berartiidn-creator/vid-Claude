# AL-BAHJAH MANASIK UMROH - Cinematic Event Bumper

A 60-second, 1920x1080, 30 fps cinematic event opener built with **Remotion + React + TypeScript**,
cut to the client's backsound "bumper opening lighting show".
Every frame is deterministic: no `Math.random`, no real-time state. The same frame always renders the same pixels.

**Final output:** `renders/ALBAHJAH_MANASIK_UMROH_BUMPER_60S.mp4` (H.264 High, yuv420p BT.709, AAC 48 kHz stereo, 1800 frames, 60.000 s)

Also in `renders/`: a 960x540 preview and a contact sheet (one frame every 3 s). The earlier 40-second version is kept in `renders/archive_40s/`.

| Scene | Time | Content | Music |
|---|---|---|---|
| 01 Brand | 00:00-00:08.6 | Horizon spark, grid draws in, skyline rises, logo forms from particles, golden sweep | logo lands on the hit at 4.85 |
| 02 Mempersembahkan | 00:08.6-00:14.6 | Logo dissolves, camera moves into the horizon, `MEMPERSEMBAHKAN` with gold rules and pulse | build-up |
| 03 Hati | 00:14.6-00:23.8 | Ka'bah and Masjid Nabawi build as holograms, energy arc, "Sarana Mempersiapkan **Hati**" | text on the first drop, 20.85 |
| 04 Bertamu | 00:23.8-00:34.2 | Two statements: "Bertamu kepada **Allah**" (Ka'bah lit), then "Bertamu kepada **Rasulullah ﷺ**" (Green Dome lit) | phrases on beat accents |
| 05 Title | 00:34.2-00:41.26 | Golden streak, MANASIK and UMROH revealed through a light-line mask, ornaments glint | MANASIK on 35.45, title settles on the music edit at 39.75 |
| 06 Final | 00:41.26-01:00 | Title scales and rearranges to one line, logo on top, tagline plaque, golden sweep, living hold | starts on the second drop; closing hit at 53.76 adds a light accent |

Wording used (chosen by the client): `MEMPERSEMBAHKAN`, "Bertamu kepada Allah", "Bertamu kepada Rasulullah ﷺ",
and the tagline "Umroh Bersama Al-Bahjah, Bernilai Sedekah & Dakwah".

---

## Install

Requirements: Node 18+ (tested on Node 22), Python 3 (only to rebuild assets or audio).

```bash
npm install
```

Remotion needs a Chrome Headless Shell. On a normal machine it downloads one automatically.
Offline or behind a firewall, point it at a local Chrome/Chromium:

```bash
export REMOTION_BROWSER=/path/to/chrome-headless-shell
```

## Preview and render

```bash
npm run studio           # interactive preview in Remotion Studio (scrub the timeline)
npm run render:preview   # quick half-resolution preview -> out/preview_960x540_60s.mp4
npm run render           # final 1080p render -> out/ALBAHJAH_MANASIK_UMROH_BUMPER_60S.mp4
npm run finalize         # convert to broadcast-range yuv420p BT.709 -> renders/ (needs ffmpeg)
npm run stills           # storyboard check stills -> out/stills/
npm run typecheck
```

Verify a render:

```bash
ffprobe -v error -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_read_frames -show_entries format=duration renders/ALBAHJAH_MANASIK_UMROH_BUMPER_60S.mp4
```

---

## Project structure

```
src/
  Bumper.tsx                 Main composition: persistent world layers + scenes + transitions + audio
  Root.tsx, index.ts         Remotion registration (composition id: AlBahjahBumper)
  config/                    <- edit these to restyle or retime
    theme.ts                 Colours, fonts, typography presets
    timeline.ts              Every beat of the storyboard in seconds
    camera.ts                Camera keyframes (push-in, horizon move, parallax drift), FOV, horizon
    lighting.ts              Light intensity curves (horizon, grid, city, windows, landmarks, gold, bloom)
    world.ts                 Landmark placement, arcades, minarets, city generator settings
    sound.ts                 Music bed and SFX cue list (file, time, volume, on/off)
  lib/
    camera3d.ts              Three.js camera basis + fast projection
    wire.ts                  Line batching, near-plane clipping, fog, bloom compositing
    anim.ts, random.ts       Easing, keyframes, seeded random
    fonts.ts                 Local font loading (no network at render time)
  geometry/                  Procedural 3D wireframe models
    buildings.ts             WireframeBuilding + DigitalCity generator
    landmarks.ts             Ka'bah, Masjid Nabawi (Green Dome), minarets, arcades, Haram riwaq
  components/
    environment/             DigitalCity, PerspectiveGrid, WireframeBuilding, KaabaHologram,
                             GreenDomeHologram, MosqueArchitecture, ParticleSystem, DigitalBlueprint,
                             EnergyArc, MegaMendungPattern, HorizonGlow, VolumetricLight, SkyBackground
    typography/              LogoReveal, TypographyReveal, GoldenLightSweep, MainTitle, TaglinePlaque, Ornament
    fx/                      LightStreak, FullScreenSweep, Vignette, SoundDesign
  scenes/                    Scene01Brand ... Scene06Final (typography per scene)
  data/                      Generated logo particle points + title band metrics
public/
  assets/logo/               Original logo + derived pieces (see below)
  assets/title/              Original MANASIK UMROH artwork + derived bands
  assets/reference/          Storyboard reference
  fonts/                     Cinzel, Cormorant Garamond, Montserrat, Amiri (OFL, from @fontsource)
  audio/                     Placeholder music bed + SFX (original, procedurally generated)
scripts/
  build_logo_assets.py       Builds the horizontal logo lockup + particle targets from the original logo
  build_title_assets.py      Splits the title artwork into MANASIK / UMROH / swoosh bands
  generate_audio.py          Synthesises the placeholder music bed and SFX
  render-stills.mjs          Renders check stills with a single bundle
```

### How the world is built

The environment is one continuous 3D scene, not a background image. A single camera (`config/camera.ts`) drives every layer:

- **DigitalCity** renders to one canvas in two bloom passes: (A) perspective grid and skyline, (B) sacred architecture. Lines are projected from 3D with near-plane clipping and distance fog, then composited with a two-level blur bloom.
- **Ka'bah**: solid dark walls with back-face line culling, gold hizam band with moving sheen, calligraphy rhythm, door, Hajar Aswad frame, Hijr Ismail, scanning plane, rotating mataf rings, floor reflection.
- **Masjid Nabawi**: Green Dome lat-long mesh with glowing fill, drum, finial and crescent, prayer hall arcade, roof domes, minarets and colonnades.
- Overlay layers (energy arcs, blueprint annotations, light pillars) project the same 3D points, so they stay locked to the architecture while the camera moves.

---

## Editing guide

**Change timing:** edit `src/config/timeline.ts`. All animations read from `T.*` (seconds).

**Change colours / fonts / sizes:** `src/config/theme.ts` (`COLORS`, `FONTS`, `TYPE`).

**Change the camera move:** `src/config/camera.ts` keyframes `[seconds, value]`. `horizonY` sets where the horizon sits.

**Brighter or calmer lighting:** `src/config/lighting.ts`.

**Move the landmarks / change the city:** `src/config/world.ts` (city is regenerated from `seed`).

**Final layout:** `FINAL_LAYOUT` in `src/scenes/Scene06Final.tsx` (logo and plaque), `TITLE_LAYOUT` in `src/components/typography/MainTitle.tsx` (title scale and position in each state).

**Wording:** scene files in `src/scenes/`. The tagline lives in `src/components/typography/TaglinePlaque.tsx`.

### Logo and title assets

The supplied logo is a stacked white PNG. `scripts/build_logo_assets.py` crops the three original pieces (symbol, AL-BAHJAH, TOUR & TRAVEL) and places them side by side as the storyboard asks, at their original proportions, with only a thin divider rule added. Nothing is redrawn.

`scripts/build_title_assets.py` splits the supplied MANASIK UMROH artwork into three layers by glyph ownership. Their alpha masks sum exactly to the original, so stacked with `mix-blend-mode: plus-lighter` they rebuild it pixel for pixel. They can also move independently, which is how the title rearranges into one line in scene 6.

To swap in a new logo or title, replace `public/assets/logo/albahjah-logo-original.png` or `public/assets/title/manasik-umroh-title.png`, run the matching script, and re-render. If the new artwork has a different layout, adjust the crop boxes or band rules at the top of the script.

### Sound design

**Music:** the client's backsound `public/audio/source/bumper opening lighting show.mp3` (78.9 s) is edited to exactly
60 s by `scripts/edit_backsound.sh` (`npm run audio:backsound`), output `public/audio/backsound_60s.wav`.
There is one cut on a downbeat (~111 BPM): music 39.75 s jumps to 59.19 s, exactly 9 bars, with a 40 ms crossfade.
Before the cut, video time equals music time; after it, video time = music time - 19.44 s.
If you change the edit, move the beats in `src/config/timeline.ts` accordingly.

`BUMPER TRANSISI.mp3` is stored next to it in `public/audio/source/` but is not used in this cut.

**SFX:** light original layers (generated by `scripts/generate_audio.py`, no samples) mixed under the music.
Edit times, volumes or `enabled` in `src/config/sound.ts`.

| Time | Cue |
|---|---|
| 00:00 | Deep atmospheric intro |
| 00:02.4 | Digital activation (buildings rise) |
| 00:04.85 | Logo reveal impact |
| 00:08.8 | Soft cinematic whoosh |
| 00:15.4 | Holographic scanning |
| 00:34.4 | Main transition impact |
| 00:35.45 | Typography reveal impact |
| 00:39.75 | Title stabilise accent (also covers the music edit) |
| 00:41.26 | Final branding impact |
| 00:47.0 | Golden shimmer |
| 00:50.76 | Ambient cinematic sustain |
| 00:53.76 | Closing shimmer |

### Rebuilding generated assets

```bash
python3 scripts/build_logo_assets.py    # needs numpy, pillow
python3 scripts/build_title_assets.py   # needs numpy, pillow, scipy
python3 scripts/generate_audio.py       # needs numpy
bash scripts/edit_backsound.sh          # needs ffmpeg
```

## Reference material

The storyboard is in `public/assets/reference/storyboard.png`. The client's reference videos (`Manasik Futuristik.mp4`, `Bumper BRI.mp4`) were reviewed for style but are not included in the repository because of their size.

---

# Animated key visual (10 s)

A second composition, `AlBahjahKeyVisual10s`, animates the supplied key visual
(`public/assets/keyvisual/keyvisual-original.png`) into a 10-second, 1920x1080, 30 fps motion graphic.
The image itself is the plate: nothing is redrawn or regenerated.

**Output:** `renders/ALBAHJAH_MANASIK_UMROH_KEYVISUAL_10S.mp4` (300 frames, exactly 10.000 s, H.264 yuv420p BT.709, AAC)

```bash
python3 scripts/build_keyvisual_assets.py   # masks + layers from the image (numpy, pillow, scipy)
npm run render:keyvisual                     # -> out/
npm run finalize:keyvisual                   # broadcast yuv420p, exact 10 s -> renders/
```

How it preserves the design:

- **Typography lock:** logo, MANASIK UMROH, tagline plaque and gold swoosh are cut from the image into one static layer (`kv-text.png`). It is never scaled, moved or warped. The camera push-in (1.6%) applies only to the background beneath it. The only effect on the text is a golden light sweep restricted to glyph pixels (`kv-glyph-mask.png`).
- **Light, not shape:** building blueprint scans, Ka'bah scanning, Green Dome pulse, minarets lighting up, floor reflections and Mega Mendung tracing are moving lights masked by line structures extracted from the image (`kv-lines-*.png`). Shapes stay exactly as drawn; only their illumination changes.
- **Ribbons (selendang):** a smooth wave displacement is applied to the original pixels around each ribbon's centreline, so they flow like fabric, with gold particles riding along them.
- **Particles and grid pulses:** drawn on a canvas layer between the background and the typography.

Timing lives in `src/keyvisual/config.ts`:

| Time | Action |
|---|---|
| 0-2 s | City wakes: lines light up bottom to top, particles start flowing |
| 2-4 s | Ka'bah and Green Dome holographic scanning, minarets light up, horizon rises |
| 4-6 s | Ribbons reach full motion, Mega Mendung light tracing, more particles |
| 6-8 s | Golden sweep over title, logo and tagline; architecture at peak light |
| 8-10 s | Ambient hold |

Audio: `public/audio/keyvisual_ambient.wav`, an original procedurally generated pad (shimmer at 6 s).
Set `KV.audio.enabled = false` in `src/keyvisual/config.ts` for a silent render.

---

# BRI-style cut (60 s)

Composition `AlBahjahBumperBRIStyle` re-creates the pacing and look of the BRI reference bumper in the
Al-Bahjah emerald palette: bright misty glass-tower city, a different camera shot per text card cut with
light flashes, decode/glitch sans typography, neon ribbon bundles, ring arcs, HUD streaks and a cloud whiteout.
Same backsound, logo, wording and timing accents as the 60 s cut.

**Ending (41.26-60 s):** the client's "Background Loop" key visual, cleaned of its typography by
`scripts/build_kv_final_layers.py` (`public/assets/kvfinal/`), kept alive with the key-visual loop layers
(scanning light, ribbon wave, particles). BRI-style build: skyline lines drawn in from both sides, then the new
title artwork `IMG_2140` (`public/assets/title/manasik-umroh-title-oneline.png`), logo, the original plaque frame
with the new tagline (Poppins italic) and the gold swoosh; long hold with golden sweep (47.3 s) and accents.

```bash
python3 scripts/build_cloud_textures.py     # cloud layers
python3 scripts/build_kv_final_layers.py    # plate / plaque / swoosh / layout for the ending
npm run render:bri-preview                  # 960x540 preview
npm run render:bri                          # 1080p master -> out/ALBAHJAH_MANASIK_UMROH_BUMPER_60S_BRISTYLE.mp4
```

Shots, timings, palettes, ribbons and flashes: `src/bri/config.ts`. SFX: `src/bri/sound.ts`.

### Final 1080p render of the BRI-style cut

The composition is layer-heavy; a single-pass 1080p render can run Chrome out of memory. Render it in chunks:

```bash
bash scripts/render_chunks.sh AlBahjahBumperBRIStyle out/ALBAHJAH_MANASIK_UMROH_BUMPER_60S_BRISTYLE.mp4 450 3
npm run finalize:bri    # broadcast yuv420p BT.709, exactly 60 s -> renders/
```

If the audio-only step times out, mix the soundtrack with ffmpeg from the same cue list (identical times, volumes and fades):
export the cues from `src/bri/sound.ts` to JSON and run `python3 scripts/mix_audio.py cues.json out/chunks_AlBahjahBumperBRIStyle/audio.wav`,
then mux it with the concatenated chunks.

**Output:** `renders/ALBAHJAH_MANASIK_UMROH_BUMPER_60S_BRISTYLE.mp4` (1920x1080, 30 fps, 1800 frames, 60.000 s, H.264 High yuv420p BT.709, AAC 48 kHz stereo).
