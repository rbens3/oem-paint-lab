export type HexColor = `#${string}`;

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/** Normalized HSV/HSB values. Every channel is in the range 0–1. */
export interface HsbColor {
  h: number;
  s: number;
  b: number;
}

export type HsvColor = HsbColor;

/** CIELAB coordinates using the D65 reference white. */
export interface LabColor {
  l: number;
  a: number;
  b: number;
}
