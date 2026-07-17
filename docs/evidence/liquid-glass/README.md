# Liquid-glass release evidence

Captured 2026-07-17 from the owner playtest server. Recreate the final Chromium
frames with `pnpm evidence:glass` while `pnpm dev` is running.

| Gate | Evidence | What it proves |
| --- | --- | --- |
| CSS baseline | [Final Fern CSS fallback](final-fern-css-fallback.png) | WebGL-disabled controls, text, title, mode, and start remain usable. |
| Objective optics | [Final WebGL fixture](final-glass-webgl.png) | The high-contrast grid and colored crossing lines bend at a pill edge; still and live video sources share the one renderer. |
| Live layered story | [Final Fern WebGL](final-fern-webgl.png) | Registered dialogue, title, mode, and transport lenses sit over live Fern media while copy remains sharp DOM. |
| Native browser | [Safari playback](checkpoint-6-safari-playback.png) | macOS Safari runs the WebGL path and preserves Watch/Read-with-me semantics. |

The earlier checkpoint frames preserve the implementation sequence: portable
map fixture, first WebGL proof, first live transport, all registered surfaces,
and dialogue. The automated proof does not rely on screenshots alone:
`pnpm qa:glass` reads framebuffer pixels and requires a changed in-lens sample,
transparent output outside lenses, one canvas, unchanged media-element counts,
map reuse, context restoration, and the responsive/reduced-motion gates in both
Chromium and Playwright WebKit.
