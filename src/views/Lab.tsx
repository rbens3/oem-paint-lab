import { useEffect, useMemo, useState } from "react";
import CopyButton from "../components/CopyButton";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import {
  hexToHsb,
  hexToRgb,
  hsbToHex,
  normalizeHex,
} from "../lib/color";
import { FLAKE_TYPES, generateFlake } from "../lib/finishes";
import { findSimilarPaints } from "../lib/similarity";
import {
  PAINT_COLLECTION_LABELS,
  PAINT_CONFIDENCE_LABELS,
  type FlakeType,
  type HexColor,
  type PaintRecord,
} from "../types";

interface LabProps {
  selectedHex: HexColor;
  selectedPaint: PaintRecord | null;
  onHexChange: (hex: HexColor) => void;
  onAnalyzePaint: (paint: PaintRecord) => void;
  onInspectPaint: (paint: PaintRecord) => void;
}

interface ValueRowProps {
  label: string;
  value: string;
}

function ValueRow({ label, value }: ValueRowProps) {
  return (
    <div className="value-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function Lab({
  selectedHex,
  selectedPaint,
  onHexChange,
  onAnalyzePaint,
  onInspectPaint,
}: LabProps) {
  const [hexDraft, setHexDraft] = useState(selectedHex.slice(1));
  const [hexTouched, setHexTouched] = useState(false);
  const [flakeType, setFlakeType] = useState<FlakeType>("silver");

  useEffect(() => {
    setHexDraft(selectedHex.slice(1));
  }, [selectedHex]);

  const rgb = hexToRgb(selectedHex);
  const hsb = hexToHsb(selectedHex);
  const nearestPaints = useMemo(
    () => findSimilarPaints(selectedHex, paints, 6),
    [selectedHex],
  );

  if (!rgb || !hsb) {
    return null;
  }

  const flake = generateFlake(hsb, flakeType);
  const flakeHex = hsbToHex(flake.h, flake.s, flake.b);
  const hexInvalid = hexTouched && hexDraft.length !== 6;

  const updateHexDraft = (value: string) => {
    const clean = value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase();
    setHexDraft(clean);

    if (clean.length === 6) {
      const normalized = normalizeHex(clean);
      if (normalized) {
        onHexChange(normalized);
      }
    }
  };

  const hueDegrees = Math.round(hsb.h * 360);
  const saturationPercent = Math.round(hsb.s * 100);
  const brightnessPercent = Math.round(hsb.b * 100);
  return (
    <div className="view lab-view">
      <section className="lab-intro reveal" aria-labelledby="lab-title">
        <div className="lab-intro__identity">
          <h1 id="lab-title">OEM Paint Lab</h1>
          <p>
            Analyze a digital color, translate it into useful values, and locate the
            closest references in a 173-record paint library.
          </p>
        </div>
      </section>

      <section className="lab-workbench reveal" aria-label="Color analysis workbench">
        <div className="lab-color-stage">
          <PaintField
            hex={selectedHex}
            className="lab-color-preview"
            label={`Live preview of ${selectedHex}`}
          >
            <div className="lab-color-preview__topline">
              <div className="lab-color-preview__identity">
                <span>{selectedPaint?.brand ?? "Custom sample"}</span>
                <strong>{selectedPaint?.name ?? "Custom color"}</strong>
              </div>
              <span className="lab-color-preview__confidence">
                {selectedPaint
                  ? PAINT_CONFIDENCE_LABELS[selectedPaint.confidence]
                  : "Custom sample"}
              </span>
            </div>
            <div className="lab-color-preview__value">
              <span>{selectedHex}</span>
              <CopyButton value={selectedHex} label="Copy HEX" />
            </div>
          </PaintField>

          <div className="hex-control">
            <div className="field-group">
              <label className="field-label" htmlFor="lab-hex-input">
                HEX value
              </label>
              <div className="hex-input-row">
                <span className="hex-input-prefix" aria-hidden="true">
                  #
                </span>
                <input
                  id="lab-hex-input"
                  className="text-input hex-input"
                  type="text"
                  inputMode="text"
                  value={hexDraft}
                  onChange={(event) => updateHexDraft(event.target.value)}
                  onBlur={() => setHexTouched(true)}
                  onFocus={() => setHexTouched(false)}
                  aria-invalid={hexInvalid}
                  aria-describedby="lab-hex-help"
                  maxLength={6}
                  autoComplete="off"
                  spellCheck={false}
                />
                <label className="native-color-control" aria-label="Choose a color">
                  <input
                    type="color"
                    value={selectedHex}
                    onChange={(event) => {
                      const normalized = normalizeHex(event.target.value);
                      if (normalized) {
                        onHexChange(normalized);
                      }
                    }}
                  />
                  <span>Pick color</span>
                </label>
              </div>
              <p
                id="lab-hex-help"
                className="field-helper"
                data-error={hexInvalid}
              >
                {hexInvalid
                  ? "The HEX value is incomplete. Enter six hexadecimal characters."
                  : "Enter six characters; the analysis updates as soon as the value is valid."}
              </p>
            </div>
          </div>
        </div>

        <div className="analysis-panel">
          <div className="analysis-panel__heading">
            <h2>Color values</h2>
            <p>Three representations of the same sampled color.</p>
          </div>

          <div className="value-group">
            <div className="value-group__heading">
              <h3>RGB</h3>
              <CopyButton value={`${rgb.r}, ${rgb.g}, ${rgb.b}`} label="Copy RGB" />
            </div>
            <ValueRow label="R" value={String(rgb.r)} />
            <ValueRow label="G" value={String(rgb.g)} />
            <ValueRow label="B" value={String(rgb.b)} />
          </div>

          <div className="value-group">
            <div className="value-group__heading">
              <h3>HSB / HSV</h3>
              <CopyButton
                value={`${hueDegrees}°, ${saturationPercent}%, ${brightnessPercent}%`}
                label="Copy HSB"
              />
            </div>
            <ValueRow label="Hue" value={`${hueDegrees}°`} />
            <ValueRow label="Saturation" value={`${saturationPercent}%`} />
            <ValueRow label="Brightness" value={`${brightnessPercent}%`} />
          </div>

          <div className="value-group value-group--dark">
            <div className="value-group__heading">
              <h3>Normalized HSB · 0–1</h3>
              <CopyButton
                value={`${hsb.h.toFixed(3)}, ${hsb.s.toFixed(3)}, ${hsb.b.toFixed(3)}`}
                label="Copy normalized"
              />
            </div>
            <ValueRow label="H" value={hsb.h.toFixed(3)} />
            <ValueRow label="S" value={hsb.s.toFixed(3)} />
            <ValueRow label="B" value={hsb.b.toFixed(3)} />
          </div>
        </div>
      </section>

      <section className="matches-section" aria-labelledby="matches-title">
        <div className="section-heading">
          <div>
            <h2 id="matches-title">Nearest paint matches</h2>
            <p>
              Ranked with CIEDE2000 perceptual distance. Lower Delta E values are
              closer.
            </p>
          </div>
          <span>{nearestPaints.length} closest records</span>
        </div>

        <div className="match-list">
          {nearestPaints.map(({ paint, deltaE }, index) => (
            <article className="match-row" key={paint.id}>
              <button
                type="button"
                className="match-row__select"
                onClick={() => onInspectPaint(paint)}
                aria-label={`View details for ${paint.brand} ${paint.name}`}
              >
                <PaintField
                  hex={paint.hex}
                  className="match-row__swatch"
                  label={`${paint.name} color swatch`}
                />
                <span className="match-row__rank">{String(index + 1).padStart(2, "0")}</span>
                <span className="match-row__identity">
                  <strong>{paint.name}</strong>
                  <span>
                    {paint.collection === "other"
                      ? "Other collection"
                      : `${paint.brand} · ${PAINT_COLLECTION_LABELS[paint.collection]}`}
                  </span>
                </span>
                <span className="match-row__hex">{paint.hex}</span>
                <span className="match-row__distance">
                  <small>ΔE00</small>
                  <strong>{deltaE.toFixed(2)}</strong>
                </span>
              </button>
              <div className="match-row__actions">
                <button
                  type="button"
                  className="button button--secondary match-row__lab-action"
                  onClick={() => onAnalyzePaint(paint)}
                >
                  Open in Lab
                </button>
                <CopyButton value={paint.hex} label="Copy HEX" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="finish-section" aria-labelledby="finish-title">
        <div className="section-heading section-heading--light">
          <div>
            <h2 id="finish-title">Finish Lab</h2>
            <p>
              Build a practical flake starting point from the current base color.
            </p>
          </div>
          <span>Heuristic finish model</span>
        </div>

        <div className="finish-workbench">
          <div className="finish-preview">
            <PaintField
              hex={selectedHex}
              className="finish-preview__field"
              label={`Base color ${selectedHex}`}
            >
              <span>Base</span>
              <strong>{selectedHex}</strong>
            </PaintField>
            <PaintField
              hex={flakeHex}
              className="finish-preview__field"
              label={`${flakeType} flake color ${flakeHex}`}
            >
              <span>{flakeType} flake</span>
              <strong>{flakeHex}</strong>
            </PaintField>
          </div>

          <div className="finish-controls">
            <div className="finish-tabs" aria-label="Flake type">
              {FLAKE_TYPES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="finish-tab"
                  aria-pressed={flakeType === option.id}
                  onClick={() => setFlakeType(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="finish-description">
              {FLAKE_TYPES.find((option) => option.id === flakeType)?.desc}. Use this
              as a controlled starting point, then validate under the target lighting
              model.
            </p>
            <div className="finish-values">
              <div className="finish-values__heading">
                <span>Finish values</span>
                <CopyButton
                  value={`${flakeHex}, ${flake.h.toFixed(3)}, ${flake.s.toFixed(3)}, ${flake.b.toFixed(3)}`}
                  label="Copy finish"
                />
              </div>
              <ValueRow label="Flake HEX" value={flakeHex} />
              <ValueRow label="H" value={flake.h.toFixed(3)} />
              <ValueRow label="S" value={flake.s.toFixed(3)} />
              <ValueRow label="B" value={flake.b.toFixed(3)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
