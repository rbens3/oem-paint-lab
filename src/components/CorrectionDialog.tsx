import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { normalizeHex } from "../lib/color";
import {
  formatCorrectionProposal,
  getCorrectionSourceError,
} from "../lib/corrections";
import { getPaintDisplayGroup } from "../lib/paint";
import { compareHexColors } from "../lib/similarity";
import {
  PAINT_CONFIDENCE_LABELS,
  type CorrectionProposal,
  type PaintRecord,
} from "../types";
import PaintField from "./PaintField";

type CopyState = "idle" | "copying" | "success" | "error";

interface CorrectionDialogProps {
  paint: PaintRecord;
}

export default function CorrectionDialog({ paint }: CorrectionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const suggestedHexRef = useRef<HTMLInputElement>(null);
  const [suggestedHex, setSuggestedHex] = useState("");
  const [suggestedHexTouched, setSuggestedHexTouched] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [explanation, setExplanation] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const normalizedSuggestedHex = normalizeHex(suggestedHex);
  const similarity = normalizedSuggestedHex
    ? compareHexColors(paint.hex, normalizedSuggestedHex)
    : null;
  const sourceError = getCorrectionSourceError(sourceUrl);
  const suggestedHexError = suggestedHex.trim()
    ? normalizedSuggestedHex
      ? null
      : "Enter a six-digit HEX value, with or without #."
    : suggestedHexTouched
      ? "Suggested HEX is required."
      : null;

  const resetForm = () => {
    setSuggestedHex("");
    setSuggestedHexTouched(false);
    setSourceUrl("");
    setExplanation("");
    setCopyState("idle");
  };

  const openDialog = () => {
    resetForm();
    dialogRef.current?.showModal();
    suggestedHexRef.current?.focus();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  };

  const handleCopy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuggestedHexTouched(true);

    if (!normalizedSuggestedHex || !similarity || sourceError) {
      return;
    }

    const proposal: CorrectionProposal = {
      paintId: paint.id,
      currentHex: paint.hex,
      suggestedHex: normalizedSuggestedHex,
      deltaE: similarity.deltaE,
      ...(sourceUrl.trim() && { sourceUrl: sourceUrl.trim() }),
      ...(explanation.trim() && { explanation: explanation.trim() }),
    };

    setCopyState("copying");

    try {
      await navigator.clipboard.writeText(
        formatCorrectionProposal(paint, proposal),
      );
      setCopyState("success");
    } catch {
      setCopyState("error");
    }
  };

  const copyLabel =
    copyState === "copying"
      ? "Copying correction"
      : copyState === "success"
        ? "Correction copied"
        : copyState === "error"
          ? "Copy failed — try again"
          : "Copy correction";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="text-action correction-trigger"
        onClick={openDialog}
      >
        Suggest correction
      </button>

      <dialog
        ref={dialogRef}
        className="correction-dialog"
        aria-labelledby="correction-dialog-title"
        onClick={handleBackdropClick}
        onClose={() => triggerRef.current?.focus()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
          }
        }}
      >
        <form className="correction-dialog__surface" onSubmit={handleCopy}>
          <header className="correction-dialog__header">
            <div>
              <span className="correction-dialog__eyebrow">Record feedback</span>
              <h2 id="correction-dialog-title">Suggest a HEX correction</h2>
              <p>
                Proposals are reviewed before any archive record is changed.
              </p>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Close correction dialog"
              onClick={closeDialog}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <section className="correction-reference" aria-labelledby="current-record-title">
            <div>
              <span id="current-record-title">Current reference</span>
              <strong>{getPaintDisplayGroup(paint)} · {paint.name}</strong>
            </div>
            <dl>
              <div>
                <dt>HEX</dt>
                <dd>{paint.hex}</dd>
              </div>
              <div>
                <dt>Provenance</dt>
                <dd>{PAINT_CONFIDENCE_LABELS[paint.confidence]}</dd>
              </div>
            </dl>
          </section>

          <div className="field-group">
            <label className="field-label" htmlFor="suggested-correction-hex">
              Suggested HEX · required
            </label>
            <input
              ref={suggestedHexRef}
              id="suggested-correction-hex"
              className="text-input correction-hex-input"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="#6B8BC0"
              value={suggestedHex}
              aria-invalid={suggestedHexError ? "true" : undefined}
              aria-describedby="suggested-correction-help"
              onChange={(event) => {
                setSuggestedHex(event.target.value);
                setCopyState("idle");
              }}
              onBlur={() => {
                setSuggestedHexTouched(true);
                if (normalizedSuggestedHex) {
                  setSuggestedHex(normalizedSuggestedHex);
                }
              }}
            />
            <span
              id="suggested-correction-help"
              className="field-helper"
              data-error={Boolean(suggestedHexError)}
            >
              {suggestedHexError ?? "Six hexadecimal digits; # is optional."}
            </span>
          </div>

          <section className="correction-comparison" aria-label="Current and suggested color comparison">
            <article>
              <span>Current</span>
              <PaintField
                hex={paint.hex}
                className="correction-swatch"
                label={`Current color ${paint.hex}`}
              />
              <strong>{paint.hex}</strong>
            </article>
            <article>
              <span>Suggested</span>
              {normalizedSuggestedHex ? (
                <PaintField
                  hex={normalizedSuggestedHex}
                  className="correction-swatch"
                  label={`Suggested color ${normalizedSuggestedHex}`}
                />
              ) : (
                <div className="correction-swatch correction-swatch--empty" aria-hidden="true" />
              )}
              <strong>{normalizedSuggestedHex ?? "—"}</strong>
            </article>
            <div className="correction-delta">
              <span>Perceptual distance</span>
              <strong>{similarity ? similarity.deltaE.toFixed(3) : "—"}</strong>
              <small>ΔE00 from current</small>
            </div>
          </section>

          <div className="correction-optional-fields">
            <div className="field-group">
              <label className="field-label" htmlFor="correction-source-url">
                Source URL · optional
              </label>
              <input
                id="correction-source-url"
                className="text-input"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://…"
                value={sourceUrl}
                aria-invalid={sourceError ? "true" : undefined}
                aria-describedby="correction-source-help"
                onChange={(event) => {
                  setSourceUrl(event.target.value);
                  setCopyState("idle");
                }}
              />
              <span
                id="correction-source-help"
                className="field-helper"
                data-error={Boolean(sourceError)}
              >
                {sourceError ?? "A supporting public reference, if available."}
              </span>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="correction-explanation">
                Explanation · optional
              </label>
              <textarea
                id="correction-explanation"
                className="text-input correction-explanation"
                rows={4}
                placeholder="What should change, and why?"
                value={explanation}
                onChange={(event) => {
                  setExplanation(event.target.value);
                  setCopyState("idle");
                }}
              />
            </div>
          </div>

          <footer className="correction-dialog__footer">
            <p>
              Copy the structured proposal, then paste it into your preferred
              communication channel.
            </p>
            <div>
              <button
                type="button"
                className="button button--secondary"
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button--primary correction-copy"
                data-state={copyState}
                disabled={copyState === "copying"}
                aria-busy={copyState === "copying"}
              >
                <span aria-live="polite">{copyLabel}</span>
              </button>
            </div>
          </footer>
        </form>
      </dialog>
    </>
  );
}
