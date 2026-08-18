import { hexToRgb } from "./color";
import type {
  ColorSimilarity,
  LabColor,
  PaintRecord,
  RgbColor,
  SimilarPaint,
} from "../types";

const D65 = { x: 0.95047, y: 1, z: 1.08883 } as const;
const LAB_EPSILON = 216 / 24_389;
const LAB_KAPPA = 24_389 / 27;

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

const linearizeSrgbChannel = (channel: number) => {
  const normalized = Math.min(255, Math.max(0, channel)) / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const labTransform = (value: number) =>
  value > LAB_EPSILON
    ? Math.cbrt(value)
    : (LAB_KAPPA * value + 16) / 116;

/** Converts sRGB to CIELAB using the standard D65 reference white. */
export function rgbToLab(rgb: RgbColor): LabColor {
  const red = linearizeSrgbChannel(rgb.r);
  const green = linearizeSrgbChannel(rgb.g);
  const blue = linearizeSrgbChannel(rgb.b);

  const x = (red * 0.4124564 + green * 0.3575761 + blue * 0.1804375) / D65.x;
  const y = (red * 0.2126729 + green * 0.7151522 + blue * 0.072175) / D65.y;
  const z = (red * 0.0193339 + green * 0.119192 + blue * 0.9503041) / D65.z;

  const fx = labTransform(x);
  const fy = labTransform(y);
  const fz = labTransform(z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function hexToLab(hex: string): LabColor | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToLab(rgb) : null;
}

/** Basic CIE76 Delta E. Useful when a simple Euclidean LAB metric is desired. */
export function deltaE76(colorA: LabColor, colorB: LabColor): number {
  return Math.hypot(
    colorA.l - colorB.l,
    colorA.a - colorB.a,
    colorA.b - colorB.b,
  );
}

/**
 * Perceptual CIEDE2000 Delta E. Lower values indicate a closer visual match.
 * A result near 0 is effectively identical; values around 2 are barely perceptible.
 */
export function deltaE2000(colorA: LabColor, colorB: LabColor): number {
  const c1 = Math.hypot(colorA.a, colorA.b);
  const c2 = Math.hypot(colorB.a, colorB.b);
  const averageC = (c1 + c2) / 2;
  const averageC7 = averageC ** 7;
  const g = 0.5 * (1 - Math.sqrt(averageC7 / (averageC7 + 25 ** 7)));
  const a1Prime = (1 + g) * colorA.a;
  const a2Prime = (1 + g) * colorB.a;
  const c1Prime = Math.hypot(a1Prime, colorA.b);
  const c2Prime = Math.hypot(a2Prime, colorB.b);

  const huePrime = (a: number, b: number) => {
    if (a === 0 && b === 0) {
      return 0;
    }

    const degrees = radiansToDegrees(Math.atan2(b, a));
    return degrees >= 0 ? degrees : degrees + 360;
  };

  const h1Prime = huePrime(a1Prime, colorA.b);
  const h2Prime = huePrime(a2Prime, colorB.b);
  const deltaLPrime = colorB.l - colorA.l;
  const deltaCPrime = c2Prime - c1Prime;
  const hueDifference = h2Prime - h1Prime;
  let deltaHuePrime = 0;

  if (c1Prime * c2Prime !== 0) {
    if (Math.abs(hueDifference) <= 180) {
      deltaHuePrime = hueDifference;
    } else if (hueDifference > 180) {
      deltaHuePrime = hueDifference - 360;
    } else {
      deltaHuePrime = hueDifference + 360;
    }
  }

  const deltaHPrime =
    2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(degreesToRadians(deltaHuePrime / 2));
  const averageLPrime = (colorA.l + colorB.l) / 2;
  const averageCPrime = (c1Prime + c2Prime) / 2;
  let averageHPrime = h1Prime + h2Prime;

  if (c1Prime * c2Prime !== 0) {
    if (Math.abs(h1Prime - h2Prime) <= 180) {
      averageHPrime = (h1Prime + h2Prime) / 2;
    } else if (h1Prime + h2Prime < 360) {
      averageHPrime = (h1Prime + h2Prime + 360) / 2;
    } else {
      averageHPrime = (h1Prime + h2Prime - 360) / 2;
    }
  }

  const t =
    1 -
    0.17 * Math.cos(degreesToRadians(averageHPrime - 30)) +
    0.24 * Math.cos(degreesToRadians(2 * averageHPrime)) +
    0.32 * Math.cos(degreesToRadians(3 * averageHPrime + 6)) -
    0.2 * Math.cos(degreesToRadians(4 * averageHPrime - 63));
  const deltaTheta =
    30 * Math.exp(-(((averageHPrime - 275) / 25) ** 2));
  const averageCPrime7 = averageCPrime ** 7;
  const rc = 2 * Math.sqrt(averageCPrime7 / (averageCPrime7 + 25 ** 7));
  const lightnessTerm = averageLPrime - 50;
  const sl = 1 + (0.015 * lightnessTerm ** 2) / Math.sqrt(20 + lightnessTerm ** 2);
  const sc = 1 + 0.045 * averageCPrime;
  const sh = 1 + 0.015 * averageCPrime * t;
  const rt = -Math.sin(degreesToRadians(2 * deltaTheta)) * rc;
  const l = deltaLPrime / sl;
  const c = deltaCPrime / sc;
  const h = deltaHPrime / sh;

  return Math.sqrt(l ** 2 + c ** 2 + h ** 2 + rt * c * h);
}

export const deltaE = deltaE2000;

/** Converts Delta E to a bounded, display-friendly score where 100 is identical. */
export function deltaEToScore(distance: number): number {
  return Math.max(0, Math.min(100, 100 - distance));
}

export function compareHexColors(hexA: string, hexB: string): ColorSimilarity | null {
  const labA = hexToLab(hexA);
  const labB = hexToLab(hexB);

  if (!labA || !labB) {
    return null;
  }

  const distance = deltaE2000(labA, labB);

  return {
    deltaE: distance,
    score: deltaEToScore(distance),
    labA,
    labB,
  };
}

export function findSimilarPaints<TPaint extends PaintRecord>(
  targetHex: string,
  paints: readonly TPaint[],
  limit = 5,
): SimilarPaint<TPaint>[] {
  const targetLab = hexToLab(targetHex);

  if (!targetLab || limit <= 0) {
    return [];
  }

  return paints
    .flatMap((paint) => {
      const paintLab = hexToLab(paint.hex);

      if (!paintLab) {
        return [];
      }

      const distance = deltaE2000(targetLab, paintLab);
      return [{ paint, deltaE: distance, score: deltaEToScore(distance) }];
    })
    .sort((a, b) => a.deltaE - b.deltaE)
    .slice(0, Math.floor(limit));
}
