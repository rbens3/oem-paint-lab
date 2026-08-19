import type { HexColor } from "./color";

export const PAINT_BRANDS = [
  "Porsche",
  "Lamborghini",
  "Ferrari",
  "McLaren",
  "Other",
  "F1",
] as const;

export type PaintBrand = (typeof PAINT_BRANDS)[number];

export const PAINT_CONFIDENCES = ["reference", "estimated"] as const;
export type PaintConfidence = (typeof PAINT_CONFIDENCES)[number];

export const PAINT_COLLECTIONS = ["oem", "motorsport", "other"] as const;
export type PaintCollection = (typeof PAINT_COLLECTIONS)[number];

export const PAINT_FINISHES = [
  "solid",
  "metallic",
  "pearl",
  "multi-layer",
  "unknown",
] as const;
export type PaintFinish = (typeof PAINT_FINISHES)[number];

export const PAINT_COLOR_FAMILIES = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "brown",
  "grey",
  "black",
  "white",
  "other",
] as const;
export type PaintColorFamily = (typeof PAINT_COLOR_FAMILIES)[number];

export type PaintSourceType =
  | "manufacturer"
  | "reference-database"
  | "in-game"
  | "visual-reference"
  | "published-standard"
  | "provided"
  | "unspecified";

export const PAINT_COLLECTION_LABELS: Record<PaintCollection, string> = {
  oem: "OEM Paints",
  motorsport: "Motorsport",
  other: "Other",
};

export const PAINT_CONFIDENCE_LABELS: Record<PaintConfidence, string> = {
  reference: "Reference",
  estimated: "Estimated",
};

export const PAINT_FINISH_LABELS: Record<PaintFinish, string> = {
  solid: "Solid",
  metallic: "Metallic",
  pearl: "Pearl",
  "multi-layer": "Multi-layer",
  unknown: "Unknown",
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
  manufacturer: "Manufacturer source",
  "reference-database": "Reference database",
  "in-game": "In-game reference",
  "visual-reference": "Visual reference",
  "published-standard": "Published standard",
  provided: "Provided digital value",
  unspecified: "Unspecified source",
};

export interface PaintRecord {
  id: number;
  brand: PaintBrand;
  name: string;
  hex: HexColor;
  confidence: PaintConfidence;
  note: string;
  collection: PaintCollection;
  finish: PaintFinish;
  colorFamily: PaintColorFamily;
  source: string;
  sourceType: PaintSourceType;
  tags: string[];
  paintCode?: string;
}
