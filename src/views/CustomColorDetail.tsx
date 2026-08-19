import { useMemo } from "react";
import CopyButton from "../components/CopyButton";
import CustomColorDialog from "../components/CustomColorDialog";
import DeleteCustomColorDialog from "../components/DeleteCustomColorDialog";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import { hexToHsb, hexToRgb } from "../lib/color";
import { findSimilarPaints } from "../lib/similarity";
import type { CustomColor, CustomColorInput, PaintRecord } from "../types";

interface CustomColorDetailProps {
  color: CustomColor;
  onBack: () => void;
  onOpenInLab: (color: CustomColor) => void;
  onCompare: (color: CustomColor) => void;
  onEdit: (id: string, input: CustomColorInput) => void;
  onDelete: (color: CustomColor) => void;
  onInspectPaint: (paint: PaintRecord) => void;
  onOpenPaintInLab: (paint: PaintRecord) => void;
}

interface DetailValueProps {
  label: string;
  value: string;
}

function DetailValue({ label, value }: DetailValueProps) {
  return (
    <div className="paint-detail-value">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CustomColorDetail({
  color,
  onBack,
  onOpenInLab,
  onCompare,
  onEdit,
  onDelete,
  onInspectPaint,
  onOpenPaintInLab,
}: CustomColorDetailProps) {
  const rgb = hexToRgb(color.hex);
  const hsb = hexToHsb(color.hex);
  const relatedPaints = useMemo(
    () => findSimilarPaints(color.hex, paints, 5),
    [color.hex],
  );

  if (!rgb || !hsb) {
    return null;
  }

  const rgbValue = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  const hsbValue = `${Math.round(hsb.h * 360)}°, ${Math.round(hsb.s * 100)}%, ${Math.round(hsb.b * 100)}%`;
  const normalizedValue = `${hsb.h.toFixed(3)}, ${hsb.s.toFixed(3)}, ${hsb.b.toFixed(3)}`;

  return (
    <div className="view paint-detail-view custom-color-detail-view">
      <section className="paint-detail-intro reveal" aria-labelledby="custom-color-title">
        <button type="button" className="paint-detail-back" onClick={onBack}>
          Back to My Colors
        </button>
        <div className="paint-detail-intro__identity">
          <span>My Colors · Custom</span>
          <h1 id="custom-color-title">{color.name}</h1>
          <p>
            A personal digital color stored locally and analyzed against the canonical
            paint archive.
          </p>
        </div>
      </section>

      <section className="paint-detail-workbench" aria-label={`${color.name} custom color`}>
        <div className="paint-detail-stage">
          <PaintField
            hex={color.hex}
            className="paint-detail-field"
            label={`${color.name} custom color field`}
          >
            <div className="paint-detail-field__topline">
              <div>
                <span>Custom</span>
                <strong>{color.name}</strong>
              </div>
              <span>My Colors</span>
            </div>
            <div className="paint-detail-field__value">
              <strong>{color.hex}</strong>
              <CopyButton value={color.hex} label="Copy HEX" />
            </div>
          </PaintField>

          <div className="paint-detail-actions" aria-label="Custom color actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => onOpenInLab(color)}
            >
              Open in Lab
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => onCompare(color)}
            >
              Send to Compare
            </button>
            <CustomColorDialog
              initialHex={color.hex}
              initialColor={color}
              triggerLabel="Edit"
              triggerClassName="button button--secondary"
              onSave={(input) => onEdit(color.id, input)}
            />
            <DeleteCustomColorDialog color={color} onDelete={onDelete} />
          </div>
        </div>

        <aside className="paint-detail-readouts" aria-labelledby="custom-values-title">
          <div className="paint-detail-readouts__heading">
            <h2 id="custom-values-title">Color values</h2>
            <p>Derived from the custom color’s stored sRGB value.</p>
          </div>
          <div className="paint-detail-value-group">
            <div className="paint-detail-value-group__heading">
              <h3>RGB</h3>
              <CopyButton value={rgbValue} label="Copy RGB" />
            </div>
            <DetailValue label="R" value={String(rgb.r)} />
            <DetailValue label="G" value={String(rgb.g)} />
            <DetailValue label="B" value={String(rgb.b)} />
          </div>
          <div className="paint-detail-value-group">
            <div className="paint-detail-value-group__heading">
              <h3>HSB / HSV</h3>
              <CopyButton value={hsbValue} label="Copy HSB" />
            </div>
            <DetailValue label="Hue" value={`${Math.round(hsb.h * 360)}°`} />
            <DetailValue label="Saturation" value={`${Math.round(hsb.s * 100)}%`} />
            <DetailValue label="Brightness" value={`${Math.round(hsb.b * 100)}%`} />
          </div>
          <div className="paint-detail-value-group paint-detail-value-group--normalized">
            <div className="paint-detail-value-group__heading">
              <h3>Normalized HSB · 0–1</h3>
              <CopyButton value={normalizedValue} label="Copy normalized" />
            </div>
            <DetailValue label="H" value={hsb.h.toFixed(3)} />
            <DetailValue label="S" value={hsb.s.toFixed(3)} />
            <DetailValue label="B" value={hsb.b.toFixed(3)} />
          </div>
        </aside>
      </section>

      {color.note ? (
        <section className="custom-color-note" aria-labelledby="custom-note-title">
          <div className="paint-detail-section-heading">
            <h2 id="custom-note-title">Note</h2>
            <p>Personal context saved with this color.</p>
          </div>
          <p>{color.note}</p>
        </section>
      ) : null}

      <section className="paint-detail-related" aria-labelledby="custom-related-title">
        <div className="paint-detail-section-heading">
          <h2 id="custom-related-title">Nearest archive matches</h2>
          <p>CIEDE2000 distance from this custom digital color.</p>
        </div>
        <div className="paint-detail-related__list">
          {relatedPaints.map(({ paint, deltaE }) => (
            <article className="paint-detail-related__row" key={paint.id}>
              <button
                type="button"
                className="paint-detail-related__select"
                onClick={() => onInspectPaint(paint)}
                aria-label={`View details for ${paint.brand} ${paint.name}`}
              >
                <PaintField
                  hex={paint.hex}
                  className="paint-detail-related__swatch"
                  label={`${paint.name} color swatch`}
                />
                <span>
                  <strong>{paint.name}</strong>
                  <small>{paint.brand} · {paint.hex}</small>
                </span>
                <span>
                  <small>ΔE00</small>
                  <strong>{deltaE.toFixed(2)}</strong>
                </span>
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => onOpenPaintInLab(paint)}
              >
                Open in Lab
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
