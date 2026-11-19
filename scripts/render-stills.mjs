// Renders check stills with one bundle: node scripts/render-stills.mjs [scale] [frames...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const scale = args.length && args[0].includes(".") ? Number(args.shift()) : 0.5;
const frames = args.length
  ? args.map(Number)
  : [30, 75, 120, 146, 200, 330, 360, 420, 480, 520, 560, 640, 690, 740, 790, 820, 850, 900, 940, 990, 1010, 1060, 1110, 1150, 1240, 1300, 1350, 1430, 1500, 1613, 1799];
mkdirSync("out/stills", { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "AlBahjahBumper", browserExecutable });
for (const frame of frames) {
  const output = `out/stills/f${String(frame).padStart(4, "0")}.jpg`;
  await renderStill({ serveUrl, composition, frame, output, scale, imageFormat: "jpeg", jpegQuality: 88, chromiumOptions: { gl: "swangle" }, browserExecutable });
  console.log(output);
}
