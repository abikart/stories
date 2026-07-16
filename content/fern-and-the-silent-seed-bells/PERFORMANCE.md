# Directed performance plan

Status: performance master approved and force-aligned on 2026-07-16.

## Voice

Use the series narrator: warm, observant, lightly playful, and emotionally
present without sounding theatrical. The narrator should feel as though they
have visited Lanternleaf many mornings. Fern and Pipkin may be distinguished by
subtle intention and placement rather than caricature voices.

## Arc

1. **Morning ritual:** gentle lift and a quiet musical pulse on “seed bells.”
2. **The hush:** leave real air before “the bells were silent.” Let the absence
   surprise rather than frighten.
3. **Working together:** slightly quicker, nimble pacing as the lower and middle
   knots come free.
4. **The high knot:** slow and narrow the voice. Fern is disappointed, not
   helpless; Pipkin is confident, not boastful.
5. **Child handoff:** settle after “through the leaves.” Preserve a generous
   silent performance gap for the interaction; do not fill it with spoken help.
6. **Release:** give “One careful tug” precision, then expand through “The
   breeze rushed in.” Count “one, two, three” with real delight and separation.
7. **Closing exchange:** intimate and sincere. Let the final line land softly,
   with wonder in “made together,” not a stated lesson.

## Candidate plan

- Generate 3 whole-story candidates with Eleven v3 after the timing plan and
  dialogue punctuation are approved.
- Keep the performance continuous; never generate isolated words or assemble
  phrases into the master.
- Candidate A: natural stability, closest to conversational storytelling.
- Candidate B: slightly more expressive, preserving the same pauses.
- Candidate C: alternate warm series voice only if A/B lack character contrast.
- Select by emotion, phrase shape, and fit to the 74–82 second window.
- Force-align the untouched winning master, then replace all planning times and
  empty word arrays in `production.json` with observed timings.

## Production result

- Five whole-story sources were preserved in `audio/candidates/`: the planned
  George natural, George creative, and Bella natural takes, plus two bounded
  pacing experiments after every initial take missed the 74–82 second window.
- `george-natural-a` is the editorial source winner. It had the strongest
  established series-voice fit, natural pause range, and dynamic variation.
- Eleven v3 accepted a `speed: 0.8` experiment but rendered it shorter; observed
  audio evidence overrode the nominal setting. Repeated pause tags also failed
  to create the required interaction breath and raised alignment loss.
- The untouched selected source remains in `audio/candidates/`. The delivery
  master applies reversible `0.84×` tempo mastering and inserts 3.4 seconds of
  silence at the midpoint of the existing post-`p09` pause. No word, phrase, or
  performance fragment was cut or reconstructed.
- Final duration is 77.089 seconds. The observed gap between `p09` and `p10` is
  4.42 seconds, giving Watch, film, and Read-with-me one shared hero handoff.
- Forced alignment covers 137 provider word tokens across 16 phrases and 17
  reading units with loss `0.03380775574240403`. The provider correctly treats
  `rain-washed` and `chimed—one` as one timed token each.
- Candidate hashes, exact settings, character costs, selection rationale,
  mastering parameters, raw/final alignment loss, and delivery hashes live in
  `audio/candidates/manifest.json`.

## Safe-stop direction

Safe stops follow complete performance thoughts. Leave audible breathing room
after `p02`, `p03`, `p05`, `p06`, `p08`, `p09`, `p11`, `p13`, and `p15`.
`p09` owns the hero-interaction gap; narration resumes only after Pipkin reaches
the high knot and the child chooses Continue in Read-with-me.
