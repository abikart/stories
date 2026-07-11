# v2 session handoff

Last updated: 2026-07-10

## Read first

- Branch: `codex/interactive-story-runtime`
- Workspace: `/Users/xzo/projects/stories`
- Product/architecture index: `docs/v2/README.md`
- Roadmap authority: `docs/v2/06-poc-roadmap.md`
- Decision log: `docs/v2/DECISIONS.md`

## Current state

- V1 POC is complete and remains functional on `/read/*` and `/render/*`.
- The Boat in the Mist AI clips are committed as v1 frame scenes.
- V2 is an interactive story-film runtime built alongside v1.
- M0 documentation is complete and indexed in `docs/v2/README.md`.
- M1 responsive cinematic stage is implemented at `/dev/experience-stage`.
- `content/the-boat-in-the-mist/production.json` is a temporary schema-v2
  fixture using the original Boat p1 video master.
- Typecheck, all four v1 story linters, and production build pass.
- Real-browser verification passed at 390×844, 430×932, 768×1024,
  1024×768, and 1440×900 with no console warnings/errors.
- M2 native media state machine is complete: two-slot preload ownership,
  legal transitions, interruptible crossfades, canonical driver, and fallback.
- `pnpm lint:experiences` validates v2 schemas, graphs, canonical paths, and
  referenced assets.

## Fixed decisions

- One 16:9 creative master per media state; centered 4:3 action safe.
- Cinema, Book, and Pocket responsive presets.
- Real-seconds expressive performance timeline.
- Native video for normal playback; frames only for true scrub moments.
- Standard interaction recipes; no story-specific runtime code.
- Same production package drives interactive web and deterministic film.

## Immediate next action

Implement M3: author the original 60–90 second golden story and performance
direction, generate 3–5 continuous Eleven v3 candidates within the 50k-credit
cap, select a provisional final performance, run forced alignment, and store
audio, prompts, candidate metadata, phrases, safe stops, and provenance.

## Verification baseline

`pnpm typecheck`, `pnpm lint:stories`, and `pnpm build` pass on the v2 branch.
Responsive QA confirmed Pocket (4:3 + docked phrase), Book (4:3 + anchored
phrase), Cinema (16:9 + anchored phrase), native MP4 playback, 44px controls,
working play/pause and guide toggles, and correct action-safe geometry.
M2 browser QA additionally confirmed canonical completion at `resolve`, active
transition cancellation, healthy-current fallback after a failed standby clip,
exactly two mounted video elements, one active layer, all five viewports, and a
clean browser console.

## Session close protocol

At the end of each substantial session:

1. Update current state and immediate next action here.
2. Add architectural deviations to `DECISIONS.md`.
3. Run proportional verification.
4. Commit the completed unit with a Conventional Commit message.
