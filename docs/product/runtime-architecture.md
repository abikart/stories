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

## Responsive stage

`ResponsiveStage` owns the 4:3 master coordinate system, responsive editorial
composition, matte, and normalized coordinate transform. Overlays and interaction
recipes consume its coordinate transform instead of measuring video elements
independently.

## Overlay director

The overlay director turns active phrases into narration ribbons or character
bubbles. It keeps text in the DOM, maps anchors through the stage, applies
collision policy, and docks content below media for Book and Pocket. Existing
16:9 fixtures retain their legacy crop path only for regression coverage.

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

- Failed video: retain poster and allow story progression.
- Delayed next state: remain in current loop/poster; never show black.
- Failed music/effect stem: continue with narration.
- Failed alignment: allow Watch mode but fail Read-with-me validation.
- Unsupported motion/performance feature: select the reduced experience rather
  than blocking the story.
