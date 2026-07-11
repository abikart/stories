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

## Visual workflow

1. Approve series bible and story beat board.
2. Create canonical character/location references.
3. Approve 16:9 key illustrations with the centered 4:3 action-safe overlay.
4. Assign each beat a production tier: living illustration, motion shot, or
   hero interaction.
5. For state transitions, approve handoff keyframes before animation.
6. Generate or animate from those references.
7. Ingest creative masters, extract posters, and create delivery renditions.
8. Preview all responsive presets and the film path.

Pure text-to-video generation is acceptable for exploration, not continuity-
critical final states. Image-to-video or controlled compositing should be the
default for recurring characters.

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
