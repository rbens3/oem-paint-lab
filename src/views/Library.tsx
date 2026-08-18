import { useMemo, useState } from "react";
import CopyButton from "../components/CopyButton";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import { hexToHsb } from "../lib/color";
import {
  PAINT_BRANDS,
  type PaintBrand,
  type PaintRecord,
} from "../types";

interface LibraryProps {
  onAnalyzePaint: (paint: PaintRecord) => void;
}

export default function Library({ onAnalyzePaint }: LibraryProps) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<PaintBrand | "All">("All");

  const filteredPaints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return paints.filter((paint) => {
      const matchesBrand = brand === "All" || paint.brand === brand;
      const matchesQuery =
        !normalizedQuery ||
        `${paint.brand} ${paint.name} ${paint.hex} ${paint.note}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesBrand && matchesQuery;
    });
  }, [brand, query]);

  return (
    <div className="view library-view">
      <section className="view-intro reveal">
        <div>
          <h1>Paint Library</h1>
          <p>
            Browse the source collection directly. Filter by manufacturer, search by
            name or HEX, then open any record in the Lab.
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
            placeholder="Paint name, manufacturer, or HEX"
          />
        </div>
        <div className="brand-filters" aria-label="Filter by manufacturer">
          {(["All", ...PAINT_BRANDS] as const).map((item) => (
            <button
              key={item}
              type="button"
              className="filter-button"
              aria-pressed={brand === item}
              onClick={() => setBrand(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="library-result-count" aria-live="polite">
          Showing {filteredPaints.length} of {paints.length} records
        </p>
      </section>

      {filteredPaints.length ? (
        <section className="paint-grid" aria-label="OEM paint records">
          {filteredPaints.map((paint) => {
            const hsb = hexToHsb(paint.hex);
            return (
              <article className="paint-card" key={paint.id}>
                <PaintField
                  hex={paint.hex}
                  className="paint-card__swatch"
                  label={`${paint.brand} ${paint.name} color swatch`}
                >
                  <div className="paint-card__swatch-meta">
                    <span>{paint.brand}</span>
                    <h2>{paint.name}</h2>
                  </div>
                  <span className="paint-card__hex">{paint.hex}</span>
                </PaintField>
                <div className="paint-card__body">
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
                      onClick={() => onAnalyzePaint(paint)}
                    >
                      Analyze paint
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
          <p>Clear the search or choose another manufacturer to restore the library.</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              setQuery("");
              setBrand("All");
            }}
          >
            Clear filters
          </button>
        </section>
      )}
    </div>
  );
}
