# v2 session handoff

Last updated: 2026-07-16

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
- M5 reusable `drag-to-guide` is complete and bound to `the-blue-dark` after
  Glow promises, “Then we will find it together.”
- Read-with-me holds the safe stop until the child guides Glow; Watch executes
  the same binding canonically without breaking continuous narration.
- Pointer/touch uses Pointer Events and capture, failed drops return to origin,
  Enter offers a direct keyboard equivalent, arrow keys move without animation,
  and reduced motion resolves without travel animation.
- `/dev/drag-to-guide` is the focused recipe fixture sourced from the production
  binding rather than duplicate fixture coordinates.
- M6 sound production is complete: ElevenLabs instrumental score, seamless
  woodland ambience, three timed effects, normalized delivery stems, source
  provenance, and a stereo mix preview. Runtime stems remain within 31ms of the
  narration after play, pause, and arbitrary seek.
- The approved 1792×1008 Grok world/character reference is stored at
  `content/pip-and-the-lantern-seed/references/world-reference.jpg`.
- M6 golden visuals are complete and committed in `cd50578`. Six selected
  1792×1008 keyframes and six 6.041667-second 1280×720 motion states now replace
  every technical placeholder in the golden experience.
- `the-blue-dark` has matched idle and resolve videos; the interaction geometry
  is aligned to the approved Glow and lantern positions in the actual artwork.
- Grok prompts, selected card IDs, rejected alternatives, source download names,
  exact agent URL, and the rejected first resolve animation are preserved in
  `content/pip-and-the-lantern-seed/visual-production.json`.
- Cloudflare presented one human-verification screen after Scene 01. No challenge
  was automated; after Chrome restarted, the signed-in session resumed without
  the gate and production completed normally.
- M6.1 continuity correction is complete. The 18 expressive phrases now contain
  27 sentence-sized reading units mapped across 16 machine-validated visual
  beats. Broad scenes remain location containers; they no longer determine how
  much prose must share one visual state.
- Read-with-me retains every sentence since the previous safe stop and displays
  the complete passage as one ordered, comfortably spaced list. One Continue
  action resumes the untouched performance master from the latest sentence.
- `beat-board.json` proves every reading unit has one visual beat;
  `continuity.json` proves the lantern remains dark until the single doorstep
  spark. Strict `pnpm lint:experiences -- pip-and-the-lantern-seed` now validates
  both contracts and all 27 referenced assets.
- Corrective media adds distinct village, Pip-exception, failed-attempt,
  path-reveal, travel, doorstep-cold, single-bloom, and resolved-hold states.
  Travel is a 10.041667-second one-shot; the failed attempt and definitive bloom
  are 6.041667-second one-shots. Full Grok provenance lives in the M6.1 revision
  of `visual-production.json`.
- The content route supports HTTP byte ranges, so audio/video seeking works
  before playback and after pauses. Seeking past the hero interaction derives
  its completed state from the destination and cannot overwrite a later cue.
- `.codex/skills/author-story-film` is the project-owned, validated production
  skill for beat coverage, continuity, generation, integration, and release QA.
- M6.2 playback correction is complete. Poster cues now render their own asset,
  arbitrary seeks bypass transition-edge restrictions for clock reconciliation,
  and expressive gaps retain the preceding sentence and authored visual.
- The golden package declares continuous Watch motion. Village, Pip exception,
  discovery, free-Glow, revealed-route, cold-doorstep, and lit-lantern holds are
  native video states; strict lint rejects future narration or interaction cues
  that regress to static posters.
- M6.3 scrub reconciliation is complete. Scene and cue now derive atomically
  from one reading unit, and returning to the visible cue cancels any superseded
  standby transition. Reverse scrubbing can no longer send `travel` to the
  `the-lantern-blooms` graph or let an older transition win later.
- M6.4 simplifies Read-with-me waits: all lines in the current safe-stop passage
  are visible together with speaker labels and one Continue action. Sentence
  paging, arrow controls, and the sentence counter are removed.
- M6.5 makes those waits atmospheric rather than abrupt. Narration and effects
  pause exactly, the synchronized score fades out, seamless ambience and living
  video continue, and an adaptive lead-in restores all timed stems on Continue.
- Aval was assessed as a possible compiled motion/runtime layer. It is not a
  replacement for the performance-led, seekable story runtime or film path and
  will not be integrated during the golden POC. `docs/v2/07-aval-assessment.md`
  records the complete capability map, reusable paradigms, constraints, and a
  bounded post-M7 experiment for an optional living-hold/interaction renderer.
- The new Lanternleaf universe direction in `docs/universe/` is reconciled with
  the project-owned `create-lanternleaf-scenes` skill. The written world guide
  is authoritative; role-specific images no longer act as global style masters.
- `/dev/lanternleaf-layout` is the approved proof for one native 4:3
  visual master. Phone and portrait tablet stack art over copy; desktop uses an
  editorial row; `?film=1` composes the same 4:3 art and DOM copy inside an exact
  16:9 film frame. Watch and seven-line Read-with-me states are switchable.
- The proof uses three portrait universe references as intentionally uncropped
  stand-ins. Production art must be recomposed natively at 4:3, and the shared
  pure-white matte becomes a release gate so the painted edge dissolves into the
  page without exposing a rectangular video canvas.
- `docs/v2/08-lanternleaf-layout-proof.md` records the measured rationale and
  `03-responsive-stage.md` now governs the approved layout. Existing Pip and
  Boat packages remain supported legacy fixtures.
- The replacement creative POC is **Fern and the Silent Seed Bells** in
  `content/fern-and-the-silent-seed-bells/`. Its manuscript, directed performance
  plan, native-4:3 production package, 17 reading units, 15-beat board,
  continuity ledger, hero interaction, visual direction, and exact canonical
  reference prompts are complete. `performance-source.json` exactly matches the
  16 phrase texts and defines three directed Eleven v3 candidates, but no audio
  generation has started.
- The new package passes `pnpm lint:experiences --
  fern-and-the-silent-seed-bells --allow-pending`. Strict lint intentionally
  fails on all 15 `needs-generation` story beats; the placeholder remains
  visibly marked as non-production media.
- The three dependency-ordered canonical references for **Fern and the Silent
  Seed Bells** are approved: Fern/Pipkin identity, four-state seed-bell sheet,
  and bell-tree interaction geometry. Grok provider originals, accepted
  1600×1200 delivery PNGs, exact prompts, targeted repair prompts, provider IDs,
  hashes, decisions, and rejection reasons are preserved in the story package.
- The project-owned `create-lanternleaf-scenes` skill now includes a reusable
  border-connected matte normalizer. It preserves each provider original and
  converts only neutral near-white pixels reachable from the image border to
  exact `#FFFFFF`; all three derived references passed full-frame visual QA.
- Five Eleven v3 whole-story candidates are preserved for **Fern and the Silent
  Seed Bells**. `george-natural-a` is the selected source; a reversible `0.84×`
  tempo treatment and 3.4-second post-`p09` pause produce the 77.089-second
  delivery master without reconstructing speech from clips.
- Final forced alignment covers 137 provider tokens across all 16 phrases and
  17 reading units at `0.03380775574240403` loss. Every nested reading unit now
  owns observed word timing, and the hero gap from the end of `p09` to the start
  of `p10` is 4.42 seconds. Candidate decisions, exact settings, hashes, costs,
  raw/final alignment loss, and mastering provenance are in the audio manifest.
- `narrate-performance.ts` now treats internal hyphen/em-dash compounds as the
  provider does, updates reading units as well as phrases, and keys alignment
  reuse to the mastered performance hash so a changed selection cannot inherit
  stale timing.
- First story-keyframe anchors are integrated for **Fern and the Silent Seed
  Bells**: dry `bell-tree-dawn`, matched rain-washed `silent-tree`, fully visible
  `tangled-tree`, and the canonical `highest-knot` reused for both Fern's limit
  and Pipkin's offer.
- The first playable-loop production unit is integrated: `village-waking`
  preserves the dry memory with readable open shutters and one oven puff;
  `lower-knots-loosened` preserves the wide tangled-tree camera while freeing
  the low/middle ribbons and retaining one high knot. Those six unique keyframe
  states cover seven of 15 beat-board entries. Both selected
  Grok originals, the rejected tighter-camera b05 repair, normalized 1600x1200
  PNGs, exact prompts, IDs, hashes, and decisions are preserved in-package.
- The hero handoff keyframes are integrated: `path-traced` provides one visible
  child-followable route, `pipkin-at-knot` clears the start and moves a single
  source-scale four-wing Pipkin to the canopy endpoint, and `knot-opening`
  removes the final bundle while the bells remain silent. Interaction start,
  target, and waypoints are recalibrated to the accepted pixels. The guide route
  dissolves only in the completed b10 state as success feedback. Nine unique
  keyframe states now cover ten of 15 beats; five remain pending. Selected and
  rejected provider originals, exact repair prompts, IDs, hashes, and normalized
  deliveries are preserved in the story package.
- The restoration chain is integrated in causal order: `breeze-rush` lifts the
  three freed bells before their first chime, `seed-bells-ringing` gives each
  bell a distinct modest ringing phase, and `forest-waking` opens the rounded
  shutters, adds one oven puff, and brings exactly three bipedal neighbors onto
  the paths after the rain. Twelve unique media states now cover thirteen of 15
  beats. Accepted and rejected Grok originals, exact repair prompts, IDs,
  hashes, and normalization decisions are preserved. The blue element retained
  in b11 is the approved b10 suspension attachment, not the removed high-knot
  bundle. The b13 delivery uses a documented 98% inset and pure-white pad to
  keep its pale wash from touching the frame edge without erasing atmosphere.
- `docs/v2/09-fern-playable-loop.md` now defines the autonomous route from that
  partial board to a hands-on local alpha: dependency-ordered keyframes, schema-
  v2 motion ingest, 14 native Watch states, story-specific sound, integration,
  strict validation, responsive/browser QA, bounded retries, blocker policy,
  and the exact long-running goal prompt. The loop stops before M7 film work.
- The first Grok memory submission ended in a provider stream error. A wet-state
  leak was repaired before approval. The first tangle edit chain was abandoned
  after cropping/removing bells; a fresh original-reference generation passed.
  One otherwise viable tangle candidate was rejected because its downloaded
  file was 1264×1568 portrait despite the UI claiming native 4:3. Exact prompts,
  IDs, hashes, decisions, and originals are preserved beside the package.

## Fixed decisions

- One native 4:3 creative master per new media state; legacy 16:9 packages stay
  valid only as regression fixtures.
- Cinema row, Book stack, and Pocket stack responsive presets.
- Real-seconds expressive performance timeline.
- Native video for normal playback; frames only for true scrub moments.
- Standard interaction recipes; no story-specific runtime code.
- Same production package drives interactive web and deterministic film.

## Immediate next action

Continue the resumable playable-alpha loop in
`docs/v2/09-fern-playable-loop.md`. The next production unit is the restoration
chain's emotional close: create `friends-listen` (b14) and `shared-morning`
(b15), preserving the restored three-bell state and returning to a quiet mutual
smile before the wider awake-village resolution. Then implement schema-v2
motion ingest and continue through motion, soundscape, integration, and QA until
the local experience is open and ready for owner playtesting.

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
M5 QA confirmed keyboard completion, actual pointer drag completion, failed-drop
return, media transition to `resolve`, automatic Watch completion, and narration
resume from the same master. The interaction fixture passed all five viewports
with no overflow, a 52px draggable, and a target no smaller than 44×44px.
M6 sound QA confirmed four synchronized audio elements, play/pause parity, 50s
seek parity, restart drift no greater than 31ms, clean console, -15.77 LUFS mix
preview, -3.91dB true peak, and effect activity at 25.25s, 47.4s, and 64.2s.
M6 visual QA inspected beginning/middle/end frames of all six clips and rejected
one resolve take that progressively over-lit the lantern. Chrome then confirmed
native playback, four authored audio elements, exactly two mounted videos with
one active layer, clean console output, keyboard and actual pointer-drag resolve,
and narration resume. The 390×844, 430×932, 768×1024, 1024×768, and 1440×900
matrix has no horizontal overflow; all story buttons and the scrubber are at
least 44px, and the same 16:9 masters preserve the centered action-safe beat.
M6.1 QA confirmed two- and four-sentence passage history, reverse visual-state
restoration, paused interaction completion, exact post-interaction travel seek,
the new travel and bloom sources, a final `lit-hold`, and no console errors.
At 390×844 the embedded reading navigator is 312×112px with zero horizontal
overflow. Strict experience lint, typecheck, the optimized production build,
skill validation, and HTTP `206 Partial Content` media delivery pass.
M6.2 QA confirmed that all 27 reading units resolve to video, fresh seeks restore
the exact village, Pip, tiny-light, trapped, free-Glow, travel, doorstep, and
lit-hold sources, opening motion plays immediately, and the browser console is
clean. Read-with-me restores the prior and next living states at its first wait.
The five-viewport matrix passes with no overflow and all buttons at least 44px.
M6.3 QA stress-scrubs backward through every reading unit, then plays the final
8.6 seconds through `Play again`; the exact opening and closing states restore
with no page error or unhandled rejection. The check is now reusable through
`pnpm qa:experience -- pip-and-the-lantern-seed` against a clean dev server.
M6.4 QA confirms the first retained passage has its exact authored lines, no
previous/next controls, and exactly one Continue action. The longest seven-line
passage is fully visible without internal or horizontal overflow at 390×844,
430×932, 768×1024, 1024×768, and 1440×900.
M6.5 QA confirms the waiting performance and effects are paused, score is silent,
ambience and active video advance throughout the dwell, Continue preserves the
resume lead-in, and narration, score, ambience, and effects rejoin afterward.
The interaction-owned safe stop completes and resumes through the same phases
without page errors or negative-volume interpolation. The seven-line passage,
living ambience/video dwell, and 44px Continue control pass all five viewports;
reduced-motion removes entry and exit motion while preserving the audio handoff.
The Lanternleaf layout proof passes typecheck and production build. Browser QA
at 390×844, 430×932, 768×1024, 1024×768, and 1440×900 confirms a stable 4:3
artboard, zero horizontal overflow, the intended stack/row switch, and 44px
controls. The seven-line passage has no nested scroll. The exact 1920×1080 film
frame contains both the 4:3 art and copy without overflow, reference switching
works, and the browser console is clean.
The reconciled scene skill and story-film skill pass the system skill validator.
The replacement POC planning package passes schema, media-graph, reading-unit
coverage, continuity, and pending-asset lint. Strict lint fails only because all
15 visual beats remain deliberately marked `needs-generation`. Canonical visual
reference QA additionally confirmed native 1600×1200 output, exact white delivery
mattes, Fern's satchel, Pipkin's four-wing anatomy, twelve-bell continuity-sheet
coverage, and the location's two-free-ribbon/one-high-knot state. Performance QA
additionally confirms a 77.089-second mono 44.1kHz/128kbps master, final alignment
loss `0.03380775574240403`, nonempty word arrays for every phrase and reading
unit, and a 4.42-second authored hero-interaction handoff. The first anchor batch
adds three approved 1600×1200 generated keyframes and one 1600×1200 canonical
derivation with exact-white corners; pending-asset experience lint remains the
appropriate gate until the other ten beat entries are produced.

## Session close protocol

At the end of each substantial session:

1. Update current state and immediate next action here.
2. Add architectural deviations to `DECISIONS.md`.
3. Run proportional verification.
4. Commit the completed unit with a Conventional Commit message.
