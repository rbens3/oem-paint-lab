import { hexToHsb } from "./color";
import { hexToLab } from "./similarity";
import {
  PAINT_COLLECTION_LABELS,
  type PaintBrand,
  type PaintCollection,
  type PaintColorFamily,
  type PaintConfidence,
  type PaintFinish,
  type PaintRecord,
} from "../types";

export const LIBRARY_SORT_OPTIONS = [
  { value: "spectrum", label: "Color spectrum" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "name", label: "Paint name A–Z" },
  { value: "light-dark", label: "Light → dark" },
  { value: "dark-light", label: "Dark → light" },
] as const;

export type LibrarySort = (typeof LIBRARY_SORT_OPTIONS)[number]["value"];

export interface LibraryState {
  query: string;
  collection: PaintCollection | "all";
  brand: PaintBrand | "all";
  colorFamily: PaintColorFamily | "all";
  finish: PaintFinish | "all";
  confidence: PaintConfidence | "all";
  sort: LibrarySort;
}

export const DEFAULT_LIBRARY_STATE: LibraryState = {
  query: "",
  collection: "all",
  brand: "all",
  colorFamily: "all",
  finish: "all",
  confidence: "all",
  sort: "spectrum",
};

const FAMILY_ORDER: Record<PaintRecord["colorFamily"], number> = {
  red: 0,
  orange: 1,
  yellow: 2,
  green: 3,
  blue: 4,
  purple: 5,
  pink: 6,
  brown: 7,
  other: 8,
  white: 9,
  grey: 10,
  black: 11,
};

const FAMILY_HUE_START: Partial<Record<PaintRecord["colorFamily"], number>> = {
  red: 345,
  orange: 18,
  yellow: 47,
  green: 70,
  blue: 180,
  purple: 255,
  pink: 295,
  brown: 15,
};

const NEUTRAL_FAMILIES = new Set<PaintRecord["colorFamily"]>([
  "white",
  "grey",
  "black",
]);

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

interface PaintSortEntry<TPaint extends PaintRecord> {
  paint: TPaint;
  displayName: string;
  displayManufacturer: string;
  hue: number;
  familyHue: number;
  hueBand: number;
  saturation: number;
  lightness: number;
  chroma: number;
}

/**
 * Removes a repeated manufacturer prefix for compact archive surfaces only.
 * Canonical record names remain unchanged for detail and data views.
 */
export const getPaintDisplayName = (paint: PaintRecord): string => {
  const manufacturerPrefix = `${paint.brand} `;

  if (paint.collection === "oem" && paint.name.startsWith(manufacturerPrefix)) {
    return paint.name.slice(manufacturerPrefix.length);
  }

  return paint.name;
};

export const getPaintDisplayManufacturer = (paint: PaintRecord): string =>
  paint.collection === "oem"
    ? paint.brand
    : PAINT_COLLECTION_LABELS[paint.collection];

const getFamilyHue = (family: PaintRecord["colorFamily"], hue: number) => {
  const start = FAMILY_HUE_START[family] ?? 0;
  return (hue - start + 360) % 360;
};

const makeSortEntry = <TPaint extends PaintRecord>(
  paint: TPaint,
): PaintSortEntry<TPaint> => {
  const hsb = hexToHsb(paint.hex);
  const lab = hexToLab(paint.hex);
  const hue = (hsb?.h ?? 0) * 360;
  const familyHue = getFamilyHue(paint.colorFamily, hue);

  return {
    paint,
    displayName: getPaintDisplayName(paint),
    displayManufacturer: getPaintDisplayManufacturer(paint),
    hue,
    familyHue,
    hueBand: Math.floor(familyHue / 10),
    saturation: hsb?.s ?? 0,
    lightness: lab?.l ?? 0,
    chroma: lab ? Math.hypot(lab.a, lab.b) : 0,
  };
};

const compareNumber = (a: number, b: number) => a - b;

const compareStable = <TPaint extends PaintRecord>(
  a: PaintSortEntry<TPaint>,
  b: PaintSortEntry<TPaint>,
) =>
  collator.compare(a.displayName, b.displayName) ||
  collator.compare(a.paint.brand, b.paint.brand) ||
  collator.compare(a.paint.name, b.paint.name) ||
  compareNumber(a.paint.id, b.paint.id);

const compareSpectrum = <TPaint extends PaintRecord>(
  a: PaintSortEntry<TPaint>,
  b: PaintSortEntry<TPaint>,
) => {
  const familyDifference =
    FAMILY_ORDER[a.paint.colorFamily] - FAMILY_ORDER[b.paint.colorFamily];

  if (familyDifference) {
    return familyDifference;
  }

  if (NEUTRAL_FAMILIES.has(a.paint.colorFamily)) {
    return (
      compareNumber(b.lightness, a.lightness) ||
      compareNumber(a.chroma, b.chroma) ||
      compareStable(a, b)
    );
  }

  if (a.paint.colorFamily === "brown") {
    return (
      compareNumber(b.lightness, a.lightness) ||
      compareNumber(a.hueBand, b.hueBand) ||
      compareNumber(b.saturation, a.saturation) ||
      compareNumber(a.familyHue, b.familyHue) ||
      compareStable(a, b)
    );
  }

  return (
    compareNumber(a.hueBand, b.hueBand) ||
    compareNumber(b.lightness, a.lightness) ||
    compareNumber(b.chroma, a.chroma) ||
    compareNumber(a.familyHue, b.familyHue) ||
    compareStable(a, b)
  );
};

/** Returns a sorted copy and never mutates the source paint collection. */
export const sortPaints = <TPaint extends PaintRecord>(
  paintRecords: readonly TPaint[],
  sort: LibrarySort,
): TPaint[] => {
  const entries = paintRecords.map(makeSortEntry);

  entries.sort((a, b) => {
    switch (sort) {
      case "manufacturer":
        return (
          collator.compare(a.displayManufacturer, b.displayManufacturer) ||
          compareStable(a, b)
        );
      case "name":
        return compareStable(a, b);
      case "light-dark":
        return (
          compareNumber(b.lightness, a.lightness) || compareStable(a, b)
        );
      case "dark-light":
        return (
          compareNumber(a.lightness, b.lightness) || compareStable(a, b)
        );
      case "spectrum":
      default:
        return compareSpectrum(a, b);
    }
  });

  return entries.map(({ paint }) => paint);
};
