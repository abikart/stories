# Canonical reference generation prompts

Status: canonical references approved on 2026-07-16. Provider attempts,
decisions, hashes, and local paths are recorded in `visual-production.json`.

Use `$create-lanternleaf-scenes`. Attach only the references named by each
prompt. Preserve the provider URL, prompt, source ID, output ID, local filename,
and acceptance decision in `visual-production.json`.

## 1. Fern and Pipkin production identity

Input: `docs/universe/fern-and-pip.png` only.

```text
Use case: illustration-story reference
Asset type: native 4:3 children's story character reference for ages 5–7
Story beat: A neutral production identity view of Fern and Pipkin together,
standing and hovering at their established relative scale, alert and gently
curious, with no story action and no transformation.
Reference role: The attached Fern-and-Pipkin image controls exact identity,
proportions, palette, Fern's dusty-teal satchel, Pipkin's gold-tipped antennae,
and Pipkin's exactly four translucent warm-gold wings. Do not copy its village
composition into this neutral reference.
Characters: Fern is one small upright rust-orange fox with a cream muzzle,
chest, inner ears, and tail tip; round reflective deep-brown eyes, rosy cheeks,
short tool-capable forelimbs, and the same dusty-teal cross-body satchel. Pipkin
is one small floating mint-green moth with two gold-tipped antennae and exactly
four visible warm-gold wings. Both face three-quarter toward the viewer with
clear uncluttered silhouettes.
Continuity now: one Fern, one Pipkin, empty hands, no seed bells, no ribbons,
soft morning light.
Composition: Complete figures inside one airy 4:3 floating vignette with large
clean breathing room and no hard scene edge. Keep both characters large enough
for anatomy inspection.
Medium: Hand-painted hybrid ink and watercolor on a solid pure-white #FFFFFF
matte. Broad translucent washes, visible glaze overlaps, restrained pigment
pooling, calm interiors, and gently dissolving shadow washes.
Contours: Thin, fluid, mostly continuous, and locally color-matched to each
enclosed fill; never one universal brown or black outline.
Avoid: extra characters, extra or missing wings, satchel redesign, quadrupedal
Fern, text, labels, panel borders, paper grain, beige or gray matte, patterned
fills, hatching, stippling, sketch lines, digital glow, vector, 3D, anime, or
photorealism.
```

Accept only if Fern, Pipkin, the satchel, four-wing anatomy, relative scale,
local contours, calm fills, and the outer pure-white matte all pass close review.

## 2. Seed-bell continuity sheet

Inputs: `docs/universe/hedge-frog.png` for handmade seed-pod vocabulary and the
accepted Fern/Pipkin identity reference for series finish only. Do not include
characters in the output.

```text
Use case: illustration-story prop reference
Asset type: native 4:3 children's story continuity sheet for ages 5–7
Story beat: The same canonical cluster of three handcrafted seed bells and their
dusty-blue, berry-pink, and warm-ochre ribbons shown in four clearly separated
states from left to right: orderly and ringing; rain-wet and fully tangled;
lower and middle ribbons free with one high knot remaining; all ribbons open
and bells ready to ring. No text or labels.
Reference roles: The attached seed-bell craft image controls only organic pod
shapes, handmade cord construction, and watercolor prop simplicity. The
accepted character reference controls only Lanternleaf palette, local contour
language, and pure-white finish. Do not include its characters or village.
Continuity: Repeat the exact same three bell shapes, color order, beads,
fasteners, and ribbon colors in all four states. State changes affect only cord
and ribbon arrangement. Do not light, sprout, duplicate, remove, or redesign a
bell.
Composition: Four generously spaced prop groups inside one native 4:3 white
field, large enough to compare construction; no decorative border or panel box.
Medium: Hand-painted hybrid ink and watercolor on solid pure-white #FFFFFF.
Use broad translucent washes, calm interiors, restrained pooling, and organic
edges. Contours are thin, fluid, and locally color-matched to each fill.
Avoid: text, numbers, labels, character hands, extra bells, changing pod shapes,
metallic 3D shine, uniform black/brown outline, beige paper, grain, hatching,
stippling, repeated texture, vector diagrams, mockup, or photorealism.
```

Accept only if the three bells are unmistakably the same props in every state
and the high knot remains closed in state three.

## 3. Bell-tree location and interaction geometry

Inputs: the accepted Fern/Pipkin identity reference, accepted seed-bell sheet,
`docs/universe/fern-and-pip.png` for village scale, and
`docs/universe/elephant-capybara.png` for semantic environmental richness.

```text
Use case: illustration-story location reference
Asset type: native 4:3 children's story location keyframe for ages 5–7
Story beat: Fern and Pipkin stand beneath Lanternleaf's rain-washed bell tree,
looking up at three silent seed bells whose lower and middle ribbons are free
while one dusty-blue high ribbon remains knotted around a thorny upper branch.
A small readable gap winds under one leaf, around one twig, and through the
thorns from Pipkin's start position to the high knot. Do not draw a silver path.
Reference roles: The accepted identity reference controls Fern and Pipkin. The
accepted prop sheet controls the exact three seed bells, ribbon colors,
fasteners, and one-high-knot state. The Fern-and-Pipkin universe image controls
root-cottage scale and village relationship. The workshop image controls only
varied recognizable inhabited details and pale atmospheric distance.
Location: One old bell tree beside two root cottages with rounded shutters, a
small warm oven vent, hooks for morning tools, potted bellflowers, ferns, and a
path that suggests nearby neighbors. Include no stream or bridge; they do not
belong to this beat.
Characters: Fern is upright at lower left in her dusty-teal satchel, one paw
raised toward the unreachable knot. Pipkin hovers near Fern at lower-middle,
with exactly four wings and a clear unobstructed route to the knot at upper
right. Faces, gestures, bells, knot, thorn gap, and route geometry read first.
Continuity now: bells silent; lower and middle ribbons free; one highest knot
closed; no breeze; no ringing; no open shutters; no oven puff; soft light after
rain.
Composition: Native 4:3, cozy low viewpoint, complete tree action in frame.
Leave interaction start region near x .28/y .70, target near x .78/y .24, and a
clear curved route between them. Enrich the setting with meaningful forms at
several scales while preserving irregular white breathing space and an organic
dissolving edge.
Medium: Hand-painted hybrid ink and watercolor on solid pure-white #FFFFFF,
broad translucent washes, overlapping glazes, restrained pigment pooling,
calm interiors, locally color-matched contours, pale dissolving distance.
Avoid: opened high knot, ringing bells, wind, silver route, extra characters,
extra wings, satchel changes, full-bleed scenery, hard rectangle, beige paper,
grain, uniform brown/black outlines, surface noise, digital glow, text, border,
vector, 3D, anime, or photorealism.
```

Accept only if the path geometry is usable for the normalized interaction, the
one remaining knot is clearly closed, and the pure-white edge blends cleanly.

## Production attempt notes

The first seed-bell request produced two 3:2, three-state candidates and was
rejected. A fresh agent received the original references plus this layout-only
prefix before the unchanged canonical prompt:

```text
Fresh independent generation from the two ORIGINAL attached references; do not
use either rejected three-state output as a visual reference. Change the layout
strategy only: the final image MUST be an exact native 4:3 canvas and MUST
contain exactly four complete prop groups arranged in a spacious 2-by-2 grid:
top-left orderly/ringing, top-right rain-wet/fully tangled, bottom-left
lower-and-middle free with exactly one high knot remaining, bottom-right all
ribbons open and ready. Show exactly three identical bells in EACH of the four
groups—twelve bell instances total—without labels, panels, or cropping. Do not
substitute 3:2. Preserve all constraints below.
```

That output established the right grid but omitted one dusty-blue bell from
each left quadrant. The accepted candidate resulted from this targeted repair:

```text
Repair the CURRENT rendered 4:3 sheet only. Keep the existing pure-white 2-by-2
layout, watercolor style, scale, spacing, and the two already-correct right-hand
groups. The image itself currently has only TWO bells in the TOP-LEFT group and
only TWO bells in the BOTTOM-LEFT group. Add exactly one matching dusty-blue
bell to TOP-LEFT and exactly one matching dusty-blue bell to BOTTOM-LEFT so that
EVERY quadrant visibly contains exactly three bells: dusty-blue, berry-pink,
and warm-ochre. Final total must be visibly twelve bell instances, three per
quadrant. Do not change the canvas ratio, do not add text or panels, and do not
alter anything else.
```

The first bell-tree candidate bundled every ribbon into one knot. The accepted
location resulted from this topology-only repair:

```text
Repair ONLY the ribbon topology and interaction geometry in the CURRENT
rendered native-4:3 location image. Preserve the exact characters, cottages,
tree, bell shapes and colors, post-rain lighting, organic white matte,
watercolor style, scale, and composition. The current image incorrectly bundles
all three ribbons into one large central knot. Remove that large central bundle.
The berry-pink lower ribbon and warm-ochre middle ribbon must be completely
untied and hang freely from their bells, with no bow or knot. Keep exactly ONE
small closed dusty-blue knot around a thorny upper-right branch, visibly higher
than all three bells and reachable through a small clear gap under one leaf,
around one twig, and through the thorns. The three silent bells must remain
separate and unchanged. Do not add a drawn route, wind, ringing, open shutters,
oven smoke, extra bells, characters, or wings. Do not change anything else.
```
