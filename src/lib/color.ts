import type { HexColor, HsbColor, RgbColor } from "../types";

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundNormalized = (value: number) => Number(value.toFixed(3));

export function normalizeHex(hex: string): HexColor | null {
  const match = HEX_PATTERN.exec(hex.trim());
  return match ? (`#${match[1].toUpperCase()}` as HexColor) : null;
}

export function hexToRgb(hex: string): RgbColor | null {
  const normalized = normalizeHex(hex);

  if (!normalized) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

export function relativeLuminance(rgb: RgbColor): number {
  const linearize = (channel: number) => {
    const value = clamp(channel, 0, 255) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return (
    linearize(rgb.r) * 0.2126 +
    linearize(rgb.g) * 0.7152 +
    linearize(rgb.b) * 0.0722
  );
}

export function isLightHex(hex: string): boolean {
  const rgb = hexToRgb(hex);
  return rgb ? relativeLuminance(rgb) > 0.18 : false;
}

/** Backwards-compatible name used by the original converter. */
export const hexToRGB = hexToRgb;

export function rgbToHex(r: number, g: number, b: number): HexColor {
  const toHex = (channel: number) =>
    Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Converts RGB channels (0–255) to normalized HSB/HSV values (0–1). */
export function rgbToHsb(r: number, g: number, b: number): HsbColor {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue /= 6;

    if (hue < 0) {
      hue += 1;
    }
  }

  return {
    h: roundNormalized(hue),
    s: roundNormalized(max === 0 ? 0 : delta / max),
    b: roundNormalized(max),
  };
}

/** Backwards-compatible name used by the original converter. */
export const rgbToForzaHSB = rgbToHsb;

export function hexToHsb(hex: string): HsbColor | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsb(rgb.r, rgb.g, rgb.b) : null;
}

export function hsbToRgb(h: number, s: number, b: number): RgbColor {
  const hue = ((h % 1) + 1) % 1;
  const saturation = clamp(s, 0, 1);
  const brightness = clamp(b, 0, 1);
  const sector = Math.floor(hue * 6);
  const fraction = hue * 6 - sector;
  const p = brightness * (1 - saturation);
  const q = brightness * (1 - fraction * saturation);
  const t = brightness * (1 - (1 - fraction) * saturation);
  let red = 0;
  let green = 0;
  let blue = 0;

  switch (sector % 6) {
    case 0:
      red = brightness;
      green = t;
      blue = p;
      break;
    case 1:
      red = q;
      green = brightness;
      blue = p;
      break;
    case 2:
      red = p;
      green = brightness;
      blue = t;
      break;
    case 3:
      red = p;
      green = q;
      blue = brightness;
      break;
    case 4:
      red = t;
      green = p;
      blue = brightness;
      break;
    case 5:
      red = brightness;
      green = p;
      blue = q;
      break;
  }

  return {
    r: Math.round(red * 255),
    g: Math.round(green * 255),
    b: Math.round(blue * 255),
  };
}

export function hsbToHex(h: number, s: number, b: number): HexColor {
  const rgb = hsbToRgb(h, s, b);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/** Backwards-compatible name used by the original converter. */
export const forzaHSBtoHex = hsbToHex;
