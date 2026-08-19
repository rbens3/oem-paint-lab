import type { HexColor } from "./color";
import type { PaintRecord } from "./paint";

export interface SavedArchivePaint {
  paintId: number;
  savedAt: string;
}

export interface CustomColor {
  id: string;
  name: string;
  hex: HexColor;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomColorInput {
  name: string;
  hex: HexColor;
  note?: string;
}

export interface MyColorsData {
  version: 1;
  savedPaints: SavedArchivePaint[];
  customColors: CustomColor[];
}

export type MyColorsStorageStatus = "ready" | "invalid" | "unavailable";

export type ColorTarget =
  | { kind: "archive"; paint: PaintRecord }
  | { kind: "custom"; color: CustomColor };
