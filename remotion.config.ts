import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// Canvas 2D (with blur filters) is used for the wireframe city; no WebGL needed.
Config.setChromiumOpenGlRenderer("swangle");
