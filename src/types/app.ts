import type { HexColor } from "./color";
import type { CustomColor } from "./myColors";
import type { PaintRecord } from "./paint";

export const APP_VIEWS = [
  "library",
  "my-colors",
  "lab",
  "compare",
  "methodology",
  "paint",
  "custom",
] as const;

export type AppView = (typeof APP_VIEWS)[number];

export interface AppRoute {
  view: AppView;
  paintId?: number;
  customId?: string;
}

export interface PaintSelection {
  hex: HexColor;
  paint: PaintRecord | null;
  customColor: CustomColor | null;
}
