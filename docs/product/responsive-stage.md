# Responsive stage contract

## Creative master

New Lanternleaf motion assets are authored natively at **4:3**. The complete
character action, prop state, interaction target, and meaningful environment
must remain inside that frame. Responsive behavior changes the relationship
between media and DOM content; it does not crop a wider creative master or
require a separately directed portrait video.

Existing 16:9 Pip and Boat packages remain valid regression fixtures under the
legacy `16:9` + `center-4:3` schema pair. Do not use that pair for new stories.

```text
phone / portrait tablet          desktop / 16:9 film output
┌──────────────────────┐         ┌──────────────────────────────┐
│ complete 4:3 media   │         │ complete 4:3 │ responsive   │
│                      │         │ media         │ DOM copy     │
├──────────────────────┤         │               │ and controls │
│ DOM story copy       │         └──────────────────────────────┘
│ and controls         │
└──────────────────────┘
```

Authoring validation must preview every shot at all presets and in the exact
16:9 film composition before approval.

## Presets

Preset selection uses the stage container and available height, not user-agent
sniffing. The breakpoint names describe editorial layouts, not media crops.

### Cinema

- Typical condition: landscape or container width at least 900px with adequate
  height.
- Layout: complete 4:3 media and copy in one editorial row.
- Dialogue/narration: DOM content in the copy column by default; an anchored
  overlay is allowed only when it remains clear of action and survives film.
- Controls: compact tray inside browser safe areas.
- Film: the deterministic 16:9 output uses this same side-by-side composition.

### Book

- Typical condition: portrait tablet or container width 600–899px.
- Layout: complete 4:3 media above the reading surface.
- Dialogue/narration: docked below media so the illustration remains intact.
- Controls: full-width touch tray.

### Pocket

- Typical condition: portrait container below 600px.
- Layout: complete 4:3 media above a compact reading sheet.
- Dialogue/narration: docked below media; text never covers essential action.
- Controls: sticky bottom tray respecting `env(safe-area-inset-bottom)`.

Landscape phones may use the row only when the container height can support the
media, copy, and controls without clipping. Otherwise they retain the stack.

## Media blending

Lanternleaf media floats in the page rather than sitting inside a framed stage:

- The page matte, poster matte, and encoded video matte are calibrated pure
  white (`#FFFFFF`).
- Painted foliage, light washes, and unfinished vignette edges dissolve into
  that shared matte without an ornamental border or hard rectangle.
- The source art must not rely on alpha video. Clean white is the portable
  compositing contract across providers and delivery formats.
- Posters remain visible until the next video has decoded its first frame.
- Two video layers crossfade only opacity; never expose black, transparent
  player chrome, or a gray compression edge.
- Release QA samples the outer media edge and rejects dirty whites, beige paper,
  gray blocks, or motion that reveals the source canvas.

Legacy packages may retain their poster-derived atmospheric backdrop. New
Lanternleaf packages use the white editorial shell.

## Coordinate mapping

All anchors, focal points, and interaction regions use normalized coordinates
inside the 4:3 creative master:

```text
4:3 master point → rendered media rectangle → viewport point
```

There is no crop rectangle for new packages. A focal point may inform delivery
diagnostics or future art direction, but it may not hide required action.

## Overlay collision rules

1. Preserve essential action and the speaker's face.
2. Prefer the dedicated copy region in every preset.
3. When an anchored overlay is deliberately authored, flip around its anchor if
   it exits the media safe rectangle.
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

- Paint the pure-white page and poster immediately.
- Load only current state plus the most likely next state.
- Never preload an entire story on entry.
- Use native video for forward playback.
- Maintain at most two decoded video layers during a transition.
- No per-frame React state updates on the performance path.
- Derive mobile and desktop delivery renditions from the one 4:3 master; do not
  create independently directed responsive videos.

## Required test matrix

| Viewport | Expected composition |
|---|---|
| 390×844 | Pocket stack |
| 430×932 | Pocket stack |
| 768×1024 | Book stack |
| 1024×768 | Cinema row |
| 1440×900 | Cinema row |
| 1920×1080 | Exact 16:9 film frame |

The development stage must label its active composition and expose media bounds,
anchors, and interaction regions behind a debug toggle.
