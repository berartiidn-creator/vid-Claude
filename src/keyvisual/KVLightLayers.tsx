/**
 * Light layers that animate the EXISTING linework of the key visual. Each layer
 * is a moving light (gradient) masked by a line mask extracted from the image,
 * blended with `screen`, so shapes never change: only their illumination does.
 */
import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import data from "../data/keyvisual.json";
import { COLORS, rgba } from "../config/theme";
import { FPS } from "../config/timeline";
import { EASE, clamp01, smoothstep } from "../lib/anim";
import { KV, peakLift } from "./config";

const M = (name: string) => staticFile(`assets/keyvisual/${name}.png`);

const Masked: React.FC<{ mask: string; background: string; opacity?: number; blend?: React.CSSProperties["mixBlendMode"]; filter?: string }> = ({ mask, background, opacity = 1, blend = "screen", filter }) =>
  opacity <= 0.003 ? null : (
    <AbsoluteFill
      style={{
        WebkitMaskImage: `url(${mask})`,
        WebkitMaskSize: "100% 100%",
        maskImage: `url(${mask})`,
        maskSize: "100% 100%",
        background,
        opacity: Math.min(1, opacity),
        mixBlendMode: blend,
        filter,
      }}
    />
  );

const range = (t: number, [a, b]: number[], ease = EASE.inOut) => ease(clamp01((t - a) / (b - a)));
const band = (pos: number, width: number, color: string, a: number, dir = "to top") =>
  `linear-gradient(${dir}, transparent ${pos - width}%, ${rgba(color, a * 0.6)} ${pos - width * 0.35}%, ${rgba("#EFFFF9", a)} ${pos}%, ${rgba(color, a * 0.6)} ${pos + width * 0.35}%, transparent ${pos + width}%)`;

export const KVLightLayers: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tl = KV.timeline;
  const peak = peakLift(t);
  const [hx, hy] = data.horizon;
  const [dcx, dcy] = data.domeCenter;
  const dr = data.domeRadius;

  // 1. City wakes: lines dimmed above a wipe front that rises bottom -> top
  const wake = range(t, tl.cityWake, EASE.inOut);
  const front = -8 + 120 * wake; // % from bottom
  // multiply with an emerald tone keeps unlit lines green (not grey)
  const unlit = "rgb(92,150,132)";
  const wakeDim = wake < 1 ? `linear-gradient(to top, #fff 0%, #fff ${front}%, ${unlit} ${front + 9}%, ${unlit} 100%)` : null;

  // 2. Periodic blueprint scans after the wake
  const scanCycle = 6.5; // slow blueprint scan
  const scanP = t > tl.cityWake[1] ? ((t - tl.cityWake[1]) / scanCycle) % 1 : -1;

  // 4. Ka'bah scans
  const k1 = range(t, tl.kaabaScan, EASE.inOut);
  const k2 = range(t, tl.kaabaScan2, EASE.inOut);
  const kActive = (k1 > 0 && k1 < 1) || (k2 > 0 && k2 < 1);
  const kPos = k1 > 0 && k1 < 1 ? -10 + 120 * k1 : -10 + 120 * k2;
  const kaabaAmb = (0.1 + 0.07 * Math.sin(t * 1.7)) * smoothstep(tl.kaabaScan[0], tl.kaabaScan[1], t) * peak;

  // 5. Dome glow pulse + horizontal scan
  const domeOn = smoothstep(tl.domeScan[0] - 0.2, tl.domeScan[0] + 0.8, t);
  const domePulse = domeOn * (0.32 + 0.14 * Math.sin(((t - tl.domeScan[0]) / 2.8) * Math.PI * 2)) * peak;
  const d1 = range(t, tl.domeScan, EASE.inOut);
  const d2 = range(t, tl.domeScan2, EASE.inOut);
  const dActive = (d1 > 0 && d1 < 1) || (d2 > 0 && d2 < 1);
  const dPos = d1 > 0 && d1 < 1 ? -10 + 120 * d1 : -10 + 120 * d2;

  // 6. Minarets: light climbs, then breathes
  const mr = range(t, tl.minaretsRise, EASE.out);
  const minaretBreath = (0.2 + 0.08 * Math.sin(t * 2.1)) * peak;

  // 7. Horizon
  const hRise = 0.65 + 0.35 * smoothstep(tl.horizonRise[0], tl.horizonRise[1], t);
  const hI = hRise * (1 + 0.12 * Math.sin((t / 3.4) * Math.PI * 2)) * peak;

  // 9. Floor sheen travelling toward the viewer
  const sheenP = (t / 3.2) % 1;
  const sheenPos = 100 - 108 * sheenP; // % from top within the floor mask image

  // 11. Mega Mendung light tracing
  const cl = smoothstep(tl.cloudTrace[0], tl.cloudTrace[1], t);
  const clPos = ((t - tl.cloudTrace[0]) / 3.5) % 1;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* volumetric rays from the horizon */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.55 * smoothstep(0, 3, t) * peak }}>
        {[-48, -26, -6, 14, 34, 54].map((a, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: hx - 170,
              top: hy - 1000,
              width: 340,
              height: 1000,
              transformOrigin: "50% 100%",
              transform: `rotate(${a + Math.sin(t * 0.22 + i * 1.3) * 2.5}deg)`,
              background: `linear-gradient(to top, ${rgba(COLORS.neonEmerald, 0.16)}, ${rgba(COLORS.neonEmerald, 0.04)} 50%, transparent 85%)`,
              filter: "blur(40px)",
              clipPath: "polygon(45% 100%, 55% 100%, 100% 0, 0 0)",
            }}
          />
        ))}
      </AbsoluteFill>

      {/* horizon glow */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          background: `radial-gradient(ellipse 300px 70px at ${hx}px ${hy}px, rgba(255,244,200,${0.42 * hI}) 0%, ${rgba(COLORS.gold, 0.18 * hI)} 40%, transparent 75%), radial-gradient(ellipse 900px 240px at ${hx}px ${hy}px, ${rgba(COLORS.neonEmerald, 0.2 * hI)} 0%, ${rgba(COLORS.emerald, 0.08 * hI)} 50%, transparent 80%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: hx - 640,
          width: 1280,
          top: hy - 3,
          height: 6,
          mixBlendMode: "screen",
          filter: "blur(3px)",
          background: `linear-gradient(90deg, transparent, ${rgba(COLORS.cyan, 0.3 * hI)} 30%, rgba(255,250,225,${0.65 * hI}) 50%, ${rgba(COLORS.cyan, 0.3 * hI)} 70%, transparent)`,
        }}
      />

      {/* floor grid reflections follow the light */}
      <Masked mask={M("kv-lines-floor")} background={rgba(COLORS.cyan, 1)} opacity={0.1 + 0.12 * (hI - 0.65)} />
      <Masked mask={M("kv-lines-floor")} background={band(sheenPos, 9, COLORS.cyan, 0.5, "to bottom")} opacity={0.75 * smoothstep(0.5, 2.5, t)} />

      {/* city wake + blueprint scanning */}
      {wakeDim && <Masked mask={M("kv-lines-arch")} background={wakeDim} blend="multiply" />}
      {wake > 0 && wake < 1 && <Masked mask={M("kv-lines-arch")} background={band(front, 7, COLORS.cyan, 0.95)} />}
      {scanP >= 0 && <Masked mask={M("kv-lines-city")} background={band(-10 + 125 * EASE.inOut(scanP), 8, COLORS.neonEmerald, 0.55)} opacity={peak} />}
      <Masked mask={M("kv-lines-city")} background={rgba(COLORS.neonEmerald, 1)} opacity={(peak - 1) * 0.7} />

      {/* wireframe colour slowly drifting between emerald and cyan */}
      <Masked
        mask={M("kv-lines-arch")}
        background={`repeating-linear-gradient(100deg, ${rgba(COLORS.neonEmerald, 1)} ${(t * 34) % 1040 - 1040}px, ${rgba(COLORS.cyan, 1)} ${(t * 34) % 1040 - 520}px, ${rgba(COLORS.neonEmerald, 1)} ${(t * 34) % 1040}px)`}
        opacity={0.2 * smoothstep(tl.cityWake[1] - 0.6, tl.cityWake[1] + 1.2, t)}
        filter={undefined}
      />

      {/* holographic light travelling up along the building contours */}
      {t > tl.cityWake[1] &&
        [0, 1, 2].map((i) => {
          const ph = (((t - tl.cityWake[1]) / 7.5 + i / 3) % 1 + 1) % 1;
          return <Masked key={`c${i}`} mask={M("kv-lines-city")} background={band(-8 + 116 * ph, 2.4, COLORS.cyan, 0.95)} opacity={0.6 * peak} />;
        })}
      {t > tl.minaretsRise[1] &&
        [0, 1].map((i) => {
          const ph = (((t - tl.minaretsRise[1]) / 6.2 + i / 2) % 1 + 1) % 1;
          return <Masked key={`m${i}`} mask={M("kv-lines-minarets")} background={band(-8 + 116 * ph, 2.2, COLORS.goldLight, 0.9)} opacity={0.5 * peak} />;
        })}

      {/* Ka'bah holographic scanning */}
      <Masked mask={M("kv-lines-kaaba")} background={rgba(COLORS.cyan, 1)} opacity={kaabaAmb} />
      {kActive && (
        <>
          <Masked mask={M("kv-lines-kaaba")} background={band(kPos, 10, COLORS.cyan, 1)} />
          <Masked mask={M("kv-shape-kaaba")} background={band(kPos, 2.2, COLORS.cyan, 0.35)} />
        </>
      )}

      {/* Green Dome emerald pulse + wireframe scan */}
      <Masked
        mask={M("kv-shape-dome")}
        background={`radial-gradient(circle ${dr * 1.1}px at ${dcx - dr * 0.2}px ${dcy - dr * 0.25}px, ${rgba("#9CFFE3", 0.9)} 0%, ${rgba(COLORS.neonEmerald, 0.6)} 45%, ${rgba(COLORS.emerald, 0.2)} 100%)`}
        opacity={domePulse}
      />
      <Masked mask={M("kv-lines-dome")} background={rgba(COLORS.cyan, 1)} opacity={domePulse * 0.6} />
      {dActive && <Masked mask={M("kv-lines-dome")} background={band(dPos, 9, COLORS.cyan, 1, "to right")} />}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: domePulse * 0.8,
          background: `radial-gradient(circle ${dr * 1.9}px at ${dcx}px ${dcy}px, ${rgba(COLORS.neonEmerald, 0.22)} 0%, transparent 70%)`,
        }}
      />

      {/* minarets light up bottom -> top, then breathe */}
      {mr > 0 && (
        <Masked
          mask={M("kv-lines-minarets")}
          background={mr < 1 ? band(-6 + 112 * mr, 10, COLORS.gold, 0.9) : rgba(COLORS.neonEmerald, 1)}
          opacity={mr < 1 ? 1 : minaretBreath}
        />
      )}
      {mr > 0 && mr < 1 && <Masked mask={M("kv-lines-minarets")} background={`linear-gradient(to top, ${rgba(COLORS.neonEmerald, 0.5)} 0%, ${rgba(COLORS.neonEmerald, 0.5)} ${-6 + 112 * mr}%, transparent ${4 + 112 * mr}%)`} />}

      {/* Mega Mendung subtle light tracing */}
      <Masked mask={M("kv-lines-clouds")} background={rgba(COLORS.neonEmerald, 1)} opacity={0.12 * cl} />
      {cl > 0 && <Masked mask={M("kv-lines-clouds")} background={band(-15 + 130 * clPos, 12, COLORS.cyan, 0.7, "to right")} opacity={0.75 * cl} />}
    </AbsoluteFill>
  );
};
