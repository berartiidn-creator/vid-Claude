import { keyAt } from "../lib/anim";
import { aim, type Cam, makeCam, type V3 } from "../lib/camera3d";
import { FPS } from "../config/timeline";
import { shotAt } from "./config";

const lin = (x: number) => x;
const cache = new Map<number, Cam>();

export const shotCamera = (frame: number): Cam => {
  const hit = cache.get(frame);
  if (hit) return hit;
  const t = frame / FPS;
  const s = shotAt(t);
  let cam: Cam;
  if (s.orbit) {
    const o = s.orbit;
    const a = keyAt(o.angle, t, lin);
    const r = keyAt(o.radius, t, lin);
    const h = keyAt(o.height, t, lin);
    const pos: V3 = [o.target[0] + Math.sin(a) * r, o.target[1] + h, o.target[2] - Math.cos(a) * r];
    const { yaw, pitch } = aim(pos, o.target);
    cam = makeCam(pos, yaw + o.yawOffset, pitch + o.pitchOffset, s.fov, s.cy, t);
  } else {
    const p = s.pos!;
    const pos: V3 = [keyAt(p.x, t, lin), keyAt(p.y, t, lin), keyAt(p.z, t, lin)];
    cam = makeCam(pos, keyAt(s.yaw!, t, lin), keyAt(s.pitch!, t, lin), s.fov, s.cy, t);
  }
  if (cache.size > 300) cache.clear();
  cache.set(frame, cam);
  return cam;
};
