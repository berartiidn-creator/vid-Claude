/** VolumetricLight: soft beams fanning from the horizon + landmark light pillars. */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CAMERA } from "../../config/camera";
import { LIGHTING } from "../../config/lighting";
import { COLORS, rgba, VIDEO } from "../../config/theme";
import { FPS, T } from "../../config/timeline";
import { keyAt, smoothstep } from "../../lib/anim";
import { getKaaba, getNabawi } from "../../geometry/landmarks";
import { projectAt } from "../../lib/projector";

const BEAMS = [
  { a: -46, w: 320, o: 0.45 },
  { a: -22, w: 380, o: 0.6 },
  { a: 4, w: 300, o: 0.5 },
  { a: 26, w: 360, o: 0.55 },
  { a: 50, w: 320, o: 0.4 },
];

export const VolumetricLight: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const I = keyAt(LIGHTING.beams, t);
  const hy = VIDEO.height * CAMERA.horizonY;
  const pillars = smoothstep(T.landmarksFull - 0.2, T.landmarksFull + 1.0, t) * (0.75 + 0.25 * smoothstep(T.fullIllumination, T.fullIllumination + 1, t));
  const kTop = projectAt(frame, getKaaba().top);
  const nTop = projectAt(frame, getNabawi().top);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {BEAMS.map((b, i) => {
        const sway = Math.sin(t * 0.25 + i * 1.7) * 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: VIDEO.width / 2 - b.w / 2,
              top: hy - 1100,
              width: b.w,
              height: 1100,
              transformOrigin: "50% 100%",
              transform: `rotate(${b.a + sway}deg)`,
              background: `linear-gradient(to top, ${rgba(COLORS.neonEmerald, 0.11 * b.o * I)}, ${rgba(COLORS.neonEmerald, 0.035 * b.o * I)} 45%, transparent 85%)`,
              filter: "blur(48px)",
              clipPath: "polygon(44% 100%, 56% 100%, 100% 0, 0 0)",
            }}
          />
        );
      })}
      {pillars > 0.01 &&
        [kTop, nTop].map((p, i) =>
          p ? (
            <div
              key={`p${i}`}
              style={{
                position: "absolute",
                left: p.x - 70,
                top: 0,
                width: 140,
                height: p.y + 20,
                background: `linear-gradient(to top, ${rgba(i === 0 ? COLORS.gold : COLORS.cyan, 0.22 * pillars)}, ${rgba(COLORS.neonEmerald, 0.06 * pillars)} 55%, transparent)`,
                filter: "blur(22px)",
              }}
            />
          ) : null,
        )}
    </AbsoluteFill>
  );
};
