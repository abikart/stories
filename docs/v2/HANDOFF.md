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
- M1 responsive cinematic stage is the active implementation milestone.

## Fixed decisions

- One 16:9 creative master per media state; centered 4:3 action safe.
- Cinema, Book, and Pocket responsive presets.
- Real-seconds expressive performance timeline.
- Native video for normal playback; frames only for true scrub moments.
- Standard interaction recipes; no story-specific runtime code.
- Same production package drives interactive web and deterministic film.

## Immediate next action

Implement and verify `/dev/experience-stage` with the v2 schema subset,
responsive preset label, safe-area debug guides, anchored/docked dialogue, and
one existing 16:9 Boat clip as a temporary fixture.

## Verification baseline

Before this branch, `pnpm typecheck`, `pnpm lint:stories`, and `pnpm build` all
passed. The git working tree was clean at commit `3ebe181` plus the prior status
checkpoint `bc302e8`.

## Session close protocol

At the end of each substantial session:

1. Update current state and immediate next action here.
2. Add architectural deviations to `DECISIONS.md`.
3. Run proportional verification.
4. Commit the completed unit with a Conventional Commit message.
