# Stories glass surfaces

## Purpose

Glass is a functional layer for temporary elevation and focus. It is not the
default appearance of story UI. The authoritative recipe and broader treatment
analysis live in [the Stories design system](design-system.md).

## Current contract

The shared `.ds-glass-light` primitive follows Figma 1D Guardrails Light Glass:

- 60% white fill and 60% white 1px border;
- 10px backdrop blur over the existing story media;
- an 80% white inset highlight;
- two restrained 4% black elevation shadows; and
- a more opaque neutral fallback when backdrop filtering is unavailable.

Usage keeps semantic DOM unchanged:

```html
<div class="ds-treatment ds-glass-light">...</div>
```

The runtime applies Light Glass to live dialogue, retained Read-with-me
passages, and the temporary start interruption. The title, mode switch, and
transport are persistent chrome, so they use `.ds-surface-solid`. Buttons never
receive an additional glass layer.

## Acceptance rules

- Temporary priority is required before glass is selected.
- Text contrast wins over material visibility.
- Glass must not expose the rectangular media boundary or alter the declared
  story matte.
- Do not layer glass on glass or use glow to simulate glass.
- Keep native buttons, keyboard behavior, focus indicators, and touch targets.
- Full playback and all responsive presets must pass with the treatment enabled.
