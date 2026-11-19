/**
 * Central visual identity: colours, fonts and typography styles.
 * Edit here to restyle the whole bumper.
 */
export const COLORS = {
  deepForest: "#032E28",
  emerald: "#075B43",
  neonEmerald: "#10B99A",
  cyan: "#35DCC8",
  gold: "#D6B34A",
  white: "#EFFFF9",
  // Derived tones
  abyss: "#01140F",
  goldLight: "#F3DC8C",
  goldDeep: "#A9862A",
} as const;

/** rgba() helper for hex palette colours. */
export const rgba = (hex: string, a: number): string => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
};

export const FONTS = {
  title: "Cinzel",
  decorative: "Cinzel Decorative",
  serif: "Cormorant Garamond",
  sans: "Montserrat",
  arabic: "Amiri",
} as const;

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1800,
} as const;

/** Typography presets (px at 1920x1080). */
export const TYPE = {
  present: {
    fontFamily: FONTS.title,
    fontWeight: 500,
    fontSize: 50,
    letterSpacing: "0.42em",
    color: COLORS.white,
  },
  statement: {
    fontFamily: FONTS.serif,
    fontStyle: "italic" as const,
    fontWeight: 600,
    fontSize: 64,
    lineHeight: 1.08,
    color: COLORS.white,
  },
  statementAccent: {
    fontFamily: FONTS.serif,
    fontStyle: "italic" as const,
    fontWeight: 700,
    fontSize: 92,
    color: COLORS.gold,
  },
  tagline: {
    fontFamily: FONTS.sans,
    fontWeight: 500,
    fontSize: 25,
    letterSpacing: "0.03em",
    color: COLORS.white,
  },
} as const;

export const TEXT_GLOW = `0 0 18px ${rgba(COLORS.neonEmerald, 0.35)}, 0 2px 10px rgba(0,0,0,0.55)`;
export const GOLD_GLOW = `0 0 22px ${rgba(COLORS.gold, 0.45)}, 0 2px 10px rgba(0,0,0,0.5)`;
