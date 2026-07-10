# Build decisions log

Divergences from the spec docs, made during the build per the guardrails in
[03-poc-requirements.md](03-poc-requirements.md). Newest first.

## M7 (2026-07-10)

- **No CDP virtual time.** Pausing Chromium's clock for frame-exact animation stepping deadlocks `page.screenshot()` (the compositor starves waiting for BeginFrames) — the first render run froze at frame 60/943. Dropped it: capture runs near-realtime (~28–35fps ≥ 30fps playback), so wall-clock CSS/WAAPI beats land at ≈correct speed. Frame-exact stepping would need CDP `HeadlessExperimental.beginFrame` — post-POC.
- **Ambient in the video is ffmpeg-synthesized** (`anoisesrc=brown` → lowpass → −26dB-ish), the same recipe as the in-app Web Audio bed; narration mp3s are placed by `adelay` using the SAME plan object the visuals used, so audio/visual sync is by construction.
- **The render plan** (enter 0.7s dormant beat, decoded-audio duration + 0.15s, 1.3s wake hold per page) is computed in the browser from decoded narration and read back by the script — one source of truth for both eyes and ears.

## M6 (2026-07-10)

- **Segmentation is scope-driven**: a word segments greedily (longest-first) against the story's declared graphemes only — "ship" is (sh)(i)(p) only where "sh" is taught. Case-preserving by construction.
- **Linter checks are structural, not phonemic** (v1): scope membership, resegmentability, g.join===w, text reconstruction, sight-word discipline, cue ranges, word budgets, asset presence. True phoneme validation (o in "cold" ≠ taught /ŏ/) needs a pronunciation lexicon — noted as post-POC.
- **Popcorn pile persists across pages via module-level scene state**, reset when p1 mounts. Kernel landings have a timer fallback because WAAPI pauses in hidden tabs — a kernel must always reach the pile.
- **Scene taps**: SceneHost forwards clicks as `event("tap", {x,y})`; scenes decide what post-wake taps do (popcorn: 3 bonus kernels).

## M5 (2026-07-10)

- **Frames are PNG, not WebP** — this machine's ffmpeg has no WebP encoder and `sips` can't write it either. `frames.ext` is now part of the Storyspec (default png); directory format otherwise unchanged, so AI-generated WebP drops in later. Ship story: ~10MB of frames, committed as content.
- **Grapheme case must match the word**: `g.join("") === w` exactly — found via "Splish" segmented lowercase rendering as "splish" (the prose renders graphemes, not `w`). This is a hard rule for the M6 linter/segmenter.
- **Frames scenes bake beats into the timeline** (drips land at their words' t positions by construction); `cue()` on the frames backend is just a subtle flash accent.
- **Next-arrow shows in every mode once a page completes** — originally hidden in Read-to-me (auto-advance), which dead-ended kids who scrub manually without pressing Play.
- **`start()` no longer resets to page 0** — honors `?p=` initial page (dev + M7 render entry).

## M4 (2026-07-10)

- **Ambient bed is synthesized** (brown noise → wandering lowpass = soft wind), per the doc-06 fallback table — no asset, starts from the Start-screen tap (which doubles as the Web Audio unlock gesture), swells on page wake, mute persisted.
- **Page turns are explicit in finger modes** (bouncy next-arrow appears on completion; kid agency), **automatic in Read-to-me** (1.5s after completion, next page auto-plays) — passive mode should flow like a bedtime reading.
- **Words counter counts completed pages once per visit** (page tokens added on first completion per mount); re-reads count again by design — it measures reading done, not unique words.

## M3 (2026-07-10)

- **Tap-a-word sound-out is sweep + whole word, not a phoneme bank.** TTS-generated isolated phonemes are unreliable ("s" reads as "ess"), and wrong phoneme audio is pedagogically worse than none. Instead, tapping a word sweeps the Spark through its graphemes slowly (~340ms each, visual sound-out) then plays the word's narration slice (the blend). A recorded human phoneme bank can slot in later.
- **Read-along re-speaks on re-entry.** Word slices play every time the Spark enters a word moving forward (not furthest-latched like chimes/cues) — re-scrubbing a word for practice speaks it again.
- **Story assets are served by a route handler** (`/content/[storyId]/[...file]`) straight from content/ — no mirroring into public/. Costs static-exportability (needs a node runtime), which we don't need for the POC; noted as the trade.
- **Tailwind v4 `@theme static` is required** — plain/inline `@theme` tree-shakes tokens that are only referenced at runtime (per-story accent vars resolved from story data). Also: mid-session `@theme` edits can leave stale HMR CSS where new rules exist in the sheet but don't cascade — cold-restart the dev server before debugging "impossible" CSS.
- **ElevenLabs narration settings**: Rachel voice, eleven_multilingual_v2, speed 0.87, stability 0.5 — warm and slow enough for early readers. Word timestamps derived from character alignment by whitespace-run grouping; the narrate script validates run count against token count.

## M1 (2026-07-10)

- **Timeline is measurement-based.** Doc 04 weighted token t-ranges by grapheme count; instead the timeline is built from *rendered* grapheme pixel ranges (gaps split at midpoints), so the Spark is always directly under the letters it lights — the reading.com feel. Assumes single-line prose (fine for level-1/2 page limits); multi-line handling deferred until a story needs it.
- **`ScrubEngine.tick(dt)` added at M1** (planned for M7): deterministic stepping outside rAF. Needed now because hidden tabs pause rAF — it's how headless verification drives the engine, and it's the fixed-timestep clock the render route will use.
- **Word-complete chime is furthest-t latched** — each word chimes once per page visit; re-scrubbing doesn't re-fire.

## M0 (2026-07-10)

- **"and" is segmented, not a sight word.** Doc 07 listed sight words `the, is, and, a` for story 1, but `a-n-d` is fully decodable within the declared scope, so treating it as a heart word would be pedagogically wrong. Story 1 declares `sightWords: ["the", "is", "a"]`.
- **`accent` added to Storyspec.** Doc 05 didn't include the per-story candy accent from doc 08; added as an optional `accent` field on the story.
- **`punct` field on tokens.** Doc 05 said punctuation "attaches to the preceding token"; concretely this is an optional `punct` string on the token, rendered after the word, owning no timeline range.
