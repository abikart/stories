---
name: create-lanternleaf-scenes
description: Create or revise native-4:3 Lanternleaf Forest watercolor scenes, canonical Fern and Pipkin character art, and continuity-sensitive illustrations for other bipedal forest denizens. Use for story keyframes, character or location explorations, matched scene variants, organic white-matte compositions, and repairs to Lanternleaf visual assets for ages 5–7.
---

# Create Lanternleaf Scenes

Create native-4:3 story illustrations with the image-generation tool. Treat the
project universe guide as canon and each image reference as a role-specific aid,
not as authority over the entire style.

## Required preparation

1. Read `docs/universe/world-details.md` as the visual source of truth.
2. Read `references/visual-bible.md` and `references/prompt-template.md`.
3. Inspect `docs/universe/fern-and-pip.png` whenever Fern or Pipkin appears.
4. Inspect only the additional universe references relevant to the beat:
   - `elephant-capybara.png` for an inhabited workshop and semantic detail;
   - `hedge-frog.png` for bipedal tool use, handmade props, and outdoor craft;
   - `dino-reference.png` for soft-cute species simplification only.
5. Let the written guide override incidental artifacts in an image reference.
   In particular, never copy beige paper, full-bleed scenery, non-bipedal land
   posture, uniform dark outlines, or textured backgrounds.

## Workflow

1. Translate the story moment into one concrete visual beat. Include only
   characters, props, state, and location details established by that beat.
2. Record the continuity snapshot before prompting: who is present, what each
   recurring prop looks like now, where the action occurs, and what must not
   transform yet.
3. Compose natively at 4:3. Keep the complete semantic action inside the frame;
   there is no later responsive crop.
4. Build one clear focal beat, then enrich the setting with varied recognizable
   objects and plants. Favor semantic detail over texture noise.
5. Use locally color-matched contours, calm broad washes inside forms, and an
   organic vignette that dissolves into a calibrated pure-white matte.
6. Generate one distinct beat per image-tool call. Use 2–3 candidates when
   selection matters; do not hide unrelated beats inside one prompt.
7. Inspect the full frame, faces and hands, continuity-bearing props, and all
   outer edges. Reject or repair:
   - altered anatomy, accessories, wing count, character scale, or prop state;
   - quadrupedal land denizens or characters unable to use their authored tool;
   - flat generic scenery, repeated motif clutter, or texture standing in for
     meaningful environmental detail;
   - beige, gray, grainy, or visibly rectangular background mattes;
   - uniform black/brown outlines instead of locally color-matched contours;
   - patterned fills, hatching, stippling, sketch-search lines, or digital glow;
   - missing action, action too small to read, or essential content near an edge.
8. Make one targeted repair at a time and restate all continuity invariants.
9. Copy accepted project-bound output into the target story package and preserve
   the exact prompt, provider ID, candidate status, and rejection reason.
10. Preserve the provider original before any derived cleanup. When an accepted
    raster has a neutral near-white matte instead of exact `#FFFFFF`, run
    `scripts/normalize_white_matte.py` to replace only border-connected
    near-white pixels, then visually inspect the derived PNG at full frame.

## Reference hierarchy

1. `docs/universe/world-details.md` controls world grammar, surface, composition,
   detail hierarchy, bipedal posture, and contour language.
2. `fern-and-pip.png` controls Fern and Pipkin identity when they appear.
3. The most relevant additional universe image controls only its listed role.
4. The target story's continuity ledger controls character, prop, location, and
   transformation state.

Do not recursively use a defective generation as the main identity or medium
reference. Return to this hierarchy when an edit amplifies artifacts.

## Non-negotiable generation contract

- Native 4:3 composition; no 16:9 action-safe framing.
- Solid clean white matte with no paper, canvas, grain, fibers, or beige cast.
- Broad translucent watercolor washes, organic glaze edges, restrained pigment
  pooling, and calm fills without repeated internal motifs.
- Thin, fluid, mostly continuous contours derived from the local fill color of
  each exact shape; no universal ink color.
- Foreground faces and actions clearest, supporting objects moderately defined,
  distant washes pale and dissolving into white.
- Rich, inhabited settings built from recognizable forms at several scales,
  never microscopic surface marks.
- No text, border, watermark, mockup, vector finish, glossy 3D, anime, named
  living-artist imitation, or photorealism.

## Character continuity

- Fern is a small upright rust-orange fox with a cream muzzle, chest, inner
  ears, and tail tip; round reflective brown eyes, rosy cheeks, and a dusty-teal
  cross-body satchel.
- Pipkin is Fern's small floating mint-green moth friend with gold-tipped
  antennae and exactly four translucent warm-gold wings. Pipkin is the canonical
  flight-capable exception to the upright land-denizen posture.
- Land denizens stand on two legs, use tools with their forelimbs, and retain a
  compact large-head/short-limb silhouette appropriate for ages 5–7.
- Transformations appear only in their authored beat. Never borrow a resolved
  prop or lighting state from a later reference.
