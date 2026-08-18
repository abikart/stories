# Kavi character-sheet provenance

- Accepted asset: `kavi.png`
- Accepted status: accepted after proportion, belly-color, and expression-angle
  revisions, followed by solid-matte normalization
- Revision scope: enlarged Kavi's head, shortened her body, added one lighter
  blue-grey belly field, and rebuilt the expression strip in readable 3/4 views
- Generator: built-in `image_gen`
- Provider request IDs: not exposed by the built-in tool
- Accepted provider artifact ID: `exec-da032b7f-65cc-469b-bd7e-aa66d6e19e9b`
- Accepted provider-original path at generation time:
  `/Users/ka/.codex/generated_images/01a0136b-9327-7770-ae13-d6f2e1ca881c/exec-da032b7f-65cc-469b-bd7e-aa66d6e19e9b.png`
- Accepted provider-original SHA-256:
  `a79cda56a1a52c16d3e0dd4e56a27f6f5fec60f0395f898fac222f46e2dcdd06`
- Accepted normalized SHA-256:
  `5abf12ee4029d045ec46eb95db4fb3a14ad5a87ee9a6c3c87cffac0374efca9e`
- Rough-reference SHA-256:
  `ea1df1d98386825fbf1cd8af1a1193b258b3f599138ebc076ce44bfea41ea6bd`
- Proportion-and-expression reference SHA-256:
  `988e44a1f152f07f7454d1efccdb6612be690144b6bb1fc5292c85ea643e7852`
- Dia reference SHA-256:
  `f9724ba705c3061762c434e16272a0312a63d290ad9b8ef401de47b2b7aa148b`
- Zippy reference SHA-256:
  `d9f9bceec462d7b964bd0b37ab61c57236a370045fe80fbede8d6621a1a3d500`
- Pebble reference SHA-256:
  `41d97880cda6968877e9dba7f706f819de7ccda363d9793619c0c7944cd664cc`
- Derivation: border-connected pixels within 10 RGB values of `#FFFFFF`
  normalized to exact `#FFFFFF` with
  `.codex/skills/create-lanternleaf-scenes/scripts/normalize_solid_matte.py`;
  visual content unchanged.

## Candidate audit

| Artifact ID | SHA-256 | Status | Reason |
| --- | --- | --- | --- |
| `exec-e052a60a-7f2f-4d93-be2e-0f03f9ad998b` | `2a874741636edded4c06847a7a20e66a38e20dc7a770b1007a152fe941d810b5` | Rejected | Several expression heads shortened or lost the trunk, and the front bracelet was on the wrong anatomical wrist. |
| `exec-9a0cf564-aa3a-4aed-8f20-843b7abe3ef4` | `be20d45bf90f3a40657a85cb7004971183e7047bb0fbf9675ddca9a127c54e4c` | Superseded | Expression trunks were corrected; front bracelet side remained inconsistent. |
| `exec-93f87cd2-96a6-4ee7-9d3e-d424f34eb40c` | `d92732462390cfd0120c989be26118cd7606038c4bf34505fff12959a7991449` | Superseded | Canonical trunks and left-wrist bracelet were consistent, but the body remained too tall, the belly lacked contrast, and the expression mouths were obstructed. |
| `exec-d924c723-3598-49e3-9589-0ce7cc29145c` | `f0278bda443819f6a074503937e1c8ba5254fb9cb73862c2f3fa98a2340aed19` | Superseded | Oversized-head, short-body proportions accepted; lighter belly and expression angles remained to revise. |
| `exec-aa7ac620-337e-439f-b2d3-2db1785fcaf3` | `b7b535837168b8339e4dbaf6ac82de7c7aade018ba0a0fe8f35b17979048d0f5` | Superseded | Lighter belly field accepted; expression mouths remained obstructed. |
| `exec-da032b7f-65cc-469b-bd7e-aa66d6e19e9b` | `a79cda56a1a52c16d3e0dd4e56a27f6f5fec60f0395f898fac222f46e2dcdd06` | Accepted | Compact proportions, belly color, readable 3/4 expressions, anatomy, and bracelet continuity are all intact. |

## Exact prompt set

### Base generation

```text
Use case: illustration-story
Asset type: canonical native-4:3 Lanternleaf master character reference sheet for ages 5–7
Primary request: Create one definitive character sheet for Kavi, a young female elephant who joins Dia, Zippy, and Pebble later as the group's gentle listener and storykeeper.

Input-image roles:
- Image 1 is a rough identity reference only. Preserve the appealing round elephant head, very broad fan-shaped ears, cool soft-grey body, pale dusty-pink inner ears and cheeks, large tender dark eyes, tiny crown tuft, curved trunk, and sweet thoughtful demeanor. Do NOT preserve its seated quadrupedal posture, textured paper, speckled rendering, anatomical ambiguity, or rough linework.
- Images 2, 3, and 4 are the accepted Dia, Zippy, and Pebble sheets. Use them only as world/style authorities for shared eye language, soft-cute proportions, borderless 4:3 sheet organization, clean #FFFFFF matte, calm broad watercolor, locally colored contours, non-repeating information hierarchy, and enlarged accessory study. Do not copy or blend their species anatomy, faces, colors, clothing, cloak, satchel, compass, straps, shell, belt, cord, poses, markings, or accessories into Kavi.

Kavi identity:
- Species: young elephant; she/her.
- Role: listener and storykeeper; calm, observant, compassionate, quietly curious, sometimes overly responsible.
- Relative scale for future scenes: a large young denizen, approximately 1.3 times Dia's standing height, but use one consistent Kavi scale across this sheet.
- Fully upright bipedal posture like other Lanternleaf land denizens: stands on exactly two short sturdy legs and has exactly two short tool-using arms.
- Large rounded head, compact pear-shaped torso, broad rounded fan ears, one long flexible trunk emerging centrally from the face, two small dark nostril marks only at the trunk tip, tiny rounded tail with one small soft tuft, tiny grouped crown tuft, no tusks.
- Exactly four limbs total: two arms and two legs. Each hand has three simple rounded digits. Each foot is broad and rounded with three pale warm-grey toenails.
- Large warm dark-brown eyes with amber warmth and bright white sparkles, same shared family language as the accepted cast. Three delicate upper eyelashes on each eye, small soft eyebrows, rosy cheeks, tiny gentle mouth placed beneath the trunk base. Keep identical facial construction in every panel.
- Body palette: cool dusty blue-grey with a slightly lighter face and belly plane; pale dusty shell-pink inner ears and cheeks; deep slate-grey local accents; warm cream toenails; no freckles, spots, wrinkles, patterned skin, or dense texture.
- No clothes, bag, book, spectacles, necklace, scarf, headpiece, shoes, or other gear.

Signature accessory:
- Exactly one chunky handmade Sunbank clay-bead bracelet worn consistently on Kavi's LEFT wrist in every full-body view where that wrist is visible.
- One continuous muted river-blue cord threaded through exactly five large rounded, slightly irregular clay beads. Canonical bead order is fixed: terracotta, warm ochre, creamy ivory, muted sage, dusty river-blue.
- Bracelet must visibly wrap around the wrist with physically continuous construction; no floating beads, duplicated bracelet, extra charms, labels, or changing bead count.
- Include one enlarged isolated accessory close-up showing the complete same bracelet as a closed loop, the same blue cord and exactly five beads in the same order. It is a tactile nonmagical memory aid.

Sheet organization, one clear canonical character:
1. Across the top: exactly four full-body neutral rotations, all at consistent scale: FRONT, 3/4 FRONT facing viewer-right, clean SIDE facing viewer-right, and straight BACK. Do not write labels.
2. Middle-left: one large authoritative front-facing head close-up.
3. Middle-right: exactly four smaller head expressions using the same face: neutral/listening, curious, worried, happy. No labels.
4. Bottom-left: one larger full-body signature pose, fully upright and bipedal, leaning forward slightly with attentive warm expression; Kavi gently curls her trunk around one bead of the bracelet on her left wrist while listening. Exactly two arms and two legs remain clearly visible.
5. Bottom-middle/right: one enlarged isolated complete bracelet construction close-up only; do not repeat another full-body Kavi.
6. Bottom edge: seven or eight simple circular canonical color swatches only.
Use open irregular white-space separation. No boxes, borders, panels, dividers, captions, callouts, arrows, guides, logos, watermark, or text.

Anatomy and rotation continuity:
- Four top figures are rotations of one physical Kavi, not independent variants.
- Preserve identical head-to-body ratio, ear size and placement, crown tuft, eye construction, trunk length and curvature, arm/leg proportions, digit counts, tail, colors, and bracelet construction.
- Front view shows both ears symmetrically and the trunk centered.
- 3/4 and side views use believable perspective with the far ear partially occluded, not missing.
- Side view has one readable near eye and a clearly side-projecting trunk, with far limbs only as perspective permits; never add limbs.
- Back view shows the backs of both ears, rounded head and torso, exactly two arms, two legs, and the small centered tail with one tuft; no face or trunk visible from behind. Bracelet remains on the same anatomical left wrist.
- Never turn the trunk into an extra arm. Never merge trunk with an arm. No tusks.

Style and surface:
- Hand-painted Lanternleaf hybrid ink-and-watercolor character art on one perfectly solid pure-white #FFFFFF matte, including every outer edge.
- Smooth broad contiguous watercolor fields with calm connected color, low-frequency tonal variation, and gentle large-scale transitions. Each grey, pink, cream, clay, and blue region reads as one coherent painted mass.
- Thin, fluid, mildly hand-wobbled contours locally matched to each fill: deeper cool grey around grey skin, muted rose around pink ear interiors, darker terracotta/ochre/sage/blue around each bead. Only eyes and tiny facial marks may be near-black.
- Clean, luminous, production-ready, matching the accepted sheets.

Strictly avoid: seated or quadrupedal anatomy; realistic adult elephant proportions; extra or missing limbs; duplicated trunk; tusks; missing far ear; changing accessory side; inconsistent bead colors/count; compass, satchel, belt, bobbin, cloak, or copied props; mottled or patch-by-patch watercolor; speckles; granulation simulation; repeated small brush marks; paper grain; beige paper; gray background; shadows that form panels; uniform black/brown outlines; colored-pencil texture; vector finish; glossy 3D; anime; photorealism; text; borders; watermark.
```

### Compact-proportion revision

```text
Use case: identity-preserve
Asset type: targeted proportion revision to Kavi's canonical native-4:3 Lanternleaf character sheet

Input-image roles:
- Image 1 is the edit target and sole authority for Kavi's canonical identity, face, anatomy, bracelet, palette, sheet organization, smooth watercolor, locally colored contours, and solid-white matte.
- Image 2 is a rough proportion reference only. Use only its appealing larger head relative to a shorter compact torso and its youthful rounded silhouette. Do not copy its pose, facial construction, upward-pointing trunk, paw-pad anatomy, colors, rendering, beige background, flowers, paper texture, or full-bleed composition.

Change only Kavi's head-to-body proportions in the five full-body depictions: the four top-row rotations and the larger bottom-left signature pose.

Exact proportion change:
- Enlarge Kavi's head, ears, facial features, trunk, and crown tuft together as one coherent head unit by roughly 10–12 percent relative to her body.
- Shorten the torso vertically by roughly 15–18 percent, making it compact, softly rounded, and youthful rather than long.
- Keep the two legs short and sturdy and the two arms short and tool-capable; adjust their attachment positions naturally to the shortened torso without changing limb count, hand construction, feet, digits, or pose.
- The revised full-body silhouette should have an oversized rounded head, broad ears, a very short pear-shaped body, and short limbs, closer in youthful proportion to Image 2 while remaining fully upright and bipedal.
- Apply exactly the same revised head-to-body ratio to front, 3/4, side, back, and signature pose so they remain rotations/actions of one physical Kavi.
- Keep each figure centered in its existing layout region with generous white space and no overlaps. Maintain approximately the existing overall figure height where practical by balancing the larger head against the shorter torso.

Absolute identity and anatomy preservation:
- Preserve Kavi's exact face, warm dark-brown amber eyes, three eyelashes per eye, eyebrows, rosy cheeks, trunk construction, ear shapes and pink interiors, crown tuft, cool dusty blue-grey skin, no tusks, tail and tail tuft, exactly two arms, exactly two legs, three rounded digits per hand, three cream toenails per foot, and fully upright posture.
- Preserve the left-wrist bracelet consistently in every full-body view where visible: one continuous muted river-blue cord and exactly five clay beads in the fixed colors terracotta, warm ochre, creamy ivory, muted sage, dusty river-blue. Do not move it to the other wrist, duplicate it, or alter its construction.
- Preserve the bottom-left signature action: Kavi listens attentively while her trunk gently touches/turns one bracelet bead.

Do not change:
- the large middle-left face close-up;
- any of the four small expression heads;
- the isolated bracelet close-up;
- any bead color, bead count, cord, or knots;
- the nine circular color swatches;
- layout organization, canvas dimensions, or white-space grouping;
- smooth broad contiguous watercolor, calm low-frequency tonal variation, thin locally color-matched contours, and the perfectly solid #FFFFFF background.

Do not add the lighter belly marking yet; keep the current body colors unchanged in this pass.
No text, labels, panels, borders, guides, extra characters, props, clothing, tusks, quadrupedal posture, paper texture, mottling, uniform dark outlines, logo, or watermark.
Final instruction: change only the five full-body head-to-body proportions; preserve every other element unchanged.
```

### Lighter-belly revision

```text
Use case: precise-object-edit
Asset type: targeted canonical color-marking revision to Kavi's Lanternleaf character sheet

Change only Kavi's belly color field in the applicable full-body depictions. Preserve every other element of the sheet unchanged.

Exact lighter-belly addition:
- Add one simple, broad, contiguous lighter blue-grey belly region to Kavi's torso in the top-row FRONT, top-row 3/4, top-row SIDE, and bottom-left signature pose.
- The belly is a single calm soft-edged oval-to-pear-shaped anatomical color region centered on the front torso, beginning below the trunk/chest and ending just above the legs.
- Use a noticeably but gently lighter misty blue-grey derived from Kavi's existing skin—not white, cream, pink, tan, or a separate garment color.
- In the 3/4 and side views, show the same belly region wrapping naturally around the torso according to perspective. It may narrow or be partially occluded, but its placement, height, and color remain consistent.
- In the straight BACK rotation, show no belly region; preserve the existing uninterrupted back color.
- Define the belly boundary with one very subtle locally matched cooler-grey watercolor contour or tonal edge. It must read as natural character coloration, not clothing, a bib, an armor plate, fur, or a pasted patch.
- Paint it as one smooth broad continuous watercolor field with low-frequency tonal variation. No spots, mottling, texture, pattern, border decoration, repeated marks, or hard graphic outline.
- Add one new simple circular swatch for this exact lighter belly color only if it can fit naturally in the existing swatch row without moving, deleting, or changing existing swatches; otherwise keep the swatch row unchanged.

Absolute preservation:
- Preserve the newly accepted oversized-head, shortened-torso proportions identically across all five full-body Kavi depictions.
- Preserve every head, face, eye, eyelash, eyebrow, cheek, ear, pink inner ear, trunk, crown tuft, arm, leg, hand digit, toenail, tail and tail tuft.
- Preserve exactly one five-bead clay bracelet on Kavi's anatomical left wrist in every full-body view where visible, with the same blue cord, fixed bead order and colors, and no duplicates.
- Preserve the signature listening pose and trunk-to-bracelet interaction.
- Preserve the large face close-up, all four expression heads, isolated complete bracelet close-up, layout, spacing, canvas dimensions, borderless presentation, smooth broad watercolor, locally colored contours, and solid #FFFFFF background.
- Do not add or remove any anatomy, props, clothing, text, labels, panels, borders, guides, logo, or watermark.
- Do not change the expression-head viewing angles yet.
Final instruction: add only one consistent lighter blue-grey belly field to applicable full-body views; change nothing else.
```

### Three-quarter expression revision

```text
Use case: precise-object-edit
Asset type: targeted expression-strip revision on Kavi's canonical Lanternleaf character sheet

Input-image roles:
- Image 1 is the edit target and sole authority for Kavi's identity, revised proportions, lighter belly, anatomy, bracelet, palette, sheet layout, watercolor surface, contours, and white matte.
- Image 2 is an angle/readability reference only. Use only the idea of a gentle 3/4 elephant head angle with the trunk lifted or swept aside so the mouth and cheek expression remain visible. Do not copy its face, eye style, extreme open-mouth expression, pose, body, colors, rendering, beige background, foliage, texture, or composition.

Change only the four small expression heads in the middle-right strip. Preserve every other element of Image 1 unchanged.

Expression-strip construction:
- Redraw all four small heads at the same gentle 3/4 angle facing slightly toward viewer-right.
- Preserve one canonical Kavi head and face in every study: same oversized rounded head, broad fan ears with pale pink interiors, tiny crown tuft, large amber-brown sparkling eyes, three upper eyelashes per eye, rosy cheeks, small eyebrows, and one correctly attached full-length blue-grey elephant trunk.
- Use believable 3/4 perspective: the near eye and near ear are slightly more prominent, the far eye and far ear remain fully readable but modestly foreshortened.
- Sweep or curl the trunk gently toward the side and slightly upward, away from the center of the mouth. The trunk must never cover the mouth, eyebrows, or main cheek expression.
- Keep the trunk long and unmistakably elephantine in all four studies, with the same taper, subtle fold language, and two tiny nostril marks at the rounded tip. Do not shorten it into a mouse snout, hide it, detach it, or turn it into an extra limb.
- Keep the mouth clearly visible beside/beneath the trunk base in every expression.

Make the four emotions unmistakably different while preserving one face:
1. NEUTRAL / LISTENING: relaxed level eyebrows, attentive open eyes, tiny calm closed smile, trunk resting gently to the side.
2. CURIOUS: one eyebrow slightly raised, eyes a little wider, small clearly visible round 'o' mouth, trunk tip lifted inquisitively.
3. WORRIED: inner eyebrows raised and drawn together, softened slightly lowered eyelids, clearly visible small downturned mouth, trunk lowered and curled inward without hiding the mouth.
4. HAPPY: cheeks lifted, eyebrows softly arched, bright joyful eyes, clearly visible open smiling mouth with a small warm coral tongue, trunk lifted outward in a gentle happy curve.

Consistency:
- Keep all four expression heads at approximately equal scale, aligned in the existing strip, with generous white space and no overlap.
- The angle may vary only subtly to support the emotion; these are expressions of one physical Kavi, not design variants.
- Do not change eye size, eye construction, eyelash count, ear anatomy, head proportions, skin color, cheek placement, tuft, or trunk attachment between expressions.

Absolute preservation:
- Preserve all four top full-body rotations and the bottom-left signature pose exactly, including the new oversized-head/short-body proportions, lighter blue-grey belly fields, bipedal anatomy, hands, feet, tail, and left-wrist bracelet continuity.
- Preserve the large middle-left authoritative face close-up exactly.
- Preserve the isolated five-bead bracelet close-up, all bead colors/order/count, cord, knots, all ten circular color swatches, layout, spacing, canvas dimensions, smooth broad watercolor, locally colored contours, borderless presentation, and perfectly solid #FFFFFF background.
- No changes outside the expression strip.
- No text, labels, boxes, borders, guides, arrows, extra props, clothing, tusks, logo, or watermark.
Final instruction: change only the four expression heads to readable 3/4 views with distinct visible mouths and non-obstructing trunks; preserve everything else unchanged.
```

### Expression-trunk repair

```text
Use case: precise-object-edit
Asset type: targeted anatomy repair on Kavi's canonical Lanternleaf character sheet
Primary request: Change only the trunks on the four small expression heads in the middle-right expression strip. Preserve every other element of the image unchanged.

Expression-head trunk correction:
- Every one of the four expression heads—neutral/listening, curious, worried, and happy—must clearly show the same canonical elephant trunk emerging centrally from the face.
- Each trunk must have the same base width, taper, length, soft blue-grey color, gentle segmented fold language, and two tiny nostril marks at its rounded tip as Kavi's authoritative large face close-up.
- The trunks may curl subtly to suit each expression, but none may be shortened into a mouse-like snout, replaced by a nose/muzzle, hidden, missing, or detached.
- Keep the trunk in front of the tiny mouth where anatomically appropriate; the happy expression may show a small smiling mouth beside/beneath the trunk base without removing the trunk.
- Do not change expression meanings, eye size, eyelashes, ears, eyebrows, cheeks, head scale, positions, or spacing.

Strict preservation:
- Preserve the four top full-body rotations pixel-level in subject, anatomy, bracelet placement, colors, and poses.
- Preserve the large face close-up and bottom-left signature pose exactly.
- Preserve the isolated five-bead bracelet close-up, cord, knots, bead colors/order/count, and all nine color swatches exactly.
- Preserve all layout spacing, pure-white #FFFFFF background, dimensions, smooth broad watercolor, locally colored contours, and borderless presentation.
- Do not add text, labels, panels, borders, guides, props, characters, or accessories.
- No other edits.
```

### Front-wrist bracelet repair

```text
Use case: precise-object-edit
Asset type: single-view accessory continuity repair on Kavi's canonical Lanternleaf character sheet
Primary request: Change only the clay-bead bracelet placement on the top-left FRONT full-body rotation of Kavi. Preserve every other element of the sheet unchanged.

Exact correction:
- In the top-left straight front rotation only, remove the bracelet from the wrist currently on the viewer's LEFT.
- Restore that viewer-left wrist and hand as plain uninterrupted dusty blue-grey skin with the same three cream rounded fingernails as the opposite hand.
- Place exactly one identical bracelet on Kavi's anatomical LEFT wrist, which is the wrist on the viewer's RIGHT in this straight front view.
- The moved bracelet must use the same continuous muted river-blue cord and exactly five rounded clay beads in the canonical fixed order: terracotta, warm ochre, creamy ivory, muted sage, dusty river-blue.
- Wrap it naturally around that wrist. No floating beads, duplicate bracelets, additional charms, changed bead count, or changed anatomy.
- Keep exactly two arms and two legs.

Strict preservation:
- Do not alter the front rotation's face, trunk, ears, eyelashes, tuft, body, proportions, hands, feet, tail visibility, pose, scale, or position except for the specified bracelet relocation and clean skin restoration.
- Preserve the other three top rotations completely unchanged.
- Preserve the large face close-up, all four corrected expression heads with their full trunks, the bottom-left signature pose, the isolated bracelet study, the nine color swatches, layout, dimensions, smooth broad watercolor, locally colored contours, borderless presentation, and solid #FFFFFF background exactly.
- Do not add text, labels, panels, borders, guides, props, characters, or accessories.
- No other edits.
```
