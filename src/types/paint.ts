import type { HexColor } from "./color";

export const PAINT_CONFIDENCES = ["reference", "estimated"] as const;
export type PaintConfidence = (typeof PAINT_CONFIDENCES)[number];

export const PAINT_COLLECTIONS = ["oem", "motorsport", "other"] as const;
export type PaintCollection = (typeof PAINT_COLLECTIONS)[number];

export const PAINT_SERIES = ["f1", "heritage"] as const;
export type PaintSeries = (typeof PAINT_SERIES)[number];

export const PAINT_ROLES = ["primary", "secondary"] as const;
export type PaintRole = (typeof PAINT_ROLES)[number];

export const PAINT_EFFECTS = ["solid", "metallic", "pearl", "multi-layer"] as const;
export type PaintEffect = (typeof PAINT_EFFECTS)[number];

export const PAINT_SHEENS = ["gloss", "satin", "matte"] as const;
export type PaintSheen = (typeof PAINT_SHEENS)[number];

export const PAINT_COLOR_FAMILIES = [
  "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown",
  "grey", "black", "white", "other",
] as const;
export type PaintColorFamily = (typeof PAINT_COLOR_FAMILIES)[number];

export const PAINT_SOURCE_TYPES = [
  "dealer-catalogue",
  "digital-color-reference",
  "heritage-reference",
  "in-game-swatch",
  "manufacturer-oem",
  "mixed-reference",
  "motorsport-reference",
  "paint-database",
  "press-launch-material",
  "specialist-paint-reference",
  "unspecified",
  "user-supplied",
] as const;
export type PaintSourceType = (typeof PAINT_SOURCE_TYPES)[number];

export const PAINT_COLLECTION_LABELS: Record<PaintCollection, string> = {
  oem: "OEM Paints",
  motorsport: "Motorsport",
  other: "Other",
};

export const PAINT_SERIES_LABELS: Record<PaintSeries, string> = {
  f1: "F1",
  heritage: "Heritage",
};

export const PAINT_ROLE_LABELS: Record<PaintRole, string> = {
  primary: "Primary",
  secondary: "Secondary",
};

export const PAINT_CONFIDENCE_LABELS: Record<PaintConfidence, string> = {
  reference: "Reference",
  estimated: "Estimated",
};

export const PAINT_EFFECT_LABELS: Record<PaintEffect, string> = {
  solid: "Solid",
  metallic: "Metallic",
  pearl: "Pearl",
  "multi-layer": "Multi-layer",
};

export const PAINT_SHEEN_LABELS: Record<PaintSheen, string> = {
  gloss: "Gloss",
  satin: "Satin",
  matte: "Matte",
};

export const PAINT_COLOR_FAMILY_LABELS: Record<PaintColorFamily, string> = {
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  pink: "Pink",
  brown: "Brown",
  grey: "Grey",
  black: "Black",
  white: "White",
  other: "Other",
};

export const PAINT_SOURCE_TYPE_LABELS: Record<PaintSourceType, string> = {
  "dealer-catalogue": "Dealer catalogue",
  "digital-color-reference": "Digital color reference",
  "heritage-reference": "Heritage reference",
  "in-game-swatch": "In-game swatch",
  "manufacturer-oem": "Manufacturer / OEM",
  "mixed-reference": "Mixed reference",
  "motorsport-reference": "Motorsport reference",
  "paint-database": "Paint database",
  "press-launch-material": "Press / launch material",
  "specialist-paint-reference": "Specialist paint reference",
  unspecified: "Unspecified",
  "user-supplied": "User supplied",
};

export interface PaintRecord {
  id: number;
  collection: PaintCollection;
  manufacturer: string | null;
  series: PaintSeries | null;
  season: number | null;
  team: string | null;
  role: PaintRole | null;
  name: string;
  paintCode: string | null;
  hex: HexColor;
  sourceName: string | null;
  sourceType: PaintSourceType;
  sourceUrl: string | null;
  effect: PaintEffect | null;
  sheen: PaintSheen | null;
  derivationNote: string | null;
  confidence: PaintConfidence;
  colorFamily: PaintColorFamily;
  tags: string[];
}
