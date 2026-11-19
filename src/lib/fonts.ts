import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const faces: { family: string; file: string; weight: string; style?: string }[] = [
  { family: "Cinzel", file: "cinzel-latin-400-normal.woff2", weight: "400" },
  { family: "Cinzel", file: "cinzel-latin-500-normal.woff2", weight: "500" },
  { family: "Cinzel", file: "cinzel-latin-600-normal.woff2", weight: "600" },
  { family: "Cinzel", file: "cinzel-latin-700-normal.woff2", weight: "700" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-500-normal.woff2", weight: "500" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-600-normal.woff2", weight: "600" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-700-normal.woff2", weight: "700" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
  { family: "Cormorant Garamond", file: "cormorant-garamond-latin-700-italic.woff2", weight: "700", style: "italic" },
  { family: "Montserrat", file: "montserrat-latin-400-normal.woff2", weight: "400" },
  { family: "Montserrat", file: "montserrat-latin-500-normal.woff2", weight: "500" },
  { family: "Montserrat", file: "montserrat-latin-600-normal.woff2", weight: "600" },
  { family: "Amiri", file: "amiri-arabic-400-normal.woff2", weight: "400" },
  { family: "Amiri", file: "amiri-arabic-700-normal.woff2", weight: "700" },
];

let loaded = false;
export const loadAllFonts = () => {
  if (loaded) return;
  loaded = true;
  for (const f of faces) {
    loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight, style: f.style ?? "normal" });
  }
};
