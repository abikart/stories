# POC Requirements — the build charter

This document is the authoritative scope for the stories.sh proof of concept. An autonomous build loop should be able to execute it milestone by milestone without further product decisions. Where this doc is silent, prefer the simplest thing that preserves the magic loop ([01-vision.md](01-vision.md)).

## What the POC must prove

1. **The magic loop feels magical.** Slide-to-read with grapheme highlighting, scene scrubbing in the same gesture, and wake-the-world on page completion — at 60fps on an iPad-class device.
2. **The format scales.** Three real stories, two scene backends, one schema — no story-specific hacks in the engine.
3. **Content is manufacturable.** Scripted pipeline: story text → lint → segment → narrate → time-align → scene assets → playable story, with every external service behind an adapter that has a free local fallback.
4. **The YouTube leg works.** One command renders a story's read-aloud mode to an MP4 with narration and karaoke highlighting.

## Out of scope (do not build)

Accounts/auth, payments/paywalls, parent dashboard, speech recognition (Echo mode), personalization, real CMS UI, mobile wrappers, i18n, analytics beyond a words-read counter in localStorage, server/database of any kind. The POC is a static web app plus local scripts.

## Tech decisions (fixed — do not relitigate)

- **App**: Next.js (App Router) + TypeScript + Tailwind. Static-exportable; deployable to Vercel under stories.sh later.
- **Design**: follow [08-design-system.md](08-design-system.md) from M0 — its color/type/shape tokens go into the Tailwind/CSS setup at scaffold time, not retrofitted at M8. Fonts (Quicksand, Inter, Lexend) via `next/font/google`.
- **Engine**: framework-agnostic TypeScript in `src/engine/` — no React imports. React components in `src/components/` bind engine state to DOM.
- **Animation**: the scrub engine is hand-rolled (rAF + spring smoothing). Motion (framer-motion) allowed for UI chrome only, never for the scrub path.
- **Audio**: Web Audio API directly (Howler unnecessary). All narration is pre-generated files + timestamp JSON; runtime TTS is not used in the reader.
- **Scenes**: coded backend = SVG + CSS transforms driven imperatively (Canvas allowed if a scene needs particles); frames backend = preloaded WebP sequence drawn to `<canvas>`.
- **Content**: stories live in `content/<story-id>/` as `story.json` + assets. No CMS; scripts in `scripts/` are the CMS ([06-content-pipeline.md](06-content-pipeline.md)).
- **Video render**: Playwright driving the app's `/render/<storyId>` route + ffmpeg mux. Both are dev-machine dependencies, fine.
- **TTS adapters**: `elevenlabs` (if `ELEVENLABS_API_KEY` present) else `macos-say` (the `say` CLI) else fail with instructions. Timestamps: ElevenLabs character timestamps when available; otherwise duration-proportional estimation refined by per-word audio slicing. The build must fully succeed with zero paid keys.
  - Status: a working key is in `.env` (verified 2026-07-10: `/v1/text-to-speech/{voice}` and `/with-timestamps` both return 200). It is a **scoped key** — TTS endpoints only; do NOT call `/v1/user*` or other account endpoints to "validate" it (they 401 by design). Use narration-friendly settings (slow-ish stability-leaning voice settings) and cache generated audio in `content/` so lint/build reruns never re-spend quota.
- **Image/video generation**: none available — do not attempt AI image or video APIs. All art is code-drawn (SVG scenes, procedural frame sequences per the frames-backend plan); stickers and covers are derived from scene art.
- **Scene asset fallback**: the frames backend must be provable without paid video generation — ship a procedural frame generator (Canvas-rendered parallax/gradient animation exported as WebP frames via a script). Real AI video (Higgsfield et al., per scroll-world) slots in later behind the same directory format.

## Milestones

Execute in order. Each milestone ends with: verification performed in a real browser (use the preview tooling), acceptance criteria checked, a git commit. If a milestone is found complete on re-entry, verify and move to the next.

### M0 — Scaffold & schema
Next.js app boots; `src/engine/types.ts` defines the Storyspec types from [05-story-format.md](05-story-format.md); one hardcoded page renders prose from a `story.json` (no interactivity). Routes: `/` (placeholder), `/read/[storyId]`, `/render/[storyId]` (stub).
**Done when**: `pnpm dev` serves a page showing tokenized prose from data.

### M1 — The scrubber (the core feel)
The Spark: a draggable handle on a rail under the prose. Dragging maps finger position → timeline `t` → active grapheme. Grapheme spans highlight progressively (past = lit, active = glowing, future = dim). Spring-smoothed, 60fps, works with touch + mouse + keyboard arrows. Word-complete chime (synthesized via Web Audio for now). Tap-a-word focuses the slider on that word.
**Done when**: dragging through "The fox sat on the box." feels smooth and grapheme groups (test with a `sh` word) highlight as units. This milestone deserves disproportionate polish time — it is the product.

### M2 — Timeline, Scene Contract, first coded scene
Page timeline model (token → t-range mapping); `Scene` interface (`mount/seek/cue/setAwake/destroy`); the fox-and-box coded scene ([07-poc-stories.md](07-poc-stories.md)) reacting to scrub with at least 3 cues; wake-the-world (dormant desaturated/still → wakes on completion). Scene and text stay in sync from the same `t`.
**Done when**: reading page 6 makes the fox jump *on the word "hops"*, and finishing a page visibly wakes the scene.

### M3 — Audio & modes
Narration adapter + pre-generated narration for story 1 (via `scripts/narrate.ts`, using the best available TTS adapter); word-timestamp JSON. Three drivers: FingerDriver (M1), ClockDriver (Read-to-me: narration plays, highlights + scene follow), HybridDriver (Read-along: finger drives, crossing a word boundary plays that word's audio slice). Mode switcher UI. Tap-a-word plays phoneme sound-out then blended word (phoneme audio may be synthesized/recorded once into a shared phoneme bank).
**Done when**: all three modes work on story 1's first three pages.

### M4 — Full story player
Page navigation with transitions (next page starts dormant), story start/end screens, story-complete celebration + sticker into a localStorage sticker book, words-read counter, ambient audio bed with mute toggle, `prefers-reduced-motion` fallback. Story 1 complete end-to-end (all pages, all cues, narration).
**Done when**: a full read-through of "The Fox on the Box" in each mode works and ends in a celebration.

### M5 — Frames backend + story 2
`FramesScene`: preloaded WebP sequence scrubbed on canvas, dormancy via desaturation/freeze. `scripts/gen-frames.ts`: procedural generator producing frame sequences for story 2's pages ("The Ship in the Rain" — rain, sea parallax, drifting ship are all procedurally achievable). Story 2 playable end-to-end.
**Done when**: story 2 plays in all modes with scrubbed frame scenes and no engine changes specific to it.

### M6 — Content pipeline & story 3
`scripts/lint-story.ts` (decodability linter per [06-content-pipeline.md](06-content-pipeline.md)); `scripts/segment.ts` (grapheme segmentation with a curated GPC table + per-story overrides); `scripts/new-story.ts` scaffolder. All three stories pass the linter. Story 3 ("Pop! Pop! Pop!", coded popcorn scene) built end-to-end — ideally using only the scripts, as a pipeline dry run.
**Done when**: `pnpm lint:stories` passes all three; story 3 plays; a README section documents the authoring flow.

### M7 — Render-to-video
`/render/[storyId]`: chrome-free 16:9 read-aloud playthrough driven by a deterministic clock. `scripts/render-video.ts`: Playwright captures frames (CDP screencast or per-frame screenshots at fixed timestep — deterministic beats realtime), ffmpeg muxes with the narration + ambient mix to `out/<storyId>.mp4`, 1080p.
**Done when**: `pnpm render fox-on-the-box` produces a watchable MP4 with synced karaoke highlighting — a plausible YouTube upload.

### M8 — Landing page & polish
stories.sh landing page (`/`): hero demonstrating the magic loop (embed the real reader on a demo page, not a video), the three stories as a library grid, one-paragraph parent pitch, mode explanations. Whole-app polish pass (run the `make-interfaces-feel-better` skill), a11y pass (focus order, labels, contrast), dyslexia-font + text-size toggles, iPad Safari verification at 1024×768 and 1366×1024 viewports.
**Done when**: the landing page would not embarrass us on a Show HN / X launch post.

## Cross-cutting acceptance criteria

- **Feel**: scrub latency imperceptible (< 1 frame between finger and highlight/scene); no jank during page transitions; audio starts within 100ms of gesture (Web Audio unlocked on first interaction).
- **Engine/content separation**: adding story 4 must require zero engine changes — this is checked at M5 and M6.
- **No paid dependencies**: `pnpm install && pnpm build` succeeds and all three stories play on a machine with no API keys.
- **Type safety**: Storyspec types are the single source of truth; `story.json` files validated (zod) at load and in the linter.
- **Commits**: one per milestone minimum, conventional messages.

## Guardrails for the autonomous loop

- Verify in a real browser before marking any milestone done — screenshots + interaction via the preview tools, at both desktop and 1024×768 touch viewport. The scrubber must be tested with actual pointer-event dispatch, not just unit tests.
- Do not add dependencies beyond: next, react, tailwind, motion, zod, playwright (dev), and small utilities. No state-management, audio, or animation libraries on the scrub path.
- Do not restructure this docs set; if reality diverges from a spec detail, note it in `docs/DECISIONS.md` and continue — do not stop to ask for product input on anything covered by these docs.
- If blocked on an asset (e.g., TTS output quality), ship the fallback and log the gap in `docs/DECISIONS.md`; never block a milestone on asset beauty.
- Story text may be adjusted for decodability (linter is the authority), but keep the arcs from [07-poc-stories.md](07-poc-stories.md).
