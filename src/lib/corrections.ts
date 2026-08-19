import type { CorrectionProposal, PaintRecord } from "../types";

export function getCorrectionSourceError(sourceUrl: string): string | null {
  const trimmedUrl = sourceUrl.trim();

  if (!trimmedUrl) {
    return null;
  }

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
    `Paint: ${paint.brand} ${paint.name}`,
    `Record ID: ${proposal.paintId}`,
    `Current HEX: ${proposal.currentHex}`,
    `Suggested HEX: ${proposal.suggestedHex}`,
    `Delta E 00: ${proposal.deltaE.toFixed(3)}`,
  ];

  if (proposal.sourceUrl) {
    lines.push(`Source: ${proposal.sourceUrl}`);
  }

  if (proposal.explanation) {
    lines.push("", "Explanation:", proposal.explanation);
  }

  return lines.join("\n");
}
