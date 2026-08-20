import {
  PAINT_COLLECTION_LABELS,
  PAINT_ROLE_LABELS,
  PAINT_SERIES_LABELS,
  type CorrectionProposal,
  type PaintRecord,
} from "../types";
import { getPaintDisplayGroup } from "./paint";

export function getCorrectionSourceError(sourceUrl: string): string | null {
  const trimmedUrl = sourceUrl.trim();
  if (!trimmedUrl) return null;

  try {
    const url = new URL(trimmedUrl);
    return url.protocol === "http:" || url.protocol === "https:"
      ? null
      : "Use an http or https source URL.";
  } catch {
    return "Enter a complete source URL, including https://.";
  }
}

export function formatCorrectionProposal(
  paint: PaintRecord,
  proposal: CorrectionProposal,
): string {
  const lines = [
    "OEM Paint Lab correction proposal",
    "",
    `Paint: ${paint.name}`,
    `Record ID: ${proposal.paintId}`,
    `Collection: ${PAINT_COLLECTION_LABELS[paint.collection]}`,
    `Context: ${getPaintDisplayGroup(paint)}`,
  ];

  if (paint.manufacturer) lines.push(`Manufacturer: ${paint.manufacturer}`);
  if (paint.paintCode) lines.push(`Paint code: ${paint.paintCode}`);
  if (paint.series) lines.push(`Series: ${PAINT_SERIES_LABELS[paint.series]}`);
  if (paint.season) lines.push(`Season: ${paint.season}`);
  if (paint.team) lines.push(`Team: ${paint.team}`);
  if (paint.role) lines.push(`Role: ${PAINT_ROLE_LABELS[paint.role]}`);

  lines.push(
    `Current HEX: ${proposal.currentHex}`,
    `Suggested HEX: ${proposal.suggestedHex}`,
    `Delta E 00: ${proposal.deltaE.toFixed(3)}`,
  );

  if (proposal.sourceUrl) lines.push(`Source: ${proposal.sourceUrl}`);
  if (proposal.explanation) lines.push("", "Explanation:", proposal.explanation);

  return lines.join("\n");
}
