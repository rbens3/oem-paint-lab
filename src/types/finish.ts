import type { HsbColor } from "./color";

export type FlakeType = "silver" | "color" | "pearl" | "gold" | "dark";

export interface FlakeOption {
  id: FlakeType;
  label: string;
  desc: string;
}

export interface FlakeRecipe extends HsbColor {
  type: FlakeType;
}
