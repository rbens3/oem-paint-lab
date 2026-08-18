import type { HexColor } from "./color";
import type { PaintRecord } from "./paint";

export const APP_VIEWS = ["lab", "library", "compare", "methodology"] as const;

export type AppView = (typeof APP_VIEWS)[number];

export interface PaintSelection {
  hex: HexColor;
  paint: PaintRecord | null;
}
