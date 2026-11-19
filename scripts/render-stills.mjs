// Renders check stills with one bundle: node scripts/render-stills.mjs [scale] [frames...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const scale = args.length && args[0].includes(".") ? Number(args.shift()) : 0.5;
const frames = args.length
  ? args.map(Number)
  : [20, 55, 80, 115, 135, 165, 230, 260, 290, 340, 375, 410, 440, 470, 500, 545, 590, 615, 650, 680, 715, 760, 800, 860, 885, 920, 950, 990, 1050, 1199];
mkdirSync("out/stills", { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "AlBahjahBumper", browserExecutable });
for (const frame of frames) {
  const output = `out/stills/f${String(frame).padStart(4, "0")}.jpg`;
  await renderStill({ serveUrl, composition, frame, output, scale, imageFormat: "jpeg", jpegQuality: 88, chromiumOptions: { gl: "swangle" }, browserExecutable });
  console.log(output);
}
