/**
 * BRIWorld: the 3D world for the BRI-style cut. Same procedural engine as the
 * main bumper (grid, skyline, Ka'bah, Green Dome, arcades), plus a glass-tower
 * district, driven by per-shot cameras and palettes.
 */
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, VIDEO } from "../config/theme";
import { FPS, T } from "../config/timeline";
import { CAMERA } from "../config/camera";
import { getCity } from "../geometry/buildings";
import { getCBD } from "../geometry/cbd";
import { smoothstep } from "../lib/anim";
import type { V3 } from "../lib/camera3d";
import { Bloom, projectPoly, WireBatch } from "../lib/wire";
import { drawPerspectiveGrid } from "../components/environment/PerspectiveGrid";
import { drawWireframeBuilding } from "../components/environment/WireframeBuilding";
import { drawKaabaFills, drawKaabaLines } from "../components/environment/KaabaHologram";
import { drawNabawiFills, drawNabawiLines } from "../components/environment/GreenDomeHologram";
import { drawMosqueArchitecture } from "../components/environment/MosqueArchitecture";
import { PALETTES, shotAt, TB } from "./config";
import { shotCamera } from "./shotCamera";

/**
 * Time remaps so the shared drawers (timed for the main bumper) build the
 * landmarks during the "sacred build" shot and rebuild everything for the
 * final key visual.
 */
const remap = (t: number) => {
  if (t >= TB.finalStart) {
    const k = t - TB.finalStart;
    return { city: Math.min(2.2 + k * 1.15, 1e3), grid: T.gridDrawStart + k * 1.2, kaaba: T.kaabaBuildStart + Math.max(0, k - 0.2) * 1.15, dome: T.domeBuildStart + Math.max(0, k - 0.5) * 1.15 };
  }
  return { city: t, grid: t, kaaba: T.kaabaBuildStart + (t - TB.landmarksBuild) * 1.05, dome: T.domeBuildStart + (t - TB.landmarksBuild - 0.3) * 1.05 };
};

export const BRIWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const res = useRef<{ a: HTMLCanvasElement; b: HTMLCanvasElement; bloom: Bloom } | null>(null);
  const t = frame / FPS;
  const shot = shotAt(t);
  const pal = PALETTES[shot.palette];

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const { width: W, height: H } = VIDEO;
    if (!res.current) {
      const mk = () => {
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        return c;
      };
      res.current = { a: mk(), b: mk(), bloom: new Bloom(W, H) };
    }
    const { a, b, bloom } = res.current;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const cam = shotCamera(frame);
    const rm = remap(t);
    const actx = a.getContext("2d")!;
    actx.clearRect(0, 0, W, H);

    if (shot.cbd) {
      // ---- glass towers: translucent faces, then curtain-wall lines
      const towers = getCBD()
        .map((tw) => ({ tw, d: Math.hypot(tw.x - cam.pos[0], tw.z - cam.pos[2]) }))
        .sort((p, q) => q.d - p.d);
      const fogNear = 220;
      const fogFar = 900;
      for (const { tw, d } of towers) {
        const fade = 1 - smoothstep(fogNear, fogFar, d);
        if (fade <= 0.02) continue;
        for (const f of tw.faces) {
          const c: V3 = [(f.pts[0][0] + f.pts[2][0]) / 2, (f.pts[0][1] + f.pts[2][1]) / 2, (f.pts[0][2] + f.pts[2][2]) / 2];
          const v = [cam.pos[0] - c[0], cam.pos[1] - c[1], cam.pos[2] - c[2]];
          if (f.n[0] * v[0] + f.n[1] * v[1] + f.n[2] * v[2] <= 0) continue;
          const sp = projectPoly(cam, f.pts);
          if (!sp) continue;
          const ys = sp.map((p) => p.y);
          const g = ctx.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
          g.addColorStop(0, pal.towerFillTop);
          g.addColorStop(1, pal.towerFillBottom);
          ctx.globalAlpha = fade;
          ctx.fillStyle = g;
          ctx.beginPath();
          sp.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      const lb = new WireBatch(cam, { fogNear, fogFar, depthWidth: true });
      const scanY = (t * 26) % 340;
      for (const { tw } of towers) {
        for (const s of tw.segs) {
          const my = (s.a[1] + s.b[1]) / 2;
          const scan = Math.exp(-(((my - scanY) / 6) ** 2));
          const alpha = s.k === "edge" ? 0.85 : s.k === "spire" ? 0.9 : s.k === "floor" ? 0.2 + 0.6 * scan : 0.16 + 0.3 * scan;
          lb.line(s.a, s.b, s.k === "edge" || s.k === "spire" ? COLORS.cyan : COLORS.neonEmerald, alpha * pal.lineAlpha, s.k === "edge" ? 1.3 : 1);
        }
      }
      lb.flush(actx);
      bloom.composite(ctx, a, pal.bloom);
      return;
    }

    if (shot.city) {
      const fog = { fogNear: CAMERA.fogNear + 60, fogFar: CAMERA.fogFar + 300 };
      const city = getCity();
      const refl = new WireBatch(cam, { ...fog, mirror: true, alphaScale: 0.07 });
      for (const bld of city) drawWireframeBuilding(refl, bld, rm.city, 0.75, 0);
      refl.flush(actx);
      const ga = new WireBatch(cam, fog);
      drawPerspectiveGrid(ga, cam, rm.grid);
      ga.flush(actx);
      const ca = new WireBatch(cam, { fogNear: 260, fogFar: 1050 });
      for (const bld of city) drawWireframeBuilding(ca, bld, rm.city, 0.75 * pal.lineAlpha, 0.8);
      ca.flush(actx);
      bloom.composite(ctx, a, pal.bloom);

      drawKaabaFills(ctx, cam, rm.kaaba, true);
      drawNabawiFills(ctx, cam, rm.dome, true);
      drawNabawiFills(ctx, cam, rm.dome);
      drawKaabaFills(ctx, cam, rm.kaaba);
      const bctx = b.getContext("2d")!;
      bctx.clearRect(0, 0, W, H);
      const lr = new WireBatch(cam, { ...fog, mirror: true, alphaScale: 0.16, depthWidth: true });
      drawMosqueArchitecture(lr, rm.kaaba);
      drawNabawiLines(lr, cam, rm.dome);
      drawKaabaLines(lr, cam, rm.kaaba);
      lr.flush(bctx);
      const lbm = new WireBatch(cam, { ...fog, depthWidth: true });
      drawMosqueArchitecture(lbm, rm.kaaba);
      drawNabawiLines(lbm, cam, rm.dome);
      drawKaabaLines(lbm, cam, rm.kaaba);
      lbm.flush(bctx);
      bloom.composite(ctx, b, pal.bloom * 1.05);
    }
  }, [frame, shot, pal, t]);

  return (
    <AbsoluteFill style={{ background: pal.sky }}>
      <canvas ref={ref} width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0 }} />
    </AbsoluteFill>
  );
};
