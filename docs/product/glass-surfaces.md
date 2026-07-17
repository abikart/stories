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

## Current limitation and approved next run

Applying `feDisplacementMap` to the dialogue's own DOM would distort the words,
not the video behind them. Applying an SVG filter to a live `<video>` backdrop
is not a dependable Safari path. The current CSS therefore remains the
universal compatibility baseline, but it is not the finished liquid-glass
effect: it does not displace the scene's pixels.

Owner review approved a real renderer as the next feature run. The authoritative
execution contract is [Liquid glass feature run](../mvp/liquid-glass-run.md).
It adds one stage-level WebGL pass that reuses `MediaDeck` sources and draws
registered lens regions while keeping text, input, accessibility, and fallback
CSS in the DOM above it.

## Acceptance rules

- Text contrast wins over refraction strength.
- Glass must not expose the rectangular media boundary or change the declared
  story matte.
- Animate only `transform` and `opacity`; never regenerate an effect while a
  lens merely changes position.
- Hover highlights only run on fine pointers.
- `prefers-reduced-motion` removes lens and highlight transitions.
- Full playback and the six responsive presets must pass with glass enabled.
