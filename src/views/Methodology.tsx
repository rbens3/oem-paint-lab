import { paints } from "../data/paints";
import {
  PAINT_COLLECTIONS,
  PAINT_COLLECTION_LABELS,
  PAINT_CONFIDENCES,
  PAINT_CONFIDENCE_LABELS,
} from "../types";

const METHODS = [
  {
    title: "Digital input",
    body: "HEX is parsed as six-digit sRGB notation, then expressed as red, green, and blue values from 0–255. The stored value describes a screen color, not a spectral measurement of physical paint.",
  },
  {
    title: "Useful color values",
    body: "RGB is converted to HSB / HSV for conventional degree and percentage readouts, plus normalized 0–1 values for portable digital workflows.",
  },
  {
    title: "Evidence before certainty",
    body: "Every record is assigned a conservative provenance level from its existing source note. Missing evidence stays visible, and no record is promoted by inference.",
  },
  {
    title: "Perceptual matching",
    body: "sRGB values are linearized, converted through XYZ using a D65 reference white, and represented in CIELAB before CIEDE2000 distance is calculated.",
  },
  {
    title: "Finish modeling",
    body: "Flake suggestions are deterministic HSB offsets. They are starting recipes, not physical spectral simulations of pigment, binder, substrate, or lighting.",
  },
  {
    title: "Archive scope",
    body: "Factory paint references, motorsport liveries, and other digital colors remain separate collections. This keeps a useful archive broad without implying that every record is an OEM production paint.",
  },
];

const provenanceDefinitions = {
  reference:
    "A traceable digital value from a secondary database, supplied reference, or in-game source. It may be well sourced while remaining a screen reference rather than an official physical paint specification.",
  estimated:
    "A value derived or updated from imagery, paint chips, livery photography, or an explicitly approximate source.",
} as const;

export default function Methodology() {
  return (
    <div className="view methodology-view">
      <section className="view-intro reveal">
        <div>
          <h1>Methodology</h1>
          <p>
            What OEM Paint Lab calculates, what the source data represents, and where
            digital color should be treated with caution.
          </p>
        </div>
        <div className="view-intro__metric">
          <strong>{paints.length}</strong>
          <span>current records</span>
        </div>
      </section>

      <section className="method-flow" aria-label="Color processing pipeline">
        <span>sRGB HEX</span>
        <span className="method-flow__arrow" aria-hidden="true">→</span>
        <span>Linear RGB</span>
        <span className="method-flow__arrow" aria-hidden="true">→</span>
        <span>XYZ · D65</span>
        <span className="method-flow__arrow" aria-hidden="true">→</span>
        <span>CIELAB</span>
        <span className="method-flow__arrow" aria-hidden="true">→</span>
        <span>ΔE00</span>
      </section>

      <section className="method-list" aria-label="Calculation methodology">
        {METHODS.map((method, index) => (
          <article className="method-row" key={method.title}>
            <div className="method-row__title">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{method.title}</h2>
            </div>
            <p>{method.body}</p>
          </article>
        ))}
      </section>

      <section className="method-confidence" aria-labelledby="confidence-title">
        <div className="paint-detail-section-heading">
          <h2 id="confidence-title">Provenance model</h2>
          <p>
            Provenance describes how a digital value was derived, not its perceptual
            match to physical paint.
          </p>
        </div>
        <dl className="method-confidence__list">
          {PAINT_CONFIDENCES.map((confidence) => (
            <div key={confidence}>
              <dt>
                <span>{PAINT_CONFIDENCE_LABELS[confidence]}</span>
                <strong>
                  {paints.filter((paint) => paint.confidence === confidence).length}
                </strong>
              </dt>
              <dd>{provenanceDefinitions[confidence]}</dd>
            </div>
          ))}
        </dl>
        <aside className="method-confidence__context" aria-labelledby="verified-context-title">
          <span>Why there is no Verified tier</span>
          <h3 id="verified-context-title">A HEX value cannot verify physical paint.</h3>
          <p>
            Automotive paint changes with illumination, viewing angle, substrate,
            clear-coat depth, and metallic or pearl behavior. Cameras, image
            processing, and displays add further transformations. A well-sourced
            digital reference is therefore not the same thing as an official physical
            paint specification.
          </p>
          <p>
            No current record clears that distinction, so OEM Paint Lab does not
            present a Verified status. The model can evolve when stronger first-party
            specifications or appropriately measured references become available;
            records will not be promoted by inference.
          </p>
        </aside>
      </section>

      <section className="method-notes">
        <div>
          <h2>Interpretation limits</h2>
          <p>
            A screen HEX value cannot encode metallic travel, pearl interference,
            surface texture, clear-coat depth, viewing angle, or illumination. OEM
            paint samples can also vary across model years and published references.
          </p>
        </div>
        <dl className="method-specs">
          <div>
            <dt>Working color space</dt>
            <dd>sRGB</dd>
          </div>
          <div>
            <dt>Reference white</dt>
            <dd>D65</dd>
          </div>
          <div>
            <dt>Similarity metric</dt>
            <dd>CIEDE2000</dd>
          </div>
          <div>
            <dt>Finish model</dt>
            <dd>Normalized HSB offsets</dd>
          </div>
        </dl>
      </section>

      <section className="method-collections" aria-labelledby="collection-title">
        <div>
          <h2 id="collection-title">Collection boundaries</h2>
          <p>
            Classification changes how records are presented, not their original
            names, identifiers, or HEX values.
          </p>
        </div>
        <dl>
          {PAINT_COLLECTIONS.map((collection) => (
            <div key={collection}>
              <dt>{PAINT_COLLECTION_LABELS[collection]}</dt>
              <dd>
                {paints.filter((paint) => paint.collection === collection).length}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="method-caveat">
        <h2>What remains intentionally unknown</h2>
        <p>
          Paint code and finish metadata are shown only where the current record can
          support them. Unknown fields remain explicit rather than being filled with
          plausible but unsupported claims. Original source notes remain available on
          every paint record.
        </p>
      </section>
    </div>
  );
}
