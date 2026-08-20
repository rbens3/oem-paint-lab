import { hexToHsb } from "./color";
import { hexToLab } from "./similarity";
import {
  PAINT_COLLECTION_LABELS,
  PAINT_ROLE_LABELS,
  PAINT_SERIES_LABELS,
  type PaintCollection,
  type PaintColorFamily,
  type PaintConfidence,
  type PaintEffect,
  type PaintRecord,
  type PaintRole,
  type PaintSeries,
  type PaintSheen,
} from "../types";

export const LIBRARY_SORT_OPTIONS = [
  { value: "spectrum", label: "Color spectrum" },
  { value: "manufacturer", label: "Manufacturer / group" },
  { value: "name", label: "Paint name A–Z" },
  { value: "light-dark", label: "Light → dark" },
  { value: "dark-light", label: "Dark → light" },
] as const;

export type LibrarySort = (typeof LIBRARY_SORT_OPTIONS)[number]["value"];

export interface LibraryState {
  query: string;
  collection: PaintCollection | "all";
  manufacturer: string | "all";
  series: PaintSeries | "all";
  team: string | "all";
  role: PaintRole | "all";
  colorFamily: PaintColorFamily | "all";
  effect: PaintEffect | "all";
  sheen: PaintSheen | "all";
  confidence: PaintConfidence | "all";
  sort: LibrarySort;
}

export const DEFAULT_LIBRARY_STATE: LibraryState = {
  query: "",
  collection: "all",
  manufacturer: "all",
  series: "all",
  team: "all",
  role: "all",
  colorFamily: "all",
  effect: "all",
  sheen: "all",
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
  displayGroup: string;
  familyHue: number;
  hueBand: number;
  saturation: number;
  lightness: number;
  chroma: number;
}

const hasRepeatedManufacturerPrefix = (paint: PaintRecord) => {
  if (paint.collection !== "oem" || !paint.manufacturer) return false;
  return paint.name.toLocaleLowerCase().startsWith(
    `${paint.manufacturer.toLocaleLowerCase()} `,
  );
};

/** Compact archive label; the canonical workbook name remains unchanged. */
export const getPaintDisplayName = (paint: PaintRecord): string => {
  const name = hasRepeatedManufacturerPrefix(paint)
    ? paint.name.slice((paint.manufacturer?.length ?? 0) + 1)
    : paint.name;

  if (
    paint.manufacturer === "Mercedes-Benz" &&
    paint.name === "Brilliant Blue Metallic" &&
    paint.paintCode
  ) {
    return `${name} · ${paint.paintCode}`;
  }

  return name;
};

export const getPaintDisplayGroup = (paint: PaintRecord): string => {
  if (paint.collection === "oem") {
    return paint.manufacturer ?? "OEM paint";
  }
  if (paint.collection === "motorsport") {
    if (paint.series === "f1") {
      return [paint.season, PAINT_SERIES_LABELS.f1, paint.team]
        .filter(Boolean)
        .join(" · ");
    }
    return paint.series
      ? `${PAINT_COLLECTION_LABELS.motorsport} · ${PAINT_SERIES_LABELS[paint.series]}`
      : PAINT_COLLECTION_LABELS.motorsport;
  }
  return paint.manufacturer
    ? `${PAINT_COLLECTION_LABELS.other} · ${paint.manufacturer}`
    : PAINT_COLLECTION_LABELS.other;
};

export const getPaintContextLabel = (paint: PaintRecord): string => {
  const group = getPaintDisplayGroup(paint);
  if (paint.role) return `${group} · ${PAINT_ROLE_LABELS[paint.role]}`;
  return group;
};

export const getPaintSearchText = (paint: PaintRecord): string =>
  [
    paint.name,
    paint.manufacturer,
    paint.paintCode,
    paint.hex,
    paint.team,
    paint.series ? PAINT_SERIES_LABELS[paint.series] : null,
    paint.season,
    paint.role,
    paint.sourceName,
    paint.sourceType,
    paint.derivationNote,
    ...paint.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

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
    displayGroup: getPaintDisplayGroup(paint),
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
  collator.compare(a.displayGroup, b.displayGroup) ||
  collator.compare(a.paint.name, b.paint.name) ||
  compareNumber(a.paint.id, b.paint.id);

const compareSpectrum = <TPaint extends PaintRecord>(
  a: PaintSortEntry<TPaint>,
  b: PaintSortEntry<TPaint>,
) => {
  const familyDifference =
    FAMILY_ORDER[a.paint.colorFamily] - FAMILY_ORDER[b.paint.colorFamily];
  if (familyDifference) return familyDifference;

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

/** Returns a sorted copy and never mutates the source archive. */
export const sortPaints = <TPaint extends PaintRecord>(
  paintRecords: readonly TPaint[],
  sort: LibrarySort,
): TPaint[] => {
  const entries = paintRecords.map(makeSortEntry);

  entries.sort((a, b) => {
    switch (sort) {
      case "manufacturer":
        return collator.compare(a.displayGroup, b.displayGroup) || compareStable(a, b);
      case "name":
        return compareStable(a, b);
      case "light-dark":
        return compareNumber(b.lightness, a.lightness) || compareStable(a, b);
      case "dark-light":
        return compareNumber(a.lightness, b.lightness) || compareStable(a, b);
      case "spectrum":
      default:
        return compareSpectrum(a, b);
    }
  });

  return entries.map(({ paint }) => paint);
};
