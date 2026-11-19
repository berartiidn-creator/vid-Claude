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
import { getHolyCity } from "../geometry/holycity";
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
      // ---- Makkah / Madinah towers: translucent faces, then holographic wireframe
      const towers = getHolyCity()
        .map((tw) => ({ tw, d: Math.hypot(tw.x - cam.pos[0], tw.z - cam.pos[2]) }))
        .filter(({ d }) => d < 1100)
        .sort((p, q) => q.d - p.d);
      const fogNear = 260;
      const fogFar = 1000;
      for (const { tw, d } of towers) {
        const fade = 1 - smoothstep(fogNear, fogFar, d);
        if (fade <= 0.02) continue;
        for (const fc of tw.faces) {
          const c: V3 = [(fc.pts[0][0] + fc.pts[2][0]) / 2, (fc.pts[0][1] + fc.pts[2][1]) / 2, (fc.pts[0][2] + fc.pts[2][2]) / 2];
          const v = [cam.pos[0] - c[0], cam.pos[1] - c[1], cam.pos[2] - c[2]];
          if (fc.n[0] * v[0] + fc.n[1] * v[1] + fc.n[2] * v[2] <= 0) continue;
          const sp = projectPoly(cam, fc.pts);
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
      const scanY = (t * 22) % 620 - 20; // slow blueprint scan plane
      for (const { tw } of towers) {
        // wireframe lights up from the ground, tower by tower
        const front = (t - tw.lightAt) * 120;
        const contour = ((t * 34 + tw.x * 0.7 + tw.z * 0.3) % (tw.h + 80)) - 40; // light travelling up the contours
        const edgeCol = tw.tint ? COLORS.neonEmerald : COLORS.cyan;
        for (const sg of tw.segs) {
          const my = (sg.a[1] + sg.b[1]) / 2;
          const lit = my < front ? 1 : 0.14;
          const fr = Math.exp(-(((my - front) / 6) ** 2)) * 1.6;
          const scan = Math.exp(-(((my - scanY) / 7) ** 2));
          const cont = Math.exp(-(((my - contour) / 5) ** 2));
          let style: string = COLORS.neonEmerald;
          let a = 0.2;
          let w = 1;
          switch (sg.k) {
            case "edge":
              style = cont > 0.4 ? COLORS.white : edgeCol;
              a = 0.8 + 0.8 * cont;
              w = 1.3;
              break;
            case "spire":
              style = COLORS.cyan;
              a = 0.9;
              break;
            case "floor":
              a = 0.14 + 0.55 * scan;
              break;
            case "mull":
              a = 0.12 + 0.3 * scan + 0.4 * cont;
              break;
            case "minaret":
            case "arch":
            case "dome":
              style = sg.k === "dome" ? COLORS.cyan : COLORS.neonEmerald;
              a = 0.8 + 0.6 * cont;
              w = 1.2;
              break;
            case "minaretMesh":
            case "archMesh":
            case "domeMesh":
            case "umbrellaMesh":
              a = 0.22 + 0.4 * scan;
              break;
            case "umbrella":
              style = COLORS.white;
              a = 0.55;
              break;
            case "gold":
              style = COLORS.gold;
              a = 0.95;
              w = 1.4;
              break;
          }
          lb.line(sg.a, sg.b, fr > 0.2 ? COLORS.white : style, Math.min(1.4, a * lit + fr * 0.6) * pal.lineAlpha, w);
        }
        // soft window light pulses
        for (const wn of tw.windows) {
          if (wn.p[1] > front) continue;
          const pulse = Math.pow(Math.max(0, Math.sin(Math.PI * 2 * (t / 4.6 + wn.ph * 9))), 5);
          lb.dot(wn.p, 1.6, wn.gold ? COLORS.goldLight : COLORS.cyan, 0.15 + 0.7 * pulse);
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
