// Single source of truth for the app's chapter/topic color palette.
// Previously this exact set of OKLCH values was duplicated independently in
// both src/routes/index.tsx (TOPIC_PALETTE) and
// src/components/pathway-diagrams.tsx (violet/teal/amber/... constants).
// Consolidated here so the two can't drift out of sync.

export interface PaletteColor {
  bg: string;
  fg: string;
  ring: string;
}

export const TOPIC_PALETTE: PaletteColor[] = [
  { bg: "oklch(0.93 0.09 300)", fg: "oklch(0.36 0.17 300)", ring: "oklch(0.55 0.19 300)" }, // violet
  { bg: "oklch(0.92 0.08 195)", fg: "oklch(0.34 0.09 210)", ring: "oklch(0.55 0.11 200)" }, // teal
  { bg: "oklch(0.92 0.11 75)", fg: "oklch(0.36 0.1 60)", ring: "oklch(0.62 0.14 75)" }, // amber
  { bg: "oklch(0.92 0.1 15)", fg: "oklch(0.4 0.16 15)", ring: "oklch(0.58 0.19 15)" }, // rose
  { bg: "oklch(0.92 0.09 155)", fg: "oklch(0.35 0.1 155)", ring: "oklch(0.55 0.13 155)" }, // emerald
  { bg: "oklch(0.91 0.09 250)", fg: "oklch(0.36 0.12 255)", ring: "oklch(0.5 0.16 250)" }, // blue
  { bg: "oklch(0.92 0.12 45)", fg: "oklch(0.4 0.13 45)", ring: "oklch(0.62 0.17 45)" }, // orange
  { bg: "oklch(0.91 0.1 340)", fg: "oklch(0.38 0.16 340)", ring: "oklch(0.54 0.19 340)" }, // magenta
  { bg: "oklch(0.92 0.07 210)", fg: "oklch(0.35 0.09 220)", ring: "oklch(0.57 0.1 210)" }, // cyan
  { bg: "oklch(0.92 0.1 125)", fg: "oklch(0.37 0.11 130)", ring: "oklch(0.62 0.14 125)" }, // lime
  { bg: "oklch(0.9 0.1 275)", fg: "oklch(0.34 0.14 278)", ring: "oklch(0.48 0.18 275)" }, // indigo
  { bg: "oklch(0.92 0.1 30)", fg: "oklch(0.4 0.14 30)", ring: "oklch(0.6 0.17 30)" }, // coral
];

// Named aliases for the first 8 palette colors, used throughout the
// hand-built SVG pathway diagrams (src/components/pathway-diagrams.tsx).
export const violet = TOPIC_PALETTE[0]!;
export const teal = TOPIC_PALETTE[1]!;
export const amber = TOPIC_PALETTE[2]!;
export const rose = TOPIC_PALETTE[3]!;
export const emerald = TOPIC_PALETTE[4]!;
export const blue = TOPIC_PALETTE[5]!;
export const magenta = TOPIC_PALETTE[7]!;
export const lime = TOPIC_PALETTE[9]!;
