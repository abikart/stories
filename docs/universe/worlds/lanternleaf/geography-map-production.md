# Lanternleaf geography-map production

**Status:** Approved working geography

**Current asset:** `assets/geography-map-v2.png`

**Source conversation:**
<https://chatgpt.com/share/6a6fde0a-3a9c-83e8-8566-6682858fc058>

**Final generation ID:** `exec-6b1801a6-faa1-4251-a2cf-6764240e6443`

**SHA-256:**
`5e4636522ab32217e5fa07b91e819a0d1ad954e961027fd9037adf18b3a1dfaa`

**Dimensions:** 1448×1086 RGB PNG, exact 4:3

**Import:** Retrieved directly from the final provider raw asset without image
editing, scaling, or re-encoding.

## Final-map iteration

The shared ChatGPT conversation began from the regional story-atlas prompt
preserved below, then made these selected changes:

1. Made the river visibly begin in the northern hills, flow through Mossgrove,
   and empty into Pebble Cove.
2. Added the working labels Mossgrove, Pebble Cove, Kite Hill, Sunbank, and
   Winkwater in a restrained hand-lettered style.
3. Renamed the central Meeting Tree landmark **Heartwood**.
4. Named the small headwater waterfall **Silverdrop Falls** and kept its label
   smaller than the regional names.
5. Removed a competing stream at the top of the hills so Silverdrop Falls is
   Winkwater's only visible origin.
6. Added subtle snowcaps to the highest northern ridge.

The result was accepted because it reads as one regional geography rather than
a neighborhood, distinguishes the four environments without settlement-level
architecture, preserves a simple watershed, and keeps landmarks secondary to
the land.

## Scope and known limitation

This asset controls macro geography, names, and watershed only. It does not
control story-scene medium, architecture, path-state visuals, or character
scale.

The original provider PNG is preserved unchanged. Its entire outer border is a
light neutral paper field rather than exact `#FFFFFF`; sampled border channels
range approximately from 238 to 249. This is acceptable for the working atlas
reference but not for production story media, which must still use the exact
solid package matte. Create a reviewed normalized derivative later only if this
map itself enters a runtime story surface.

## Superseded local image-generation exploration

**Asset:** `assets/geography-map-v1.png`

**Generation ID:** `exec-a1a3e6da-f9b7-40b6-971a-cf44b565b065`

**SHA-256:**
`4848d72627e471530c02d16ee50e475b546ce5d223c5bc2443b7bc23c62a56d2`

This earlier built-in image-generation candidate established the four-region
layout but used a close aerial scale and individual dwellings. It remains only
as process provenance.

## Reference roles

- `docs/universe/fern-and-pip.png` controlled Lanternleaf's watercolor-and-ink
  village vocabulary, organic dwellings, palette, and clean-white presentation
  only. Its characters and layout were not copied.
- `docs/universe/elephant-capybara.png` controlled inhabited semantic detail,
  handmade structures, pale distance, and broad watercolor washes only. Its
  characters, workshop, and layout were not copied.

## Superseded candidate history

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

The owner subsequently rejected this camera scale because it reads like a small
neighborhood and exposes individual homes. It remains versioned as evidence of
the geography and simplification process, but it is not the target map art.

The next candidate must use a regional story-atlas view: macro landforms and
biomes first, paths second, settlement locations third, and no dwelling-level
detail.

## Regional-map base prompt

```text
Hand-painted children's storybook atlas map of Lanternleaf, a small whimsical coastal realm seen from very high overhead in a nearly flat top-down view, regional map scale rather than an aerial village scene. One broad irregular coastal peninsula fills most of the composition, with the sea wrapping around its western and southern edges. The geography is the subject.

Across the north: a long band of gentle rounded hills and low mountains with pale ridge marks and open windy uplands. Center-west: one broad deep-green forest region with layered tree-canopy symbols and fern-shaped edges, not individual trees. Southwest: a sheltered crescent coast with pale beach, pebble shore, tide-pool shapes, and dusty-blue watercolor sea. East and southeast: one large warm dry region with terracotta earth, pale stone ridges, sparse silver-green plant marks, and winding dry channels. A narrow river begins in the northern hills, crosses the forest, and reaches the southwest sea.

Four village locations are indicated only by small understated clearings or simple hand-painted location marks integrated into their regions: one in the forest, one beside the sheltered coast, one among the northern hills, and one in the warm dry country. No individual houses, roofs, streets, courtyards, boats, pots, or settlement architecture. One small Meeting Tree landmark stands near the central crossing, important but not oversized. Fine organic paths connect the four locations and Meeting Tree across the geography, readable but subtle, with some incomplete or fading sections.

Simple macro cartography, large landform shapes, broad watercolor regions, restrained repeated terrain marks, generous breathing space, clear geographic hierarchy, whimsical but believable. Soft hand-painted watercolor and delicate locally color-matched ink, broad translucent washes, gentle pigment pooling, moss green, dusty blue, warm cream, terracotta, rust, pale yellow, and silver-green. Clean solid white outer background, airy organic map edge, suitable for children ages five to seven. Original geography, not based on any existing fictional world.

No generated labels; names will be added later. Not a neighborhood, not a village illustration, not an isometric diorama, not a game map. --ar 4:3 --raw --s 60 --no text, letters, numbers, labels, individual houses, cottages, streets, detailed settlements, close-up buildings, giant foreground tree, characters, decorative border, parchment, aged paper, dark ocean, compass rose, legend, neon glow, particles, 3D render, photorealism, watermark
```

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
