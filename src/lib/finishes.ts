import type { FlakeOption, FlakeRecipe, FlakeType, HsbColor } from "../types";

export const FLAKE_TYPES = [
  { id: "silver", label: "Silver", desc: "Standard silver metallic flake" },
  { id: "color", label: "Color", desc: "Lighter version of base color" },
  { id: "pearl", label: "Pearl", desc: "Pearl/opalescent shift" },
  { id: "gold", label: "Gold", desc: "Warm gold flake" },
  { id: "dark", label: "Dark", desc: "Darker base for depth" },
] satisfies readonly FlakeOption[];

export function generateFlake(base: HsbColor, type: FlakeType): FlakeRecipe {
  switch (type) {
    case "silver":
      return {
        type,
        h: base.h,
        s: Math.max(0, base.s - 0.3),
        b: Math.min(1, base.b + 0.3),
      };
    case "color":
      return {
        type,
        h: base.h,
        s: Math.max(0, base.s - 0.15),
        b: Math.min(1, base.b + 0.2),
      };
    case "pearl":
      return {
        type,
        h: (base.h + 0.03) % 1,
        s: Math.max(0, base.s - 0.4),
        b: Math.min(1, base.b + 0.25),
      };
    case "gold":
      return { type, h: 0.12, s: 0.75, b: 0.88 };
    case "dark":
      return {
        type,
        h: base.h,
        s: Math.min(1, base.s + 0.1),
        b: Math.max(0, base.b - 0.2),
      };
  }
}

/** Backwards-compatible signature used by the current converter UI. */
export function getFlake(
  baseH: number,
  baseS: number,
  baseB: number,
  type: FlakeType,
): HsbColor {
  const { h, s, b } = generateFlake({ h: baseH, s: baseS, b: baseB }, type);
  return { h, s, b };
}
