# Design-system rollout evidence

Captured: 2026-07-19

The owner-provided “before” frames show the rejected universal-glass direction.
The “after” frames are reproducible with
`pnpm tsx scripts/capture-design-system-evidence.ts` against the clean local dev
server. The catalog and guide frames use Chromium; the full-story frame uses
Playwright WebKit (Safari’s browser engine).

## Persistent chrome and temporary focus

| Before | After |
| --- | --- |
| ![Mode control covered by a broad decorative translucent slab](before-mode-glass.png) | ![WebKit story frame with solid title, mode, and transport plus one temporary Light Glass start decision](after-fern-webkit.png) |

## Whole-story hierarchy

| Before | After |
| --- | --- |
| ![Universal gray glass applied to title, dialogue, mode, and transport](before-universal-glass.jpg) | ![Fern guide state with solid persistent chrome, Light Glass dialogue, and a local gold Spotlight Glow target](after-fern-guide-chromium.png) |

## Portable catalog and phone composition

| Catalog | Phone |
| --- | --- |
| ![All portable treatments, fallback state, and recipe maturity labels](after-catalog-chromium.png) | ![Phone-width Fern composition with complete art and 44 pixel controls](after-fern-phone-chromium.png) |
