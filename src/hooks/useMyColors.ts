import { useCallback, useEffect, useState } from "react";
import {
  loadMyColorsData,
  makeCustomColor,
  MY_COLORS_STORAGE_KEY,
  normalizeMyColorsData,
  saveMyColorsData,
} from "../lib/myColors";
import type {
  CustomColor,
  CustomColorInput,
  MyColorsData,
  MyColorsStorageStatus,
} from "../types";

export default function useMyColors() {
  const [initial] = useState(loadMyColorsData);
  const [data, setData] = useState<MyColorsData>(initial.data);
  const [storageStatus, setStorageStatus] =
    useState<MyColorsStorageStatus>(initial.status);

  const commit = useCallback((nextData: MyColorsData) => {
    const normalized = normalizeMyColorsData(nextData);
    setData(normalized);
    setStorageStatus(saveMyColorsData(normalized));
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== MY_COLORS_STORAGE_KEY) {
        return;
      }

      const loaded = loadMyColorsData();
      setData(loaded.data);
      setStorageStatus(loaded.status);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isArchivePaintSaved = useCallback(
    (paintId: number) => data.savedPaints.some((item) => item.paintId === paintId),
    [data.savedPaints],
  );

  const saveArchivePaint = useCallback(
    (paintId: number) => {
      if (isArchivePaintSaved(paintId)) {
        return false;
      }

      commit({
        ...data,
        savedPaints: [
          ...data.savedPaints,
          { paintId, savedAt: new Date().toISOString() },
        ],
      });
      return true;
    },
    [commit, data, isArchivePaintSaved],
  );

  const removeArchivePaint = useCallback(
    (paintId: number) => {
      if (!isArchivePaintSaved(paintId)) {
        return false;
      }

      commit({
        ...data,
        savedPaints: data.savedPaints.filter((item) => item.paintId !== paintId),
      });
      return true;
    },
    [commit, data, isArchivePaintSaved],
  );

  const createCustomColor = useCallback(
    (input: CustomColorInput) => {
      const customColor = makeCustomColor(input);
      commit({ ...data, customColors: [...data.customColors, customColor] });
      return customColor;
    },
    [commit, data],
  );

  const updateCustomColor = useCallback(
    (id: string, input: CustomColorInput): CustomColor | null => {
      const existing = data.customColors.find((color) => color.id === id);
      if (!existing) {
        return null;
      }

      const updated: CustomColor = {
        ...existing,
        name: input.name.trim(),
        hex: input.hex,
        note: input.note?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      commit({
        ...data,
        customColors: data.customColors.map((color) =>
          color.id === id ? updated : color,
        ),
      });
      return updated;
    },
    [commit, data],
  );

  const deleteCustomColor = useCallback(
    (id: string) => {
      if (!data.customColors.some((color) => color.id === id)) {
        return false;
      }

      commit({
        ...data,
        customColors: data.customColors.filter((color) => color.id !== id),
      });
      return true;
    },
    [commit, data],
  );

  return {
    data,
    storageStatus,
    isArchivePaintSaved,
    saveArchivePaint,
    removeArchivePaint,
    createCustomColor,
    updateCustomColor,
    deleteCustomColor,
  };
}
