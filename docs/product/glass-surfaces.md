# Stories glass surfaces

## Purpose

Stories uses one reusable glass material for dialogue, title, mode, transport,
and temporary reading surfaces. It should make controls feel suspended inside
the living illustration without turning the watercolor world into a technology
demo.

The implementation is informed by Aave's
[Building Glass for the Web](https://aave.com/design/building-glass-for-the-web).
Aave separates the portable displacement map from the renderer: ordinary DOM
can use an SVG filter, while live video in Safari needs WebGL. That distinction
matters here because most Stories glass sits over moving video.

## Current fallback contract

The shared `.story-glass` primitive is the accessible CSS fallback:

- a translucent neutral fill that preserves the story matte;
- `backdrop-filter` blur and restrained saturation over live art;
- layered top light, inner rim, soft shadow, and a barely visible chromatic edge;
- `quiet`, `reading`, and `control` variants expressed through custom properties;
- no directional bubble tail and no hard ornamental border; and
- an opaque-enough fill fallback when backdrop filtering is unavailable.

Usage:

```html
<div class="story-glass story-glass--reading">...</div>
<div class="story-glass story-glass--control">...</div>
<div class="story-glass story-glass--quiet">...</div>
```

`story-glass--reading` prioritizes text contrast. `story-glass--control` makes
the rim and highlight more tactile. `story-glass--quiet` keeps persistent labels
from competing with the illustration.

The Watch/Read-with-me toggle has a separate `.story-mode-lens`. The lens moves
between options with one 220ms ease-in-out transform; it does not animate layout.
Reduced-motion removes that transition. Buttons retain their semantic DOM,
keyboard behavior, and minimum touch size.

## Progressive renderer boundary

Applying `feDisplacementMap` to the dialogue's own DOM would distort the words,
not the video behind them. Applying an SVG filter to a live `<video>` backdrop
is not a dependable Safari path. The current CSS therefore remains the
universal compatibility baseline, but it is not the finished liquid-glass
effect: it does not displace the scene's pixels.

The real renderer is a progressive layer governed by the authoritative
[Liquid glass feature run](../mvp/liquid-glass-run.md). One `GlassStage` owns the
canvas, context, source collection, recovery, and diagnostics. A `GlassSurface`
registers one DOM element's bounds and lens model without exposing WebGL to the
story component.

The stage reads only image/video elements already mounted by `MediaDeck` and
measures their rendered geometry and ancestor opacity. During a deck crossfade,
the source resolver follows live opacity without allocating React state. All
semantic UI remains above the canvas and the existing `.story-glass` material
becomes visible automatically whenever the renderer reports CSS fallback.

Fern now registers the complete family. Browser QA compares the media-element
count with WebGL forced off, asserts one stage canvas, reads opaque pixels inside
each visible lens, and checks that context recovery does not reset playback or
focus. It also selects dialogue text directly from the DOM.

`GlassRefractionTarget` registers an authored paint callback with the stage. The
stage maintains one cached 2D source per target and versions it only when the
target or responsive geometry changes. It is uploaded to a target framebuffer
and sampled only by lenses that name it; it is never mounted as a visible stage
layer. Fern uses this for the moving mode accent and a very quiet title line over
white matte. The mode canvas paints detail across the whole selector plus a
selected-state pill, so the moving lens remains evident throughout travel while
the actual labels stay untouched above it.

Surface visibility is part of registration. Zero-opacity, hidden, display-none,
or zero-area DOM does not produce a lens. This prevents the pre-play dialogue
surface from refracting behind the start card, then permits the same registered
surface to resume when playback exposes it.

## Portable lens field

The first renderer-independent layer lives in `src/experience/glass`. A lens
map stores signed horizontal and vertical displacement in red and green,
edge/thickness in blue, and the exact shape mask in alpha. Pixels outside the
lens are neutral RG with zero thickness and alpha. Pills, rounded rectangles,
and circles share one geometry contract.

Map generation computes one quadrant and mirrors it with the correct sign into
the other three. The cache key includes rounded geometry and map-affecting
curvature, splay, depth, and center scale; screen position, displacement scale,
chroma, and specular lighting remain renderer uniforms. Moving a lens therefore
does not rebuild its map. The longest map edge is capped at 512 pixels so a
large responsive reading surface cannot create an unbounded texture.

## Acceptance rules

- Text contrast wins over refraction strength.
- Glass must not expose the rectangular media boundary or change the declared
  story matte.
- Animate only `transform` and `opacity`; never regenerate an effect while a
  lens merely changes position.
- Hover highlights only run on fine pointers.
- `prefers-reduced-motion` removes lens and highlight transitions.
- Full playback and the six responsive presets must pass with glass enabled.
