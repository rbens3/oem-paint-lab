import CustomColorDialog from "../components/CustomColorDialog";
import PaintField from "../components/PaintField";
import { getPaintDisplayGroup } from "../lib/paint";
import {
  PAINT_CONFIDENCE_LABELS,
  PAINT_EFFECT_LABELS,
  PAINT_SHEEN_LABELS,
  type CustomColor,
  type CustomColorInput,
  type HexColor,
  type MyColorsStorageStatus,
  type PaintRecord,
} from "../types";

interface MyColorsProps {
  savedPaints: PaintRecord[];
  customColors: CustomColor[];
  initialHex: HexColor;
  storageStatus: MyColorsStorageStatus;
  onOpenLibrary: () => void;
  onInspectPaint: (paint: PaintRecord) => void;
  onOpenPaintInLab: (paint: PaintRecord) => void;
  onComparePaint: (paint: PaintRecord) => void;
  onRemovePaint: (paint: PaintRecord) => void;
  onCreateCustom: (input: CustomColorInput) => void;
  onInspectCustom: (color: CustomColor) => void;
  onOpenCustomInLab: (color: CustomColor) => void;
  onCompareCustom: (color: CustomColor) => void;
}

const storageMessage: Record<MyColorsStorageStatus, string> = {
  ready: "Saved locally in this browser/device.",
  invalid: "Some local data could not be read. Valid colors remain available locally.",
  unavailable: "Local saving is unavailable. Changes will last until this page closes.",
};

export default function MyColors({
  savedPaints,
  customColors,
  initialHex,
  storageStatus,
  onOpenLibrary,
  onInspectPaint,
  onOpenPaintInLab,
  onComparePaint,
  onRemovePaint,
  onCreateCustom,
  onInspectCustom,
  onOpenCustomInLab,
  onCompareCustom,
}: MyColorsProps) {
  return (
    <div className="view my-colors-view">
      <section className="view-intro my-colors-intro reveal">
        <div>
          <h1>My Colors</h1>
          <p>
            Keep archive paints close and build a personal palette of custom digital
            colors.
          </p>
        </div>
        <span className="my-colors-storage" data-status={storageStatus} role="status">
          {storageMessage[storageStatus]}
        </span>
      </section>

      <section className="my-colors-section" aria-labelledby="saved-paints-title">
        <div className="section-heading">
          <div>
            <h2 id="saved-paints-title">Saved paints</h2>
            <p>Canonical records kept from the curated Library.</p>
          </div>
          <span>{savedPaints.length} saved</span>
        </div>

        {savedPaints.length ? (
          <div className="my-colors-grid">
            {savedPaints.map((paint) => (
              <article className="my-color-card" key={paint.id}>
                <a
                  className="my-color-card__link"
                  href={`#/paint/${paint.id}`}
                  aria-label={`View ${getPaintDisplayGroup(paint)} ${paint.name} details`}
                  onClick={(event) => {
                    event.preventDefault();
                    onInspectPaint(paint);
                  }}
                >
                  <PaintField
                    hex={paint.hex}
                    className="my-color-card__field"
                    label={`${getPaintDisplayGroup(paint)} ${paint.name} saved paint`}
                  >
                    <div className="my-color-card__topline">
                      <span>{getPaintDisplayGroup(paint)}</span>
                      <span>{PAINT_CONFIDENCE_LABELS[paint.confidence]}</span>
                    </div>
                    <h3>{paint.name}</h3>
                    <div className="my-color-card__footer">
                      <strong>{paint.hex}</strong>
                      {paint.effect || paint.sheen ? (
                        <span>
                          {[
                            paint.effect ? PAINT_EFFECT_LABELS[paint.effect] : null,
                            paint.sheen ? PAINT_SHEEN_LABELS[paint.sheen] : null,
                          ].filter(Boolean).join(" · ")}
                        </span>
                      ) : null}
                    </div>
                  </PaintField>
                </a>
                <div className="my-color-card__actions" aria-label={`${paint.name} actions`}>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => onOpenPaintInLab(paint)}
                  >
                    Lab
                  </button>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => onComparePaint(paint)}
                  >
                    Compare
                  </button>
                  <button
                    type="button"
                    className="text-action my-color-card__remove"
                    onClick={() => onRemovePaint(paint)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="my-colors-empty">
            <div>
              <h3>Save paints from the Library to keep them here.</h3>
              <p>Saved archive paints remain linked to their canonical records.</p>
            </div>
            <button
              type="button"
              className="button button--secondary"
              onClick={onOpenLibrary}
            >
              Open Library
            </button>
          </div>
        )}
      </section>

      <section className="my-colors-section" aria-labelledby="custom-colors-title">
        <div className="section-heading my-colors-section-heading">
          <div>
            <div className="my-colors-section-heading__title">
              <h2 id="custom-colors-title">Custom colors</h2>
              <CustomColorDialog
                initialHex={initialHex}
                triggerLabel="Add custom color"
                triggerClassName="button button--secondary"
                onSave={onCreateCustom}
              />
            </div>
            <p>Your own named HEX references, analyzed with Paint Lab tools.</p>
          </div>
        </div>

        {customColors.length ? (
          <div className="my-colors-grid">
            {customColors.map((color) => (
              <article className="my-color-card" key={color.id}>
                <a
                  className="my-color-card__link"
                  href={`#/my-colors/custom/${encodeURIComponent(color.id)}`}
                  aria-label={`View ${color.name} custom color details`}
                  onClick={(event) => {
                    event.preventDefault();
                    onInspectCustom(color);
                  }}
                >
                  <PaintField
                    hex={color.hex}
                    className="my-color-card__field"
                    label={`${color.name} custom color`}
                  >
                    <div className="my-color-card__topline">
                      <span>Custom</span>
                      <span>My Colors</span>
                    </div>
                    <h3>{color.name}</h3>
                    <div className="my-color-card__footer">
                      <strong>{color.hex}</strong>
                    </div>
                  </PaintField>
                </a>
                <div className="my-color-card__actions" aria-label={`${color.name} actions`}>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => onOpenCustomInLab(color)}
                  >
                    Lab
                  </button>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => onCompareCustom(color)}
                  >
                    Compare
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="my-colors-empty">
            <div>
              <h3>Create a color to start your personal palette.</h3>
              <p>Name a HEX value now, then reopen it in Lab or Compare later.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
