# v2 decision log

Newest decisions go first. Record meaningful divergences, tradeoffs, and quality
gates; do not duplicate routine implementation details.

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
