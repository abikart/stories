# v2 decision log

Newest decisions go first. Record meaningful divergences, tradeoffs, and quality
gates; do not duplicate routine implementation details.

## 2026-07-11 — M2 native media deck

- The media runtime owns exactly two slots: the active state and one likely-next
  state. A transition reuses the standby slot, then immediately turns the
  released slot into the next preload.
- Poster backgrounds live underneath every video layer permanently, so decode
  failure never exposes black. A failed standby transition preserves the active
  state and enters an explicit recoverable error phase.
- Readiness is checked both from media events and synchronously after slot
  assignment. Browsers can reach `readyState >= 2` before React observes a
  readiness event, so event-only state machines can stall on already-decoded
  local media.
- Runtime slot ownership is mirrored in refs while React renders the layers.
  Long-running canonical drivers must not make transition decisions from a
  stale render closure.
- The Boat package includes a deliberately invalid-media `broken-fixture`
  state for fallback QA. It is ignored by the canonical path and will not be
  copied into the golden story.

## 2026-07-10 — v2 foundation

- Keep the existing repository and create v2 in parallel on
  `codex/interactive-story-runtime`; preserve v1 routes until the golden POC
  proves replacement value.
- A directed, expressive performance in real seconds is the source of truth.
  The v1 normalized page scrubber is not migrated into the v2 core.
- Author one 16:9 creative master per visual state with a centered 4:3 action-
  safe region. Responsive delivery uses crops, overlays, and derived encodes—not
  separately directed mobile videos.
- Normal motion uses native video. Frame sequences are limited to genuinely
  scrubbable short moments.
- The first content target is a 60–90 second golden sequence with Watch and
  Read-with-me modes, not a migration of the existing library.
- V2 production metadata lives in `content/<id>/production.json` beside v1
  `story.json` during the parallel POC. A dedicated loader validates schema v2.
- The responsive-stage fixture reuses an original Boat MP4 directly through the
  content asset route. This is a technical fixture, not approval of its action-
  safe composition or creative quality.
