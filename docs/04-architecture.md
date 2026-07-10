# Architecture

## Shape of the system

```
content/<story-id>/story.json + audio/ + scenes/     ← data (the CMS output)
src/engine/        ← framework-agnostic TS: timeline, drivers, scenes, audio
src/components/    ← React bindings: Reader, Scrubber, ProseLine, SceneHost, UI chrome
app/               ← Next.js routes: / , /read/[storyId] , /render/[storyId]
scripts/           ← the "CMS": new-story, segment, lint-story, narrate, gen-frames, render-video
```

The engine never imports React; React never computes timeline math. The reader is one state machine observed by components.

## The unifying idea: one timeline, many drivers

Each page has a normalized timeline `t ∈ [0, 1]`. Everything renders from `t`:

- **Text**: tokens own contiguous t-ranges (weighted by narration duration when available, else by grapheme count). Within the active token, sub-progress maps to the active grapheme. From `t` alone you can derive: which words are read, which grapheme is lit, karaoke state.
- **Scene**: `scene.seek(t)` scrubs the visual timeline. Discrete `cue`s fire when `t` crosses word boundaries flagged in the storyspec (`atWord: 5, cue: "jump"`).
- **Audio**: word boundaries map to narration timestamp slices; crossing a boundary in hybrid mode plays that slice.

Modes are just **drivers** — sources of `t`:

```ts
interface Driver {
  attach(timeline: PageTimeline, apply: (t: number) => void): void
  start(): void; stop(): void; dispose(): void
}
// FingerDriver  — pointer position on the rail → target t, spring-smoothed
// ClockDriver   — narration audio clock → t (read-aloud; also the render mode)
// HybridDriver  — FingerDriver + word-slice audio on boundary crossings
```

The render-to-video route uses ClockDriver with a fixed timestep instead of wall clock, making output deterministic.

## The scrub engine

Hand-rolled, on the model of scroll-world's config-driven scrub engine but gesture-driven rather than scroll-driven:

- Pointer events on the rail → raw target `t`; a critically-damped spring smooths displayed `t` (rAF loop). Spring params tuned so the Spark feels attached to the finger but settles softly.
- All per-frame consumers (grapheme highlight, scene seek, Spark position) subscribe to smoothed `t`; boundary-crossing events (word complete, cues) are edge-detected on the smoothed value with hysteresis so jitter can't double-fire.
- Highlight rendering must avoid layout: graphemes are pre-wrapped in spans at mount; highlighting toggles CSS custom properties/classes only. Scene seeks must be O(1) per frame.

## Scene Contract

Every scene backend implements:

```ts
interface Scene {
  mount(host: HTMLElement, ctx: SceneCtx): Promise<void>  // preload assets here
  seek(t: number): void          // called every frame — must be cheap
  cue(name: string): void        // discrete beats: "jump", "wobble", "pop"
  setAwake(a: number): void      // 0 = dormant (desaturated/still/quiet) → 1 = alive
  event(name: string, xy?): void // optional: taps into the scene (easter eggs)
  destroy(): void
}
```

Backends in the POC:

- **CodedScene** — a TS module per scene exporting a `Scene`. SVG elements moved imperatively via transforms; Web Audio hooks for sfx; dormancy handled internally (e.g., saturate filter + paused idle animations). Registered by module path in the storyspec.
- **FramesScene** — generic player for a WebP frame sequence (`scenes/p3/frame_0000.webp…`): preload + decode into ImageBitmaps, draw to canvas on `seek` (frame = `t × (n−1)`), dormancy via canvas filter, `cue` optionally swaps to an overlay sprite. This is the scroll-world technique; AI-generated video drops into the same directory format after frame extraction (ffmpeg).

Both are lazy-loaded per page; adjacent pages preload during reading.

## Audio architecture

- One `AudioContext`, unlocked on first user gesture.
- **Narration**: one file per page + `words: [{i, start, end}]` timestamps. ClockDriver plays it straight; HybridDriver plays sliced word buffers.
- **Phoneme bank**: shared `content/_shared/phonemes/*.mp3` (one per phoneme) powering tap-a-word sound-outs across all stories.
- **Layers**: narration / sfx / ambient on separate gain nodes; ambient fades with `setAwake`.

## State & persistence

- Reader state machine: `idle → reading(page, t, mode) → pageComplete → storyComplete`. Zustand-free; a small observable store in the engine, `useSyncExternalStore` in React.
- localStorage: per-story furthest page, sticker book contents, words-read counter, settings (font, text size, reduced motion override).

## Performance budget

- First story page interactive < 3s on a 2020 iPad over fast wifi; scene assets stream after prose is interactive.
- Scrub path allocates nothing per frame; no React re-render per frame (refs + CSS vars).
- Frame sequences: ≤ 60 frames per page beat at ≤ 1280w WebP, budget ~4 MB/page; ImageBitmap decode off the main thread where available.
