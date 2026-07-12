---
name: author-story-film
description: Plan, create, revise, or validate stories.sh interactive story-film production packages. Use for manuscript-to-media work, beat boards, phrase/read synchronization, Read-with-me passages, visual generation, character or prop continuity, Grok Imagine production, ElevenLabs performance, missing-scene repair, and film-path readiness in this repository.
---

# Author Story Film

Build story packages whose expressive audio, readable text, visual beats, interactions, and film path share one validated timeline.

## Required context

Read these before making story decisions:

1. `docs/v2/README.md`
2. `docs/v2/HANDOFF.md`
3. `docs/v2/05-production-system.md`
4. `docs/v2/DECISIONS.md`
5. `references/workflow.md` in this skill

Read the target story's `production.json`, `beat-board.json`, `continuity.json`, and provider provenance before revising it.

## Mandatory sequence

1. Preserve the continuous expressive performance master and its word alignment.
2. Split performance phrases into sentence-sized `readingUnits` without cutting new audio.
3. Map every reading unit to an explicit media state in `beat-board.json`.
4. Record prop, character, and location state on every beat in `continuity.json`.
5. Run `pnpm lint:experiences -- <story-id> --allow-pending` before generation.
6. Generate canonical references before continuity-critical keyframes or video.
7. Prefer matched image-to-video, locked cameras, and authored handoffs.
8. Inspect beginning, middle, and end frames; reject semantic or continuity drift.
9. Mark only accepted assets `approved-existing`, `approved-generated`, or `approved-derived`.
10. Run strict lint, typecheck, build, real-browser playback, and the five viewport matrix before completion.

Do not begin expensive generation while reading units, beat coverage, or continuity transitions are unresolved.

## Runtime rules

- Treat performance phrases, reading units, visual beats, and safe stops as separate layers.
- Allow multiple reading units to share a visual state only when the visual meaning is stable.
- Loop only living holds. Never loop an action whose narrative state changes.
- When a production declares continuous Watch motion, every narration-bearing
  reading unit and interaction outcome must resolve to a native video state;
  posters are decode fallbacks and Read-mode holds, not Watch presentation.
- Make Read-with-me retain the entire passage since the previous safe stop.
- At each Read-with-me wait, show that complete passage as one ordered, well-spaced
  list with a single 44px-minimum Continue action; do not paginate its lines.
- Treat a Read-with-me wait as a soft handoff: pause narration and timed effects,
  fade the synchronized score, but keep loopable ambience and living holds active.
- Make settling and resuming phases interruptible, resynchronize timed stems
  before narration returns, and remove visual motion under reduced-motion preference.
- Seek within the same performance master for replay; never reconstruct narration from word clips.
- Make canonical Watch interactions finish before narration advances to their consequence.

## Validation

Planning pass:

```bash
pnpm lint:experiences -- <story-id> --allow-pending
```

Release pass:

```bash
pnpm typecheck
pnpm lint:stories
pnpm lint:experiences
pnpm build
```

Run `pnpm qa:experience -- <story-id>` against a clean local dev server after
runtime or timeline changes. Stop the dev server before `pnpm build`, because
both commands own `.next`; restart it before browser QA.

Strict lint must fail while any beat is `needs-generation`, `derived-pending`, or `replace-needed`.

## Handoff

Update `docs/v2/HANDOFF.md`, record meaningful tradeoffs in `docs/v2/DECISIONS.md`, preserve exact prompts and rejected candidates beside the story, and commit each substantial validated unit locally. Never push unless explicitly asked.
