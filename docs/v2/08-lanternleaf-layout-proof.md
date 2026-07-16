# Lanternleaf 4:3 responsive composition proof

Status: **candidate contract, awaiting product review**  
Proof route: `/dev/lanternleaf-layout`

## Question this proof answers

Can one 4:3 Lanternleaf illustration or motion master support phone, tablet,
desktop, and a 16:9 film output without a separately directed portrait asset?

The working proof says yes. It deliberately tests the new bright-white,
edge-dissolving universe references rather than the framed 16:9 Bramble Hollow
visual language. It does not yet replace the current contract in
`03-responsive-stage.md`.

## Candidate composition contract

- Author each story visual natively at 4:3. Keep the complete semantic beat in
  that frame; do not rely on a later center crop.
- Let painted foliage, light washes, and paper-white negative space dissolve
  into a shared pure-white page matte. Avoid ornamental frames and hard scene
  rectangles.
- Keep narration, dialogue, highlighting, controls, and Read-with-me passages
  as responsive DOM content. They are never baked into the media.
- Below the wide-layout breakpoint, stack the complete illustration above the
  reading surface. The resulting page is portrait even though the media is not.
- At wide sizes, place illustration and copy in one editorial row. The media
  remains 4:3 and the copy receives its own collision-free column.
- Compose film deterministically in a 16:9 output frame: 4:3 art on one side,
  story copy on the other. Film is an output layout, not a second creative
  media master.
- Treat short landscape devices as wide layouts only when their usable height
  can support the row. Final preset selection should use container dimensions,
  not user-agent detection.

## What the route demonstrates

The route includes two presentation states:

1. **Watch phrase** — a current narration phrase, word highlight, progress, and
   transport affordance.
2. **Seven-line passage** — the longest current Read-with-me shape rendered as
   one naturally flowing list with one Continue action and no nested scroll.

It also switches among three universe references to expose how differently
composed images behave inside the same media surface. Those files are portrait
references and are intentionally contained without cropping. They are layout
stand-ins, not approved 4:3 scene masters; production artwork should use the
4:3 canvas from the start.

Query controls make the proof reproducible:

```text
/dev/lanternleaf-layout?mode=watch&scene=fern
/dev/lanternleaf-layout?mode=read&scene=workshop
/dev/lanternleaf-layout?film=1&mode=watch&scene=fern
```

## Browser findings

| Viewport | Composition | Result |
|---|---|---|
| 390×844 | stacked phone page | 4:3 art, copy below, zero horizontal overflow |
| 430×932 | stacked phone page | 4:3 art, copy below, zero horizontal overflow |
| 768×1024 | stacked tablet page | 4:3 art, copy below, zero horizontal overflow |
| 1024×768 | editorial row | 4:3 art beside copy, zero horizontal overflow |
| 1440×900 | editorial row | 4:3 art beside copy, zero horizontal overflow |
| 1920×1080 | exact 16:9 film frame | 4:3 art and copy fully inside frame; no page overflow |

Across the matrix:

- the measured art ratio remains 1.3333;
- media uses `object-fit: contain`, so reference art is not cropped;
- all interactive controls are at least 44px high;
- the Read-with-me state contains exactly seven visible lines, one Continue
  action, and no internal overflow container;
- switching universe references works without remounting the composition; and
- the browser console is clean.

## Production implications

The ratio change simplifies content continuity: the authored story beat and the
interactive reading viewport see the same full composition. It also makes the
responsive behavior primarily a layout problem rather than a media-generation
problem.

The organic edge depends on a disciplined matte. Image and video generation,
post-processing, posters, and the page must share a calibrated white background;
otherwise a faint rectangular canvas will reappear. Production QA should sample
the outer edge and reject dirty whites, gray compression blocks, or motion that
reveals the source rectangle.

The next gate is visual review of this proof. If approved, replace the old
16:9-master/4:3-crop contract in `03-responsive-stage.md`, record the decision,
then reconcile the Lanternleaf scene skill before authoring the replacement POC
story.
