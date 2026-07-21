# Design-system rollout evidence

Captured: 2026-07-19; soft-component catalog added 2026-07-20.

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

## Soft component compatibility and Stories preset

The complete component catalog is reproducible with
`npm run evidence:soft-components`. The checked-in captures cover the
upstream-compatible and child-focused presets, Chromium and WebKit, and a
390px phone viewport.

| Stories preset | Upstream-compatible preset |
| --- | --- |
| ![Complete 40-component Stories preset catalog in Chromium](soft-components/stories-desktop-chromium.png) | ![Complete upstream-compatible catalog in Chromium](soft-components/upstream-desktop-chromium.png) |

| Phone | WebKit |
| --- | --- |
| ![Complete Stories preset catalog at 390px without horizontal overflow](soft-components/stories-phone-chromium.png) | ![Complete Stories preset catalog in WebKit](soft-components/stories-desktop-webkit.png) |
