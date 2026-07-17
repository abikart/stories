# Stories transmission glass

## Purpose

Stories uses one stage-level renderer to bend the live illustration beneath
dialogue, title, mode, start, and transport surfaces. The accessible interface
remains normal DOM above that renderer. The result follows the physical
transmission material demonstrated by
[React Bits Fluid Glass](https://reactbits.dev/components/fluid-glass) and the
portable lens principles in Aave's
[Building Glass for the Web](https://aave.com/design/building-glass-for-the-web).

## Runtime boundary

`GlassStage` owns one transparent React Three Fiber canvas. It renders after
`MediaDeck` but below all text, portraits, buttons, focus rings, and pointer
targets. `GlassSourceScene` creates Three textures directly from the existing
`HTMLImageElement`, `HTMLVideoElement`, and canvas nodes; it never creates a
second media element or decoder. Source rectangles, ancestor opacity, alpha,
and deck crossfades are recomputed from the mounted scene.

Every `GlassSurface` supplies live DOM bounds, one of `pill`, `rounded-rect`, or
`circle`, and a small optical recipe. Geometry and the signed normal/
displacement profile are cached by shape and material values. Moving a lens
changes only its transform. A source-only `refractionTarget` plane lets the
Watch/Read lens remain visible over Fern's white matte without adding any
visible stage background or distorting its labels.

The React Bits ingredients are physical IOR, thickness, transmission,
anisotropic blur, restrained chromatic aberration, and bevel normals. The
cached Stories lens profile is also supplied as the material normal map so the
edge bend and highlight follow the actual lens shape.

## Rendering and recovery

- One canvas/context and one offscreen source target serve all lenses.
- Render DPR is capped at 1.5 (below the contract ceiling of 2).
- Playing video refreshes at up to 30fps; motion, resize, and deck changes wake
  demand rendering; a settled still stage sleeps.
- Hidden documents and offscreen stages stop invalidating frames.
- Pointer/keyboard press compresses the lens to `0.96`; reduced motion keeps a
  static lens and removes travel/deformation.
- Context loss immediately selects `data-glass-renderer="css"`; restoration
  returns to WebGL without remounting the story.
- Initialization failure retains the existing `.story-glass` CSS material.

Development diagnostics live at `window.__storiesGlassStage` and report status,
frames, source/surface counts, sleeping state, DPR, frame time, map-cache
hits/misses, and the last boundary error. `/dev/glass` shows the active renderer
and proves transmission across a grid, still, and playing video.

## Accessibility and acceptance

The canvas is `aria-hidden` and has no pointer events. Labels, synchronized
words, portraits, range input, buttons, and focus behavior are never rendered
into WebGL. All controls retain at least 44×44 CSS-pixel hit targets.

Completion evidence is objective: `pnpm qa:glass` compares fixture pixels with
the glass layer enabled and disabled, checks transparency outside lenses, one
context, cache reuse during travel, context loss/restoration, and live Fern in
Chromium and Playwright WebKit. `pnpm qa:experience --
fern-and-the-silent-seed-bells` remains the story regression gate.
