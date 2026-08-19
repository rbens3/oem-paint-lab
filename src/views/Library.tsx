import { useMemo, type Dispatch, type MouseEvent, type SetStateAction } from "react";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import {
  getPaintDisplayName,
  getPaintDisplayManufacturer,
  LIBRARY_SORT_OPTIONS,
  sortPaints,
  type LibraryState,
} from "../lib/paint";
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
  onInspectPaint: (paint: PaintRecord) => void;
  state: LibraryState;
  onStateChange: Dispatch<SetStateAction<LibraryState>>;
}

export default function Library({
  onInspectPaint,
  state,
  onStateChange,
}: LibraryProps) {
  const { query, collection, brand, colorFamily, finish, confidence, sort } =
    state;

  const setLibraryValue = <Key extends keyof LibraryState>(
    key: Key,
    value: LibraryState[Key],
  ) => {
    onStateChange((current) => ({ ...current, [key]: value }));
  };

  const setQuery = (value: string) => setLibraryValue("query", value);
  const setCollection = (value: PaintCollection | "all") =>
    setLibraryValue("collection", value);
  const setBrand = (value: PaintBrand | "all") =>
    setLibraryValue("brand", value);
  const setColorFamily = (value: PaintColorFamily | "all") =>
    setLibraryValue("colorFamily", value);
  const setFinish = (value: PaintFinish | "all") =>
    setLibraryValue("finish", value);
  const setConfidence = (value: PaintConfidence | "all") =>
    setLibraryValue("confidence", value);

  const filteredPaints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchingPaints = paints.filter((paint) => {
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

    return sortPaints(matchingPaints, sort);
  }, [brand, collection, colorFamily, confidence, finish, query, sort]);

  const advancedFilterCount = [colorFamily, finish, confidence].filter(
    (value) => value !== "all",
  ).length;

  const activeFilters: Array<{
    id: string;
    label: string;
    clear: () => void;
  }> = [];

  if (query.trim()) {
    activeFilters.push({
      id: "query",
      label: `Search · ${query.trim()}`,
      clear: () => setQuery(""),
    });
  }
  if (collection !== "all") {
    activeFilters.push({
      id: "collection",
      label: `Collection · ${PAINT_COLLECTION_LABELS[collection]}`,
      clear: () => {
        setCollection("all");
        setBrand("all");
      },
    });
  }
  if (brand !== "all") {
    activeFilters.push({
      id: "brand",
      label: `Manufacturer · ${brand}`,
      clear: () => setBrand("all"),
    });
  }
  if (colorFamily !== "all") {
    activeFilters.push({
      id: "family",
      label: `Family · ${PAINT_COLOR_FAMILY_LABELS[colorFamily]}`,
      clear: () => setColorFamily("all"),
    });
  }
  if (finish !== "all") {
    activeFilters.push({
      id: "finish",
      label: `Finish · ${PAINT_FINISH_LABELS[finish]}`,
      clear: () => setFinish("all"),
    });
  }
  if (confidence !== "all") {
    activeFilters.push({
      id: "confidence",
      label: `Provenance · ${PAINT_CONFIDENCE_LABELS[confidence]}`,
      clear: () => setConfidence("all"),
    });
  }

  const resetFilters = () => {
    setQuery("");
    setCollection("all");
    setBrand("all");
    setColorFamily("all");
    setFinish("all");
    setConfidence("all");
  };

  const openPaintRecord = (
    event: MouseEvent<HTMLAnchorElement>,
    paint: PaintRecord,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onInspectPaint(paint);
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
        <div className="library-primary-filters">
          <div className="field-group library-search">
            <label className="field-label" htmlFor="library-search">
              Search
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

          <div className="library-filter-group">
            <span className="field-label">Collection</span>
            <div className="collection-filters" aria-label="Filter by collection">
              <button
                type="button"
                className="filter-button"
                aria-pressed={collection === "all"}
                onClick={() => setCollection("all")}
              >
                All
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
                  {item === "oem" ? "OEM" : PAINT_COLLECTION_LABELS[item]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {collection === "all" || collection === "oem" ? (
          <div className="library-filter-group library-manufacturer-filter">
            <span className="field-label">Manufacturer</span>
            <div className="brand-filters" aria-label="Filter by manufacturer">
              <button
                type="button"
                className="filter-button"
                aria-pressed={brand === "all"}
                onClick={() => setBrand("all")}
              >
                All
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
          </div>
        ) : null}

        <details className="library-advanced-filters">
          <summary>
            <span>All filters</span>
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
                <option value="all">All provenance levels</option>
                {PAINT_CONFIDENCES.map((item) => (
                  <option key={item} value={item}>
                    {PAINT_CONFIDENCE_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>

        {activeFilters.length ? (
          <div className="library-active-filters" aria-label="Active filters">
            <span className="library-active-filters__label">Active</span>
            <div className="library-active-filters__rail">
              {activeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className="active-filter"
                  onClick={filter.clear}
                  aria-label={`Remove ${filter.label} filter`}
                  title={filter.label}
                >
                  <span>{filter.label}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="library-result-line">
          <p className="library-result-count" aria-live="polite">
            Showing {filteredPaints.length} of {paints.length} records
          </p>
          <div className="library-result-actions">
            <label className="library-sort" htmlFor="library-sort">
              <span className="field-label">Sort</span>
              <select
                id="library-sort"
                className="select-input library-sort__select"
                value={sort}
                onChange={(event) =>
                  setLibraryValue("sort", event.target.value as LibraryState["sort"])
                }
              >
                {LIBRARY_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {activeFilters.length ? (
              <button type="button" className="text-action" onClick={resetFilters}>
                Clear all
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {filteredPaints.length ? (
        <section className="paint-grid" aria-label="Paint records">
          {filteredPaints.map((paint) => {
            const displayName = getPaintDisplayName(paint);
            return (
              <article className="paint-card" key={paint.id}>
                <a
                  href={`#/paint/${paint.id}`}
                  className="paint-card__link"
                  onClick={(event) => openPaintRecord(event, paint)}
                  aria-label={`View ${paint.brand} ${displayName} record`}
                >
                  <PaintField
                    hex={paint.hex}
                    className="paint-card__field"
                  >
                    <div className="paint-card__topline">
                      <span className="paint-card__manufacturer">
                        {getPaintDisplayManufacturer(paint)}
                      </span>
                      <span>{PAINT_CONFIDENCE_LABELS[paint.confidence]}</span>
                    </div>
                    <div className="paint-card__identity">
                      <h2>{displayName}</h2>
                    </div>
                    <div className="paint-card__footer">
                      <span className="paint-card__hex">{paint.hex}</span>
                      <div className="paint-card__metadata">
                        {paint.finish !== "unknown" ? (
                          <span>{PAINT_FINISH_LABELS[paint.finish]}</span>
                        ) : null}
                      </div>
                    </div>
                  </PaintField>
                </a>
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
