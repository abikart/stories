import { treatmentClassNames, treatmentGuidelines, type TreatmentName } from "@/design-system/treatments";
import { SoftComponentsCatalog } from "@/design-system/SoftComponentsCatalog";

const showcasedTreatments: TreatmentName[] = [
  "glassLight",
  "glowAtmospheric",
  "glowSpotlight",
  "sheenStatic",
  "sheenAnimated",
  "surfaceSolid",
];

export default function DesignSystemPage() {
  return (
    <main className="ds-catalog">
      <header className="ds-catalog__header">
        <span className="ds-catalog__eyebrow">Stories design system / surface treatments</span>
        <h1>Focus without atmosphere.</h1>
        <p className="ds-catalog__lede">
          Glass elevates temporary priority. Glow orients attention. Sheen communicates active change.
          Persistent controls stay solid so the story remains the visual center.
        </p>
      </header>

      <section className="ds-catalog__section" aria-labelledby="treatment-fixtures">
        <div>
          <span className="ds-catalog__eyebrow">High-contrast fixtures</span>
          <h2 id="treatment-fixtures">Portable treatments</h2>
        </div>
        <div className="ds-catalog__grid">
          <article className="ds-catalog__sample ds-catalog__sample--contrast">
            <div className={`${treatmentClassNames.glassLight} ds-catalog__surface`}>
              <h3>Light Glass</h3>
              <p>One temporary elevated layer over live content.</p>
            </div>
          </article>
          <article className="ds-catalog__sample ds-catalog__sample--contrast">
            <div className={`${treatmentClassNames.glassLight} ds-glass-light--fallback ds-catalog__surface`}>
              <h3>Light Glass fallback</h3>
              <p>Opaque, readable separation when backdrop filtering is unavailable.</p>
            </div>
          </article>
          <article className="ds-catalog__sample ds-catalog__sample--dark">
            <div className={`${treatmentClassNames.glowAtmospheric} ds-catalog__surface ds-catalog__surface--dark`}>
              <h3>Atmospheric Glow</h3>
              <p>Large, diffused, and tied to one first-look region.</p>
            </div>
          </article>
          <article className="ds-catalog__sample ds-catalog__sample--contrast">
            <div className={`${treatmentClassNames.surfaceSolid} ds-catalog__surface`}>
              <h3>Solid Surface</h3>
              <p>Durable chrome without temporary elevation or backdrop blur.</p>
            </div>
          </article>
          <article className="ds-catalog__sample">
            <div className={`${treatmentClassNames.glowSpotlight} ${treatmentClassNames.surfaceSolid} ds-catalog__surface`}>
              <h3>Spotlight Glow</h3>
              <p>A tighter directional nudge for one action.</p>
            </div>
          </article>
          <article className="ds-catalog__sample ds-catalog__sample--dark">
            <div className={`${treatmentClassNames.sheenStatic} ds-catalog__surface ds-catalog__surface--dark`}>
              <h3>Static Sheen</h3>
              <p>Priority without implying progress.</p>
            </div>
          </article>
          <article className="ds-catalog__sample ds-catalog__sample--dark">
            <div className={`${treatmentClassNames.sheenAnimated} ds-catalog__surface ds-catalog__surface--dark`}>
              <h3>Animated Sheen</h3>
              <p>A single directional travel for an evolving state.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="ds-catalog__section" aria-labelledby="treatment-contracts">
        <div>
          <span className="ds-catalog__eyebrow">Usage contracts</span>
          <h2 id="treatment-contracts">Purpose before effect</h2>
        </div>
        <div className="ds-catalog__notes">
          {showcasedTreatments.map((name) => {
            const guideline = treatmentGuidelines[name];
            return (
              <article className="ds-catalog__note" key={name}>
                <span className="ds-catalog__status">{guideline.status} · {guideline.fidelity}</span>
                <h3>{guideline.label}</h3>
                <p>{guideline.purpose}</p>
                <ul>
                  {guideline.useWhen.slice(0, 2).map((rule) => <li key={rule}>{rule}</li>)}
                  <li>Avoid: {guideline.avoidWhen[0]}</li>
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <SoftComponentsCatalog />
    </main>
  );
}
