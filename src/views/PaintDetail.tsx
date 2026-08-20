import { useMemo } from "react";
import CopyButton from "../components/CopyButton";
import CorrectionDialog from "../components/CorrectionDialog";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import { hexToHsb, hexToRgb } from "../lib/color";
import { getPaintContextLabel, getPaintDisplayGroup } from "../lib/paint";
import { findSimilarPaints } from "../lib/similarity";
import {
  PAINT_COLLECTION_LABELS,
  PAINT_COLOR_FAMILY_LABELS,
  PAINT_CONFIDENCE_LABELS,
  PAINT_EFFECT_LABELS,
  PAINT_ROLE_LABELS,
  PAINT_SERIES_LABELS,
  PAINT_SHEEN_LABELS,
  PAINT_SOURCE_TYPE_LABELS,
  type PaintRecord,
} from "../types";

interface PaintDetailProps {
  paint: PaintRecord;
  backLabel: string;
  onBack: () => void;
  onOpenInLab: (paint: PaintRecord) => void;
  onComparePaint: (paint: PaintRecord) => void;
  onInspectPaint: (paint: PaintRecord) => void;
  isSaved: boolean;
  onToggleSaved: () => void;
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="paint-detail-value">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function PaintDetail({
  paint,
  backLabel,
  onBack,
  onOpenInLab,
  onComparePaint,
  onInspectPaint,
  isSaved,
  onToggleSaved,
}: PaintDetailProps) {
  const rgb = hexToRgb(paint.hex);
  const hsb = hexToHsb(paint.hex);
  const relatedPaints = useMemo(
    () => findSimilarPaints(paint.hex, paints, 6).filter((match) => match.paint.id !== paint.id).slice(0, 5),
    [paint],
  );

  if (!rgb || !hsb) return null;

  const rgbValue = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  const hsbValue = `${Math.round(hsb.h * 360)}°, ${Math.round(hsb.s * 100)}%, ${Math.round(hsb.b * 100)}%`;
  const normalizedValue = `${hsb.h.toFixed(3)}, ${hsb.s.toFixed(3)}, ${hsb.b.toFixed(3)}`;
  const metadata: Array<[string, string]> = [
    ["Collection", PAINT_COLLECTION_LABELS[paint.collection]],
  ];

  if (paint.collection === "oem") {
    if (paint.manufacturer) metadata.push(["Manufacturer", paint.manufacturer]);
    if (paint.paintCode) metadata.push(["Paint code", paint.paintCode]);
  } else if (paint.collection === "motorsport") {
    if (paint.series) metadata.push(["Series", PAINT_SERIES_LABELS[paint.series]]);
    if (paint.season) metadata.push(["Season", String(paint.season)]);
    if (paint.team) metadata.push(["Team", paint.team]);
    if (paint.role) metadata.push(["Color role", PAINT_ROLE_LABELS[paint.role]]);
  } else if (paint.manufacturer) {
    metadata.push(["Reference group", paint.manufacturer]);
  }

  if (paint.effect) metadata.push(["Effect", PAINT_EFFECT_LABELS[paint.effect]]);
  if (paint.sheen) metadata.push(["Sheen", PAINT_SHEEN_LABELS[paint.sheen]]);
  metadata.push(
    ["Color family", PAINT_COLOR_FAMILY_LABELS[paint.colorFamily]],
    ["Provenance", PAINT_CONFIDENCE_LABELS[paint.confidence]],
  );

  return (
    <div className="view paint-detail-view">
      <section className="paint-detail-intro reveal" aria-labelledby="paint-detail-title">
        <button type="button" className="paint-detail-back" onClick={onBack}>{backLabel}</button>
        <div className="paint-detail-intro__identity">
          <span>{getPaintContextLabel(paint)}</span>
          <h1 id="paint-detail-title">{paint.name}</h1>
          <p>A structured digital reference with explicit provenance, technical values, and perceptually related colors.</p>
        </div>
      </section>

      <section className="paint-detail-workbench" aria-label={`${paint.name} record`}>
        <div className="paint-detail-stage">
          <PaintField hex={paint.hex} className="paint-detail-field" label={`${getPaintDisplayGroup(paint)} ${paint.name} color field`}>
            <div className="paint-detail-field__topline">
              <div>
                <span>{getPaintDisplayGroup(paint)}</span>
                <strong>{paint.name}</strong>
              </div>
              <span>{PAINT_CONFIDENCE_LABELS[paint.confidence]}</span>
            </div>
            <div className="paint-detail-field__value">
              <strong>{paint.hex}</strong>
              <CopyButton value={paint.hex} label="Copy HEX" />
            </div>
          </PaintField>

          <div className="paint-detail-actions" aria-label="Paint actions">
            <button type="button" className="button button--primary" onClick={() => onOpenInLab(paint)}>Open in Lab</button>
            <button type="button" className="button button--secondary" onClick={() => onComparePaint(paint)}>Send to Compare</button>
            <button type="button" className="button button--secondary" onClick={onToggleSaved} aria-pressed={isSaved}>
              {isSaved ? "Remove from My Colors" : "Save to My Colors"}
            </button>
          </div>
        </div>

        <aside className="paint-detail-readouts" aria-labelledby="detail-values-title">
          <div className="paint-detail-readouts__heading">
            <h2 id="detail-values-title">Color values</h2>
            <p>Digital representations of the stored sRGB value.</p>
          </div>
          <div className="paint-detail-value-group">
            <div className="paint-detail-value-group__heading"><h3>RGB</h3><CopyButton value={rgbValue} label="Copy RGB" /></div>
            <DetailValue label="R" value={String(rgb.r)} />
            <DetailValue label="G" value={String(rgb.g)} />
            <DetailValue label="B" value={String(rgb.b)} />
          </div>
          <div className="paint-detail-value-group">
            <div className="paint-detail-value-group__heading"><h3>HSB / HSV</h3><CopyButton value={hsbValue} label="Copy HSB" /></div>
            <DetailValue label="Hue" value={`${Math.round(hsb.h * 360)}°`} />
            <DetailValue label="Saturation" value={`${Math.round(hsb.s * 100)}%`} />
            <DetailValue label="Brightness" value={`${Math.round(hsb.b * 100)}%`} />
          </div>
          <div className="paint-detail-value-group paint-detail-value-group--normalized">
            <div className="paint-detail-value-group__heading"><h3>Normalized HSB · 0–1</h3><CopyButton value={normalizedValue} label="Copy normalized" /></div>
            <DetailValue label="H" value={hsb.h.toFixed(3)} />
            <DetailValue label="S" value={hsb.s.toFixed(3)} />
            <DetailValue label="B" value={hsb.b.toFixed(3)} />
          </div>
        </aside>
      </section>

      <section className="paint-detail-metadata" aria-labelledby="record-metadata-title">
        <div className="paint-detail-section-heading">
          <h2 id="record-metadata-title">Record metadata</h2>
          <p>Fields follow the schema for this paint collection; unsupported values are not inferred.</p>
        </div>
        <dl className="paint-detail-specs">
          {metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </section>

      <section className="paint-detail-provenance" aria-labelledby="provenance-title">
        <div>
          <h2 id="provenance-title">Provenance</h2>
          <p>How this digital reference is sourced and interpreted.</p>
          <CorrectionDialog paint={paint} />
        </div>
        <dl>
          <div><dt>Provenance</dt><dd>{PAINT_CONFIDENCE_LABELS[paint.confidence]}</dd></div>
          <div>
            <dt>Source</dt>
            <dd>
              {paint.sourceUrl ? (
                <a href={paint.sourceUrl} target="_blank" rel="noreferrer">{paint.sourceName ?? "Open source reference"}</a>
              ) : (paint.sourceName ?? "Not recorded")}
            </dd>
          </div>
          <div><dt>Source type</dt><dd>{PAINT_SOURCE_TYPE_LABELS[paint.sourceType]}</dd></div>
          <div><dt>Interpretation</dt><dd>This value is a screen reference, not a physical paint specification.</dd></div>
          {paint.derivationNote ? <div><dt>Derivation note</dt><dd>{paint.derivationNote}</dd></div> : null}
        </dl>
      </section>

      <section className="paint-detail-related" aria-labelledby="related-paints-title">
        <div className="paint-detail-section-heading">
          <h2 id="related-paints-title">Closest related paints</h2>
          <p>CIEDE2000 distance from this stored digital reference.</p>
        </div>
        <div className="paint-detail-related__list">
          {relatedPaints.map(({ paint: related, deltaE }) => (
            <article className="paint-detail-related__row" key={related.id}>
              <button type="button" className="paint-detail-related__select" onClick={() => onInspectPaint(related)} aria-label={`View details for ${getPaintDisplayGroup(related)} ${related.name}`}>
                <PaintField hex={related.hex} className="paint-detail-related__swatch" label={`${related.name} color swatch`} />
                <span><strong>{related.name}</strong><small>{getPaintDisplayGroup(related)} · {related.hex}</small></span>
                <span><small>ΔE00</small><strong>{deltaE.toFixed(2)}</strong></span>
              </button>
              <button type="button" className="button button--secondary" onClick={() => onOpenInLab(related)}>Open in Lab</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
