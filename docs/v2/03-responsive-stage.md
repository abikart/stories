# Responsive stage contract

## Creative master

All motion assets are authored at 16:9. Essential characters, gestures, props,
and destinations must remain in the centered 4:3 action-safe region. The outer
12.5% on each horizontal side is atmospheric composition that may be cropped.

```text
16:9 master
┌────────────────────────────────────────┐
│     ┌────────────────────────────┐     │
│     │ centered 4:3 action-safe   │     │
│     │ characters + interaction   │     │
│     └────────────────────────────┘     │
└────────────────────────────────────────┘
```

Authoring validation must preview every shot at all presets before approval.

## Presets

Preset selection uses the stage container and orientation, not user-agent
sniffing.

### Cinema

- Typical condition: landscape or container width at least 1024px.
- Stage: 16:9.
- Media: full creative master.
- Dialogue: anchored near characters.
- Narration: may overlay a quiet region.
- Controls: compact floating tray within browser safe areas.

### Book

- Typical condition: portrait tablet or container width 600–1023px.
- Stage: 4:3 center crop from the same 16:9 asset.
- Dialogue: anchored when collision-free; otherwise lightly docked.
- Narration: lower portion of stage or immediately below it.
- Controls: full-width touch tray.

### Pocket

- Typical condition: portrait container below 600px.
- Stage: 4:3 center crop.
- Dialogue/narration: docked reading sheet below the stage by default.
- Controls: sticky bottom tray respecting `env(safe-area-inset-bottom)`.
- Text: never placed over essential character action.

Landscape phones use Cinema behavior with compact controls.

## Media blending

The stage sits inside a scene atmosphere rather than on a flat page:

- A poster-derived backdrop fills the viewport behind the stage.
- The backdrop is blurred, enlarged, desaturated slightly, and noninteractive.
- A scene color provides an immediate paint before poster/video decode.
- Stage edges use a subtle mask or gradient where appropriate, never a heavy
  ornamental frame.
- Posters remain visible until the next video has decoded its first frame.
- Two video layers crossfade only opacity; never expose black or transparent
  player chrome.

## Coordinate mapping

All anchors and regions use normalized master-media coordinates. The runtime
maps them through the active crop:

```text
master point → crop rectangle → rendered media rectangle → viewport point
```

Focal points may shift the 4:3 crop within the 16:9 master, but validation must
guarantee the full interaction remains visible.

## Overlay collision rules

1. Preserve essential action and the speaker's face.
2. Prefer the authored placement around the anchor.
3. Flip left/right or above/below if the bubble exits the safe rectangle.
4. Dock when no anchored placement is safe.
5. Never reduce reading text below the preset's minimum size.

## Accessibility and input

- Touch targets are at least 44×44 CSS pixels and never overlap.
- Interaction recipes support touch and pointer; keyboard has an equivalent
  completion path.
- Timed narration can be paused and replayed.
- Text remains DOM content, not pixels inside video.
- Reduced motion replaces atmospheric movement and animated transitions with
  short opacity changes while preserving narrative state.
- Captions and reading highlighting share the final alignment data.

## Performance budget for the POC

- Paint backdrop color and poster immediately.
- Load only current state plus the most likely next state.
- Never preload an entire story on entry.
- Use native video for forward playback.
- Maintain at most two decoded video layers during a transition.
- No per-frame React state updates on the performance path.
- Automatically generate mobile and desktop delivery renditions from one
  creative master in the later production pipeline.

## Required test matrix

| Viewport | Expected preset |
|---|---|
| 390×844 | Pocket |
| 430×932 | Pocket |
| 768×1024 | Book |
| 1024×768 | Cinema |
| 1440×900 | Cinema |

The development stage must visibly label its active preset and expose safe-area
guides behind a debug toggle.
