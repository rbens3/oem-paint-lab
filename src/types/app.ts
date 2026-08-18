import type { HexColor } from "./color";
import type { PaintRecord } from "./paint";

export const APP_VIEWS = ["lab", "library", "compare", "methodology", "paint"] as const;

export type AppView = (typeof APP_VIEWS)[number];

export interface AppRoute {
  view: AppView;
  paintId?: number;
}

export interface PaintSelection {
  hex: HexColor;
  paint: PaintRecord | null;
}
