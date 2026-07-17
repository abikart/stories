# Session handoff

Last updated: 2026-07-17

## Read first

- Branch: `codex/mvp-immersive-runtime`
- Preserved baseline: annotated local tag `poc-success`
- Completed MVP contract: `docs/mvp/immersive-run.md`
- Next feature contract and goal prompt: `docs/mvp/liquid-glass-run.md`
- Product index: `docs/README.md`
- Decision log: `docs/DECISIONS.md`

## Current state

- The Fern POC is preserved at `poc-success`; the immersive MVP is complete on
  `codex/mvp-immersive-runtime` and has not been pushed.
- V1/Pip content, superseded routes and engine code, obsolete proofs/scripts,
  rejected binaries, and historical POC documents are absent from the active
  tree. Git history remains their archive.
- Fern is the sole active package. Its expressive performance, alignment,
  Read-with-me units, continuity, soundscape, interaction, and full flattened
  presentation remain intact.
- The runtime now accepts provider-neutral ordered compositions with plates,
  native or packed-alpha layers, normalized geometry, and opaque fallbacks. It
  mounts only the current and likely-next composition.
- Three story moments use real moving transparency: the opening, the complete
  silver-path hero interaction, and the emotional close. Eight alpha renditions
  were compiled from approved media; no new Grok generation was necessary.
- Owner playtesting established the standard scene-blending treatment: one
  exact solid `stage.backdrop.color` shared by source media and the page. Fern
  uses `#FFFFFF`; the poster atmosphere, accent gradient, blur, and opacity wash
  have been removed from the standard runtime path.
- Dialogue identity and placement are now package content. Fern's four scenes
  currently use `top-left`; narrated lines have no visible label, Fern/Pipkin
  speech uses canonical watercolor portraits, and constrained layouts dock the
  same copy safely.
- Title, dialogue, mode, start, and transport surfaces now share the documented
  Stories fallback glass material. The Watch/Read toggle has a moving CSS lens,
  but this implementation does not refract pixels. Owner review approved the
  real WebGL refraction system as the next run; its contract and terminal gates
  are in `docs/mvp/liquid-glass-run.md`.

## Liquid-glass run progress

- Checkpoint 1 is preserved in `983b41b`: the real-refraction contract is
  authoritative and the existing CSS surface is explicitly the fallback.
- Checkpoint 2 now has a renderer-independent signed RG displacement field in
  `src/experience/glass`. It supports pills, rounded rectangles, and circles,
  computes one quadrant with exact four-fold sign symmetry, stays neutral and
  transparent outside the lens, caps map resolution, and caches by geometry
  plus map-affecting optics rather than position.
- `/dev/glass` exposes the principal optical controls, all three map shapes, a
  high-contrast crossing-line source, cache diagnostics, and a moving same-shape
  case. It now runs the real stage WebGL2 path over a grid, still image, and one
  playing Fern video. The line crossing the pill visibly bends and the other
  shapes refract their media; this is the objective optics proof.
- `pnpm test:glass` covers neutral pixels, signed range/direction, symmetry,
  shapes, cache identity, and regeneration. Chromium hydration/error inspection
  passes, and moving the pill leaves the generation count unchanged.
- Checkpoint 3 uses one transparent WebGL2 canvas and one context. It composites
  existing same-origin canvas/image/video sources into an offscreen texture,
  draws only scissored lens rectangles, caps DPR at 2, uploads one live video
  frame without creating another decoder, and sleeps when the video pauses.
  Context loss selects CSS and restoration rebuilds GPU resources without
  remounting. WebKit restoration deliberately abandons invalid lost-context
  handles instead of deleting them through the restored context.
- `pnpm qa:glass --browser=chromium` and `--browser=webkit` both pass the one-
  canvas/video checks, objective in/out pixel checks, map-reuse assertion,
  failure fallback, context recovery, and sleeping-loop gate. Chromium measured
  369 displaced samples; WebKit measured 363.
- Checkpoint 4 adds `GlassStage` and `GlassSurface`. The stage owns the only
  renderer/context, collects the existing `MediaDeck` image/video elements,
  tracks deck mutation/resize/intersection/visibility, and measures registered
  surfaces outside the hot path. The live Fern transport is the first reusable
  surface; its replay/play DOM, focus, labels, and hit targets remain unchanged.
- Chromium and WebKit each measure 6,504 opaque refracted transport pixels and
  exactly two existing MediaDeck videos in both WebGL and forced-CSS modes.
  Live-story context loss/restoration preserves focus and story time.
- Checkpoint 5 registers every required family: quiet title, moving mode lens,
  reading dialogue, start/continue, and tactile transport/replay. Hidden DOM
  surfaces are excluded from drawing, so the opacity-zero dialogue cannot ghost
  behind the start card; it takes over after playback begins.
- The mode and quiet title use authored lens-only refraction targets over low-
  detail white areas. The target canvases are cached source textures, never
  mounted backgrounds, and add no visible stage rectangle or media decoder.
  The mode target contains a restrained selected-state accent and fine lines;
  labels remain sharp DOM while those pixels bend underneath.
- Mode travel follows the existing interruptible 220ms CSS transform and updates
  only bounds. Chromium and WebKit assert that its GPU map-upload count does not
  change. Browser QA also selects the full dialogue string from DOM to prove the
  renderer does not rasterize or distort reading text.
- Checkpoint 6 adds renderer-uniform press deformation: pointer, touch, Space,
  and Enter compress lens scale to 0.96 and optical depth to 0.72, then return
  over a short cubic ease-out without bounce or map upload. Reduced motion keeps
  the static refracted state but removes travel and press deformation.
- Target textures now repaint/upload only when their version or responsive
  geometry changes. Advancing deck video remains the only per-frame source
  upload; hidden/offscreen and paused stages sleep, while offscreen suspension
  does not pause narration. A deviceScaleFactor-3 probe confirms the DPR-2 cap.
- The glass QA matrix passes 390×844, 430×932, 768×1024, 1024×768,
  1440×900, and 1920×1080 in Chromium and WebKit with no horizontal overflow,
  aligned stage/canvas bounds, all visible lenses, and 44px controls. Warm
  measured frames were 0.2ms or below in the automated run.
- Existing `pnpm qa:experience -- fern-and-the-silent-seed-bells` passes after
  replacing its obsolete active-CSS-blur assertion with the one-canvas
  registered-WebGL contract. Playback, Read-with-me, reverse settlement, ending,
  reduced motion, and the established responsive matrix remain green.
- Native macOS Safari was also inspected through its real app: `/dev/glass`
  exposed `webgl`, Fern exposed its complete semantic control tree, mode change
  worked, playback advanced to 9.3s, and Read-with-me reached a two-line Continue
  wait. `docs/evidence/liquid-glass/checkpoint-6-safari-playback.png` preserves
  the native-browser frame.
- Earliest remaining gate: checkpoint 7, full release validation, final evidence,
  architecture/handoff closure, clean checkout, and owner server handoff.
- The active checkout is 139 files / 103,098,739 bytes. Fern is 84 files /
  78,864,822 bytes, including eight alpha videos totaling 10,771,186 bytes.

## Owner playtest

Open <http://localhost:3000/experience/fern-and-the-silent-seed-bells>, then:

1. In Watch, play from the beginning and notice the moving watercolor edge has
   no rectangular video boundary.
2. Let the story reach the silver path; confirm the guide interaction changes
   the layered visual state and Watch completes the same action automatically.
3. Switch to Read-with-me, complete one child passage, and feel the soft
   ambience/visual wait and resume.
4. Resize to phone portrait and desktop landscape. Confirm the whole 4:3 art,
   dialogue, and controls remain usable without horizontal scrolling.
5. Replay the ending and drag the hidden test seek control only through the QA
   harness if reverse-settlement behavior needs inspection.

Subjective approval should focus on alpha-edge cleanliness, whether the plate
and motion feel like one illustration, transition softness, and whether the
silver-path action feels meaningfully more immersive than the flattened beats.

## Validation record

- `pnpm typecheck` — pass
- `pnpm lint:experiences` — pass; 55 referenced assets
- `pnpm build` — pass
- `pnpm qa:experience -- fern-and-the-silent-seed-bells` — pass: Watch,
  Read-with-me, hero completion, reverse scrub, ending, reduced motion, and six
  responsive presets
- Native-alpha files — eight VP9 WebMs with `ALPHA_MODE=1`; representative
  composite and mask inspected against a contrasting plate
- Browser console — no page error or unhandled rejection during forward state
  settlement
- Solid-matte regression — computed page, stage, media, and active-layer colors
  all equal `stage.backdrop.color`; no runtime background image, filter, opacity
  wash, pseudo-atmosphere, or atmosphere DOM element

## Seedance gate

Do not migrate providers by default. When access is worthwhile, regenerate only
the silver-path hero state family with the same references and semantic start /
hold / action / resolve contract. Adopt Seedance only if a side-by-side review
shows a material improvement in character/prop continuity, matched state
handoffs, transparent or mask-ready delivery, or accepted output per hour. The
runtime and package schema require no provider-specific changes.
