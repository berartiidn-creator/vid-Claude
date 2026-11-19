/**
 * DigitalBlueprint: animated Islamic geometric pattern in the sky plus
 * architectural blueprint annotations (brackets, dimension lines, scan lines)
 * that track the landmarks while they are being constructed.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, rgba } from "../../config/theme";
import { FPS, T } from "../../config/timeline";
import { EASE, prog, smoothstep, window4 } from "../../lib/anim";
import { getKaaba, getNabawi, type Landmark } from "../../geometry/landmarks";
import { projectAt } from "../../lib/projector";
import type { V3 } from "../../lib/camera3d";

export const GeometricPattern: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const op = smoothstep(1.2, 4, t) * (0.75 + 0.25 * smoothstep(T.fullIllumination, T.fullIllumination + 1.5, t));
  const off = (t * 6) % 96;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: op }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="star8" width="96" height="96" patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${-off})`}>
            <g fill="none" stroke={COLORS.neonEmerald} strokeWidth="1">
              <rect x="28" y="28" width="40" height="40" />
              <rect x="28" y="28" width="40" height="40" transform="rotate(45 48 48)" />
              <circle cx="48" cy="48" r="9" />
              <path d="M48 0 L48 20 M48 76 L48 96 M0 48 L20 48 M76 48 L96 48" />
              <path d="M0 0 L19.7 19.7 M96 0 L76.3 19.7 M0 96 L19.7 76.3 M96 96 L76.3 76.3" />
            </g>
          </pattern>
          <radialGradient id="patMask" cx="50%" cy="38%" r="60%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="pm">
            <rect width="1920" height="760" fill="url(#patMask)" />
          </mask>
        </defs>
        <rect width="1920" height="740" fill="url(#star8)" opacity={0.07} mask="url(#pm)" />
      </svg>
    </AbsoluteFill>
  );
};

const bbox = (frame: number, l: Landmark, extra: V3[] = []) => {
  const pts = [...l.footprint, ...l.footprint.map((p) => [p[0], l.height, p[2]] as V3), l.top, ...extra]
    .map((p) => projectAt(frame, p))
    .filter(Boolean) as { x: number; y: number }[];
  if (!pts.length) return null;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};

const Annot: React.FC<{ b: { x0: number; x1: number; y0: number; y1: number }; vis: number; scan: number; label: string; coord: string; align: "left" | "right" }> = ({ b, vis, scan, label, coord, align }) => {
  const pad = 16;
  const x0 = b.x0 - pad;
  const x1 = b.x1 + pad;
  const y0 = b.y0 - pad;
  const y1 = b.y1 + pad;
  const L = 22;
  const c = rgba(COLORS.cyan, 0.85);
  const brackets = `M${x0} ${y0 + L} L${x0} ${y0} L${x0 + L} ${y0} M${x1 - L} ${y0} L${x1} ${y0} L${x1} ${y0 + L} M${x1} ${y1 - L} L${x1} ${y1} L${x1 - L} ${y1} M${x0 + L} ${y1} L${x0} ${y1} L${x0} ${y1 - L}`;
  const dimY = y1 + 16;
  const ticks = Array.from({ length: 11 }, (_, i) => x0 + ((x1 - x0) * i) / 10);
  const sx = x0 + (x1 - x0) * scan;
  return (
    <g opacity={vis}>
      <path d={brackets} fill="none" stroke={c} strokeWidth={1.4} />
      <line x1={x0} y1={dimY} x2={x1} y2={dimY} stroke={c} strokeWidth={1} strokeDasharray="4 4" />
      {ticks.map((x, i) => (
        <line key={i} x1={x} y1={dimY - (i % 5 === 0 ? 7 : 3)} x2={x} y2={dimY + (i % 5 === 0 ? 7 : 3)} stroke={c} strokeWidth={1} />
      ))}
      {scan > 0 && scan < 1 && (
        <>
          <line x1={sx} y1={y0} x2={sx} y2={y1} stroke={rgba(COLORS.cyan, 0.9)} strokeWidth={1.5} />
          <rect x={sx - 40} y={y0} width={40} height={y1 - y0} fill={rgba(COLORS.cyan, 0.08)} />
        </>
      )}
      <text
        x={align === "left" ? x0 : x1}
        y={dimY + 26}
        textAnchor={align === "left" ? "start" : "end"}
        fill={rgba(COLORS.white, 0.82)}
        style={{ fontFamily: FONTS.sans, fontSize: 13, letterSpacing: "0.22em", fontWeight: 500 }}
      >
        {label}
      </text>
      <text
        x={align === "left" ? x0 : x1}
        y={dimY + 44}
        textAnchor={align === "left" ? "start" : "end"}
        fill={rgba(COLORS.cyan, 0.75)}
        style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: "0.18em" }}
      >
        {coord}
      </text>
    </g>
  );
};

export const DigitalBlueprint: React.FC = () => {
  const frame = useCurrentFrame();
  const kv = window4(frame, T.kaabaBuildStart, T.kaabaBuildStart + 0.4, T.hatiTextIn - 0.3, T.hatiTextIn + 0.5);
  const nv = window4(frame, T.domeBuildStart, T.domeBuildStart + 0.4, T.hatiTextIn - 0.1, T.hatiTextIn + 0.7);
  if (kv <= 0 && nv <= 0) return null;
  const kb = bbox(frame, getKaaba());
  const nb = bbox(frame, getNabawi());
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {kb && kv > 0 && (
          <Annot b={kb} vis={kv} scan={prog(frame, T.kaabaBuildStart, T.kaabaBuildEnd + 0.3, EASE.inOut)} label="MASJIDIL HARAM" coord="21.4225° N   39.8262° E" align="left" />
        )}
        {nb && nv > 0 && (
          <Annot b={nb} vis={nv} scan={prog(frame, T.domeBuildStart, T.domeBuildEnd + 0.3, EASE.inOut)} label="MASJID NABAWI" coord="24.4672° N   39.6112° E" align="right" />
        )}
      </svg>
    </AbsoluteFill>
  );
};
