import { useId, useRef } from "react";
import type { CustomColor } from "../types";

interface DeleteCustomColorDialogProps {
  color: CustomColor;
  onDelete: (color: CustomColor) => void;
}

export default function DeleteCustomColorDialog({
  color,
  onDelete,
}: DeleteCustomColorDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const closeDialog = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="button button--secondary custom-delete-trigger"
        onClick={() => dialogRef.current?.showModal()}
      >
        Delete
      </button>
      <dialog
        ref={dialogRef}
        className="correction-dialog delete-color-dialog"
        aria-labelledby={`${id}-title`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDialog();
          }
        }}
        onClose={() => triggerRef.current?.focus()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
          }
        }}
      >
        <div className="correction-dialog__surface delete-color-dialog__surface">
          <header className="correction-dialog__header">
            <div>
              <span className="correction-dialog__eyebrow">My Colors</span>
              <h2 id={`${id}-title`}>Delete this custom color?</h2>
              <p>
                {color.name} will be removed from this browser. Archive paints are
                not affected.
              </p>
            </div>
          </header>
          <footer className="correction-dialog__footer delete-color-dialog__footer">
            <p>This cannot be undone after the browser storage is updated.</p>
            <div>
              <button
                type="button"
                className="button button--secondary"
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={() => {
                  closeDialog();
                  onDelete(color);
                }}
              >
                Delete color
              </button>
            </div>
          </footer>
        </div>
      </dialog>
    </>
  );
}
