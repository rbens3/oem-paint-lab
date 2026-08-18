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
export type PaintConfidence = "confirmed" | "approximate";

export type PaintFinish =
  | "solid"
  | "metallic"
  | "pearl"
  | "matte"
  | "satin"
  | "special";

export type PaintColorFamily =
  | "black"
  | "white"
  | "grey"
  | "silver"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "pink"
  | "purple"
  | "brown"
  | "beige"
  | "gold"
  | "bronze";

export type PaintSourceType =
  | "manufacturer"
  | "paint-database"
  | "in-game"
  | "visual-reference"
  | "community"
  | "other";

export interface PaintRecord {
  id: number;
  brand: PaintBrand;
  name: string;
  /** Empty string is allowed while a user clears an editable HEX field. */
  hex: HexColor | "";
  confidence: PaintConfidence;
  note: string;
  paintCode?: string;
  finish?: PaintFinish;
  colorFamily?: PaintColorFamily;
  source?: string;
  sourceType?: PaintSourceType;
  tags?: string[];
}
