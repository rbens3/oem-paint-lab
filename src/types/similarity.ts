import type { LabColor } from "./color";
import type { PaintRecord } from "./paint";

export interface ColorSimilarity {
  deltaE: number;
  score: number;
  labA: LabColor;
  labB: LabColor;
}

export interface SimilarPaint<TPaint extends PaintRecord = PaintRecord> {
  paint: TPaint;
  deltaE: number;
  score: number;
}
