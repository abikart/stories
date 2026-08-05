# Character-scene integration

Use this workflow when character and environment art were created separately.
Generate one cohesive new composition; do not paste a character into an
unchanged wide environment or preserve framing that forces the character to be
oversized.

## Reference roles

- Let the accepted character sheet control identity, anatomy, proportions,
  colors, and persistent accessories.
- Let the environment image control location vocabulary, materials, palette,
  light, and useful spatial relationships—not exact camera or framing.
- Name one reference as the surface authority for stroke length, fill
  continuity, tonal transitions, contour weight, and mark frequency. It may be
  the location reference when that image already has the desired finish; use a
  separate accepted style reference when it does not.
- Use `docs/universe/fern-and-pip.png` for character-to-setting proportion,
  selective character-level framing, generous white-space emphasis, and
  foreground layering only. Never copy its character identities or portrait
  canvas ratio.
- Let the written world guide override incidental defects in every image.

## Recompose before rendering

1. Choose one concrete character action and the smallest location slice needed
   to support it. Prefer one doorway, work area, crossing, garden edge, or path
   turn over a complete village overview.
   Start with one architectural anchor, one action-bearing prop, and two to four
   supporting plant or object groups. Complexity added before the focal action
   is stable often returns as texture noise.
2. Establish scale from physical anchors: door openings, stools, table height,
   steps, pots, bridge rails, tools, and nearby plants. Ask whether the character
   could plausibly pass through, perch beside, carry, or use those forms.
3. Keep small-bodied or flight-capable denizens visibly subordinate to doors,
   furniture, and major plants. When a small face becomes hard to read, move the
   camera closer and simplify the visible environment; never solve readability
   by inflating the character.
4. Place the camera at the focal character's eye level or slightly below so the
   face, gesture, and nearby action read against architecture that rises behind
   them. Avoid a bird's-eye, map-like, or elevated three-quarter survey view
   unless the authored action depends on looking down.
5. Reframe or redesign the source scene around that scale. Zoom into a
   character-level moment, shift the viewpoint, omit distant structures, and
   move supporting forms when needed for a balanced native-4:3 composition.
6. Preserve generous, irregular solid-matte space around and within the
   vignette. Use open space to isolate the face and gesture rather than filling
   the canvas with scenery.
7. Build foreground, character, action prop, architecture, and pale distance as
   one depth stack. Overlap foliage or a prop edge naturally where it confirms
   placement without hiding identity-bearing anatomy.

Do not infer a permanent species-size canon from one composition. Until an
approved scale sheet exists, treat these as scene-review heuristics and compare
recurring characters across accepted story images.

## Painterly cohesion

- Paint character and setting in the same pass with shared light direction,
  reflected local color, pigment density, contour weight, and edge softness.
- Match the surface authority with confident broad strokes, calm continuous
  color inside forms, gentle tonal transitions, and locally colored contours.
- Use long directional strokes plus varied leaf and frond shapes. Broad
  watercolor treatment does not mean many short marks or repeated dabs.
- Give the character the clearest contours, nearby anchors moderate definition,
  and distant forms soft dissolving edges.
- Use a restrained local contact or hover shadow and environmental overlap. A
  halo, uniformly sharp silhouette, or saturation jump makes the character read
  as a sticker.

## Surface-control discipline

Keep the generation prompt outcome-focused and short. Describe the desired
finish once with terms such as `confident broad strokes`, `calm continuous
color`, `gentle tonal transitions`, and `locally colored contours`. Do not stack
watercolor-process synonyms such as pigment pooling, granulation, blooms,
glaze edges, wet-on-wet shifts, dry-brush variation, and connected wash masses;
image models may literalize that vocabulary as mottled or patchwork texture.

Reduce scene scope before adding more negative terms. A close eye-level slice
with a few large readable forms gives the model room to render smooth surfaces;
a village overview with many tiny objects encourages short repeated marks.
Treat source selection as part of surface control: broad walls, doors, vessels,
water, and large plants are stronger smooth-finish anchors than a reference
dominated by distant foliage.

## Prompt core

```text
Create one new cohesive character-level composition from the references; do
not preserve the environment's original wide framing.

The character sheet controls identity and anatomy. The environment reference
controls location vocabulary, materials, palette, and light. Reimagine crop,
camera, object placement, and depth so the character has a plausible scale
against <doors / table / steps / plants>.

The surface-authority reference controls stroke length, fill continuity, tonal
transitions, contour weight, and mark frequency. Match its confident broad
strokes, calm continuous color inside forms, gentle tonal transitions, and
locally colored contours.

Set the camera at the character's eye level or slightly below, with the face and
gesture in clear focus and architecture rising behind them. Do not inherit the
environment reference's elevated overview angle.

Show only the location slice needed for <one concrete action>. If the character
is too small to read, move the camera closer and reduce the visible environment;
do not enlarge the character. Use generous irregular solid-matte white space to
emphasize the face and gesture.

Paint everything as one watercolor illustration with shared reflected colors,
edge softness, foreground overlap, and a restrained local shadow.

Avoid oversized characters, complete-village overview framing, pasted cutout
edges, halos, mismatched sharpness, clustered round dabs, cauliflower foliage,
stippled leaves, repeated blooms, evenly sized blotches, or copied character
identities from composition references.
```

## Acceptance check

- Read the action and expression at thumbnail size without making the character
  dominate the architecture.
- Compare the character with at least two nearby physical anchors and reject
  implausible scale.
- Confirm that a closer camera or simpler location—not character enlargement—
  provides readability.
- Confirm that the camera sits at the focal character's eye level or slightly
  below, with no unnecessary view across roofs, tabletops, terraces, or ground.
- Confirm that open matte space emphasizes the focal group and the painted area
  does not become a dense rectangular environment plate.
- Inspect overlaps, reflected color, shadows, contours, and edge softness for a
  shared painting system.
- At full size, inspect at least one large wall or ground shape, one plant group,
  and the character. Reject interiors broken into many small tonal islands,
  faceted patches, stippling, clustered dabs, or repeated short marks when the
  surface authority uses calmer, longer strokes.
- Compare mark frequency directly with the surface-authority reference rather
  than accepting an image merely because it reads as generic watercolor.
- Confirm exact character anatomy and continuity after recomposition.
