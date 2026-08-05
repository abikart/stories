---
name: create-lanternleaf-scenes
description: Create or revise native-4:3 Lanternleaf Forest watercolor scenes, current Lanternleaf character art, and continuity-sensitive illustrations for other bipedal forest denizens. Use for story keyframes, character or location explorations, matched scene variants, organic solid-matte compositions, and repairs to Lanternleaf visual assets for ages 5–7.
---

# Create Lanternleaf Scenes

Create native-4:3 story illustrations with the image-generation tool. Treat the
project universe guide as canon and each image reference as a role-specific aid,
not as authority over the entire style.

## Required preparation

1. Read `docs/universe/world-details.md` as the visual source of truth.
2. Read `docs/universe/worlds/lanternleaf/main-characters.md` for current cast
   identity and role status.
3. Read `references/visual-bible.md` and `references/prompt-template.md`.
   When combining separate character and environment references, also read
   `references/character-scene-integration.md`.
4. Inspect only the universe references relevant to the beat:
   - `fern-and-pip.png` for inhabited Mossgrove scale, selective framing,
     white-space emphasis, and foreground layering, never for current character
     identity or canvas ratio;
   - `elephant-capybara.png` for an inhabited workshop and semantic detail;
   - `hedge-frog.png` for bipedal tool use, handmade props, and outdoor craft;
   - `dino-reference.png` for soft-cute species simplification only.
5. Let the written guide override incidental artifacts in an image reference.
   In particular, never copy beige paper, full-bleed scenery, non-bipedal land
   posture, uniform dark outlines, or textured backgrounds.
6. For a story package, read `stage.backdrop.color` from its `production.json`.
   That six-digit hex color is the exact matte for every keyframe, poster, video,
   delivery pad, and runtime surface in the story. Use `#FFFFFF` when planning a
   new package unless another solid matte has been deliberately approved.

## Workflow

1. Translate the story moment into one concrete visual beat. Include only
   characters, props, state, and location details established by that beat.
2. Record the continuity snapshot before prompting: who is present, what each
   recurring prop looks like now, where the action occurs, and what must not
   transform yet.
3. Compose natively at 4:3. Keep the complete semantic action inside the frame;
   there is no later responsive crop.
   For character-scene integration, recompose the environment around plausible
   character scale and readable white space instead of preserving a wide scene
   and enlarging the character to fill it. Default to the focal character's eye
   level or slightly below; do not inherit an environment study's elevated
   survey camera unless the story action requires it.
4. Build one clear focal beat, then enrich the setting with varied recognizable
   objects and plants. Favor semantic detail over texture noise.
5. Use locally color-matched contours, calm broad washes inside forms, and an
   organic vignette that dissolves into the package's calibrated solid matte.
6. Generate one distinct beat per image-tool call. Use 2–3 candidates when
   selection matters; do not hide unrelated beats inside one prompt.
7. Inspect the full frame, faces and hands, continuity-bearing props, and all
   outer edges. Reject or repair:
   - altered anatomy, accessories, wing count, character scale, or prop state;
   - quadrupedal land denizens or characters unable to use their authored tool;
   - flat generic scenery, repeated motif clutter, or texture standing in for
     meaningful environmental detail;
   - gradients, texture, grain, or a background that differs from the declared
     solid story matte;
   - uniform black/brown outlines instead of locally color-matched contours;
   - patterned fills, hatching, stippling, sketch-search lines, or digital glow;
   - missing action, action too small to read, or essential content near an edge.
8. Make one targeted repair at a time and restate all continuity invariants.
9. Copy accepted project-bound output into the target story package and preserve
   the exact prompt, provider ID, candidate status, and rejection reason.
10. Keep the provider original through derivation and acceptance. Record its
    provider ID, historical path, and hash in compact provenance, then archive
    redundant originals and rejected binaries in the run's Git baseline rather
    than the active tree. When an accepted raster is close to but not exactly the
    declared matte, run `scripts/normalize_solid_matte.py --matte-color <#RRGGBB>`
    to replace only border-connected near-matte pixels, then visually inspect the
    derived PNG at full frame.

## Reference hierarchy

1. `docs/universe/world-details.md` controls world grammar, surface, composition,
   detail hierarchy, bipedal posture, and contour language.
2. `main-characters.md` controls current names, species, pronouns, homes, and
   role status. An accepted character sheet controls visual identity once one
   exists.
3. The most relevant universe image controls only its listed role;
   `fern-and-pip.png` never controls current character identity.
4. The target story's continuity ledger controls character, prop, location, and
   transformation state.

Do not recursively use a defective generation as the main identity or medium
reference. Return to this hierarchy when an edit amplifies artifacts.

## Non-negotiable generation contract

- Native 4:3 composition; no 16:9 action-safe framing.
- One exact solid story matte, normally `#FFFFFF`, with no gradient, paper,
  canvas, grain, fibers, or color variation. Match `stage.backdrop.color`.
- Broad translucent watercolor washes, organic glaze edges, restrained pigment
  pooling, and calm fills without repeated internal motifs.
- Thin, fluid, mostly continuous contours derived from the local fill color of
  each exact shape; no universal ink color.
- Foreground faces and actions clearest, supporting objects moderately defined,
  distant washes pale and dissolving into the solid story matte.
- Rich, inhabited settings built from recognizable forms at several scales,
  never microscopic surface marks.
- No text, border, watermark, mockup, vector finish, glossy 3D, anime, named
  living-artist imitation, or photorealism.

## Character continuity

- The working main cast is Nibbles the fox (she/her), Zippy the bee (he/him),
  Pickle the tortoise (he/him), and Pepper the snow wolf (she/her).
- Nibbles is the working navigator and mapmaker. Zippy is the working aerial
  scout and messenger. Do not invent locked visual details before their
  character sheets are accepted.
- Pickle's and Pepper's exact group functions, accessories, and visual designs
  remain open. Pepper is from Kite Hill; the other open origins are recorded in
  `main-characters.md`.
- Zippy and other explicitly flight-capable creatures may hover.
- Land denizens stand on two legs, use tools with their forelimbs, and retain a
  compact large-head/short-limb silhouette appropriate for ages 5–7.
- Transformations appear only in their authored beat. Never borrow a resolved
  prop or lighting state from a later reference.
