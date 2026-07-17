# Story-film workflow

## Timeline layers

Keep four separate layers over one real-seconds performance master:

- **Performance phrase:** an expressive spoken passage; may contain several sentences.
- **Reading unit:** one child-readable sentence or deliberate fragment with aligned words.
- **Visual beat:** an intentional image, hold, action shot, or interaction outcome.
- **Safe stop:** a natural post-phrase pause where Read-with-me may wait.

Never use a broad chapter/scene boundary as a substitute for sentence or visual timing.

## Beat-board contract

Every reading unit must appear exactly once in `beat-board.json`. A beat records:

- reading-unit IDs;
- scene and media-state IDs;
- production tier;
- precise visual intent;
- asset status;
- every continuity subject;
- interaction outcome when applicable.

Several units may share a beat only if no described action, location, or prop state changes between them.

## Continuity contract

`continuity.json` declares each tracked subject's initial state and every allowed state change at an exact reading unit. The beat board repeats the current state on every beat.

Track at minimum:

- transformation-bearing props;
- recurring characters' presence and role;
- location or travel progression.

If a transformation appears twice, occurs before its authored unit, regresses, or lacks a declared transition, reject the asset or storyboard.

## Visual coverage gates

- Establishing narration needs an establishing visual.
- Discoveries need a pre-discovery and reveal state when the distinction matters.
- Narrated travel needs visible travel, not a stationary loop.
- One-shot action duration must cover its narration and settle on a usable final hold.
- A loop may cover multiple units only when it is a semantically stable living illustration.
- A story marked for continuous Watch motion may not map a reading unit or
  interaction outcome to a poster state. Keep the poster only as the video's
  decode/error fallback or as an explicitly paused Read-mode treatment.
- Interaction completion changes only the authored state and must hand off cleanly to the next beat.
- New stories use a native 4:3 creative master with the complete action and
  interaction geometry in frame. Existing 16:9 packages are legacy fixtures.

## Read-with-me gates

At each safe stop:

- retain every reading unit since the previous stop;
- render the complete retained passage as one ordered, comfortably spaced list;
- keep speaker labels legible when narration and dialogue share the passage;
- keep the latest unit's authored visual beat behind the complete passage;
- use one clear Continue action and do not paginate the retained lines;
- pause narration and effects exactly, fade the synchronized score, and keep
  loopable ambience plus the living visual active during the child's turn;
- ease into and out of the passage without adding excessive silence, then
  resynchronize score and effects before the next spoken word;
- after a hero interaction, remain in the reading passage until the child chooses Continue.

## Generation and acceptance

Before generation, approve the beat's visual intent, continuity snapshot,
duration, motion tier, start state, and end state. Generate 2–3 candidates when
selection matters. Retain compact provider, project/agent URL, prompt, source
ID, selected output, hashes, and rejection reasons. Keep accepted delivery
assets active; archive redundant provider originals and rejected binaries in
the run baseline after acceptance.

For video, inspect at least start, midpoint, and final frames. Reject camera drift, redesign, premature transformation, duplicated action, missing travel, text, malformed anatomy, or an unusable final hold.

## Required browser matrix

Verify 390×844, 430×932, 768×1024, 1024×768, 1440×900, and the exact 1920×1080
film composition. Check media readiness, complete 4:3 presentation, stack/row
layout, overlays, passage history, pointer/touch/keyboard interaction, controls,
audio synchronization, seeking, and console errors.

Stress reverse scrubbing across every reading unit and play through the final
scene. Scene identity and media state must change atomically, superseded loads
must not win later, and the browser must report no page error or unhandled
rejection. Use `pnpm qa:experience -- <story-id>` against a clean dev server.
