---
name: create-lanternleaf-scenes
description: Create or revise cohesive Lanternleaf Forest children's story illustrations featuring Fern the fox and Pipkin the moth. Use for new story scenes, character/world explorations, continuity-sensitive scene variants, or fine-tuning this established bright-white sparse watercolor style for ages 5–7.
---

# Create Lanternleaf Scenes

Create 16:9 story illustrations with the built-in image generation tool. Keep Fern, Pipkin, and the Lanternleaf visual language consistent with the bundled canonical scenes.

## Required preparation

1. Read `references/visual-bible.md` before writing any image prompt.
2. Read `references/prompt-template.md` before generating a new scene or editing an existing one.
3. Inspect all three canonical images in `assets/` when establishing continuity:
   - `scene-01-village.png`
   - `scene-02-discovery.png`
   - `scene-03-lantern-bloom.png`
4. Inspect both medium references before every new generation:
   - `medium-reference-loose-ink-watercolor.png`
   - `medium-reference-simple-character-watercolor.png`
5. Treat the canonical images as reference inputs, not edit targets, unless the user explicitly asks to revise one of them.

## Workflow

1. Translate the requested story moment into one concrete visual beat. Do not invent extra characters, props, or story actions.
2. Choose the nearest canonical scene for composition and story-state guidance. Include `scene-01-village.png` whenever Fern or Pipkin appears because it is the primary character reference. Include both medium references to control hand-painted execution.
3. Use a 16:9 composition with essential action inside the centered 4:3 safe area.
4. Generate one distinct scene per image-tool call. For several scenes, make separate calls with beat-specific prompts.
5. Preserve the fixed character and style invariants from the visual bible in every prompt.
6. Inspect the result at full-frame scale and close crop. Reject or repair:
   - patterned or scale-like painted fills;
   - beige, textured, or full-bleed paper;
   - dashed, stitched, dotted, or periodically broken character contours;
   - changed character anatomy, colors, props, or wing count;
   - dense environments that erase the white negative space;
   - essential action outside the centered safe area.
7. Make only one targeted repair at a time. Restate every invariant during edits.
8. For project-bound output, copy the accepted image from the generated-images directory into the project before finishing.

## Reference hierarchy

Use references by role; do not let one generated image control everything:

1. `scene-01-village.png` controls character identity, palette, and white-ground composition.
2. The nearest canonical scene controls story state and approximate staging only.
3. `medium-reference-loose-ink-watercolor.png` controls economical environment marks, incomplete ink, glazing, blooms, backruns, and wash edges.
4. `medium-reference-simple-character-watercolor.png` controls simple hand-painted character forms.

When an existing generated scene contains dashed contours, patterned fills, faceted rocks, or digital glow, rebuild the scene from the clean reference hierarchy instead of using the defective scene as the primary style source. Recursive editing amplifies those artifacts.

## Non-negotiable prompt language

Always specify:

- smooth bright neutral-white support with no paper, canvas, grain, or texture overlay;
- broad transparent watercolor washes with overlapping glaze edges and organic tonal variation;
- mostly smooth character fills without digital airbrushing;
- no scales, loops, rosettes, curls, mosaics, stamped dabs, patchwork, hatching, or repeated internal motifs;
- long, thin, confident, continuous warm-brown character contours;
- contour breaks only at real occlusions or rare natural brush lifts, never along an exposed smooth curve;
- sparse vignette occupying roughly 55–60% of the canvas with 40–45% clean white negative space;
- fuller, clearer, more saturated characters over a lighter, looser, subordinate environment;
- reserved white paper for light; no digital glow, bloom filter, rim light, or radial gradient;
- no text, border, watermark, mockup, vector finish, glossy 3D shading, anime styling, or photorealism.

## Canonical state rules

- Keep Pipkin's four golden leaf-shaped wings visible whenever the angle permits; never add a fifth or reduce the design to two wings.
- Keep Fern's teal cross-body satchel unless the story explicitly establishes that Fern has removed it.
- Keep faces open, gentle, and legible for ages 5–7. Use round deep-brown eyes with one main white catchlight and one tiny secondary highlight.
- Keep nighttime scenes airy. Use a localized pale blue wash over white rather than a dark full-bleed sky.
- Show transformations only in their requested story beat. Use the closed lantern-lily from Scene 2 and the open glowing flower from Scene 3 as distinct continuity states.
