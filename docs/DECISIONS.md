# Build decisions log

Divergences from the spec docs, made during the build per the guardrails in
[03-poc-requirements.md](03-poc-requirements.md). Newest first.

## M1 (2026-07-10)

- **Timeline is measurement-based.** Doc 04 weighted token t-ranges by grapheme count; instead the timeline is built from *rendered* grapheme pixel ranges (gaps split at midpoints), so the Spark is always directly under the letters it lights — the reading.com feel. Assumes single-line prose (fine for level-1/2 page limits); multi-line handling deferred until a story needs it.
- **`ScrubEngine.tick(dt)` added at M1** (planned for M7): deterministic stepping outside rAF. Needed now because hidden tabs pause rAF — it's how headless verification drives the engine, and it's the fixed-timestep clock the render route will use.
- **Word-complete chime is furthest-t latched** — each word chimes once per page visit; re-scrubbing doesn't re-fire.

## M0 (2026-07-10)

- **"and" is segmented, not a sight word.** Doc 07 listed sight words `the, is, and, a` for story 1, but `a-n-d` is fully decodable within the declared scope, so treating it as a heart word would be pedagogically wrong. Story 1 declares `sightWords: ["the", "is", "a"]`.
- **`accent` added to Storyspec.** Doc 05 didn't include the per-story candy accent from doc 08; added as an optional `accent` field on the story.
- **`punct` field on tokens.** Doc 05 said punctuation "attaches to the preceding token"; concretely this is an optional `punct` string on the token, rendered after the word, owning no timeline range.
