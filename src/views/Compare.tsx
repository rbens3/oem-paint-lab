import { useEffect, useMemo, useState } from "react";
import CopyButton from "../components/CopyButton";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import { hexToHsb, hexToRgb } from "../lib/color";
import { compareHexColors } from "../lib/similarity";
import type { PaintRecord } from "../types";

interface CompareProps {
  selectedPaint: PaintRecord | null;
  onAnalyzePaint: (paint: PaintRecord) => void;
}

function PaintComparisonPanel({ paint }: { paint: PaintRecord }) {
  const rgb = hexToRgb(paint.hex);
  const hsb = hexToHsb(paint.hex);

  return (
    <article className="compare-panel">
      <PaintField
        hex={paint.hex}
        className="compare-panel__field"
        label={`${paint.brand} ${paint.name} color field`}
      >
        <div className="compare-panel__field-identity">
          <span>{paint.brand}</span>
          <h2>{paint.name}</h2>
        </div>
        <div className="compare-panel__field-value">
          <strong>{paint.hex}</strong>
          <CopyButton value={paint.hex} label="Copy HEX" />
        </div>
      </PaintField>
      {rgb && hsb ? (
        <dl className="compare-specs">
          <div>
            <dt>RGB</dt>
            <dd>{rgb.r} · {rgb.g} · {rgb.b}</dd>
          </div>
          <div>
            <dt>HSB</dt>
            <dd>{Math.round(hsb.h * 360)}° · {Math.round(hsb.s * 100)}% · {Math.round(hsb.b * 100)}%</dd>
          </div>
          <div>
            <dt>Normalized</dt>
            <dd>{hsb.h.toFixed(3)} · {hsb.s.toFixed(3)} · {hsb.b.toFixed(3)}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

export default function Compare({ selectedPaint, onAnalyzePaint }: CompareProps) {
  const initialLeft = selectedPaint?.id ?? 2;
  const [leftId, setLeftId] = useState(initialLeft);
  const [rightId, setRightId] = useState(3);

  useEffect(() => {
    if (selectedPaint) {
      setLeftId(selectedPaint.id);
    }
  }, [selectedPaint]);

  const leftPaint = paints.find((paint) => paint.id === leftId) ?? paints[0];
  const rightPaint = paints.find((paint) => paint.id === rightId) ?? paints[1];
  const comparison = useMemo(
    () => compareHexColors(leftPaint.hex, rightPaint.hex),
    [leftPaint.hex, rightPaint.hex],
  );

  return (
    <div className="view compare-view">
      <section className="view-intro reveal">
        <div>
          <h1>Compare</h1>
          <p>
            Place two library records side by side and measure their perceptual
            separation with CIEDE2000.
          </p>
        </div>
      </section>

      <section className="compare-selectors" aria-label="Choose paints to compare">
        <label className="field-group">
          <span className="field-label">Paint A</span>
          <select
            className="select-input"
            value={leftId}
            onChange={(event) => setLeftId(Number(event.target.value))}
          >
            {paints.map((paint) => (
              <option key={paint.id} value={paint.id}>
                {paint.brand} — {paint.name}
              </option>
            ))}
          </select>
        </label>
        <div className="compare-selector-center">
          <output
            className="compare-selector-delta"
            aria-label="Current Delta E 2000 difference"
            aria-live="polite"
          >
            <span>ΔE00</span>
            <strong>{comparison?.deltaE.toFixed(2) ?? "—"}</strong>
          </output>
          <button
            type="button"
            className="compare-swap"
            onClick={() => {
              setLeftId(rightId);
              setRightId(leftId);
            }}
            aria-label="Swap compared paints"
          >
            Swap
          </button>
        </div>
        <label className="field-group">
          <span className="field-label">Paint B</span>
          <select
            className="select-input"
            value={rightId}
            onChange={(event) => setRightId(Number(event.target.value))}
          >
            {paints.map((paint) => (
              <option key={paint.id} value={paint.id}>
                {paint.brand} — {paint.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="compare-grid" aria-label="Paint comparison">
        <PaintComparisonPanel paint={leftPaint} />
        <PaintComparisonPanel paint={rightPaint} />
      </section>

      <section className="comparison-result" aria-labelledby="comparison-result-title">
        <div>
          <h2 id="comparison-result-title">Perceptual distance</h2>
          <p>
            Delta E is calculated after converting both sRGB values to CIELAB using
            the D65 reference white.
          </p>
        </div>
        <div className="comparison-result__value">
          <span>ΔE00</span>
          <strong>{comparison?.deltaE.toFixed(3) ?? "—"}</strong>
        </div>
        <div className="comparison-result__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => onAnalyzePaint(leftPaint)}
          >
            Analyze first paint
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => onAnalyzePaint(rightPaint)}
          >
            Analyze second paint
          </button>
        </div>
      </section>
    </div>
  );
}
