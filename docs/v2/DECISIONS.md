# v2 decision log

Newest decisions go first. Record meaningful divergences, tradeoffs, and quality
gates; do not duplicate routine implementation details.

## 2026-07-11 — M6 golden visual package

- The golden sequence uses one selected 1792×1008 Grok keyframe per story scene
  plus a matched resolve keyframe for the hero interaction. All were generated
  from the approved Pip/Glow/Bramble Hollow reference, keep the important action
  inside the centered 4:3 region, and use no named artist or studio references.
- Delivery motion is deliberately short and state-shaped: calm loops for the
  opening, blue-dark idle/resolve, and closing window; one-shot resolved holds
  for the rescue and lantern bloom. The runtime mutes every visual clip and
  keeps authored narration, score, ambience, and effects authoritative.
- Image-to-video prompts lock the camera, character anatomy, painterly paper
  texture, and start composition. A beginning/middle/end review is an acceptance
  gate; the first blue-dark resolve animation was rejected because it
  progressively lit the lantern before the authored bloom scene.
- Visual provenance belongs beside the story in `visual-production.json`: exact
  Grok agent URL, selected card IDs, rejected candidates and reasons, source
  download names, motion prompts, and final package paths. Provider UI labels
  are recorded as observed even when Grok did not persist the requested names.
- Production geometry may be corrected after final art selection. The
  `drag-to-guide` binding now targets Glow and the acorn lantern in the approved
  composition rather than retaining coordinates authored for the prompt.
- The one visible Cloudflare challenge was not automated. Restarting Chrome
  cleared the gate in the existing signed-in session, after which normal
  user-authorized generation resumed.

## 2026-07-11 — M6 soundscape and visual reference

- The golden soundscape uses separate narration, music, ambience, and effect
  elements so Read-mode waits and deterministic film rendering share the same
  real-seconds clock. `Soundscape` is isolated from visual scene renders behind
  an imperative play/pause/seek controller.
- The score and source effects come from ElevenLabs; untouched generations,
  prompts, provider IDs, response cost metadata, normalized stems, cue times,
  mix ratios, and a stereo preview are stored with the story package.
- Narration remains the intelligibility anchor. Delivery targets are about -16
  LUFS narration, -24 LUFS music, and -32 LUFS ambience; runtime gains remain
  conservative. The preview measures -15.77 LUFS and -3.91dB true peak.
- Grok's approved world reference establishes an original gouache-watercolor
  language and exact Pip/Glow/lantern continuity. It is a 1792×1008 16:9 asset;
  no named artist or studio appears in the prompts.
- Visual production is resumable from the exact Grok agent URL and card IDs in
  `visual-production.json`. A Cloudflare verification challenge is a user gate,
  not permission to automate or route around it.

## 2026-07-11 — M5 drag-to-guide

- The hero interaction is bound to `the-blue-dark` after phrase `p10`: Glow has
  offered to find the path together, and the child guides his light home.
- Interaction behavior is engine-owned. The story supplies normalized start and
  target regions, a visual path, prompt, trigger phrase, and completion media
  state; it supplies no React or pointer code.
- Read-with-me exposes the direct manipulation at its authored safe stop. Watch
  remains continuous by executing the same recipe's canonical path once the
  trigger phrase ends.
- Pointer motion writes compositor transforms directly from a cached stage
  rectangle instead of rendering React state on every move. Failed drops return
  in 280ms with an on-screen movement curve; successful media resolution uses
  the existing 420ms deck crossfade.
- Keyboard arrows move immediately without animation. Enter is an equivalent
  direct completion path. Reduced-motion preference removes recipe travel and
  completion transitions rather than merely shortening them.
- The actual target is at least 44×44px and the draggable is 52×52px at every
  supported viewport. Pointer capture and `touch-action: none` make the same
  controller usable for mouse, pen, and touch.

## 2026-07-11 — M4 Watch and Read-with-me

- `/experience/[storyId]` is now the reusable interactive route. V1 `/read/*`
  and `/render/*` remain unchanged.
- Watch and Read-with-me share one `PerformanceClock` and master audio. Read mode
  pauses within the natural post-phrase gap at authored `safeStopAfter` times;
  continuing calls `play()` on the same audio element.
- The safe-stop cursor is recomputed after seeks and mode changes. Past stops do
  not trap the child, replay resets the cursor, and switching to Watch releases
  an active wait.
- During an authored wait the completed phrase remains visible. Between normal
  phrases the preceding phrase remains until its successor begins, preventing
  text flicker during expressive pauses.
- Narration and dialogue are distinct overlay presentations over the same DOM
  phrase. Dialogue consumes authored normalized anchors in Book/Cinema; Pocket
  docks every overlay below the 4:3 media crop.
- Word help remains deferred. When added it must be a separate reading service
  and UI action; it may not seek, slice, or replace the performance master.
- The player uses a calm dark-world shell, high-contrast paper overlays,
  restrained 150–180ms ease-out feedback, and no gratuitous container motion.
  Reduced-motion mode removes phrase and control animation.

## 2026-07-11 — M3 expressive performance

- The golden story is **Pip and the Lantern Seed**, a 77.6-second Bramble Hollow
  story for ages 5–7. Its theme is reciprocal help, expressed through action
  and the closing image rather than an explained moral.
- Generate and align one continuous performance. Phrase and word timing are
  metadata over that master; Read-with-me must never assemble speech from
  per-word clips.
- Four Eleven v3 candidates used two voice profiles and two stability settings.
  Candidate selection combines the intended warm storyteller profile with fit
  to the 78-second target; all candidates and provenance remain in the package.
- The delivery master is loudness-normalized toward -16 LUFS while untouched
  generation candidates remain available for audit. Normalization does not
  alter the forced-alignment timeline.
- The native `HTMLAudioElement` is the performance-clock authority. React state
  samples it for UI but does not maintain a competing elapsed-time clock.
- Safe stops are authored only after complete phrases. Read-with-me may pause at
  those points, never between words or by replacing expressive audio.
- Exact responsive QA uses a same-origin iframe harness at `/dev/viewport` when
  the browser's viewport override is unavailable. The content frame—not an
  approximate CSS mock—is the measured viewport.

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
