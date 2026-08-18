import { paints } from "../data/paints";

const METHODS = [
  {
    title: "Digital input",
    body: "HEX is parsed as six-digit sRGB notation, then expressed as red, green, and blue values from 0–255.",
  },
  {
    title: "Useful color values",
    body: "RGB is converted to HSB / HSV for conventional degree and percentage readouts, plus normalized 0–1 values for Forza workflows.",
  },
  {
    title: "Perceptual matching",
    body: "sRGB values are linearized, converted through XYZ using a D65 reference white, and represented in CIELAB before CIEDE2000 distance is calculated.",
  },
  {
    title: "Finish modeling",
    body: "Flake suggestions are deterministic HSB offsets. They are starting recipes, not physical spectral simulations of pigment, binder, and substrate.",
  },
];

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

      <section className="method-caveat">
        <h2>Data confidence</h2>
        <p>
          Confidence labels and source notes are preserved from the current dataset.
          They should not be interpreted as manufacturer certification. A later data
          phase can normalize paint codes, finish types, source records, and evidence
          quality without changing the calculation layer.
        </p>
      </section>
    </div>
  );
}
