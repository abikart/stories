# Video scenes — AI-generated art behind the same format

Scenes are backend-agnostic (docs/04), so externally-generated video (Grok
Imagine, Veo, Runway…) becomes a scene style without engine changes: clips
are ingested into the proven frames backend, and the slider scrubs the
video exactly like it scrubs procedural frames. Slider↔grapheme↔audio sync
is untouched — video rides the same page timeline.

## The workflow

```
pnpm video-prompts <story-id> [--style ghibli|watercolor|claymation|paper-cutout|"any text"]
        │  writes content/<id>/VIDEO-PROMPTS.md — one copy-paste prompt per page
        ▼
generate each clip in Grok Imagine (or any tool), save as
content/<id>/video-drops/<pageId>.mp4
        ▼
pnpm ingest-video <story-id>
        │  ffmpeg explodes each clip → scenes/<pageId>/frame_%04d.jpg
        │  (12 samples/sec, 48–96 frames, 1280×720 center-crop)
        │  and rewires the page's scene to the frames backend (cues kept)
        ▼
pnpm lint:stories <id> && pnpm dev     # play it; pnpm render <id> for the MP4
```

## Why clips become frames (v1)

Scrubbing a `<video>` element by `currentTime` is janky without dense
keyframes and inconsistent across browsers; exploded frames give
guaranteed-smooth random access, identical behavior in the reader and the
render route, and dormancy/cues for free. Cost: ~5–10MB per page at JPEG
q3 — fine locally, CDN/AVIF later. A native `<video>` backend (for long
ambient pages that play while parked) is a listed future backend.

## Prompt rules that matter (encoded in every generated prompt)

The clip is driven by a child's finger on a slider, so:

- **one single continuous shot** — a cut reads as teleportation mid-word
- **slow, constant-speed, strictly forward motion** — scrubbing backward
  through cyclic motion feels broken; monotonic motion always feels causal
- **start nearly still, end settled** — pages hold their final frame after
  the last word; endings must be a resting composition
- **locked/drifting camera, no text or watermarks, 16:9, 5–8s, 24fps+**

Continuity across pages comes from repeating the style block, world
description, and verbatim character sheet in every prompt — all stored in
`story.json`'s `videoBrief` (style/world/characters/shots) so prompts
regenerate deterministically.

## Current video-ready story

**The Boat in the Mist** (level 2, `oa`/`ea`/`ng` + digraphs) ships fully
tokenized, linted, and narrated with an authored `videoBrief` — five shots
of a lantern-lit rowboat and a singing fish in dawn fog, Ghibli-watercolor.
Its pages use the `none` scene until clips land; `pnpm ingest-video
the-boat-in-the-mist` flips them to frames.
