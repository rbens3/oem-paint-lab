import { useMemo, useState } from "react";
import CopyButton from "../components/CopyButton";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import { hexToHsb } from "../lib/color";
import {
  PAINT_COLLECTIONS,
  PAINT_COLLECTION_LABELS,
  PAINT_COLOR_FAMILIES,
  PAINT_COLOR_FAMILY_LABELS,
  PAINT_CONFIDENCES,
  PAINT_CONFIDENCE_LABELS,
  PAINT_FINISHES,
  PAINT_FINISH_LABELS,
  type PaintBrand,
  type PaintCollection,
  type PaintColorFamily,
  type PaintConfidence,
  type PaintFinish,
  type PaintRecord,
} from "../types";

const OEM_BRANDS: PaintBrand[] = [
  "Porsche",
  "Lamborghini",
  "Ferrari",
  "McLaren",
];

interface LibraryProps {
  onAnalyzePaint: (paint: PaintRecord) => void;
  onInspectPaint: (paint: PaintRecord) => void;
}

export default function Library({
  onAnalyzePaint,
  onInspectPaint,
}: LibraryProps) {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<PaintCollection | "all">("all");
  const [brand, setBrand] = useState<PaintBrand | "all">("all");
  const [colorFamily, setColorFamily] = useState<PaintColorFamily | "all">("all");
  const [finish, setFinish] = useState<PaintFinish | "all">("all");
  const [confidence, setConfidence] = useState<PaintConfidence | "all">("all");

  const filteredPaints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return paints.filter((paint) => {
      const searchValue = [
        paint.brand,
        paint.name,
        paint.hex,
        paint.paintCode,
        paint.note,
        paint.source,
        paint.sourceType,
        ...paint.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (collection === "all" || paint.collection === collection) &&
        (brand === "all" || paint.brand === brand) &&
        (colorFamily === "all" || paint.colorFamily === colorFamily) &&
        (finish === "all" || paint.finish === finish) &&
        (confidence === "all" || paint.confidence === confidence) &&
        (!normalizedQuery || searchValue.includes(normalizedQuery))
      );
    });
  }, [brand, collection, colorFamily, confidence, finish, query]);

  const advancedFilterCount = [colorFamily, finish, confidence].filter(
    (value) => value !== "all",
  ).length;

  const resetFilters = () => {
    setQuery("");
    setCollection("all");
    setBrand("all");
    setColorFamily("all");
    setFinish("all");
    setConfidence("all");
  };

  return (
    <div className="view library-view">
      <section className="view-intro reveal">
        <div>
          <h1>Paint Library</h1>
          <p>
            Browse OEM paint references, motorsport colors, and other supported
            records with their provenance kept visible.
          </p>
        </div>
        <div className="view-intro__metric">
          <strong>{paints.length}</strong>
          <span>paint records</span>
        </div>
      </section>

      <section className="library-controls" aria-label="Library filters">
        <div className="field-group library-search">
          <label className="field-label" htmlFor="library-search">
            Search the library
          </label>
          <input
            id="library-search"
            className="text-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Paint name, code, manufacturer, or HEX"
          />
        </div>

        <div className="collection-filters" aria-label="Filter by collection">
          <button
            type="button"
            className="filter-button"
            aria-pressed={collection === "all"}
            onClick={() => setCollection("all")}
          >
            All records
          </button>
          {PAINT_COLLECTIONS.map((item) => (
            <button
              key={item}
              type="button"
              className="filter-button"
              aria-pressed={collection === item}
              onClick={() => {
                setCollection(item);
                if (item !== "oem") {
                  setBrand("all");
                }
              }}
            >
              {PAINT_COLLECTION_LABELS[item]}
            </button>
          ))}
        </div>

        {collection === "all" || collection === "oem" ? (
          <div className="brand-filters" aria-label="Filter by manufacturer">
            <button
              type="button"
              className="filter-button"
              aria-pressed={brand === "all"}
              onClick={() => setBrand("all")}
            >
              All manufacturers
            </button>
            {OEM_BRANDS.map((item) => (
              <button
                key={item}
                type="button"
                className="filter-button"
                aria-pressed={brand === item}
                onClick={() => {
                  setBrand(item);
                  setCollection("oem");
                }}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}

        <details className="library-advanced-filters">
          <summary>
            <span>More filters</span>
            <span>
              {advancedFilterCount
                ? `${advancedFilterCount} active`
                : "Family · finish · provenance"}
            </span>
          </summary>
          <div className="library-advanced-filters__grid">
            <label className="field-group">
              <span className="field-label">Color family</span>
              <select
                className="select-input"
                value={colorFamily}
                onChange={(event) =>
                  setColorFamily(event.target.value as PaintColorFamily | "all")
                }
              >
                <option value="all">All color families</option>
                {PAINT_COLOR_FAMILIES.map((item) => (
                  <option key={item} value={item}>
                    {PAINT_COLOR_FAMILY_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group">
              <span className="field-label">Finish</span>
              <select
                className="select-input"
                value={finish}
                onChange={(event) =>
                  setFinish(event.target.value as PaintFinish | "all")
                }
              >
                <option value="all">All finish types</option>
                {PAINT_FINISHES.map((item) => (
                  <option key={item} value={item}>
                    {PAINT_FINISH_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group">
              <span className="field-label">Provenance</span>
              <select
                className="select-input"
                value={confidence}
                onChange={(event) =>
                  setConfidence(event.target.value as PaintConfidence | "all")
                }
              >
                <option value="all">All confidence levels</option>
                {PAINT_CONFIDENCES.map((item) => (
                  <option key={item} value={item}>
                    {PAINT_CONFIDENCE_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>

        <div className="library-result-line">
          <p className="library-result-count" aria-live="polite">
            Showing {filteredPaints.length} of {paints.length} records
          </p>
          {filteredPaints.length > 0 && filteredPaints.length !== paints.length ? (
            <button type="button" className="text-action" onClick={resetFilters}>
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {filteredPaints.length ? (
        <section className="paint-grid" aria-label="Paint records">
          {filteredPaints.map((paint) => {
            const hsb = hexToHsb(paint.hex);
            return (
              <article className="paint-card" key={paint.id}>
                <button
                  type="button"
                  className="paint-card__detail-trigger"
                  onClick={() => onInspectPaint(paint)}
                  aria-label={`View details for ${paint.brand} ${paint.name}`}
                >
                  <PaintField
                    hex={paint.hex}
                    className="paint-card__swatch"
                    label={`${paint.brand} ${paint.name} color swatch`}
                  >
                    <div className="paint-card__swatch-meta">
                      <span>
                        {paint.collection === "oem"
                          ? paint.brand
                          : PAINT_COLLECTION_LABELS[paint.collection]}
                      </span>
                      <h2>{paint.name}</h2>
                    </div>
                    <span className="paint-card__hex">{paint.hex}</span>
                  </PaintField>
                </button>
                <div className="paint-card__body">
                  <div className="paint-card__metadata">
                    {paint.finish !== "unknown" ? (
                      <span>{PAINT_FINISH_LABELS[paint.finish]}</span>
                    ) : null}
                    <span>{PAINT_COLOR_FAMILY_LABELS[paint.colorFamily]}</span>
                    <span>{PAINT_CONFIDENCE_LABELS[paint.confidence]}</span>
                  </div>
                  {hsb ? (
                    <dl className="paint-card__values">
                      <div>
                        <dt>Normalized HSB</dt>
                        <dd>
                          {hsb.h.toFixed(3)} · {hsb.s.toFixed(3)} · {hsb.b.toFixed(3)}
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                  <div className="paint-card__actions">
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => onInspectPaint(paint)}
                    >
                      View record
                    </button>
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => onAnalyzePaint(paint)}
                    >
                      Open in Lab
                    </button>
                    <CopyButton value={paint.hex} label="Copy HEX" />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="empty-state" aria-live="polite">
          <h2>No paint records match.</h2>
          <p>Clear the active filters to restore the full library.</p>
          <button
            type="button"
            className="button button--primary"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </section>
      )}
    </div>
  );
}
