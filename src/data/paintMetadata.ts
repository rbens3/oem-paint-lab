import type {
  HexColor,
  PaintBrand,
  PaintColorFamily,
  PaintCollection,
  PaintConfidence,
  PaintFinish,
  PaintRecord,
  PaintSourceType,
} from "../types";

export interface LegacyPaintRecord {
  id: number;
  brand: PaintBrand;
  name: string;
  hex: HexColor;
  confidence: "confirmed" | "approximate";
  note: string;
}

const PAINT_CODES: Partial<Record<number, string>> = {
  1: "PTS 5NY",
  3: "328",
  6: "336",
  9: "3AE",
  12: "Y79",
  13: "M4A",
  14: "82N",
  16: "0335",
  32: "524",
  39: "34544",
  42: "Pantone 342 C",
  43: "AM9539",
  45: "LA5D",
};

interface Provenance {
  confidence: PaintConfidence;
  source: string;
  sourceType: PaintSourceType;
}

const getCollection = (brand: PaintBrand): PaintCollection => {
  if (brand === "F1") {
    return "motorsport";
  }
  if (brand === "Other") {
    return "other";
  }
  return "oem";
};

const getProvenance = (paint: LegacyPaintRecord): Provenance => {
  const note = paint.note.toLowerCase();
  const isEstimated =
    paint.confidence === "approximate" ||
    /approxim|real photo reference|f1 livery color/.test(note);

  if (note.includes("exoticcarcolors.com")) {
    return {
      confidence: isEstimated ? "estimated" : "reference",
      source: "Exotic Car Colors",
      sourceType: "reference-database",
    };
  }

  if (note.includes("paint database")) {
    return {
      confidence: isEstimated ? "estimated" : "reference",
      source: "Secondary paint database",
      sourceType: "reference-database",
    };
  }

  if (note.includes("forza")) {
    return {
      confidence: "reference",
      source: "Forza in-game swatch",
      sourceType: "in-game",
    };
  }

  if (note.includes("hex provided")) {
    return {
      confidence: "reference",
      source: "Provided digital HEX value",
      sourceType: "provided",
    };
  }

  if (note.includes("pantone")) {
    return {
      confidence: "estimated",
      source: "Pantone 342 C digital equivalent",
      sourceType: "published-standard",
    };
  }

  if (paint.brand === "F1") {
    return {
      confidence: "estimated",
      source: "2025 Formula 1 livery reference",
      sourceType: "visual-reference",
    };
  }

  if (note.includes("paint chip")) {
    return {
      confidence: "estimated",
      source: "Paint-chip imagery",
      sourceType: "visual-reference",
    };
  }

  if (note.includes("paint reference")) {
    return {
      confidence: "estimated",
      source: "Paint reference imagery",
      sourceType: "visual-reference",
    };
  }

  if (note.includes("livery")) {
    return {
      confidence: "estimated",
      source: "Livery photography",
      sourceType: "visual-reference",
    };
  }

  if (note.includes("photo")) {
    return {
      confidence: "estimated",
      source: "Photographic reference",
      sourceType: "visual-reference",
    };
  }

  if (note.includes("visual reference")) {
    return {
      confidence: "estimated",
      source: "Visual reference",
      sourceType: "visual-reference",
    };
  }

  return {
    confidence: isEstimated ? "estimated" : "reference",
    source: "Source not specified in the current dataset",
    sourceType: "unspecified",
  };
};

const getFinish = (paint: LegacyPaintRecord): PaintFinish => {
  const description = `${paint.name} ${paint.note}`.toLowerCase();

  if (paint.id === 35 || /multi[- ]layer|triple[- ]layer/.test(description)) {
    return "multi-layer";
  }
  if (description.includes("pearl")) {
    return "pearl";
  }
  if (description.includes("metallic")) {
    return "metallic";
  }
  if (/non-metallic|\bsolid\b/.test(description)) {
    return "solid";
  }
  return "unknown";
};

const getColorFamily = (hex: HexColor): PaintColorFamily => {
  const value = hex.slice(1);
  const red = Number.parseInt(value.slice(0, 2), 16) / 255;
  const green = Number.parseInt(value.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const saturation = max === 0 ? 0 : delta / max;

  if (max <= 0.18) {
    return "black";
  }
  if (saturation <= 0.1) {
    return max >= 0.86 ? "white" : "grey";
  }

  let hue = 0;
  if (delta > 0) {
    if (max === red) {
      hue = 60 * (((green - blue) / delta) % 6);
    } else if (max === green) {
      hue = 60 * ((blue - red) / delta + 2);
    } else {
      hue = 60 * ((red - green) / delta + 4);
    }
  }
  if (hue < 0) {
    hue += 360;
  }

  if (hue >= 15 && hue < 50 && max < 0.82 && saturation < 0.65) {
    return "brown";
  }
  if (hue < 18 || hue >= 345) {
    return "red";
  }
  if (hue < 47) {
    return "orange";
  }
  if (hue < 70) {
    return "yellow";
  }
  if (hue < 180) {
    return "green";
  }
  if (hue < 255) {
    return "blue";
  }
  if (hue < 295) {
    return "purple";
  }
  if (hue < 345) {
    return "pink";
  }
  return "other";
};

export const normalizePaintRecord = (paint: LegacyPaintRecord): PaintRecord => {
  const provenance = getProvenance(paint);
  const collection = getCollection(paint.brand);
  const finish = getFinish(paint);
  const colorFamily = getColorFamily(paint.hex);
  const paintCode = PAINT_CODES[paint.id];
  const tags = Array.from(
    new Set(
      [
        paint.brand,
        paint.name,
        collection,
        finish,
        colorFamily,
        provenance.confidence,
        paintCode,
      ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase()),
    ),
  );

  return {
    id: paint.id,
    brand: paint.brand,
    name: paint.name,
    hex: paint.hex,
    confidence: provenance.confidence,
    note: paint.note,
    collection,
    finish,
    colorFamily,
    source: provenance.source,
    sourceType: provenance.sourceType,
    tags,
    ...(paintCode ? { paintCode } : {}),
  };
};
