# Lanternleaf geography-map production

**Status:** Approved exploration

**Accepted asset:** `assets/geography-map-v1.png`

**Generated:** 2026-08-02 with the built-in image-generation tool

**Accepted generation ID:** `exec-a1a3e6da-f9b7-40b6-971a-cf44b565b065`

**Accepted SHA-256:**
`4848d72627e471530c02d16ee50e475b546ce5d223c5bc2443b7bc23c62a56d2`

**Dimensions:** 1448×1086 RGB PNG, exact 4:3

## Reference roles

- `docs/universe/fern-and-pip.png` controlled Lanternleaf's watercolor-and-ink
  village vocabulary, organic dwellings, palette, and clean-white presentation
  only. Its characters and layout were not copied.
- `docs/universe/elephant-capybara.png` controlled inhabited semantic detail,
  handmade structures, pale distance, and broad watercolor washes only. Its
  characters, workshop, and layout were not copied.

## Candidate history

### Base candidate — rejected for density

**Generation ID:** `exec-3ff9068e-9739-4ef1-830c-b4f159ee5c6c`

**Reason:** Geography, path network, and four-region composition were strong,
but repeated dome dwellings, microscopic objects, and dense foliage made the
map feel more generated and less restrained than the Lanternleaf visual
language.

### Simplification repair — accepted

The accepted image preserved the base geography while reducing each village to
a small set of distinct structures, consolidating vegetation into broader
washes, and increasing organic white breathing space.

The image was accepted because the four regions read clearly at thumbnail size,
the Meeting Tree anchors the composition, paths remain terrain-shaped rather
than effect-like, there is no generated lettering, and the outer presentation
visually dissolves into a clean white matte.

Known limitations are retained as exploration status: architecture, exact route
geometry, settlement size, stream placement, and biome boundaries are not yet
canon.

## Base prompt

```text
Use case: illustration-story
Asset type: native 4:3 illustrated geography map for the Lanternleaf world bible, ages 5–7
Primary request: Create one clear elevated bird's-eye watercolor map of a compact coastal region containing four distinct, connected village environments around a central Meeting Tree.
Reference roles: Image 1 controls Lanternleaf's soft watercolor-and-ink village vocabulary, organic dwellings, plant forms, palette, and clean white presentation only; do not copy its characters or exact scene. Image 2 controls inhabited semantic detail, handmade structures, pale distance, and broad watercolor washes only; do not copy its characters, workshop, or exact layout.
Story matte: #FFFFFF exactly across the complete outer frame.
Geography and placement: north at the top. In the north, rounded windy green hills with a small hill village, orchard terraces, streamers, and one or two tiny kites. In the center-west, a dense but airy mossy forest village among roots, ferns, shaded gardens, and rounded stump homes. At the southwest coast, a sheltered crescent beach village with smooth pebbles, tide pools, dune grass, a few tiny boats, and curved dwellings safely above the waterline. In the east and southeast, a warm dry village with terracotta banks, pale smooth stone, silver-green low plants, hardy flowers, shaded rounded earthen homes, clay vessels, and carefully tended water. Near the geographical center, one large welcoming Meeting Tree in a small shared clearing. A narrow natural stream may descend from the northern hills through the forest toward the coast to make the landform coherent.
Paths: Show a simple connected network of subtle ordinary walking paths between the four villages and Meeting Tree. Each path belongs to its terrain: forest openings and stepping stones, parted dune grass and familiar pebbles, a worn meadow line, and flat stones through the warm dry plants. Paths are fully present for this geography overview, gently curved, and easy to trace without glowing, magical effects, artificial symmetry, or graphic diagram lines.
Composition: Native landscape 4:3. Gently elevated three-quarter bird's-eye viewpoint, like a children's storybook geography plate rather than a satellite map or parchment chart. The entire compact region reads at a glance with generous irregular pure-white breathing space around an organic watercolor vignette. Each village is visually distinct and recognizable at thumbnail size. No characters. No scene border.
Medium: Hand-painted hybrid ink and watercolor on a perfectly solid clean #FFFFFF matte. Broad translucent washes, overlapping glaze edges, restrained pigment pooling, gentle wet-on-wet shifts, calm interiors, and environmental edges dissolving naturally into white. Richness comes from recognizable villages, terrain, plants, paths, and useful objects, not microscopic texture.
Contours: Thin, fluid, mostly continuous, locally color-matched contours; clearer on village silhouettes and key landmarks, lighter in terrain, absent in pale distance. Never one universal brown or black ink.
Palette and light: Soft warm daylight. Moss and forest greens, dusty blue sea, warm cream, terracotta and rust, pale pink flowers, restrained yellow, and silver-green dry plants. Maintain a cohesive Lanternleaf palette across all biomes.
Must preserve: exactly four village environments plus one central Meeting Tree; geographically coherent coast, hills, forest, and warm dry side; complete paths inside frame; clean solid-white outer matte.
Avoid: any text, labels, letters, numbers, compass rose, legend, icons, border, parchment, paper grain, beige background, map scroll, hard diagram lines, vector infographic finish, top-down game map, neon or digital glow, sparkles, particles, synchronized path effects, rainbow effects, artificial symmetry, repeated identical trees or houses, full-bleed scenery, black outlines, hatching, stippling, pencil texture, glossy 3D, anime, photorealism, watermark.
```

## Simplification repair prompt

```text
Change only the visual simplification and watercolor restraint of this illustrated Lanternleaf geography map; preserve the exact overall 4:3 composition, north hills, center-west forest, southwest coast, east/southeast warm dry region, central Meeting Tree, coherent stream, four-village placement, and connected natural path layout.

Use case: illustration-story
Asset type: native 4:3 Lanternleaf world-bible geography map for ages 5–7
Targeted repair: Make the map feel simpler, more handmade, airy, and naturally watercolor-painted. Reduce each village to only 3–5 clearly different small dwellings or structures. Remove repeated dome-house patterns, excessive pots, microscopic flowers, tiny decorative marks, crowded identical trees, and dense object scatter. Consolidate vegetation into broad translucent wash shapes with a purposeful selection of readable ferns, orchard trees, dune grass, hardy dry plants, boats, and garden forms. Increase irregular pure-white breathing space around and subtly within the vignette. Keep each region instantly recognizable at thumbnail size through large shapes rather than micro-detail.

Medium: broad translucent watercolor washes, gentle pigment pooling, calm interiors, soft wet-on-wet terrain transitions, locally color-matched thin contours only on important landmarks, pale dissolving distance, exact clean solid #FFFFFF outer matte. Retain warm daylight and the cohesive moss green, dusty blue, cream, terracotta, rust, pale pink, restrained yellow, and silver-green palette.

Paths: preserve the existing gently curved connected network, but keep paths organic and understated—not bright, glowing, perfectly smooth, or diagrammatic.

Must preserve: exactly four distinct village environments; one central Meeting Tree; geographically coherent coast, hills, forest, dry side, stream, and paths; no characters.

Avoid: any text, labels, letters, numbers, compass, legend, border, parchment, paper texture, beige matte, repeated architecture, artificial symmetry, high-detail fantasy-map clutter, stippling, hatching, sketch noise, black outlines, digital glow, particles, vector finish, glossy 3D, anime, photorealism, watermark.
```
