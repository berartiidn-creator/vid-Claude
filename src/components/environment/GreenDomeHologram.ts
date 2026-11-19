/**
 * GreenDomeHologram: Masjid Nabawi with the Green Dome mesh, drum, finial,
 * prayer hall arcade, roof domes, minarets and colonnades.
 */
import { domeFocus, LIGHTING } from "../../config/lighting";
import { COLORS } from "../../config/theme";
import { T } from "../../config/timeline";
import { WORLD } from "../../config/world";
import { EASE, keyAt, smoothstep } from "../../lib/anim";
import type { Cam, V3 } from "../../lib/camera3d";
import { project } from "../../lib/camera3d";
import { getNabawi } from "../../geometry/landmarks";
import { convexHull, projectPoly, type WireBatch } from "../../lib/wire";
import { drawReveal } from "./reveal";

export const nabawiProgress = (t: number) => EASE.inOut(smoothstep(T.domeBuildStart, T.domeBuildEnd, t));

const field = (p: V3) => {
  const o = WORLD.nabawi.origin;
  const dist = Math.hypot(p[0] - o[0], p[2] - o[2]);
  return Math.min(1, 0.6 * (p[1] / 44) + 0.4 * (dist / 200));
};

const wave = (t: number, f: number) => {
  let b = 0;
  for (const [start, dur] of [[T.outlinesIlluminate + 0.3, 1.1], [T.landmarksFull + 0.15, 1.0], [T.rasulIn, 1.0], [T.fullIllumination + 0.15, 1.2], [T.finalAccent + 0.1, 1.1]] as const) {
    const w = (t - start) / dur;
    if (w > -0.2 && w < 1.3) b += Math.exp(-((f - w * 1.1 + 0.05) ** 2) / 0.008);
  }
  return b;
};

export const drawNabawiLines = (batch: WireBatch, _cam: Cam, t: number) => {
  const P = nabawiProgress(t);
  if (P <= 0) return;
  const n = getNabawi();
  const L = keyAt(LIGHTING.landmarks, t) * domeFocus(t);
  const G = keyAt(LIGHTING.gold, t);
  const breathe = 0.9 + 0.1 * Math.sin(t * 1.3);
  drawReveal(batch, n.segs, field, P, (s, my) => {
    const w = wave(t, field([s.a[0], my, s.a[2]]));
    switch (s.k) {
      case "edge":
        return { style: COLORS.neonEmerald, alpha: (0.8 + w) * L, width: 1.5 };
      case "dome":
        return { style: w > 0.3 ? COLORS.white : COLORS.cyan, alpha: (0.85 + w) * L * breathe, width: 1.7 };
      case "domeMesh":
        return { style: COLORS.neonEmerald, alpha: (0.5 + 0.6 * w) * L * breathe, width: 1.15 };
      case "arch":
        return { style: COLORS.neonEmerald, alpha: (0.55 + w) * L, width: 1.2 };
      case "archMesh":
        return { style: COLORS.neonEmerald, alpha: (0.18 + 0.4 * w) * L, width: 1 };
      case "minaret":
        return { style: COLORS.neonEmerald, alpha: (0.75 + w) * L, width: 1.3 };
      case "minaretMesh":
        return { style: COLORS.neonEmerald, alpha: (0.2 + 0.4 * w) * L, width: 1 };
      case "gold":
        return { style: COLORS.gold, alpha: 0.95 * G, width: 1.6 };
      default:
        return { style: COLORS.neonEmerald, alpha: (0.2 + 0.5 * w) * L, width: 1 };
    }
  });
};

export const drawNabawiFills = (ctx: CanvasRenderingContext2D, cam: Cam, t: number, mirror = false) => {
  const P = nabawiProgress(t);
  if (P <= 0.05) return;
  const n = getNabawi();
  const L = keyAt(LIGHTING.landmarks, t) * domeFocus(t);
  const a = smoothstep(0.2, 0.8, P) * (mirror ? 0.25 : 1);
  ctx.save();
  // hall walls
  for (const f of n.faces) {
    const sp = projectPoly(cam, f.pts, mirror);
    if (!sp) continue;
    ctx.beginPath();
    sp.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
    ctx.fillStyle = `rgba(2,22,18,${0.62 * a})`;
    ctx.fill();
  }
  // dome glow fill
  const da = smoothstep(0.55, 0.95, P) * (mirror ? 0.25 : 1);
  if (da > 0 && n.hullPts) {
    const sp = projectPoly(cam, n.hullPts, mirror);
    const c = project(cam, mirror ? [n.center[0], -n.center[1], n.center[2]] : n.center);
    if (sp && c) {
      const hull = convexHull(sp);
      const rad = Math.max(...hull.map((q) => Math.hypot(q.x - c.x, q.y - c.y)));
      ctx.beginPath();
      hull.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
      ctx.closePath();
      const g = ctx.createRadialGradient(c.x - rad * 0.25, c.y - rad * 0.35, rad * 0.05, c.x, c.y, rad * 1.05);
      g.addColorStop(0, `rgba(120,255,214,${0.55 * da * L})`);
      g.addColorStop(0.45, `rgba(16,185,154,${0.42 * da * L})`);
      g.addColorStop(1, `rgba(7,91,67,${0.5 * da})`);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }
  ctx.restore();
};
