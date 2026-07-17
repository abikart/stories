# Production system

## Story portfolio

Scale through recurring series, not unrelated one-offs. A first season targets
three worlds with four stories each. Every series owns a stable character,
location, voice, music, palette, and motion bible.

## Story budget

For a mature three-to-five-minute story:

| Production unit | Target |
|---|---:|
| Scenes | 8–12 |
| Living illustrations | 5–8 |
| Regular motion clips | 4–6 |
| Hero interactions | 1–2 |
| Clips per hero interaction | 3–5 |
| Total generated motion clips | about 10–16 |
| Narrator voices | 1 per series |
| Character voices | 0–2 per story |
| Music themes | 1–2 |
| Bespoke effects | 6–12 |

The 60–90 second golden POC uses roughly one quarter of this budget.

## Audio workflow

1. Write the literary manuscript.
2. Add a non-spoken performance script: objective, emotion, pacing, emphasis,
   pauses, and character direction.
3. Generate whole scenes or long passages, never isolated words.
4. Produce multiple performance candidates.
5. Human-select and, where needed, patch the winning performance.
6. Run forced alignment against the clean spoken manuscript.
7. Mix narration, dialogue, ambience, music, and effects as separate stems.
8. Validate synchronization and intelligibility on phone speakers.

Instructional word/phoneme audio is a separate system and cannot be cut from
the expressive performance.

Read-with-me waits separate narrative time from atmosphere. Narration and timed
effects stop exactly; the synchronized score fades out rather than drifting;
loopable ambience and living visuals continue. Resume must re-seek timed stems
before narration returns. A later series-level reading-bed loop may enrich this
interlude without requiring a new asset per story.

## Visual workflow

1. Approve the series bible, expressive performance phrases, and sentence-sized
   reading units.
2. Build a beat board that covers every reading unit exactly once and a
   continuity ledger that names each legal prop, character, and location change.
3. Create canonical character/location references.
4. Approve native 4:3 key illustrations with the complete semantic beat inside
   the frame and one exact solid dissolving matte matching
   `stage.backdrop.color` (`#FFFFFF` by default).
5. Mark the least obstructive dialogue position for each scene and approve one
   small cast portrait for every speaking character; narration remains
   label-free.
6. Assign each beat a production tier: living illustration, motion shot, or
   hero interaction.
7. Run planning lint with pending assets allowed; generate only the missing or
   rejected beats.
8. For state transitions, approve handoff keyframes before animation.
9. Generate or animate from those references, then review start, middle, and end
   frames against the continuity ledger.
10. Ingest creative masters, extract posters, and create delivery renditions.
11. Run strict release lint, Read-with-me passage QA, responsive presets, and
    the film path.

For a package that declares continuous Watch motion, every narration-bearing
reading unit and interaction outcome must use native video. Posters remain
required as decode/error fallbacks, but they are not an accepted Watch state.

Pure text-to-video generation is acceptable for exploration, not continuity-
critical final states. Image-to-video or controlled compositing should be the
default for recurring characters.

## Layer delivery workflow

The MVP accepts an approved white-matte motion master as creative source and
compiles a transparent delivery rendition with
`scripts/derive-connected-alpha.py`. For every frame, the compiler identifies
only near-neutral pixels connected to the frame boundary, feathers that matte,
and encodes VP9 alpha. Interior whites such as eyes, ribbons, and highlights are
therefore retained. It streams raw frames through memory rather than writing a
frame sequence to disk.

Every derived layer must retain:

- the accepted opaque H.264 master and poster as fallbacks;
- compiler parameters and input/output SHA-256 hashes in
  `layer-production.json`;
- a full-frame and alpha-mask inspection for halos, dirty matte, and rectangular
  remnants; and
- a browser check that the alpha rendition is selected and moving over an
  independently rendered plate.

This is a delivery operation, not a license to repair continuity during ingest.
If a matte cannot be separated cleanly, reject the layer or create a deliberate
mask/packed-alpha source. Provider originals and rejected candidates remain in
provider history or Git history after compact provenance has been recorded.

Opaque delivery is still a first-class path. For it, the solid matte is authored
into the image/video and repeated exactly by the page; the runtime must not add
poster-derived gradients, filters, or opacity treatments. Before acceptance,
sample the outer edge at the beginning, middle, and end of every video. Reject a
clip whose background varies spatially, drifts over time, or compresses far
enough from the declared matte to expose the frame.

For this repository, `$author-story-film` packages the resumable workflow. The
runtime contract and validators remain authoritative; the skill tells a fresh
session which artifacts to update and which acceptance gates must pass.

## Seam grammar

Use a small reusable transition library:

- foreground occlusion;
- fog, leaves, dust, water, or watercolor wash;
- light bloom;
- camera push into darkness;
- fast pan;
- low-motion dissolve;
- character passes close to camera.

Matched end/start frames matter more than sophisticated transition code.

## Human quality gates

Automation prepares candidates; it does not approve:

- story meaning and emotional arc;
- narrator performance;
- character continuity;
- unsafe or malformed visuals;
- scene composition;
- child comprehension;
- final film pacing.

## Sustainable quarterly cadence

- Weeks 1–2: runtime foundation.
- Weeks 3–4: golden sequence.
- Weeks 5–6: constrained Story Studio and three series bibles.
- Weeks 7–10: batch production by series.
- Weeks 11–12: device QA, compression, film renders, and launch packaging.

Twelve polished stories is the first-quarter planning target. Fifteen to twenty
per quarter becomes plausible only after the runtime, recipe library, recurring
worlds, and review pipeline have completed one season.

## Story Studio boundary

The later studio is a constrained assembly tool, not a general editor. It needs:

- scene and state graph editing;
- asset slots and responsive preview;
- performance-candidate selection;
- alignment correction;
- phrase/safe-stop authoring;
- interaction recipe bindings;
- transition, music, and effect cues;
- interactive and canonical film previews;
- validation and export.
