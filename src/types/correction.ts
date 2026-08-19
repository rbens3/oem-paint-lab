import type { HexColor } from "./color";

export interface CorrectionProposal {
  paintId: number;
  currentHex: HexColor;
  suggestedHex: HexColor;
  deltaE: number;
  sourceUrl?: string;
  explanation?: string;
}
