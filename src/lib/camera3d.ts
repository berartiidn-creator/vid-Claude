/**
 * Camera + projection. Three.js is used to build the camera basis/matrices;
 * the hot projection loop is done manually for speed.
 */
import { Matrix4, Vector3 } from "three";
import { CAMERA } from "../config/camera";
import { VIDEO } from "../config/theme";
import { FPS } from "../config/timeline";
import { keyAt } from "./anim";

export type V3 = [number, number, number];

export type Cam = {
  pos: V3;
  // view basis rows (right, up, forward)
  r: V3;
  u: V3;
  f: V3;
  focal: number;
  cx: number;
  cy: number;
  near: number;
  t: number;
};

const camCache = new Map<number, Cam>();

export const cameraAt = (frame: number): Cam => {
  const cached = camCache.get(frame);
  if (cached) return cached;
  const t = frame / FPS;
  const amp = keyAt(CAMERA.driftAmplitude, t);
  const phase = (t / CAMERA.driftPeriod) * Math.PI * 2;
  const x = Math.sin(phase) * amp;
  const y = keyAt(CAMERA.y, t);
  const z = keyAt(CAMERA.z, t);
  const yaw = -Math.sin(phase - 0.6) * amp * CAMERA.yawFactor * 10;
  const pitch = CAMERA.pitch;

  const forward = new Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).normalize();
  const right = new Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
  const up = new Vector3().crossVectors(forward, right).normalize();
  // Matrix kept for reference / external use (three.js convention).
  new Matrix4().makeBasis(right, up, forward);

  const focal = VIDEO.height / 2 / Math.tan(((CAMERA.fovDeg / 2) * Math.PI) / 180);
  const cam: Cam = {
    pos: [x, y, z],
    r: [right.x, right.y, right.z],
    u: [up.x, up.y, up.z],
    f: [forward.x, forward.y, forward.z],
    focal,
    cx: VIDEO.width / 2,
    cy: VIDEO.height * CAMERA.horizonY,
    near: CAMERA.near,
    t,
  };
  if (camCache.size > 400) camCache.clear();
  camCache.set(frame, cam);
  return cam;
};

/** World -> view space (x right, y up, z forward depth). */
export const toView = (c: Cam, p: V3): V3 => {
  const dx = p[0] - c.pos[0];
  const dy = p[1] - c.pos[1];
  const dz = p[2] - c.pos[2];
  return [
    dx * c.r[0] + dy * c.r[1] + dz * c.r[2],
    dx * c.u[0] + dy * c.u[1] + dz * c.u[2],
    dx * c.f[0] + dy * c.f[1] + dz * c.f[2],
  ];
};

/** Project a world point to screen. Returns null when behind the camera. */
export const project = (c: Cam, p: V3): { x: number; y: number; d: number } | null => {
  const v = toView(c, p);
  if (v[2] < c.near) return null;
  return { x: c.cx + (c.focal * v[0]) / v[2], y: c.cy - (c.focal * v[1]) / v[2], d: v[2] };
};
