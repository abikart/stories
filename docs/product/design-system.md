# Stories design system

## Scope

Stories has a code-first design system with two portable layers: semantic
surface treatments and a complete soft Web Components package. The source of
truth is:

- CSS tokens and portable classes in `src/design-system/treatments.css`;
- typed class names and usage contracts in `src/design-system/treatments.ts`;
- the dependency-free component package in `src/design-system/soft-components`;
- the child-focused preset in `src/design-system/soft-components/preset/stories.css`;
- the live catalog at `/dev/design-system`; and
- this document for selection rules and provenance.

The system is intentionally lean. It does not wrap semantic HTML in a custom
component merely to add an effect. Product markup keeps its native buttons,
headings, groups, labels, focus order, and assistive text, then opts into one
class-backed treatment.

Every registry entry exposes both maturity (`stable` or `provisional`) and
recipe fidelity (`exact-source`, `source-guided`, or `stories-native`). Light
Glass is the sole exact-source effect. Glow and sheen remain source-guided and
provisional; the stable solid surface is explicitly a Stories-native primitive,
not a claim of Figma pixel parity.

## Soft component package

The local package preserves Jelly UI v1.1.0 at pinned upstream commit
`8e39a8e61b5a43a562ae85e4b01191d333d5b121`. Its 40 `jelly-*` custom elements,
public utilities, declarations, browser tests, generated API data, source map,
and MIT notice live together under `src/design-system/soft-components` so the
directory can be copied into another TypeScript web project intact.

The compatibility namespace is intentionally retained. This keeps markup,
events, examples, and API comparison mechanical; a document must never load
the local bundle and hosted Jelly UI together. The app performs no hosted
runtime fetch. `register.ts` defers the browser registration side effect until
client mount through the synchronized local `/design-system/jelly.js` asset,
and the React integration remains outside the portable core in
`soft-components-react.tsx` and `soft-components-elements.d.ts`.

The upstream-compatible presentation remains the default. Product code opts
into `data-jelly-preset="stories"` for warm-paper colors, Quicksand/Lexend type,
44px small targets, restrained depth, and higher reading clarity. This preset
is CSS-only: it does not fork control logic, forms, events, keyboard behavior,
overlay behavior, or soft-body physics.

The catalog mounts every element and exposes upstream/Stories and motion
controls. The package-level verifier proves all 40 tags register once and that
attributes, properties, methods, events, slots, parts, CSS properties, types,
and named exports retain the pinned contract. The application QA additionally
checks registration, nested overlays, modal semantics, RTL fixtures,
responsive overflow, and browser consoles in Chromium, WebKit, and Firefox.

The upstream baseline is updateable without mixing project customizations into
the recovered core. `npm run update:soft-components -- --ref <ref> --dry-run`
fetches and fully verifies a detached Jelly UI checkout and reports API changes
without writing. Removing `--dry-run` applies a verified candidate; any public
API delta requires the explicit `--accept-api-changes` flag. The updater keeps
the Stories preset and loaders intact, regenerates React intrinsic-element
declarations, updates the public browser bundle, records exact hashes and
provenance, and leaves the resulting Git diff uncommitted for review.

Run the relevant checks against a local server:

```sh
npm --prefix src/design-system/soft-components run verify
EXPERIENCE_BASE_URL=http://localhost:3000 npm run qa:soft-components
EXPERIENCE_BASE_URL=http://localhost:3000 npm run evidence:soft-components
```

Exact provenance, artifact hashes, licensing, development, React use, API
access, and extraction instructions live in the package
[`README.md`](../../src/design-system/soft-components/README.md) and
[`PROVENANCE.md`](../../src/design-system/soft-components/PROVENANCE.md).

## Figma source audit

The treatment model comes from Cisco's
[1D Guardrails](https://www.figma.com/design/VPpFDRaovwQeHrSM86fcSv/1D-Guardrails?node-id=313-50940),
adapted to Stories rather than copied as product chrome. The source defines an
important semantic split:

| Family | Meaning | Portable pattern | Stories rule |
| --- | --- | --- | --- |
| Glass | elevation and focus | temporary translucent layer with real backdrop blur | Use only for content that matters now. |
| Atmospheric glow | trust, atmosphere, broad orientation | large diffused field positioned behind a region | Never add it as an ambient Fern stage background. |
| Spotlight glow | directional guidance | smaller, tighter, higher-contrast local field | One target at a time; it cannot replace focus styling. |
| Static sheen | priority or novelty | bounded gradient edge without travel | Use when a plain border is insufficient. |
| Animated sheen | active change or transformation | one directional gradient travel | Tie it to a state change and stop it under reduced motion. |
| Solid surface | durable chrome | opaque or nearly opaque neutral surface | Default for persistent controls and labels. |

### Light Glass recipe

Node `313:50940` is the stable production recipe:

- white fill at 60%;
- white 1px border at 60%;
- 10px backdrop blur;
- inset white highlight `0 0 24px 1px` at 80%; and
- soft black shadows `0 1px 2px` and `0 4px 16px`, both at 4%.

There is no decorative color wash, chromatic rim, fake refraction, or large
ambient shadow in this recipe. The shape owns its radius; the treatment owns
only material properties. Browsers without backdrop filtering receive a more
opaque neutral fallback.

### Glass selection guardrails

Use Light Glass when a temporary layer overlays content and needs separation:
dialogue, a retained Read-with-me passage, a modal interruption, or a
contextual decision. Do not use it for static background panels, persistent
title/mode/transport chrome, every container, nested buttons, or purely
decorative layering. Busy imagery that defeats clarity should receive a solid
surface or authored relocation instead.

### Glow patterns

Glow communicates trust, intelligence, guidance, or atmosphere; it is not a
glass substitute. Atmospheric glow stays large and diffused and may originate
from the top, top-left, or bottom of a broad target region. The source uses 40%
gradient strength in light environments and 100% in dark environments.
Spotlight glow is the secondary, restrained form: smaller, tighter, and higher
contrast around one decision or action.

The portable spectrum preserves the source stops (`#0A60FF`, `#02C8FF`,
`#FF007F`, `#FF9000`) as design-system primitives. Product features may map
those primitives to a world palette only when the semantic role remains clear.
Fern deliberately uses none of them as stage atmosphere because its solid
`#FFFFFF` matte is an authored media contract.

The source establishes the glow semantics, spectrum, light/dark strength, and
relative atmospheric/spotlight hierarchy. The portable blur radii and field
geometry are still `provisional`, because the detailed source frames were not
available after the Figma Starter inspection limit was reached. Fern maps the
Spotlight Glow colors to its authored gold guide target while retaining the
single-target, local-field contract; this is source-guided adaptation, not a
pixel-exact Figma recipe.

### Sheen patterns

Sheen communicates movement, progression, transformation, direction, priority,
urgent attention, or a new feature. Static and animated variants are available
as bounded, shape-aware gradient edges. The animated form makes one directional
travel and becomes static under `prefers-reduced-motion`.

The source file exposes separate Static Sheen and Animated Sheen guidance
frames. Their portable implementations remain `provisional`: the Figma Starter
MCP limit was reached after the structural inventory and sheen-purpose frame,
before the two detailed recipe frames could be extracted. Do not claim exact
pixel parity for their speed or edge thickness until those nodes are audited.

## Fern application

| Existing feature | Treatment | Reason |
| --- | --- | --- |
| Live dialogue and narration | Light Glass | Temporary content overlays live media and needs focus. |
| Read-with-me retained passage | Light Glass | Temporary priority and containment while narration waits. |
| Start interruption | Light Glass | A short modal-like decision before playback. |
| Story title | Solid surface | Persistent identity, not temporary elevation. |
| Watch / Read-with-me switch | Solid surface + solid active selection | Persistent navigation; glass would weaken affordance. |
| Replay / transport | Solid surface | Persistent controls and buttons must remain unambiguous. |
| Silver-path goal | Spotlight Glow | One local target needs directional guidance; the world-authored gold palette replaces the portable spectrum. |
| Stage background | None | The exact solid story matte remains authoritative. |

The complete route-and-feature inventory lives in
[Treatment audit](treatment-audit.md). It records the negative decisions as
carefully as the applied effects so later work does not gradually decorate
every surface.

The checked-in [before/after evidence](../evidence/design-system/README.md)
preserves the rejected universal-glass direction beside Chromium and WebKit
captures of the current catalog, story, guide target, and phone layout.

## Accessibility and motion

- Effects never contain or distort semantic content.
- Keyboard focus remains an explicit outline, independent of glow or sheen.
- Minimum touch targets and native controls remain unchanged.
- Animated sheen stops under `prefers-reduced-motion`.
- Light Glass uses a solid fallback when backdrop filtering is unavailable.
- Treatment strength never overrides readable contrast or authored media focus.
