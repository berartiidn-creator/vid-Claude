import type { V3 } from "./camera3d";
import { cameraAt, project } from "./camera3d";

/** Project a world point for overlay (SVG/CSS) layers so they track the 3D world. */
export const projectAt = (frame: number, p: V3) => project(cameraAt(frame), p);
