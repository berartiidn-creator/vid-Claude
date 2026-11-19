/**
 * KaabaHologram: holographic Ka'bah with dark solid walls, gold hizam band,
 * emerald/cyan contours, scanning plane and rotating mataf rings.
 */
import { kaabaFocus, LIGHTING } from "../../config/lighting";
import { COLORS, rgba } from "../../config/theme";
import { T } from "../../config/timeline";
import { WORLD } from "../../config/world";
import { EASE, keyAt, smoothstep } from "../../lib/anim";
import type { Cam, V3 } from "../../lib/camera3d";
import { getKaaba } from "../../geometry/landmarks";
import { circleXZ, rectXZ, type Seg, xform } from "../../geometry/primitives";
import { projectPoly, type WireBatch } from "../../lib/wire";
import { drawReveal } from "./reveal";

export const kaabaProgress = (t: number) => EASE.inOut(smoothstep(T.kaabaBuildStart, T.kaabaBuildEnd, t));

const illumWave = (t: number, yN: number) => {
  let b = 0;
  for (const [start, dur] of [[T.outlinesIlluminate, 1.1], [T.landmarksFull, 1.0], [T.allahIn, 1.0], [T.fullIllumination, 1.2], [T.finalAccent, 1.1]] as const) {
    const w = (t - start) / dur;
    if (w > -0.2 && w < 1.3) b += Math.exp(-((yN - w * 1.2 + 0.1) ** 2) / 0.012);
  }
  return b;
};

export const drawKaabaLines = (batch: WireBatch, cam: Cam, t: number) => {
  const P = kaabaProgress(t);
  if (P <= 0) return;
  const k = getKaaba();
  const H = k.height;
  const L = keyAt(LIGHTING.landmarks, t) * kaabaFocus(t);
  const G = keyAt(LIGHTING.gold, t) * (0.85 + 0.15 * kaabaFocus(t));
  const scanPeriod = 3.4;
  const scanY = t > T.kaabaBuildEnd ? (((t - T.kaabaBuildEnd) / scanPeriod) % 1) * (H + 3) - 1.5 : -10;
  // Hide lines that lie only on faces turned away from the camera (solid look).
  const { origin, yaw, width: KW, depth: KD } = WORLD.kaaba;
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const toLocal = (p: V3): [number, number] => {
    const dx = p[0] - origin[0];
    const dz = p[2] - origin[2];
    return [dx * c - dz * sn, dx * sn + dz * c];
  };
  const [lcx, lcz] = toLocal(cam.pos);
  const hwK = KW / 2;
  const hdK = KD / 2;
  const eps = 0.2;
  const onVisibleFace = (s: Seg) => {
    const mid: V3 = [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2, (s.a[2] + s.b[2]) / 2];
    const [lx, lz] = toLocal(mid);
    if (Math.abs(lx) > hwK + eps || Math.abs(lz) > hdK + eps) return true; // outside the volume (base, hijr)
    if (mid[1] >= H - 0.05 && cam.pos[1] > H) return true;
    if (Math.abs(lx - hwK) < eps && lcx > hwK) return true;
    if (Math.abs(lx + hwK) < eps && lcx < -hwK) return true;
    if (Math.abs(lz - hdK) < eps && lcz > hdK) return true;
    if (Math.abs(lz + hdK) < eps && lcz < -hdK) return true;
    if (mid[1] < 0.6) return true;
    return false;
  };
  const segs = k.segs.filter((s) => s.k !== "ring" && onVisibleFace(s));
  drawReveal(
    batch,
    segs,
    (p) => p[1] / (H + 0.4),
    P,
    (s, my) => {
      const wave = illumWave(t, my / H);
      const scan = Math.exp(-(((my - scanY) / 1.0) ** 2));
      switch (s.k) {
        case "edge":
          return { style: wave > 0.3 ? COLORS.cyan : COLORS.neonEmerald, alpha: (0.9 + wave) * L, width: 1.9 };
        case "base":
          return { style: COLORS.neonEmerald, alpha: 0.7 * L, width: 1.4 };
        case "mesh":
          return { style: COLORS.neonEmerald, alpha: (0.13 + 0.5 * scan + 0.5 * wave) * L, width: 1 };
        case "gold":
          return { style: COLORS.gold, alpha: 0.95 * G, width: 1.7 };
        case "goldDetail":
          return { style: COLORS.goldLight, alpha: 0.5 * G, width: 1 };
        default:
          return { style: COLORS.neonEmerald, alpha: 0.5 * L, width: 1 };
      }
    },
  );
  // Scanning plane
  if (scanY > -1 && scanY < H + 1) {
    const { origin, yaw, width: W, depth: D } = WORLD.kaaba;
    const tmp: Seg[] = [];
    const X = xform(origin, yaw);
    for (const [dy, a] of [[0, 0.85], [-0.35, 0.4], [-0.7, 0.18]] as const) {
      tmp.length = 0;
      rectXZ(tmp, X, -W / 2 - 0.15, W / 2 + 0.15, -D / 2 - 0.15, D / 2 + 0.15, scanY + dy, "s");
      for (const s of tmp) batch.line(s.a, s.b, COLORS.cyan, a * L * 0.8, 1.4);
    }
  }
  // Mataf rings, revealed outward then rotating light arcs
  const rp = EASE.out(smoothstep(T.kaabaBuildEnd - 0.4, T.kaabaBuildEnd + 0.9, t));
  if (rp > 0) {
    const X = xform(WORLD.kaaba.origin, 0);
    const radii = [11, 15, 20, 26];
    radii.forEach((r, i) => {
      const pts = circleXZ(0, 0, r * rp, 0.03, 72).map(X);
      for (let j = 0; j < pts.length - 1; j++) batch.line(pts[j], pts[j + 1], COLORS.neonEmerald, 0.22 * L * (1 - i * 0.15), 1);
      const dir = i % 2 === 0 ? 1 : -1;
      const a0 = t * (0.45 - i * 0.06) * dir + i * 1.7;
      const arc = circleXZ(0, 0, r * rp, 0.05, 10, a0, a0 + 0.8).map(X);
      for (let j = 0; j < arc.length - 1; j++)
        batch.line(arc[j], arc[j + 1], i % 2 === 0 ? COLORS.gold : COLORS.cyan, (0.25 + (0.7 * j) / arc.length) * L, 1.6);
    });
  }
};

const faceCenter = (pts: V3[]): V3 => {
  const c: V3 = [0, 0, 0];
  for (const p of pts) {
    c[0] += p[0] / pts.length;
    c[1] += p[1] / pts.length;
    c[2] += p[2] / pts.length;
  }
  return c;
};

/** Solid faces (painter's order). `mirror` draws the floor reflection. */
export const drawKaabaFills = (ctx: CanvasRenderingContext2D, cam: Cam, t: number, mirror = false) => {
  const P = kaabaProgress(t);
  if (P <= 0.05) return;
  const k = getKaaba();
  const H = k.height;
  const hRev = P * (H + 0.4);
  const fillA = 0.95 * smoothstep(0.15, 0.85, P) * (mirror ? 0.28 : 1);
  const G = keyAt(LIGHTING.gold, t);
  const c = k.center;
  const visible = k.faces
    .map((f) => {
      const fc = faceCenter(f.pts);
      const n: V3 = f.kind === "roof" ? [0, 1, 0] : [fc[0] - c[0], 0, fc[2] - c[2]];
      const v: V3 = [cam.pos[0] - fc[0], cam.pos[1] - fc[1], cam.pos[2] - fc[2]];
      const dot = n[0] * v[0] + n[1] * v[1] + n[2] * v[2];
      const d = Math.hypot(v[0], v[1], v[2]);
      return { f, fc, dot, d, n };
    })
    .filter((x) => x.dot > 0)
    .sort((a, b) => b.d - a.d);
  const order = ["wall", "roof", "band", "door"];
  visible.sort((a, b) => order.indexOf(a.f.kind) - order.indexOf(b.f.kind) || b.d - a.d);
  ctx.save();
  for (const { f, n } of visible) {
    if (f.kind === "roof" && hRev < H) continue;
    const pts = f.pts.map((p) => [p[0], Math.min(p[1], hRev), p[2]] as V3);
    if (f.kind !== "roof" && Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1])) < 0.01) continue;
    const sp = projectPoly(cam, pts, mirror);
    if (!sp) continue;
    ctx.beginPath();
    sp.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
    const ys = sp.map((q) => q.y);
    const xs = sp.map((q) => q.x);
    const top = Math.min(...ys);
    const bot = Math.max(...ys);
    const lit = Math.abs(n[0]) > Math.abs(n[2]) ? 1 : 0.7;
    if (f.kind === "wall") {
      const g = ctx.createLinearGradient(0, mirror ? bot : top, 0, mirror ? top : bot);
      g.addColorStop(0, `rgba(${Math.round(8 * lit)},${Math.round(44 * lit)},${Math.round(36 * lit)},${fillA})`);
      g.addColorStop(1, `rgba(1,12,10,${fillA})`);
      ctx.fillStyle = g;
    } else if (f.kind === "roof") {
      ctx.fillStyle = `rgba(6,40,32,${fillA})`;
    } else if (f.kind === "band") {
      const left = Math.min(...xs);
      const right = Math.max(...xs);
      const g = ctx.createLinearGradient(left, 0, right, 0);
      const sh = (t * 0.35) % 1.6 - 0.3;
      g.addColorStop(0, rgba(COLORS.goldDeep, 0.85 * fillA * G));
      g.addColorStop(Math.max(0, Math.min(1, sh)), rgba(COLORS.goldLight, 0.95 * fillA * G));
      g.addColorStop(1, rgba(COLORS.gold, 0.85 * fillA * G));
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = rgba(COLORS.gold, 0.38 * fillA * G);
    }
    ctx.fill();
  }
  ctx.restore();
};
