import generatedPaints from "./paints.generated.json";
import type { PaintRecord } from "../types";

/**
 * Static archive generated from the canonical All Colors workbook sheet.
 * Run scripts/import-paints.py when the workbook source changes.
 */
export const paints = generatedPaints as readonly PaintRecord[];

export default paints;
