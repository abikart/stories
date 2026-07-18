# Interactive story runtime

## Runtime boundaries

The active runtime lives in `src/experience/`. It owns validated content
loading, the expressive performance clock, media state, audio, overlays, and
reusable interactions.

```text
Experience production package
       │
       ├── StoryGraph reducer
       ├── PerformanceClock
       ├── MediaStateMachine
       ├── Overlay director
       ├── Interaction recipes
       └── Canonical film driver
```

## Performance clock

Real seconds in the selected final performance are authoritative for:

- narration playback;
- phrase activation;
- word highlighting;
- timed media beats;
- music and effect cues;
- deterministic film rendering.

The child's gesture can release a pause, choose a state transition, or later
request bounded pace changes. It does not assemble speech from word slices.

## Media state machine

Each scene declares a small directed state graph such as:

```text
enter → idle → action → resolve → exit
          └──── wait ────┘
```

The runtime owns:

- native video lifecycle;
- poster and first-frame readiness;
- current/next preloading;
- crossfade timing;
- legal-transition enforcement;
- cancellation when child intent changes;
- reduced-motion fallback.

A story only names states, assets, and legal transitions.

## Layered scene composition

A media state may retain its flattened video or declare one provider-neutral
composition:

```text
opaque plate
  + ordered native/packed-alpha motion layers
  + optional effect and foreground layers
  + accessible DOM story UI
```

Each layer carries normalized geometry, z-order, fit, opacity, blend mode,
delivery renditions, and an opaque fallback. The runtime prefers native-alpha
WebM when the browser accepts it and otherwise keeps the approved poster and
H.264 rendition. Generation-provider names and project IDs belong only in
production provenance.

The deck owns two composition slots: current and likely-next. A transition loads
the standby slot, bridges with its poster until the first frame is ready,
crossfades once, then unmounts the superseded slot. Hidden video is paused and a
new semantic request cancels any older in-flight settlement. This keeps resource
ownership bounded while preserving reverse-seek correctness.

Reduced motion keeps narration and semantic progression intact but pauses
nonessential visual motion. Pointer depth remains cosmetic and is never required
to understand or complete an interaction.

## Responsive stage

`ResponsiveStage` owns the 4:3 master coordinate system, responsive editorial
composition, matte, and normalized coordinate transform. Overlays and interaction
recipes consume its coordinate transform instead of measuring video elements
independently.

The stage treats `stage.backdrop.color` as a literal solid color. The player,
stage, media deck, and inactive/entering layers all paint that same value. No
poster atmosphere, gradient, filter, or opacity overlay is allowed in the normal
Lanternleaf path; visual atmosphere belongs inside the illustration.

## Overlay director

The overlay director turns active phrases into narration ribbons or character
bubbles. It keeps text in the DOM, maps anchors through the stage, applies
collision policy, and docks content below media for Book and Pocket. Existing
16:9 fixtures retain their legacy crop path only for regression coverage.

## Live displacement glass

`GlassStage` is a progressive stage compositor above `MediaDeck` and below the
semantic overlay director. It reads the media deck's existing decoded elements
as textures, composites the active/entering alpha layers into one source target,
then draws every registered lens through one WebGL context. Cached signed maps
drive edge magnification, restrained RGB separation, roughness, antialiased
shape coverage, and the specular rim. No 3D bevel, lighting scene, or opaque
surface is part of this pass. It does not own media lifecycle and cannot add a
video decoder. Context failure or loss exposes the unchanged CSS glass path;
story state and the performance clock remain owned by `ExperiencePlayer`.

## Interaction recipes

Recipes are registered, reusable controllers with a consistent interface:

```ts
type InteractionRecipe = {
  mount(context: InteractionContext): void;
  update(input: NormalizedInput): void;
  complete(): void;
  destroy(): void;
  canonicalActions(): CanonicalAction[];
};
```

The first recipe is `drag-to-guide`. `trace-path` and `tap-reveal` follow only
after the golden interaction works across touch, pointer, keyboard, film, and
reduced-motion paths.

## Routes

- `/experience/[storyId]` — interactive runtime.
- `/dev/viewport` — exact-size same-origin responsive QA harness.

The later `/film/[storyId]` route will execute the same semantic story package
without interactive chrome; it is outside the immersive MVP run.

## State ownership

- React owns coarse state: scene, media state, mode, active phrase, waiting.
- DOM/media elements own playback position and compositor-friendly transitions.
- The performance loop publishes only meaningful boundary changes to React.
- CSS custom properties may carry continuous visual progress.

## Render strategy

The film driver executes each scene's `canonicalPath`, advances the same
performance clock, and hides interactive chrome. The existing Playwright and
ffmpeg pipeline may be adapted after the browser route is authoritative.

## Failure behavior

- Failed native-alpha video: use the state's opaque delivery rendition; retain
  its poster if video also fails, and allow story progression.
- Delayed next state: remain in current loop/poster; never show black.
- Failed music/effect stem: continue with narration.
- Failed alignment: allow Watch mode but fail Read-with-me validation.
- Unsupported motion/performance feature: select the reduced experience rather
  than blocking the story.
