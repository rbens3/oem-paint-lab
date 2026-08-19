import { normalizeHex } from "./color";
import type {
  CustomColor,
  CustomColorInput,
  MyColorsData,
  MyColorsStorageStatus,
  SavedArchivePaint,
} from "../types";

export const MY_COLORS_STORAGE_KEY = "oem-paint-lab.my-colors.v1";

export const EMPTY_MY_COLORS: MyColorsData = {
  version: 1,
  savedPaints: [],
  customColors: [],
};

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface MyColorsLoadResult {
  data: MyColorsData;
  status: MyColorsStorageStatus;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isTimestamp = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

const sortSavedPaints = (
  savedPaints: SavedArchivePaint[],
): SavedArchivePaint[] =>
  [...savedPaints].sort(
    (a, b) =>
      Date.parse(b.savedAt) - Date.parse(a.savedAt) || a.paintId - b.paintId,
  );

const sortCustomColors = (customColors: CustomColor[]): CustomColor[] =>
  [...customColors].sort(
    (a, b) =>
      Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
      a.id.localeCompare(b.id),
  );

export function normalizeMyColorsData(data: MyColorsData): MyColorsData {
  const savedPaintsById = new Map<number, SavedArchivePaint>();
  data.savedPaints.forEach((savedPaint) => {
    const existing = savedPaintsById.get(savedPaint.paintId);
    if (
      !existing ||
      Date.parse(savedPaint.savedAt) > Date.parse(existing.savedAt)
    ) {
      savedPaintsById.set(savedPaint.paintId, savedPaint);
    }
  });

  const customColorsById = new Map<string, CustomColor>();
  data.customColors.forEach((customColor) => {
    customColorsById.set(customColor.id, customColor);
  });

  return {
    version: 1,
    savedPaints: sortSavedPaints([...savedPaintsById.values()]),
    customColors: sortCustomColors([...customColorsById.values()]),
  };
}

export function parseMyColorsData(value: unknown): MyColorsLoadResult {
  if (
    !isObject(value) ||
    value.version !== 1 ||
    !Array.isArray(value.savedPaints) ||
    !Array.isArray(value.customColors)
  ) {
    return { data: EMPTY_MY_COLORS, status: "invalid" };
  }

  let invalidEntryFound = false;
  const savedPaintsById = new Map<number, SavedArchivePaint>();

  value.savedPaints.forEach((candidate) => {
    if (
      !isObject(candidate) ||
      !Number.isInteger(candidate.paintId) ||
      Number(candidate.paintId) <= 0 ||
      !isTimestamp(candidate.savedAt)
    ) {
      invalidEntryFound = true;
      return;
    }

    const savedPaint: SavedArchivePaint = {
      paintId: Number(candidate.paintId),
      savedAt: candidate.savedAt,
    };
    const existing = savedPaintsById.get(savedPaint.paintId);

    if (!existing || Date.parse(savedPaint.savedAt) > Date.parse(existing.savedAt)) {
      savedPaintsById.set(savedPaint.paintId, savedPaint);
    }
  });

  if (savedPaintsById.size !== value.savedPaints.length) {
    invalidEntryFound = true;
  }

  const customColorsById = new Map<string, CustomColor>();

  value.customColors.forEach((candidate) => {
    if (
      !isObject(candidate) ||
      typeof candidate.id !== "string" ||
      !candidate.id.startsWith("custom-") ||
      typeof candidate.name !== "string" ||
      !candidate.name.trim() ||
      typeof candidate.hex !== "string" ||
      !isTimestamp(candidate.createdAt) ||
      (candidate.updatedAt !== undefined && !isTimestamp(candidate.updatedAt)) ||
      (candidate.note !== undefined && typeof candidate.note !== "string")
    ) {
      invalidEntryFound = true;
      return;
    }

    const normalizedHex = normalizeHex(candidate.hex);
    if (!normalizedHex) {
      invalidEntryFound = true;
      return;
    }

    customColorsById.set(candidate.id, {
      id: candidate.id,
      name: candidate.name.trim(),
      hex: normalizedHex,
      ...(candidate.note?.trim() && { note: candidate.note.trim() }),
      createdAt: candidate.createdAt,
      ...(candidate.updatedAt && { updatedAt: candidate.updatedAt }),
    });
  });

  if (customColorsById.size !== value.customColors.length) {
    invalidEntryFound = true;
  }

  return {
    data: normalizeMyColorsData({
      version: 1,
      savedPaints: [...savedPaintsById.values()],
      customColors: [...customColorsById.values()],
    }),
    status: invalidEntryFound ? "invalid" : "ready",
  };
}

const getBrowserStorage = (): StorageAdapter | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

export function loadMyColorsData(
  storage: StorageAdapter | null = getBrowserStorage(),
): MyColorsLoadResult {
  if (!storage) {
    return { data: EMPTY_MY_COLORS, status: "unavailable" };
  }

  let serialized: string | null;

  try {
    serialized = storage.getItem(MY_COLORS_STORAGE_KEY);
  } catch {
    return { data: EMPTY_MY_COLORS, status: "unavailable" };
  }

  if (serialized === null) {
    return { data: EMPTY_MY_COLORS, status: "ready" };
  }

  try {
    return parseMyColorsData(JSON.parse(serialized) as unknown);
  } catch {
    return { data: EMPTY_MY_COLORS, status: "invalid" };
  }
}

export function saveMyColorsData(
  data: MyColorsData,
  storage: StorageAdapter | null = getBrowserStorage(),
): MyColorsStorageStatus {
  if (!storage) {
    return "unavailable";
  }

  try {
    storage.setItem(
      MY_COLORS_STORAGE_KEY,
      JSON.stringify(normalizeMyColorsData(data)),
    );
    return "ready";
  } catch {
    return "unavailable";
  }
}

const createCustomId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `custom-${crypto.randomUUID()}`;
  }

  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export function makeCustomColor(
  input: CustomColorInput,
  createdAt = new Date().toISOString(),
): CustomColor {
  return {
    id: createCustomId(),
    name: input.name.trim(),
    hex: input.hex,
    ...(input.note?.trim() && { note: input.note.trim() }),
    createdAt,
  };
}
