# Build decisions log

Divergences from the spec docs, made during the build per the guardrails in
[03-poc-requirements.md](03-poc-requirements.md). Newest first.

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
