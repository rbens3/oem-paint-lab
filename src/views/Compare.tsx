import { useEffect, useMemo, useState } from "react";
import CopyButton from "../components/CopyButton";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import { hexToHsb, hexToRgb } from "../lib/color";
import { compareHexColors } from "../lib/similarity";
import {
  PAINT_COLLECTIONS,
  PAINT_COLLECTION_LABELS,
  type ColorTarget,
  type CustomColor,
} from "../types";

interface CompareProps {
  selectedTarget: ColorTarget | null;
  customColors: CustomColor[];
  onAnalyzeTarget: (target: ColorTarget) => void;
}

const getTargetKey = (target: ColorTarget) =>
  target.kind === "archive"
    ? `archive:${target.paint.id}`
    : `custom:${target.color.id}`;

const getTargetHex = (target: ColorTarget) =>
  target.kind === "archive" ? target.paint.hex : target.color.hex;

const resolveTarget = (
  key: string,
  customColors: CustomColor[],
): ColorTarget | null => {
  const [kind, id] = key.split(":");
  if (kind === "archive") {
    const paint = paints.find((item) => item.id === Number(id));
    return paint ? { kind: "archive", paint } : null;
  }
  if (kind === "custom") {
    const color = customColors.find((item) => item.id === id);
    return color ? { kind: "custom", color } : null;
  }
  return null;
};

function ColorOptions({ customColors }: { customColors: CustomColor[] }) {
  return (
    <>
      {customColors.length ? (
        <optgroup label="My Colors · Custom">
          {customColors.map((color) => (
            <option key={color.id} value={`custom:${color.id}`}>
              {color.name}
            </option>
          ))}
        </optgroup>
      ) : null}
      {PAINT_COLLECTIONS.map((collection) => (
        <optgroup key={collection} label={PAINT_COLLECTION_LABELS[collection]}>
          {paints
            .filter((paint) => paint.collection === collection)
            .map((paint) => (
              <option key={paint.id} value={`archive:${paint.id}`}>
                {paint.brand} — {paint.name}
              </option>
            ))}
        </optgroup>
      ))}
    </>
  );
}

function ColorComparisonPanel({ target }: { target: ColorTarget }) {
  const color = target.kind === "archive" ? target.paint : target.color;
  const rgb = hexToRgb(color.hex);
  const hsb = hexToHsb(color.hex);
  const label =
    target.kind === "archive"
      ? target.paint.collection === "other"
        ? "Other collection"
        : `${PAINT_COLLECTION_LABELS[target.paint.collection]} · ${target.paint.brand}`
      : "My Colors · Custom";

  return (
    <article className="compare-panel">
      <PaintField
        hex={color.hex}
        className="compare-panel__field"
        label={`${color.name} color field`}
      >
        <div className="compare-panel__field-identity">
          <span>{label}</span>
          <h2>{color.name}</h2>
        </div>
        <div className="compare-panel__field-value">
          <strong>{color.hex}</strong>
          <CopyButton value={color.hex} label="Copy HEX" />
        </div>
      </PaintField>
      {rgb && hsb ? (
        <dl className="compare-specs">
          <div>
            <dt>RGB</dt>
            <dd>{rgb.r} · {rgb.g} · {rgb.b}</dd>
          </div>
          <div>
            <dt>HSB / HSV</dt>
            <dd>
              {Math.round(hsb.h * 360)}° · {Math.round(hsb.s * 100)}% · {Math.round(hsb.b * 100)}%
            </dd>
          </div>
          <div>
            <dt>Normalized HSB</dt>
            <dd>{hsb.h.toFixed(3)} · {hsb.s.toFixed(3)} · {hsb.b.toFixed(3)}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

export default function Compare({
  selectedTarget,
  customColors,
  onAnalyzeTarget,
}: CompareProps) {
  const initialLeftKey = selectedTarget
    ? getTargetKey(selectedTarget)
    : "archive:2";
  const [leftKey, setLeftKey] = useState(initialLeftKey);
  const [rightKey, setRightKey] = useState("archive:3");

  useEffect(() => {
    if (selectedTarget) {
      setLeftKey(getTargetKey(selectedTarget));
    }
  }, [selectedTarget]);

  const leftTarget: ColorTarget =
    resolveTarget(leftKey, customColors) ?? { kind: "archive", paint: paints[0] };
  const rightTarget: ColorTarget =
    resolveTarget(rightKey, customColors) ?? { kind: "archive", paint: paints[1] };
  const leftHex = getTargetHex(leftTarget);
  const rightHex = getTargetHex(rightTarget);
  const comparison = useMemo(
    () => compareHexColors(leftHex, rightHex),
    [leftHex, rightHex],
  );

  return (
    <div className="view compare-view">
      <section className="view-intro reveal">
        <div>
          <h1>Compare</h1>
          <p>
            Place archive or custom colors side by side and measure their perceptual
            separation with CIEDE2000.
          </p>
        </div>
      </section>

      <section className="compare-selectors" aria-label="Choose colors to compare">
        <label className="field-group">
          <span className="field-label">Color A</span>
          <select
            className="select-input"
            value={getTargetKey(leftTarget)}
            onChange={(event) => setLeftKey(event.target.value)}
          >
            <ColorOptions customColors={customColors} />
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
              setLeftKey(getTargetKey(rightTarget));
              setRightKey(getTargetKey(leftTarget));
            }}
            aria-label="Swap compared colors"
          >
            Swap
          </button>
        </div>
        <label className="field-group">
          <span className="field-label">Color B</span>
          <select
            className="select-input"
            value={getTargetKey(rightTarget)}
            onChange={(event) => setRightKey(event.target.value)}
          >
            <ColorOptions customColors={customColors} />
          </select>
        </label>
      </section>

      <section className="compare-grid" aria-label="Color comparison">
        <ColorComparisonPanel target={leftTarget} />
        <ColorComparisonPanel target={rightTarget} />
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
            onClick={() => onAnalyzeTarget(leftTarget)}
          >
            Analyze first color
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => onAnalyzeTarget(rightTarget)}
          >
            Analyze second color
          </button>
        </div>
      </section>
    </div>
  );
}
