# Session handoff

Last updated: 2026-08-02

## Read first

- Branch: `codex/mvp-immersive-runtime`
- Preserved baseline: annotated local tag `poc-success`
- Execution contract: `docs/mvp/immersive-run.md`
- Product index: `docs/README.md`
- Decision log: `docs/DECISIONS.md`

## Current state

- Lanternleaf creative development has restarted independently of the completed
  Fern runtime POC. **Fern and the Silent Seed Bells** is non-canon as a story;
  its technical and production lessons remain useful.
- `docs/universe/README.md` now registers story worlds, and
  `docs/universe/worlds/lanternleaf/` contains the working adventure spine and a
  separate exploration of why its living paths are fading.
- The owner has approved the core living-path promise and its restrained,
  daylight-readable watercolor treatment. The proposed Long Rain cause remains
  exploration, not approved canon, and is the next creative review point.
- The new content model separates reading difficulty, character era, and
  chronology so simple concept stories and the serialized adventure can share
  one world without forcing one-to-one adaptations.
- The Fern POC is preserved at `poc-success`; the immersive MVP is complete on
  `codex/mvp-immersive-runtime` and has not been pushed.
- V1/Pip content, superseded routes and engine code, obsolete proofs/scripts,
  rejected binaries, and historical POC documents are absent from the active
  tree. Git history remains their archive.
- Fern is the sole active package. Its expressive performance, alignment,
  Read-with-me units, continuity, soundscape, interaction, and full flattened
  presentation remain intact.
- The runtime now accepts provider-neutral ordered compositions with plates,
  native or packed-alpha layers, normalized geometry, and opaque fallbacks. It
  mounts only the current and likely-next composition.
- Three story moments use real moving transparency: the opening, the complete
  silver-path hero interaction, and the emotional close. Eight alpha renditions
  were compiled from approved media; no new Grok generation was necessary.
- Owner playtesting established the standard scene-blending treatment: one
  exact solid `stage.backdrop.color` shared by source media and the page. Fern
  uses `#FFFFFF`; the poster atmosphere, accent gradient, blur, and opacity wash
  have been removed from the standard runtime path.
- Dialogue identity and placement are now package content. Fern's four scenes
  currently use `top-left`; narrated lines have no visible label, Fern/Pipkin
  speech uses canonical watercolor portraits, and constrained layouts dock the
  same copy safely.
- Stories now has a code-first surface-treatment design system and a live
  `/dev/design-system` catalog. Figma 1D Guardrails Light Glass is reserved for
  dialogue, retained Read-with-me passages, and the temporary start decision.
  Persistent title, mode, and transport chrome is solid; the mode selection is
  no longer presented as a glass lens. The silver-path goal is the only live
  Spotlight Glow use and maps the source semantics to Fern gold. Atmospheric
  glow and sheen remain catalog-only and do not alter Fern's exact solid stage
  matte.
- Every active route and story surface now has an explicit decision in
  `docs/product/treatment-audit.md`. Light Glass is exact-source and stable;
  glow/sheen geometry remains clearly source-guided and provisional; the stable
  solid surface is marked Stories-native. The catalog demonstrates the opaque
  no-backdrop-filter branch and labels recipe maturity/fidelity.
- Before/after evidence is checked into `docs/evidence/design-system/`, including
  Chromium catalog/guide/phone captures and a WebKit story capture.
- The active checkout is 164 files / 109,421,798 bytes. Fern is 84 files /
  78,864,822 bytes, including eight alpha videos totaling 10,771,186 bytes.

## Owner playtest

Open <http://localhost:3000/dev/design-system> first to inspect the source-backed
Light Glass fixture and the opt-in glow/sheen catalog.

Open <http://localhost:3000/experience/fern-and-the-silent-seed-bells>, then:

1. Confirm dialogue and the start interruption use a restrained Light Glass
   layer while title, mode, and transport remain solid and unambiguous.
2. In Watch, play from the beginning and notice the moving watercolor edge has
   no rectangular video boundary.
3. Let the story reach the silver path; confirm the guide interaction changes
   the layered visual state, its local gold goal is evident without a full-stage
   tint, and Watch completes the same action automatically.
4. Switch to Read-with-me, complete one child passage, and feel the soft
   ambience/visual wait and resume.
5. Resize to phone portrait and desktop landscape. Confirm the whole 4:3 art,
   dialogue, and controls remain usable without horizontal scrolling.
6. Replay the ending and drag the hidden test seek control only through the QA
   harness if reverse-settlement behavior needs inspection.

Subjective approval should focus on alpha-edge cleanliness, whether the plate
and motion feel like one illustration, transition softness, and whether the
silver-path action feels meaningfully more immersive than the flattened beats.

## Validation record

- `pnpm typecheck` — pass
- `pnpm lint:experiences` — pass; 55 referenced assets
- `pnpm build` — pass
- `pnpm qa:design-system` — pass: exact Light Glass computed recipe, portable
  fallback fixture, recipe maturity/fidelity diagnostics, responsive catalog,
  reduced-motion sheen behavior, and Chromium/WebKit computed-style parity
- `pnpm qa:experience -- fern-and-the-silent-seed-bells` — pass in Chromium:
  Watch, Read-with-me, keyboard guide completion, touch-safe geometry, reverse
  scrub, ending, alpha fallback, reduced motion, and six responsive presets
- `pnpm qa:experience:webkit -- fern-and-the-silent-seed-bells` — same full
  playback and recovery matrix passes in WebKit/Safari engine
- Browser inspection — exact 60% fill/border and 10px blur confirmed over live
  Fern media; persistent chrome and solid prompts/errors have no backdrop filter;
  390×844 has no overflow and keeps 44px controls; the guide adds no stage-wide
  tint; checked-in Chromium and WebKit captures show no visual regression
- Native-alpha files — eight VP9 WebMs with `ALPHA_MODE=1`; representative
  composite and mask inspected against a contrasting plate
- Browser console — no page error or unhandled rejection during forward state
  settlement
- Solid-matte regression — computed page, stage, media, and active-layer colors
  all equal `stage.backdrop.color`; no runtime background image, filter, opacity
  wash, pseudo-atmosphere, or atmosphere DOM element

## Seedance gate

Do not migrate providers by default. When access is worthwhile, regenerate only
the silver-path hero state family with the same references and semantic start /
hold / action / resolve contract. Adopt Seedance only if a side-by-side review
shows a material improvement in character/prop continuity, matched state
handoffs, transparent or mask-ready delivery, or accepted output per hour. The
runtime and package schema require no provider-specific changes.
