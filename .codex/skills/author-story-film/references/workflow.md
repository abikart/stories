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
- Essential action stays within the centered 4:3 region of the 16:9 master.

## Read-with-me gates

At each safe stop:

- retain every reading unit since the previous stop;
- select the latest unit initially;
- provide previous/next, touch, and keyboard navigation;
- restore the selected unit's visual beat;
- keep completed words legible without restarting chopped narration;
- restore the latest beat before continuing;
- after a hero interaction, remain in the reading passage until the child chooses Continue.

## Generation and acceptance

Before generation, approve the beat's visual intent, continuity snapshot, duration, motion tier, start state, and end state. Generate 2–3 candidates when selection matters. Preserve provider, project/agent URL, prompt, source ID, selected output, rejection reason, and local path.

For video, inspect at least start, midpoint, and final frames. Reject camera drift, redesign, premature transformation, duplicated action, missing travel, text, malformed anatomy, or an unusable final hold.

## Required browser matrix

Verify 390×844, 430×932, 768×1024, 1024×768, and 1440×900. Check media readiness, crop, overlays, passage history, pointer/touch/keyboard interaction, controls, audio synchronization, seeking, and console errors.
