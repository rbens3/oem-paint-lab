import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { normalizeHex } from "../lib/color";
import type { CustomColor, CustomColorInput, HexColor } from "../types";
import PaintField from "./PaintField";

interface CustomColorDialogProps {
  initialHex: HexColor;
  initialColor?: CustomColor;
  triggerLabel: string;
  triggerClassName?: string;
  onSave: (input: CustomColorInput) => void;
}

export default function CustomColorDialog({
  initialHex,
  initialColor,
  triggerLabel,
  triggerClassName = "button button--secondary",
  onSave,
}: CustomColorDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [name, setName] = useState("");
  const [hex, setHex] = useState<string>(initialHex);
  const [note, setNote] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [hexTouched, setHexTouched] = useState(false);

  const normalizedHex = normalizeHex(hex);
  const nameError = nameTouched && !name.trim() ? "Name is required." : null;
  const hexError = hex.trim()
    ? normalizedHex
      ? null
      : "Enter a six-digit HEX value, with or without #."
    : hexTouched
      ? "HEX is required."
      : null;

  const resetForm = () => {
    setName(initialColor?.name ?? "");
    setHex(initialHex);
    setNote(initialColor?.note ?? "");
    setNameTouched(false);
    setHexTouched(false);
  };

  const openDialog = () => {
    resetForm();
    dialogRef.current?.showModal();
    nameRef.current?.focus();
  };

  const closeDialog = () => dialogRef.current?.close();

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameTouched(true);
    setHexTouched(true);

    if (!name.trim() || !normalizedHex) {
      return;
    }

    onSave({
      name: name.trim(),
      hex: normalizedHex,
      ...(note.trim() && { note: note.trim() }),
    });
    closeDialog();
  };

  const title = initialColor ? "Edit custom color" : "Add custom color";
  const submitLabel = initialColor ? "Save changes" : "Add color";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        onClick={openDialog}
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="correction-dialog color-editor-dialog"
        aria-labelledby={`${id}-title`}
        onClick={handleBackdropClick}
        onClose={() => triggerRef.current?.focus()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
          }
        }}
      >
        <form
          className="correction-dialog__surface color-editor-dialog__surface"
          onSubmit={handleSubmit}
        >
          <header className="correction-dialog__header">
            <div>
              <span className="correction-dialog__eyebrow">My Colors</span>
              <h2 id={`${id}-title`}>{title}</h2>
              <p>Name the color and store its source HEX value locally.</p>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Close custom color dialog"
              onClick={closeDialog}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="color-editor-dialog__grid">
            <div className="color-editor-dialog__fields">
              <div className="field-group">
                <label className="field-label" htmlFor={`${id}-name`}>
                  Name · required
                </label>
                <input
                  ref={nameRef}
                  id={`${id}-name`}
                  className="text-input"
                  type="text"
                  autoComplete="off"
                  maxLength={120}
                  placeholder="Bennett Purple"
                  value={name}
                  aria-invalid={nameError ? "true" : undefined}
                  aria-describedby={`${id}-name-help`}
                  onChange={(event) => setName(event.target.value)}
                  onBlur={() => setNameTouched(true)}
                />
                <span
                  id={`${id}-name-help`}
                  className="field-helper"
                  data-error={Boolean(nameError)}
                >
                  {nameError ?? "Use your own descriptive name."}
                </span>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor={`${id}-hex`}>
                  HEX · required
                </label>
                <input
                  id={`${id}-hex`}
                  className="text-input color-editor-dialog__hex"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="#6B8BC0"
                  value={hex}
                  aria-invalid={hexError ? "true" : undefined}
                  aria-describedby={`${id}-hex-help`}
                  onChange={(event) => setHex(event.target.value)}
                  onBlur={() => {
                    setHexTouched(true);
                    if (normalizedHex) {
                      setHex(normalizedHex);
                    }
                  }}
                />
                <span
                  id={`${id}-hex-help`}
                  className="field-helper"
                  data-error={Boolean(hexError)}
                >
                  {hexError ?? "Six hexadecimal digits; # is optional."}
                </span>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor={`${id}-note`}>
                  Note · optional
                </label>
                <textarea
                  id={`${id}-note`}
                  className="text-input color-editor-dialog__note"
                  rows={4}
                  maxLength={2000}
                  placeholder="A useful reminder about this color."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>

            <div className="color-editor-dialog__preview">
              <span>Live color</span>
              {normalizedHex ? (
                <PaintField
                  hex={normalizedHex}
                  className="color-editor-dialog__swatch"
                  label={`Custom color preview ${normalizedHex}`}
                >
                  <strong>{normalizedHex}</strong>
                </PaintField>
              ) : (
                <div
                  className="color-editor-dialog__swatch color-editor-dialog__swatch--empty"
                  aria-label="Enter a valid HEX value to preview the color"
                />
              )}
            </div>
          </div>

          <footer className="correction-dialog__footer">
            <p>Saved locally in this browser. No color is uploaded or shared.</p>
            <div>
              <button
                type="button"
                className="button button--secondary"
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button type="submit" className="button button--primary">
                {submitLabel}
              </button>
            </div>
          </footer>
        </form>
      </dialog>
    </>
  );
}
