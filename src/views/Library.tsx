import { useMemo, type Dispatch, type MouseEvent, type SetStateAction } from "react";
import PaintField from "../components/PaintField";
import { paints } from "../data/paints";
import {
  getPaintDisplayGroup,
  getPaintDisplayName,
  getPaintSearchText,
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
  PAINT_EFFECTS,
  PAINT_EFFECT_LABELS,
  PAINT_ROLES,
  PAINT_ROLE_LABELS,
  PAINT_SERIES,
  PAINT_SERIES_LABELS,
  PAINT_SHEENS,
  PAINT_SHEEN_LABELS,
  type PaintCollection,
  type PaintColorFamily,
  type PaintConfidence,
  type PaintEffect,
  type PaintRecord,
  type PaintRole,
  type PaintSeries,
  type PaintSheen,
} from "../types";

const collator = new Intl.Collator("en", { sensitivity: "base" });
const OEM_MANUFACTURERS = [...new Set(
  paints
    .filter((paint) => paint.collection === "oem" && paint.manufacturer)
    .map((paint) => paint.manufacturer as string),
)].sort(collator.compare);
const F1_TEAMS = [...new Set(
  paints
    .filter((paint) => paint.series === "f1" && paint.team)
    .map((paint) => paint.team as string),
)].sort(collator.compare);

interface LibraryProps {
  onInspectPaint: (paint: PaintRecord) => void;
  state: LibraryState;
  onStateChange: Dispatch<SetStateAction<LibraryState>>;
}

export default function Library({ onInspectPaint, state, onStateChange }: LibraryProps) {
  const {
    query,
    collection,
    manufacturer,
    series,
    team,
    role,
    colorFamily,
    effect,
    sheen,
    confidence,
    sort,
  } = state;

  const setLibraryValue = <Key extends keyof LibraryState>(
    key: Key,
    value: LibraryState[Key],
  ) => onStateChange((current) => ({ ...current, [key]: value }));

  const setCollection = (value: PaintCollection | "all") => {
    onStateChange((current) => ({
      ...current,
      collection: value,
      manufacturer: value === "oem" || value === "all" ? current.manufacturer : "all",
      series: value === "motorsport" ? current.series : "all",
      team: value === "motorsport" ? current.team : "all",
      role: value === "motorsport" ? current.role : "all",
    }));
  };

  const filteredPaints = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return sortPaints(
      paints.filter(
        (paint) =>
          (collection === "all" || paint.collection === collection) &&
          (manufacturer === "all" || paint.manufacturer === manufacturer) &&
          (series === "all" || paint.series === series) &&
          (team === "all" || paint.team === team) &&
          (role === "all" || paint.role === role) &&
          (colorFamily === "all" || paint.colorFamily === colorFamily) &&
          (effect === "all" || paint.effect === effect) &&
          (sheen === "all" || paint.sheen === sheen) &&
          (confidence === "all" || paint.confidence === confidence) &&
          (!normalizedQuery || getPaintSearchText(paint).includes(normalizedQuery)),
      ),
      sort,
    );
  }, [collection, colorFamily, confidence, effect, manufacturer, query, role, series, sheen, sort, team]);

  const advancedFilterCount = [colorFamily, effect, sheen, confidence].filter(
    (value) => value !== "all",
  ).length;
  const activeFilters: Array<{ id: string; label: string; clear: () => void }> = [];

  if (query.trim()) activeFilters.push({
    id: "query",
    label: `Search · ${query.trim()}`,
    clear: () => setLibraryValue("query", ""),
  });
  if (collection !== "all") activeFilters.push({
    id: "collection",
    label: `Collection · ${PAINT_COLLECTION_LABELS[collection]}`,
    clear: () => setCollection("all"),
  });
  if (manufacturer !== "all") activeFilters.push({
    id: "manufacturer",
    label: `Manufacturer · ${manufacturer}`,
    clear: () => setLibraryValue("manufacturer", "all"),
  });
  if (series !== "all") activeFilters.push({
    id: "series",
    label: `Series · ${PAINT_SERIES_LABELS[series]}`,
    clear: () => onStateChange((current) => ({ ...current, series: "all", team: "all", role: "all" })),
  });
  if (team !== "all") activeFilters.push({
    id: "team",
    label: `Team · ${team}`,
    clear: () => setLibraryValue("team", "all"),
  });
  if (role !== "all") activeFilters.push({
    id: "role",
    label: `Role · ${PAINT_ROLE_LABELS[role]}`,
    clear: () => setLibraryValue("role", "all"),
  });
  if (colorFamily !== "all") activeFilters.push({
    id: "family",
    label: `Family · ${PAINT_COLOR_FAMILY_LABELS[colorFamily]}`,
    clear: () => setLibraryValue("colorFamily", "all"),
  });
  if (effect !== "all") activeFilters.push({
    id: "effect",
    label: `Effect · ${PAINT_EFFECT_LABELS[effect]}`,
    clear: () => setLibraryValue("effect", "all"),
  });
  if (sheen !== "all") activeFilters.push({
    id: "sheen",
    label: `Sheen · ${PAINT_SHEEN_LABELS[sheen]}`,
    clear: () => setLibraryValue("sheen", "all"),
  });
  if (confidence !== "all") activeFilters.push({
    id: "confidence",
    label: `Provenance · ${PAINT_CONFIDENCE_LABELS[confidence]}`,
    clear: () => setLibraryValue("confidence", "all"),
  });

  const resetFilters = () => onStateChange((current) => ({
    ...current,
    query: "",
    collection: "all",
    manufacturer: "all",
    series: "all",
    team: "all",
    role: "all",
    colorFamily: "all",
    effect: "all",
    sheen: "all",
    confidence: "all",
  }));

  const openPaintRecord = (event: MouseEvent<HTMLAnchorElement>, paint: PaintRecord) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onInspectPaint(paint);
  };

  return (
    <div className="view library-view">
      <section className="view-intro reveal">
        <div>
          <h1>Paint Library</h1>
          <p>
            Browse OEM references, 2026 Formula 1 liveries, and motorsport heritage
            colors with structured provenance, effect, and sheen metadata.
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
            <label className="field-label" htmlFor="library-search">Search</label>
            <input
              id="library-search"
              className="text-input"
              type="search"
              value={query}
              onChange={(event) => setLibraryValue("query", event.target.value)}
              placeholder="Paint, code, manufacturer, team, series, or HEX"
            />
          </div>

          <div className="library-filter-group">
            <span className="field-label">Collection</span>
            <div className="collection-filters" aria-label="Filter by collection">
              <button type="button" className="filter-button" aria-pressed={collection === "all"} onClick={() => setCollection("all")}>All</button>
              {PAINT_COLLECTIONS.map((item) => (
                <button key={item} type="button" className="filter-button" aria-pressed={collection === item} onClick={() => setCollection(item)}>
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
              <button type="button" className="filter-button" aria-pressed={manufacturer === "all"} onClick={() => setLibraryValue("manufacturer", "all")}>All</button>
              {OEM_MANUFACTURERS.map((item) => (
                <button key={item} type="button" className="filter-button" aria-pressed={manufacturer === item} onClick={() => onStateChange((current) => ({ ...current, manufacturer: item, collection: "oem", series: "all", team: "all", role: "all" }))}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {collection === "motorsport" ? (
          <div className="library-motorsport-filters">
            <div className="library-filter-group">
              <span className="field-label">Series</span>
              <div className="collection-filters" aria-label="Filter motorsport series">
                <button type="button" className="filter-button" aria-pressed={series === "all"} onClick={() => onStateChange((current) => ({ ...current, series: "all", team: "all", role: "all" }))}>All</button>
                {PAINT_SERIES.map((item) => (
                  <button key={item} type="button" className="filter-button" aria-pressed={series === item} onClick={() => onStateChange((current) => ({ ...current, series: item, team: item === "f1" ? current.team : "all", role: item === "f1" ? current.role : "all" }))}>
                    {item === "f1" ? "2026 F1" : PAINT_SERIES_LABELS[item]}
                  </button>
                ))}
              </div>
            </div>
            {series === "f1" ? (
              <div className="library-advanced-filters__grid">
                <label className="field-group">
                  <span className="field-label">Team</span>
                  <select className="select-input" value={team} onChange={(event) => setLibraryValue("team", event.target.value)}>
                    <option value="all">All teams</option>
                    {F1_TEAMS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">Role</span>
                  <select className="select-input" value={role} onChange={(event) => setLibraryValue("role", event.target.value as PaintRole | "all") }>
                    <option value="all">All roles</option>
                    {PAINT_ROLES.map((item) => <option key={item} value={item}>{PAINT_ROLE_LABELS[item]}</option>)}
                  </select>
                </label>
              </div>
            ) : null}
          </div>
        ) : null}

        <details className="library-advanced-filters">
          <summary>
            <span>All filters</span>
            <span>{advancedFilterCount ? `${advancedFilterCount} active` : "Family · effect · sheen · provenance"}</span>
          </summary>
          <div className="library-advanced-filters__grid">
            <label className="field-group">
              <span className="field-label">Color family</span>
              <select className="select-input" value={colorFamily} onChange={(event) => setLibraryValue("colorFamily", event.target.value as PaintColorFamily | "all") }>
                <option value="all">All color families</option>
                {PAINT_COLOR_FAMILIES.map((item) => <option key={item} value={item}>{PAINT_COLOR_FAMILY_LABELS[item]}</option>)}
              </select>
            </label>
            <label className="field-group">
              <span className="field-label">Effect</span>
              <select className="select-input" value={effect} onChange={(event) => setLibraryValue("effect", event.target.value as PaintEffect | "all") }>
                <option value="all">All paint effects</option>
                {PAINT_EFFECTS.map((item) => <option key={item} value={item}>{PAINT_EFFECT_LABELS[item]}</option>)}
              </select>
            </label>
            <label className="field-group">
              <span className="field-label">Sheen</span>
              <select className="select-input" value={sheen} onChange={(event) => setLibraryValue("sheen", event.target.value as PaintSheen | "all") }>
                <option value="all">All supported sheens</option>
                {PAINT_SHEENS.map((item) => <option key={item} value={item}>{PAINT_SHEEN_LABELS[item]}</option>)}
              </select>
            </label>
            <label className="field-group">
              <span className="field-label">Provenance</span>
              <select className="select-input" value={confidence} onChange={(event) => setLibraryValue("confidence", event.target.value as PaintConfidence | "all") }>
                <option value="all">All provenance levels</option>
                {PAINT_CONFIDENCES.map((item) => <option key={item} value={item}>{PAINT_CONFIDENCE_LABELS[item]}</option>)}
              </select>
            </label>
          </div>
        </details>

        {activeFilters.length ? (
          <div className="library-active-filters" aria-label="Active filters">
            <span className="library-active-filters__label">Active</span>
            <div className="library-active-filters__rail">
              {activeFilters.map((filter) => (
                <button key={filter.id} type="button" className="active-filter" onClick={filter.clear} aria-label={`Remove ${filter.label} filter`} title={filter.label}>
                  <span>{filter.label}</span><span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="library-result-line">
          <p className="library-result-count" aria-live="polite">Showing {filteredPaints.length} of {paints.length} records</p>
          <div className="library-result-actions">
            <label className="library-sort" htmlFor="library-sort">
              <span className="field-label">Sort</span>
              <select id="library-sort" className="select-input library-sort__select" value={sort} onChange={(event) => setLibraryValue("sort", event.target.value as LibraryState["sort"])}>
                {LIBRARY_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {activeFilters.length ? <button type="button" className="text-action" onClick={resetFilters}>Clear all</button> : null}
          </div>
        </div>
      </section>

      {filteredPaints.length ? (
        <section className="paint-grid" aria-label="Paint records">
          {filteredPaints.map((paint) => {
            const displayName = getPaintDisplayName(paint);
            const metadata = paint.effect
              ? PAINT_EFFECT_LABELS[paint.effect]
              : null;
            return (
              <article className="paint-card" key={paint.id}>
                <a href={`#/paint/${paint.id}`} className="paint-card__link" onClick={(event) => openPaintRecord(event, paint)} aria-label={`View ${getPaintDisplayGroup(paint)} ${displayName} record`}>
                  <PaintField hex={paint.hex} className="paint-card__field">
                    <div className="paint-card__topline">
                      <span className="paint-card__manufacturer">{getPaintDisplayGroup(paint)}</span>
                      <span>{PAINT_CONFIDENCE_LABELS[paint.confidence]}</span>
                    </div>
                    <div className="paint-card__identity"><h2>{displayName}</h2></div>
                    <div className="paint-card__footer">
                      <span className="paint-card__hex">{paint.hex}</span>
                      <div className="paint-card__metadata">{metadata ? <span>{metadata}</span> : null}</div>
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
          <button type="button" className="button button--primary" onClick={resetFilters}>Clear filters</button>
        </section>
      )}
    </div>
  );
}
