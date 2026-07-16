# Fern playable-alpha production loop

This is the autonomous execution plan for taking **Fern and the Silent Seed
Bells** from its approved performance and partial keyframe board to a story the
owner can play end to end in the local app.

It is a bounded replacement-POC loop, not the M7 film-rendering milestone. The
loop ends with a complete interactive alpha at
`/experience/fern-and-the-silent-seed-bells`; deterministic film rendering can
begin only after the owner has played and reviewed that alpha.

## Starting point

- The 77.089-second expressive performance master, forced alignment, 16
  phrases, 17 reading units, nine safe stops, and hero pause are complete.
- Canonical Fern/Pipkin, seed-bell, and bell-tree references are approved.
- Four unique keyframes cover five of 15 beat-board entries:
  `bell-tree-dawn`, `silent-tree`, `tangled-tree`, and `highest-knot`.
- Ten media states still use the visible planning placeholder.
- All 14 media states are currently posters. The package cannot declare
  continuous Watch motion until each narration-bearing state and interaction
  outcome has an accepted native video.
- Planning lint and typecheck pass. Strict lint intentionally fails while the
  ten missing beats remain pending.
- The existing `ingest-video.ts` and `generate-soundscape.ts` are golden-story
  tooling: the former targets v1 frame stories and the latter hard-codes the old
  Pip story. They must not be applied unchanged to this package.

## Progress ledger

Update this compact ledger after every committed production unit. Detailed
asset truth remains in the story manifests.

| Workstream | Current state |
|---|---|
| Performance and alignment | Complete |
| Canonical references | 3/3 complete |
| Keyframe coverage | 9/14 unique media states; 10/15 beats accepted |
| Schema-v2 motion ingest | Pending |
| Native Watch video | 0/14 media states |
| Silent Seed Bells soundscape | Pending |
| Strict integration | Pending |
| Browser and responsive QA | Pending |
| Owner-ready local handoff | Pending |

## Playable-alpha definition of done

The loop is complete only when all of these are true:

1. No planning placeholder appears anywhere in the package or runtime.
2. All 15 visual beats have accepted native-4:3 keyframes, exact continuity,
   verified downloaded dimensions, and complete Grok provenance.
3. All 14 media states have native, muted Watch video plus a state-specific
   poster fallback. Stable states use living loops; transformations use
   non-looping one-shots with usable settled endings.
4. `watchMotion: "continuous"` is enabled and strict experience lint passes.
5. The drag-to-guide moment works with pointer/touch geometry, keyboard, Watch
   automation, Read-with-me waiting, and the same `pipkin-at-knot` outcome.
6. A story-specific score, ambience loop, and restrained effects are mixed and
   integrated without competing with narration. Read waits keep ambience and
   living video active while narration/effects stop and score eases away.
7. Watch plays all 77.089 seconds with sentence-appropriate visuals and causal
   state changes. Read with me shows every retained passage as one list and
   resumes the untouched performance master gracefully.
8. Strict experience lint, typecheck, v1 story lint, all experience lint, and a
   clean production build pass.
9. Browser QA passes reverse scrubbing across all 17 units, full ending and
   replay, actual interaction completion, Read waits, reduced motion, byte-range
   seeking, and a clean console.
10. The 390x844, 430x932, 768x1024, 1024x768, and 1440x900 viewports have no
    horizontal overflow, preserve the complete 4:3 art, and keep controls at
    least 44px. The 1920x1080 film composition is checked for layout parity,
    without implementing M7.
11. The clean dev server is left running, Chrome is left on the exact story
    route, and the handoff contains a short owner playtest checklist.

Passing these gates means *playtest-approved*, not final creative approval. The
owner's hands-on play remains the final subjective gate before M7.

## The recurring loop

At the beginning of every continuation:

1. Read this document, `HANDOFF.md`, the two project production skills, and the
   target story manifests.
2. Inspect git status and the on-disk asset/status matrix. Preserve unrelated
   work and never regenerate an already accepted asset without a recorded
   defect.
3. Select the earliest dependency-unblocked batch below.
4. Produce, inspect, integrate, and validate that batch.
5. Preserve provider originals, exact prompts, IDs/URLs, hashes, selected
   deliveries, and rejected candidates with concise reasons.
6. Update the beat board, continuity/package metadata, the progress ledger,
   and `HANDOFF.md`; commit the validated unit with a Conventional Commit.
7. Continue immediately to the next batch. Do not stop for a routine status
   report or merely because one asset or phase completed.

For each generated visual, inspect the full image and actual dimensions. For
each video, inspect at least beginning, midpoint, and final frames. Reject a
candidate for semantic mismatch, premature or repeated state change, cropped
action, malformed anatomy, character/prop redesign, camera drift, dirty matte,
text, or an unusable final hold.

Use two candidates when selection materially matters. Limit a repair chain to
three targeted attempts; then abandon the chain and retry from the approved
reference with a fresh prompt or fresh Grok agent. Never lower the continuity or
semantic gate just to finish. Do not purchase credits, upgrade plans, bypass a
human verification screen, or expose secrets.

## Dependency-ordered batches

### A. Finish the keyframe board

Produce these as four committed units so every later motion prompt starts from
accepted art:

1. **Early state changes:** `village-waking` (b02), then
   `lower-knots-loosened` (b05).
2. **Hero handoff:** matched `path-traced` (b08) and `pipkin-at-knot` (b09),
   followed by the settled end state for `knot-opening` (b10). Recalibrate the
   interaction regions and path against the accepted pixels.
3. **Restoration chain:** `breeze-rush` (b11), `seed-bells-ringing` (b12), and
   `forest-waking` (b13). Preserve the single ordering: knot opens, breeze
   enters, bells ring, then the village wakes.
4. **Emotional close:** `friends-listen` (b14) and `shared-morning` (b15).

Every delivery is a native 1600x1200 PNG with the action contained in frame and
a border-connected exact-white matte. Keep provider originals unchanged.

### B. Add a schema-v2 motion ingest path

Add or adapt tooling for `production.json` media states; do not pass this story
through the v1 frame-sequence ingest. It must:

- verify source dimensions and duration with `ffprobe`;
- preserve the native 4:3 composition without center-cropping;
- create browser-safe muted H.264/yuv420p/faststart delivery video;
- extract the correct state-specific poster, using a settled final frame for
  state-changing one-shots when appropriate;
- record source and delivery hashes plus technical metadata; and
- update only the named media state, preserving legal graph transitions.

### C. Produce continuous Watch motion

Animate from the accepted keyframes in continuity order. Use restrained living
loops for `bell-tree-dawn`, `silent-tree`, `tangled-tree`, `highest-knot`,
`path-traced`, `pipkin-at-knot`, `friends-listen`, and `shared-morning`. Use
non-looping, settled one-shots for `village-waking`, `lower-knots-loosened`,
`knot-opening`, `breeze-rush`, `seed-bells-ringing`, and `forest-waking`.

The same accepted `highest-knot` motion may serve both of its stable reading
beats. All other sentence-addressable states retain their own media identity.
Motion duration follows observed unit timing and transition needs, not a generic
six-second default. A one-shot action may hold its final frame; it must never
loop the authored transformation.

Only after all 14 states have accepted video and fallback posters, enable
continuous Watch motion and run strict lint.

### D. Author the Silent Seed Bells soundscape

Make sound generation story-configured instead of using the old hard-coded Pip
prompts, duration, and cue times. Generate only the new story's assets:

- a sparse Lanternleaf morning score shaped around hush, cooperation, release,
  and the resolved shared morning;
- a seamless light forest-morning ambience that can continue through reading
  waits; and
- restrained effects for ribbon release, silver path/guide, the single knot
  opening, breeze entry, seed-bell count, and village waking where useful.

Use the 77.089-second performance and observed aligned event times. Preserve
sources and cost/provenance metadata, normalize delivery stems, create a mix
preview, and verify narration intelligibility before integrating the stems.

### E. Integrate and harden the experience

Confirm the generic `/experience/[storyId]` runtime needs no story-specific
React code. Fix reusable runtime/schema/tooling defects if real assets expose
them, but do not branch into Story Studio, another interaction recipe, old-story
migration, or M7 rendering. Recheck interaction geometry after final art and
motion are installed.

### F. Release QA and owner handoff

Run the full validation commands, then start a clean dev server and exercise the
real story in Chrome. Use `pnpm qa:experience --
fern-and-the-silent-seed-bells` plus the required manual/browser matrix. Check
each reading-unit boundary against its visual, every safe stop, the hero path,
forward and reverse seeks, the last 8.6 seconds, replay, reduced motion, and
console/unhandled errors.

If QA reveals a defect, return to the earliest responsible batch, repair it,
re-run the proportional gates, commit, and continue. When all gates pass, leave
the dev server running and Chrome at:

`http://localhost:3000/experience/fern-and-the-silent-seed-bells`

## Legitimate blockers

Continue autonomously through ordinary generation failures, browser restarts,
targeted retries, code defects, failed checks, and recoverable provider errors.
Pause and ask the owner only for:

- a human-verification/CAPTCHA screen;
- a signed-out provider session that cannot be restored safely;
- exhausted quota, a purchase, or a plan upgrade;
- a missing secret or OS permission that the current process cannot access;
- an unsafe/destructive action or an external-state change beyond this project;
  or
- three fresh-strategy failures of the same essential asset with no honest
  continuity-preserving fallback.

When blocked, record the exact state, URL/file, attempts, and next user action in
`HANDOFF.md`. Do not call an unfinished loop complete.

## Goal prompt

```text
Take Fern and the Silent Seed Bells from its current partial keyframe package to
a complete interactive playable alpha, following
docs/v2/09-fern-playable-loop.md as the execution contract. Use the project-owned
author-story-film and create-lanternleaf-scenes skills, and use my existing
signed-in Grok Imagine session in Chrome for visual and video production.

Work as a long-running autonomous loop across automatic continuations. At every
continuation, resume from docs/v2/HANDOFF.md and the on-disk manifests; take the
earliest dependency-unblocked batch, generate or implement it, inspect it,
integrate it, validate it, update durable status/provenance, commit the completed
unit with a Conventional Commit, and immediately continue. Do not stop for
routine progress reports, after a single generation, at a commit boundary, or
because a test failed—diagnose, repair, and keep looping.

Preserve approved assets and provider originals. Generate only missing or
rejected media. Enforce native 4:3 composition, exact Lanternleaf continuity,
the pure-white organic matte, sentence-addressable visual meaning, living loops
only for stable states, and one-shot motion for transformations. Never accept a
placeholder, unrelated fallback image, repeated narrative action, or static
Watch state. Keep exact prompts, provider URLs/IDs, hashes, decisions, and
rejection reasons. Use bounded retries from the plan; do not buy credits,
upgrade plans, bypass human verification, or expose secrets.

The terminal condition is the full playable-alpha definition of done in that
document: all keyframes and native motion accepted, story-specific soundscape
integrated, continuous Watch and Read-with-me working, hero interaction working,
strict lint/typecheck/build and real-browser QA passing, all required responsive
viewports clean, reverse scrub and ending playback error-free, and no console
errors. Then leave a clean dev server running, leave Chrome open on
http://localhost:3000/experience/fern-and-the-silent-seed-bells, update the
handoff with a short owner playtest checklist, and report that it is ready for me
to play. Do not start M7 film rendering or call the goal complete before this
exact handoff exists.

Pause only for the legitimate blockers listed in the plan. If one occurs,
record the exact blocker and smallest user action needed; otherwise keep going.
```
