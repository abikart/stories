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
- M3 expressive performance timeline is complete at `/dev/performance` for the
  original golden story, **Pip and the Lantern Seed**.
- Four whole-story Eleven v3 candidates cost 5,104 directed characters total.
  `george-natural-a` is the selected 77.6-second performance; the final master
  is mono 44.1kHz/128kbps and loudness-normalized near -16 LUFS.
- Eleven forced alignment produced 156 timed spoken words across 18 phrases,
  five scenes, and nine authored safe stops with 0.0342 alignment loss.
- `PerformanceClock` keeps the native audio element authoritative and drives
  phrase/word state, seek, pause, and replay from real seconds.
- `/dev/viewport` is the reusable exact-size same-origin QA harness when a
  browser's viewport override is unavailable.
- M4 Watch and Read-with-me player is complete at
  `/experience/pip-and-the-lantern-seed`.
- Watch is continuous. Read-with-me pauses the same performance only at authored
  safe stops, holds the completed phrase, and resumes without word splicing.
- Narration uses a centered ribbon; dialogue uses authored stage anchors in Book
  and Cinema and docks in Pocket. Both share word-level aligned highlighting.
- Replay, play/pause, seeking, mode handoff, browser audio failure messaging,
  and reduced-motion behavior are implemented with 44px-minimum controls.

## Fixed decisions

- One 16:9 creative master per media state; centered 4:3 action safe.
- Cinema, Book, and Pocket responsive presets.
- Real-seconds expressive performance timeline.
- Native video for normal playback; frames only for true scrub moments.
- Standard interaction recipes; no story-specific runtime code.
- Same production package drives interactive web and deterministic film.

## Immediate next action

Implement M5: register the reusable `drag-to-guide` recipe, add an interaction
binding to Pip's signature light-guiding beat, and support pointer, touch,
keyboard, reduced motion, and deterministic canonical completion without adding
story-specific runtime code.

## Verification baseline

`pnpm typecheck`, `pnpm lint:stories`, and `pnpm build` pass on the v2 branch.
Responsive QA confirmed Pocket (4:3 + docked phrase), Book (4:3 + anchored
phrase), Cinema (16:9 + anchored phrase), native MP4 playback, 44px controls,
working play/pause and guide toggles, and correct action-safe geometry.
M2 browser QA additionally confirmed canonical completion at `resolve`, active
transition cancellation, healthy-current fallback after a failed standby clip,
exactly two mounted video elements, one active layer, all five viewports, and a
clean browser console.
M3 Chrome QA confirmed uninterrupted audio playback, pause/resume, exact seek
to 58.2s (`Glow`), word highlighting, and replay to the opening phrase. The
390×844, 430×932, 768×1024, 1024×768, and 1440×900 framed matrix has no
horizontal overflow; every action and seek control is at least 44px high.
M4 Chrome QA confirmed continuous Watch playback, aligned narration and dialogue
overlays, seeking, replay, and Read-with-me pause at 5.986s for the 5.980s safe
stop. Continue preserved the performance cadence; switching to Watch from a
33.747s wait resumed immediately. The five-viewport matrix again has no
horizontal overflow and all controls remain at least 44px.

## Session close protocol

At the end of each substantial session:

1. Update current state and immediate next action here.
2. Add architectural deviations to `DECISIONS.md`.
3. Run proportional verification.
4. Commit the completed unit with a Conventional Commit message.
