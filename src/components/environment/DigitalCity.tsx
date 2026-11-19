/**
 * DigitalCity: the 3D holographic world rendered to a single canvas in two
 * bloom passes: (A) floor grid + skyline, (B) sacred architecture.
 */
import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { CAMERA } from "../../config/camera";
import { LIGHTING } from "../../config/lighting";
import { VIDEO } from "../../config/theme";
import { FPS } from "../../config/timeline";
import { keyAt } from "../../lib/anim";
import { cameraAt } from "../../lib/camera3d";
import { getCity } from "../../geometry/buildings";
import { Bloom, WireBatch } from "../../lib/wire";
import { drawPerspectiveGrid } from "./PerspectiveGrid";
import { drawWireframeBuilding } from "./WireframeBuilding";
import { drawKaabaFills, drawKaabaLines } from "./KaabaHologram";
import { drawNabawiFills, drawNabawiLines } from "./GreenDomeHologram";
import { drawMosqueArchitecture } from "./MosqueArchitecture";

type Res = { a: HTMLCanvasElement; b: HTMLCanvasElement; bloom: Bloom };

export const DigitalCity: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const res = useRef<Res | null>(null);

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
    const t = frame / FPS;
    const cam = cameraAt(frame);
    const strength = keyAt(LIGHTING.bloom, t);
    const cityL = keyAt(LIGHTING.city, t);
    const winL = keyAt(LIGHTING.windows, t);
    const fog = { fogNear: CAMERA.fogNear, fogFar: CAMERA.fogFar };

    // ---- Pass A: grid + skyline (with faint floor reflection)
    const actx = a.getContext("2d")!;
    actx.clearRect(0, 0, W, H);
    const city = getCity();
    const refl = new WireBatch(cam, { ...fog, mirror: true, alphaScale: 0.07 });
    for (const bld of city) drawWireframeBuilding(refl, bld, t, cityL, 0);
    refl.flush(actx);
    const ga = new WireBatch(cam, { ...fog, depthWidth: false });
    drawPerspectiveGrid(ga, cam, t);
    ga.flush(actx);
    const ca = new WireBatch(cam, { fogNear: 170, fogFar: 680 });
    for (const bld of city) drawWireframeBuilding(ca, bld, t, cityL, winL);
    ca.flush(actx);
    bloom.composite(ctx, a, strength);

    // ---- Pass B: sacred architecture
    drawKaabaFills(ctx, cam, t, true);
    drawNabawiFills(ctx, cam, t, true);
    drawNabawiFills(ctx, cam, t);
    drawKaabaFills(ctx, cam, t);
    const bctx = b.getContext("2d")!;
    bctx.clearRect(0, 0, W, H);
    const lr = new WireBatch(cam, { ...fog, mirror: true, alphaScale: 0.16, depthWidth: true });
    drawMosqueArchitecture(lr, t);
    drawNabawiLines(lr, cam, t);
    drawKaabaLines(lr, cam, t);
    lr.flush(bctx);
    const lb = new WireBatch(cam, { ...fog, depthWidth: true });
    drawMosqueArchitecture(lb, t);
    drawNabawiLines(lb, cam, t);
    drawKaabaLines(lb, cam, t);
    lb.flush(bctx);
    bloom.composite(ctx, b, strength * 1.05);
  }, [frame]);

  return <canvas ref={ref} width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0 }} />;
};
