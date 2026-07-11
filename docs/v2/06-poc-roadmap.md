# Golden POC roadmap

Each milestone ends with typecheck, production build, real-browser verification,
acceptance notes, and a conventional commit. Update `HANDOFF.md` after each
substantial unit.

## M0 — Foundation and durable context

Deliver the indexed v2 documents, decision log, handoff, branch, and README
orientation. Preserve v1 as a reference without treating its normalized page
timeline as a constraint.

**Done when:** a fresh session can identify the product, architecture,
responsive contract, production plan, current status, and next command by
reading only `docs/v2/README.md` and `docs/v2/HANDOFF.md`.

## M1 — Responsive cinematic stage

Implement the v2 schema subset, fixture production package, and
`/dev/experience-stage` with:

- one 16:9 creative master;
- Cinema, Book, and Pocket presets;
- centered 4:3 crop in Book/Pocket;
- focal-point metadata;
- poster-derived atmosphere;
- anchored dialogue and Pocket docking;
- debug safe-area guides and active-preset label;
- 44px controls and reduced motion.

**Done when:** the single asset composes intentionally at every required test
viewport without separate creative files.

## M2 — Native media state machine

Implement poster/enter/idle/action/resolve states, legal transitions, dual-video
preloading, opacity crossfades, cancellation, failure fallback, and a simple
canonical driver.

**Done when:** a multi-clip fixture moves between states without black frames or
loading the entire story.

## M3 — Expressive performance timeline

Create the golden script and performance directions, generate/select final
expressive narration, align final audio, add phrase boundaries and safe stops,
and play it from one real-seconds performance clock.

**Done when:** narration sounds performed rather than announced, and active
phrases/words follow the selected audio without per-word files.

## M4 — Watch and Read with me

Add mode UI, narration ribbon, character bubbles, word highlighting, replay,
pause/resume, and safe-stop release. Word help may be a stub but must remain
architecturally separate from performance audio.

**Done when:** Watch flows continuously and Read with me waits without damaging
speech cadence.

## M5 — Hero interaction

Implement `drag-to-guide` once and bind the golden story's signature moment to
it. Support pointer, touch, keyboard, reduced motion, and canonical film action.

**Done when:** the action feels narratively causal on phone and desktop and adds
no story-specific runtime code.

## M6 — Golden visuals and sound mix

Replace technical fixtures with approved key illustrations, motion states,
posters, ambience, music, and effects. Validate continuity, responsive safe
areas, and phone-speaker intelligibility.

**Done when:** the sequence meets the product charter's emotional and visual
quality gate.

## M7 — Film path and final QA

Adapt deterministic rendering to `/film/[storyId]`, automate interactions,
mux stems, render 1080p, and test the required viewport/device matrix.

**Done when:** interactive and film outputs visibly share one package and the
result is credible as both a launch demo and a YouTube story.

## Current status

- M0 complete: durable v2 documentation and handoff.
- M1 complete: responsive cinematic stage and schema-v2 fixture.
- M2 complete: two-slot native media deck, legal graph transitions, canonical
  driver, cancellation, and poster-backed failure recovery.
- M3 complete: original 77.6-second golden story, four Eleven v3 whole-story
  candidates, selected normalized performance, forced alignment, 18 phrases,
  156 timed words, nine safe stops, and a real-seconds audio clock.
- M4 complete: responsive `/experience/[storyId]` player, continuous Watch,
  safe-stop Read-with-me, narration ribbons, anchored dialogue, aligned words,
  transport, replay, seeking, and mode handoff.
- M5 next: reusable drag-to-guide hero interaction and canonical completion.

Do not start Story Studio, migrate old stories, or add more interaction recipes
before the media state machine and expressive performance timeline are verified.
