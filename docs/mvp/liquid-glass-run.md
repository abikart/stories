# Liquid glass feature run

Status: approved next major run

Owner playtest target: `/experience/fern-and-the-silent-seed-bells`

## Outcome

Build a complete Stories liquid-glass system that visibly refracts the living
story illustration beneath dialogue, title, mode, start, and transport
surfaces. Completion means real pixel displacement over the active layered
scene, not a restyled translucent panel.

The system must preserve the things that already work: expressive audio and
word timing, semantic and selectable text, accessible controls, layered alpha
media, the exact story matte, responsive layouts, Read-with-me stops, reverse
settlement, and bounded media ownership.

The current `.story-glass` CSS is the reliable fallback. It is not the visual
definition of done for this run.

## Reference and implementation boundary

The visual and technical reference is Aave's article
[Building Glass for the Web](https://aave.com/design/building-glass-for-the-web):
a portable displacement field, a renderer appropriate to the content beneath
the lens, restrained chromatic separation, and a shape-aware specular rim.

Implement the system independently from those principles. Do not copy private
or bundled Aave code and do not add a large general-purpose 3D engine when a
small Stories-owned WebGL2 pass is sufficient.

## What is currently missing

CSS translucency, blur, saturation, borders, and shadows can suggest frosted
glass, but they cannot bend the scene. The finished feature needs all of these:

- visible magnification and displacement near the lens edge;
- a calmer center and a curved transition into the edge displacement;
- restrained red/green/blue separation where the virtual glass is thickest;
- a highlight that follows lens geometry rather than a generic box gradient;
- a deliberate source to refract when a control sits over the blank white story
  matte; and
- deformation and travel that update lens uniforms without rebuilding its
  displacement field every frame.

## Runtime architecture

### One renderer per story stage

Mount one transparent WebGL2 canvas inside the story stage, above `MediaDeck`
and below all semantic UI. It draws only registered lens regions and remains
transparent elsewhere. Do not create a canvas, WebGL context, or media decoder
per surface.

The renderer reuses the media elements already decoded and owned by
`MediaDeck`. It uploads or composites the current and entering plate/motion
sources—including their opacity, normalized geometry, alpha, and deck
crossfade—into the refraction source. It must not introduce duplicate hidden
`<video>` elements.

DOM text, word highlighting, portraits, focus rings, hit targets, and button
semantics stay above the canvas and are never distorted. A surface may combine
a refracted shell below with a very light DOM readability wash above.

### Portable lens model

Create a renderer-independent lens definition with:

- bounds and corner radius;
- displacement strength, curvature, splay, depth, and center scale;
- chromatic-fringe strength;
- specular direction, width, and intensity;
- optional tint/readability wash; and
- an optional `refractionTarget` for surfaces over low-detail matte.

Generate a neutral-outside, signed red/green displacement map. Exploit
four-fold symmetry and cache by geometry plus optical parameters. Position-only
movement changes bounds/uniforms; it must not regenerate the map. Rounded pills,
rounded rectangles, and circles are required in the first version.

### Surface registration

Provide one reusable React integration, such as `GlassStage`, `GlassSurface`,
and a registration hook/context. A registered DOM ref supplies live bounds;
`ResizeObserver` and stage resize update them outside the animation hot path.

The public surface API must be small enough that a future story can opt in
without WebGL knowledge. The implementation may use modules similar to:

```text
src/experience/glass/
  types.ts
  lens-map.ts
  shaders.ts
  source-compositor.ts
  GlassRenderer.ts
  GlassStage.tsx
  GlassSurface.tsx
```

Names may change if the resulting boundary is clearer.

### Refraction targets on white matte

Refraction cannot reveal detail that does not exist. Fern deliberately has a
white matte, so controls outside the illustration may otherwise look quiet.
Support an authored target layer that is sampled only through a lens. The
Watch/Read selector should refract a subtle selected-state accent or duplicate
target rather than distort its labels. Large dialogue surfaces should use the
actual illustration when it lies underneath and a restrained target only when
needed for legibility and optical proof.

Do not add a visible rectangle, atmospheric wash, or gradient behind the full
stage merely to make glass easier to see.

## Surface behavior

Apply the real renderer to the existing surface families:

| Surface | Treatment | Required behavior |
| --- | --- | --- |
| Dialogue | Reading lens plus independent DOM copy | Scene bends; words and portraits remain sharp and readable. |
| Mode toggle | Moving control lens plus `refractionTarget` | Lens moves between options and remains evident over white. |
| Transport/replay | Compact control lenses | Strongest tactile edge; no extra decoration or bubble arrow. |
| Start/continue | Reading/control hybrid | Clear primary action with stable focus treatment. |
| Story title | Quiet lens | Subordinate to the art; still visibly optical over detailed media. |

The mode lens uses an interruptible 220ms ease-in-out transform. Press feedback
may compress optical depth and scale to `0.96`, then recover with a short
ease-out. Avoid bounce. Hover-only effects run only for fine pointers. All hit
targets remain at least 44 by 44 CSS pixels.

`prefers-reduced-motion` keeps a static refracted lens but removes travel,
press deformation, and highlight motion. The state change itself remains
immediate and clear.

## Render and resource budget

- Exactly one stage glass canvas and one WebGL context.
- No additional `<video>` decoder created by the glass system.
- Cap render DPR at 2 and resize only when stage size/DPR actually changes.
- Scissor or otherwise bound work to lens regions where practical.
- Render while a source video is advancing, a deck transition is active, or a
  lens is moving/deforming; otherwise settle to one final frame and sleep.
- Never update React state per animation frame.
- Keep map generation and geometry allocation outside the frame loop.
- Stop rendering when the stage is offscreen or the document is hidden.
- Preserve `MediaDeck` ownership of current and likely-next media only.

Add lightweight development instrumentation for renderer status, source
uploads, active lenses, displacement-map cache hits/misses, frame time, and
context loss. It must be absent or dormant in normal production UI.

## Progressive enhancement and recovery

The feature must fail soft. Use the existing CSS material when WebGL2 is
unavailable, initialization fails, a source cannot be sampled, or context is
lost. Handle context restoration without remounting or restarting the story.
Expose the active path as a stable diagnostic attribute such as
`data-glass-renderer="webgl|css"`.

The fallback must preserve every control and reading surface. A fallback is a
compatibility result, not evidence that the real-renderer acceptance gates pass.

## Proof fixture

Add a development-only `/dev/glass` route or equivalent harness with:

- a high-contrast line/grid source;
- a still image and a playing video source;
- pill, rounded-rectangle, and circle lenses;
- controls for the principal optical parameters;
- a moving-lens case that proves map reuse; and
- renderer status and frame/cache diagnostics.

This fixture is the objective optics proof. A line crossing the edge of the
lens must visibly bend or magnify. Blur and a brighter border do not satisfy
this test.

## Validation gates

### Automated

- Unit tests cover displacement sign/range, neutral pixels outside the lens,
  symmetry, supported shapes, and cache identity/reuse.
- Browser QA asserts one canvas/context, no duplicate media elements, correct
  renderer status, transparent pixels outside lenses, and pixels that differ
  inside a lens over the diagnostic grid.
- Moving a same-shaped lens must not increase displacement-map generation.
- Simulated context loss must select CSS fallback; restoration must return to
  WebGL without losing story state.
- Existing `pnpm typecheck`, `pnpm lint:experiences`, `pnpm build`, and
  `pnpm qa:experience -- fern-and-the-silent-seed-bells` pass.
- Run the optical and story path in Chromium and Playwright WebKit. Inspect in
  macOS Safari as well when it is locally controllable.

### Visual and interaction

- A high-contrast line behind each lens shape visibly displaces at its edge.
- Chromatic fringe and specular light are perceptible but do not look neon.
- Live Fern video, alpha layers, and deck crossfades refract without a duplicate
  decoder, rectangular boundary, stale frame, or black flash.
- The toggle remains optically legible over Fern's white matte.
- Dialogue words remain sharp, selectable DOM and synchronized to narration.
- Focus, pointer, touch, keyboard, reduced motion, Read-with-me waits, replay,
  reverse settlement, and media fallback keep working.
- All six existing responsive presets remain free of clipping and horizontal
  scrolling.

Capture before/after screenshots of `/dev/glass` and representative Fern
surfaces. Include one frame with a diagnostic line crossing a lens edge so the
result can be judged without relying on prose.

## Checkpoint sequence

Complete and commit the smallest coherent unit at each checkpoint:

1. Correct the docs and preserve the CSS implementation explicitly as fallback.
2. Build lens math, displacement-map generation/cache, and the diagnostic
   fixture with tests.
3. Add the single stage renderer, source composition, sleeping render loop,
   instrumentation, and recovery path.
4. Integrate reusable surface registration and prove one live transport lens.
5. Add the mode target/lens and hybrid dialogue, start, and title surfaces.
6. Tune motion, touch/focus/reduced-motion behavior, responsive composition,
   and resource performance.
7. Run full validation, capture proof, update architecture/handoff docs, and
   leave a clean owner-playable checkout.

Use Conventional Commits. Do not push unless explicitly asked.

## Out of scope

- New story writing, timing, narration, or media generation.
- Grok or Seedance work.
- A full Canvas/WebGL rewrite of the story player.
- Aval adoption, branching-video changes, or deterministic film export.
- Dark-theme content production. The architecture may support future dark
  worlds, but Fern remains a white-matte watercolor story.
- Distorting dialogue text to make an effect easier to implement.

## Terminal condition

The run is complete only when Fern uses the real renderer for all listed
surface families, the diagnostic grid proves displacement, the live layered
video path visibly refracts, automated and real-browser gates pass, fallback
and context recovery work, documentation describes the implemented system, Git
is clean, and the dev server is running for owner playtest.

Do not declare completion when the result is only blur, translucency, shadow,
or border styling. If live-video refraction remains blocked, attempt at least
three materially different in-scope technical approaches, retain the smallest
isolated reproduction and evidence, and report the precise blocker rather than
lowering the definition of done.

## Goal prompt

```text
Implement and owner-deliver the complete Stories liquid-glass feature defined
in docs/mvp/liquid-glass-run.md. Run as a long-lived autonomous loop across
automatic continuations until its terminal condition is genuinely satisfied.

The result must use real pixel refraction over the active layered story media,
not a CSS frosted-glass imitation. Build one stage-level WebGL2 renderer that
reuses MediaDeck's already-decoded sources, a cached portable displacement-map
and lens model, reusable registered glass surfaces, deliberate refractionTarget
support for white/low-detail areas, and robust CSS fallback and context-loss
recovery. Keep all words, portraits, buttons, focus behavior, and accessibility
in semantic DOM above the renderer and never distort reading text.

Apply the feature to dialogue, the Watch/Read toggle, transport/replay,
start/continue, and the story title. Prove it first in a high-contrast /dev/glass
fixture, then over Fern's live layered illustration. A line crossing a lens edge
must visibly bend or magnify; restrained chromatic separation and a shape-aware
specular rim must be visible. The mode lens must remain evident over the solid
white matte without adding a rectangular or atmospheric stage background.

Preserve the existing story performance, word synchronization, Read-with-me,
alpha compositions, media fallbacks, reverse settlement, responsive presets,
and solid-matte blending. Use one WebGL context, no duplicate video decoders, a
DPR cap, cached map generation, and an idle/sleeping render loop. Handle WebGL
failure, context loss/restoration, reduced motion, hidden/offscreen stages,
keyboard, touch, and focus without breaking the story.

Work through the contract's checkpoints in dependency order. At every
continuation, resume from the durable handoff, take the earliest failed or
unblocked gate, implement the smallest coherent unit, inspect it, run
proportional checks, update docs and diagnostics, commit with a Conventional
Commit message, and continue immediately. Do not stop for routine choices,
status reports, a commit boundary, or the first failed approach. Use best
judgment, do not push, do not buy services, and do not change story content.

Completion requires the objective diagnostic displacement proof, live Fern
refraction, Chromium and WebKit/Safari inspection, all existing story QA plus
new optics/recovery tests, clean responsive behavior, before/after evidence,
updated architecture and handoff docs, a clean Git checkout, and a running dev
server at /experience/fern-and-the-silent-seed-bells for my playtest. Do not call
CSS blur/translucency complete. If a true blocker remains, exhaust at least
three materially different in-scope approaches, preserve the isolated evidence,
and report the exact smallest action needed rather than weakening the gates.
```
