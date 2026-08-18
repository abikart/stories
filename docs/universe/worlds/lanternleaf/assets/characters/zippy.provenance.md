# Zippy character-sheet provenance

- Accepted asset: `zippy.png`
- Accepted status: accepted after continuity repairs and solid-matte normalization
- Revision scope: removed duplicated lower character views, made the compass persistent, replaced them with isolated sling and compass studies, locked one tapered rear-center nub, and clarified the partially occluded second wing in the flying pose
- Generator: built-in `image_gen`
- Provider request IDs: not exposed by the built-in tool
- Edit-input SHA-256: `ddfb9355870925adb17062b84bf359faec3c79d99d8cd45c9e801c7318547928`
- Wing-repair input provider SHA-256: `9463f3239502a852b48b15b58ef5c594302dacdbb64275a661dccdefcb9b56ea`
- Accepted provider artifact ID: `exec-c833115d-237f-485f-97ab-588d00d15f39`
- Accepted provider-original path at generation time: `/Users/ka/.codex/generated_images/01a0136b-9327-7770-ae13-d6f2e1ca881c/exec-c833115d-237f-485f-97ab-588d00d15f39.png`
- Accepted provider-original SHA-256: `cae0fdcb72107a678a8fe61b178394f15c2c5cce697e11f9aff9a5a31263790f`
- Accepted normalized SHA-256: `d9f9bceec462d7b964bd0b37ab61c57236a370045fe80fbede8d6621a1a3d500`
- Derivation: border-connected pixels within 10 RGB values of `#FFFFFF` normalized to exact `#FFFFFF` with `.codex/skills/create-lanternleaf-scenes/scripts/normalize_solid_matte.py`; visual content unchanged.

## Candidate audit

| Artifact ID | SHA-256 | Status | Reason |
| --- | --- | --- | --- |
| `exec-a9c7f31a-2fb6-43a9-baef-4f7e1683cd4c` | `f98f02ae30534d94b95157eb2f7f33d0b1ed2daa85cd4f384da31b9d37988292` | Rejected | Back-view nub remained rounded and foot-like. |
| `exec-d5a117e8-8fd1-4ae5-bcf8-05c34b0fe7df` | `2ec227a4b39edaacdda399e268bfa10385196be383d03f77bb820cd0b6618c51` | Rejected | Nub sharpened, but the back-view feet were omitted. |
| `exec-369e1abc-6a36-4f4e-bd79-e1ce4284d487` | `4c8ccc359e10ee605d5860f3a4deea3699a7f22071e8d34f499f26b2f91b4c6f` | Rejected | Feet and nub were corrected, but the back-view compass disappeared. |
| `exec-4ad36bbd-82ba-4e18-ba01-0a303c90c9a2` | `9463f3239502a852b48b15b58ef5c594302dacdbb64275a661dccdefcb9b56ea` | Superseded | Back-view compass and anatomy were correct, but the second flying wing remained visually ambiguous. |
| `exec-c833115d-237f-485f-97ab-588d00d15f39` | `cae0fdcb72107a678a8fe61b178394f15c2c5cce697e11f9aff9a5a31263790f` | Accepted | Far-side flying wing is independently readable; prior continuity locks remain intact. |

## Exact prompt set

### Base correction

```text
Use case: identity-preserve
Asset type: corrected canonical Lanternleaf master character reference sheet, native landscape 4:3, for ages 5–7.

Input image roles:
- Image 1 is the identity and style reference for Zippy the bee. Preserve Zippy's face, proportions, golden-yellow and brown palette, upper-left forehead freckles, two curled antennae, two pale lavender wings, body bands, expressions, compass design, borderless white presentation, and clean broad watercolor treatment. Do not preserve Image 1's inconsistent compass presence, duplicated lower full-body views, or inconsistent rear nub.
- Image 2 is Pebble's accepted sheet. Use only its clear non-repeating information hierarchy, isolated accessory studies, open borderless spacing, and calm watercolor surface. Do not copy Pebble's anatomy, shell, face, palette, markings, proportions, or accessory.

Primary correction:
Redesign the reference-sheet organization so it depicts one unambiguous canonical Zippy. Use one authoritative full-body rotation set only. The compass is a persistent signature accessory and must be worn consistently in every full-body depiction. Replace the duplicated lower front/back characters with isolated accessory construction studies. Define one consistent rear tail/stinger nub that never resembles a limb.

Zippy identity lock:
- Zippy is a tiny male bee, he/him, a cheerful aerial scout and messenger.
- Same compact stacked silhouette, oversized round golden-yellow head, tiny simple dark nose and mouth, large warm-brown reflective eyes with bright white sparkles, rosy orange cheeks, and absolutely no eyelashes.
- Same small restrained cluster of darker golden freckles on the upper-left forehead, consistent in all relevant views.
- Exactly two dark-brown antennae with matching curled spiral tips.
- Exactly two translucent pale-lavender wings, one on each side, with a few purposeful structural veins. Never add extra wings.
- Exactly four limbs: two short dark-brown tool-capable arms and two tiny dark-brown legs/feet. Never add, remove, merge, detach, or duplicate limbs.
- Same body segmentation and proportions in every full-body view: golden-yellow upper body, soft dark-brown collar band, golden-yellow middle band, soft dark-brown lower abdomen band.
- Maintain identical head-to-body ratio, eye construction, antenna attachment, wing attachment, body width, limb size, freckles, color boundaries, and contour weight across every depiction.

Rear tail/stinger nub — exact anatomy lock:
- Exactly one small dark-brown tail/stinger nub attached at the exact rear centerline of the lowest brown abdomen band.
- Shape it as one short, softly tapered teardrop point with a clear narrow tip, not a round oval and not the same shape as an arm or foot.
- It must always emerge from the rear centerline, never from either side.
- It is fully hidden by the abdomen in the straight front view.
- It is partially visible at the rear center in the 3/4 view.
- It is clearly visible as one short tapered rear point in the side view.
- It is clearly visible centered between and slightly above the two feet in the back view.
- It is clearly visible at the trailing rear center in the hovering signature pose.
- Never show more than one nub. Never replace it with a limb, and never omit it when the rear is visible.

Persistent compass accessory lock:
- Zippy always wears the same round handmade wooden compass in every full-body rotation and in the hovering signature pose.
- One cream compass face with the same restrained green and rust directional needle, warm wooden case, small green leaf charm, and one continuous warm-brown sling strap.
- The strap begins at the compass attachment, travels diagonally across the visible torso, wraps naturally behind the round body, and reconnects to the compass as one continuous loop.
- Keep the compass at the same relative lower-hip/front-side position across rotations according to perspective. In back view show the continuous diagonal strap and the compass hanging naturally around the side, not appearing or disappearing.
- Exactly one compass per full-body Zippy. No floating strap, clipped strap, necklace-like loop, doubled strap, duplicate compass, or accessory state change.

Sheet organization on one clean solid-white field:
1. Top row: exactly four authoritative full-body rotations at equal scale—front, 3/4 front, side, back. All four wear the compass and continuous strap. These are the only neutral full-body rotation views on the sheet.
2. Middle-left: one large authoritative front-facing head close-up.
3. Middle-right: four smaller expression heads of the exact same face—neutral, curious, worried, happy.
4. Bottom-left: one larger hovering/flying signature pose. Zippy wears the compass and continuous strap; exactly two wings, two arms, two feet, two antennae, and one tapered rear-center nub.
5. Bottom-middle: one isolated complete sling assembly laid out as a single coherent object with no character body: the entire continuous warm-brown strap loop, attached wooden compass, clasp, and green leaf charm. Make the loop visibly complete and physically plausible.
6. Bottom-right: one enlarged isolated compass-face close-up matching the worn compass exactly.
7. Bottom edge: preserve eight simple circular canonical color swatches.
Use white space only to separate groups. No repeated lower front or back Zippy characters. No boxes, borders, dividers, labels, captions, or callouts.

Critical non-repetition rule:
Do not include any additional neutral front, 3/4, side, or back full-body character below the top row. The bottom contains only one action pose and two isolated accessory studies. Every panel has a unique reference purpose.

Watercolor surface lock:
Preserve and refine Image 1's cleaner treatment. Use smooth, broad, contiguous watercolor fields with very low-frequency tonal variation across every yellow region, brown body band, wing, compass, strap, leaf, and swatch.
- Yellow head and body regions are calm luminous unified masses with only gentle large-scale tonal transitions.
- Brown bands are calm unified softly scalloped shapes, with no dense fur marks.
- Wings are clean pale lavender washes with only a few veins.
- Wood, leather, and leaf forms use broad unified washes with minimal meaningful construction detail.
Strictly avoid mottled or patch-by-patch watercolor, little tonal islands, noisy pigment texture, granulation simulation, stippling, hatching, repeated dabs, tiny fur strokes, speckling, dry-brush fill texture, and high-frequency value changes.

Contour lock:
Thin, fluid, mostly continuous, softly tapered locally color-matched contours: honey-ochre around yellow, warm brown around brown bands, wood and strap, muted lavender-brown around wings, deeper green around the leaf charm. Pupils may be very dark. No universal black/dark-brown outline, vector-clean curves, uniform line weight, doubled sketch lines, or scratchy marks.

Backdrop:
One perfectly solid #FFFFFF matte across the full frame and every outer edge. No gradient, paper texture, grain, fibers, canvas, beige cast, shadowed sheet, border, or watermark.

No text:
No name, headings, labels, captions, numbers, arrows, guides, symbols, pseudo-writing, logo, or watermark.

Final priority:
one canonical Zippy -> exact anatomy and rear nub -> persistent compass continuity -> non-repeating sheet information -> face consistency -> exact wing and limb counts -> smooth broad watercolor -> borderless organization -> locally colored contours.
```

### Nub-shape repair

```text
Use case: precise-object-edit
Asset type: targeted anatomy correction to the canonical Zippy character sheet.

Image 1 is the edit target. It already has the correct non-repeating borderless layout, persistent compass in every full-body pose, isolated complete sling assembly, compass close-up, smooth broad watercolor, expressions, palette, and Zippy identity.

Change only Zippy's rear tail/stinger nub anatomy in the full-body views; preserve everything else unchanged.

Exact nub repair:
- Zippy has exactly one small dark-brown tail/stinger nub attached at the exact rear centerline of the lowest brown abdomen band.
- The nub is one short tapered teardrop/soft triangular point with a visibly narrow tip. It must never be a rounded oval, pill, foot, arm, or limb shape.
- Straight front view: nub remains completely hidden behind the abdomen.
- Top-row 3/4 view: show a tiny tapered point peeking from the rear centerline, according to perspective.
- Top-row side view: preserve one clearly tapered rear point emerging from the center rear of the abdomen.
- Top-row back view: replace the current rounded central oval between the feet with one small downward-pointing tapered teardrop. Keep exactly two rounded feet, one on each side; the centered pointed nub must be smaller, narrower, and unmistakably different from the feet.
- Bottom-left hovering pose: preserve one clearly tapered rear-center point at the trailing end of the abdomen, distinct from both rounded feet.
- No nub appears in face-only studies or accessory-only studies.
- Never add more than one nub. Never alter the two arms, two feet, two wings, or two antennae.

Critical preservation lock:
Preserve the complete canvas composition and every existing non-nub element unchanged: one top rotation set only; compass and continuous strap present in all five full-body depictions; no duplicated lower full-body views; exact faces and expressions; head freckles; body bands; wing count and veins; limb count and placement; isolated full sling assembly; isolated compass close-up; eight color swatches; smooth calm watercolor; locally colored contours; generous spacing; and borderless solid-white sheet. Do not redraw, reposition, resize, crop, remove, or recolor any existing study, accessory, face, wing, limb, antenna, swatch, or layout group.

Keep the same smooth broad contiguous watercolor fields and thin locally color-matched contours. No mottling, patchy texture, borders, boxes, text, labels, arrows, guides, logo, or watermark. Keep one perfectly solid #FFFFFF matte to every frame edge.

Final instruction: change only the rear nub into one consistent tapered, pointed, non-limb form wherever the rear is visible; preserve every other aspect of Image 1 unchanged.
```

### Back-feet repair

```text
Use case: precise-object-edit
Asset type: single-view anatomy repair on Zippy's canonical character sheet.

Image 1 is the edit target. Change only the lower rear anatomy of the top-right BACK rotation of Zippy. Preserve every other pixel-level subject, study, accessory, pose, face, wing, antenna, layout group, color swatch, watercolor treatment, and white background unchanged.

Repair the top-right back rotation only:
- Restore exactly two small rounded dark-brown feet beneath the lowest brown abdomen band: one left foot and one right foot, symmetrically placed and clearly separated.
- Between those two feet, show exactly one much smaller rear-center tail/stinger nub.
- The nub must be attached to the exact centerline of the lowest brown abdomen band and point downward.
- Shape the nub as a short narrow tapered teardrop or soft triangular point with a visibly pointed tip.
- The nub must be smaller and narrower than either foot and unmistakably different from their rounded oval shapes.
- Reading from left to right beneath the abdomen, the anatomy must clearly be: rounded LEFT FOOT, small centered POINTED NUB, rounded RIGHT FOOT.
- Keep exactly two arms at the sides, exactly two lavender wings, two curled antennae, one compass, one continuous strap, and the same body bands in this back view.
- Do not hide, merge, duplicate, or transform either foot.
- Do not turn the nub into a third foot or limb.

Absolute preservation:
Do not alter the front, 3/4, side, or flying Zippy views. Do not change their compass state, rear nub, wings, limbs, faces, colors, or positions. Do not alter the large face close-up, four expression heads, isolated full sling assembly, compass close-up, eight circular swatches, open borderless layout, smooth broad watercolor, locally colored contours, dimensions, or solid #FFFFFF matte.

No text, labels, guides, arrows, boxes, borders, new objects, logo, or watermark.

Final instruction: in the top-right back rotation only, show two rounded feet with one smaller pointed center nub between them; change nothing else.
```

### Back-compass repair

```text
Use case: precise-object-edit
Asset type: single-view accessory continuity repair on Zippy's canonical character sheet.

Image 1 is the edit target. Change only the compass accessory on the top-right BACK rotation of Zippy. Preserve every other aspect of the image unchanged.

Back-view compass repair:
- The top-right back rotation already has one continuous warm-brown diagonal sling strap across Zippy's back.
- Add exactly one small round wooden compass hanging naturally from that same continuous strap at Zippy's left hip, which appears on the viewer's left side in this straight back view.
- Match the compass worn in the front, 3/4, side, and flying poses exactly: same warm wooden case, same scale, cream compass face, restrained green and rust needle, and one small green leaf charm.
- The compass may be seen at a slight rear/side angle appropriate to the back view, but it must remain clearly identifiable as the same compass.
- Connect it physically to the existing strap with the same small wooden/golden attachment rings. No floating, clipped, disconnected, doubled, or necklace-like strap.
- Keep exactly one compass and exactly one leaf charm in this back view.

Critical anatomy preservation in the back rotation:
Preserve exactly two rounded feet beneath the abdomen, one left and one right. Preserve exactly one smaller pointed tapered center nub between them. Do not hide, round, merge, move, duplicate, or transform the feet or nub. Preserve exactly two arms, two wings, and two antennae.

Absolute preservation:
Do not alter the other top-row rotations, flying pose, faces, expressions, rear nub in any other view, limb count, wing count, antennae, freckles, body bands, colors, proportions, isolated complete sling assembly, compass close-up, eight color swatches, borderless layout, smooth broad watercolor, locally colored contours, canvas dimensions, or solid #FFFFFF matte.

No text, labels, arrows, guides, boxes, borders, new objects, extra accessories, logo, or watermark.

Final instruction: add one correctly attached compass with leaf charm to the top-right back rotation's existing strap; change nothing else.
```

### Flying-wing repair

```text
Use case: precise-object-edit
Asset type: targeted wing-anatomy correction to Zippy's canonical Lanternleaf character sheet.

Image 1 is the edit target. Change only the wings of the bottom-left hovering/flying Zippy located around x 15.5%, y 78.4%. Preserve every other element of the sheet unchanged.

Wing repair in that flying pose only:
- Zippy has exactly two wings total.
- Preserve the existing large near-side pale-lavender wing as the dominant visible wing.
- Replace the ambiguous small lavender lower lobe beneath it with one clearly separate far-side wing.
- The far-side wing must emerge from its own anatomically plausible attachment root on the opposite side of the upper thorax.
- Because Zippy is flying in a 3/4 side angle facing viewer-right, the far-side wing should be smaller and partially occluded by the thorax/head and by perspective.
- Offset the far-side wing enough that its outer silhouette, attachment direction, and locally colored contour are independently readable, while keeping it behind the near-side wing/body.
- Include a narrow, deliberate overlap or white-space separation where appropriate so the two wings read as two physical wings, not one bifurcated wing or two lobes of one wing.
- Match both wings to the exact pale translucent lavender wash, muted lavender-brown contour, vein language, softness, and broad low-frequency watercolor treatment used in the other canonical Zippy rotations.
- Do not create a third wing, duplicate a wing root, enlarge the far wing to equal prominence, or alter the pose.

Absolute preservation lock:
Preserve the flying Zippy's face, head freckles, two curled antennae, exactly two arms, exactly two feet, one tapered rear-center tail/stinger nub, body bands, proportions, compass, leaf charm, and continuous strap unchanged.
Preserve all four top rotations, large face close-up, four expression heads, complete isolated sling assembly, enlarged compass close-up, eight color swatches, spacing, borderless organization, locally colored contours, and smooth broad watercolor unchanged.
Do not change compass presence or construction in any pose. Do not alter the back-view two feet and smaller pointed center nub.
Keep the same native 4:3 dimensions and one perfectly solid #FFFFFF matte to every outer edge.

No text, labels, arrows, guides, boxes, borders, extra objects, logo, or watermark.

Final instruction: clarify exactly two separate wings in the bottom-left flying pose only; change nothing else.
```
