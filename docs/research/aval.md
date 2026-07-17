# Aval assessment for stories.sh

Status: deferred integration candidate  
Assessed: 2026-07-15  
Reference snapshot: `/Users/xzo/projects/references/aval`

## Executive decision

Aval is strong infrastructure for short, self-contained interactive motion. It
is not a replacement for the stories.sh story runtime or production system.

- Keep the stories.sh performance clock, production schema, responsive stage,
  media deck, reading system, interaction recipes, and film path authoritative.
- Do not fork, vendor, or make Aval a runtime dependency during the golden POC.
- Adopt Aval's useful authoring and runtime paradigms where they strengthen the
  existing native-video system.
- Finish M7 with native seekable media before evaluating another renderer.
- After M7, consider a bounded experiment using one seamless living hold and
  one deliberately authored interaction transition.
- If that experiment succeeds on real target mobile devices, Aval may become an
  optional derived web renderer for semantic holds or interaction motion. It
  must not become the story package or the only copy of a motion performance.

The decisive mismatch is time authority. stories.sh is a seekable,
narration-led experience measured in real seconds. Aval is a state-led motion
system measured in frames and intentionally designed to avoid media seeking.

## What Aval provides

Aval combines five substantial systems:

| Layer | Capability |
| --- | --- |
| Graph | Deterministic, latest-intent-wins animation states and routes |
| Format | Strict `.avl` binary container with graph metadata, indexes, motion units, and hashes |
| Compiler | Video/PNG ingestion and independently decodable H.264 unit generation |
| Browser runtime | Range loading, WebCodecs scheduling, worker decoding, WebGL presentation, and resource management |
| Web component | `<aval-player>` with state control, fallbacks, bindings, lifecycle events, and diagnostics |

Its notable capabilities are:

- seamless partial loops without seeking a video element;
- optional initial one-shots followed by loop, finite, or held bodies;
- locked bridges and reversible transitions with resident endpoint runways;
- portal, finish, and cut transition policies;
- pointer, focus, activation, engagement, and visibility bindings;
- packed transparency with color and alpha carried by one H.264 decoder clock;
- bounded range loading, integrity validation, per-unit hashes, and strong-ETag handling;
- page-wide decoder and byte accounting, visibility suspension, context-loss
  recovery, and generation-safe cleanup;
- host-owned fallback markup and reduced-motion behavior; and
- extensive conformance, fuzz, security, release, and certification tooling.

Aval is a motion-only, web-only system. It deliberately does not own narration,
sound, prose, captions, word alignment, semantic story continuity, responsive
editorial overlays, or deterministic film export.

## Paradigm comparison

| Concern | stories.sh | Aval |
| --- | --- | --- |
| Primary authority | Expressive performance in real seconds | Motion graph and frame ordinal |
| Main unit | Reading unit and visual beat | Body and transition unit |
| Progression | Performance clock selects semantic visual state | Events request graph states |
| Scrubbing | Required in both directions | No public seek or `currentTime` API |
| Audio | Narration plus synchronized stems | Motion-only |
| Text | DOM prose, speaker labels, and aligned highlighting | None |
| Interaction | Narrative recipe bound to a performance beat | Visual-state trigger and transition |
| Film | Same package renders a deterministic 1080p path | No film-output system |
| Responsive behavior | 4:3 master, stack/row composition, anchors, docking, safe areas | Canvas fit and dimensions |
| Continuity | Character, prop, location, and transformation semantics | Pixel and frame-boundary continuity |
| Target | Mobile, tablet, desktop, and film | Current release boundary is web desktop |

The Aval element exposes `prepare`, `setState`, `send`, `readyFor`, `pause`, and
`resume`, but no operation for seeking to a performance second or exact frame.
This follows from its continuous decoder design rather than being a missing
React wrapper. An Aval visual can restore a semantic state, but it cannot
restore an exact narration-relative frame after arbitrary or reverse scrubbing.

## Capability fit

### Continuous living illustrations: strong candidate

This is Aval's best overlap with stories.sh. It could improve loop seams,
intro-to-idle handoffs, interruptible state reactions, reversible
micro-interactions, and transparent animation.

Use it only where semantic state matters more than exact internal frame phase.
A calm living hold can restart or resume within its loop without contradicting
the narration.

### Narration-synchronized action shots: poor fit

Travel, rescue, failed attempts, and transformation shots must start at a known
performance second, seek correctly, restore after reverse scrubbing, and render
identically in the film. They should remain native seekable video or explicit
frame media.

### Read-with-me holds: optional improvement

An Aval living hold could continue during the child's reading pause. It would
not participate in passage presentation, narration pause/resume, score ducking,
or alignment. The current native-video system already preserves living video
and ambience, so Aval is justified here only if its motion is visibly better.

### Hero interactions: promising visual layer

Aval's graph is stronger than the current media graph for idle/action/resolved
states, completion routes, superseded requests, and reversible transition
settlement. stories.sh would still own the child-facing gesture, normalized
geometry, narrative prompt, accessibility, safe-stop release, and canonical
Watch/film action.

Aval cannot manufacture continuity between independently generated clips. A
cut between unrelated Grok outputs gains little over the existing crossfade.
Its strongest interaction behavior requires a deliberately authored continuous
source with matched endpoint runways and a real transition body.

### Watch mode and scrubbing: retain stories.sh

Aval has no concept of narration seconds, word alignment, safe stops, reading
units, score, or effect cues. It cannot govern Watch mode. Its lack of seek
control also prevents it from replacing the primary visual timeline.

### Responsive composition: retain stories.sh

Aval provides fit and size behavior, not the editorial stack/row composition,
full-frame coordinate mapping, dialogue anchoring, collision rules, Pocket docking,
or reading surfaces. `ResponsiveStage` and DOM overlays remain authoritative.

### Transparent animation: valuable future option

Aval's packed-alpha path could support a reusable animated character, particles,
magical light, or foreground atmosphere over a world background without a
second decoder clock. This is technically valuable but changes the creative
pipeline. Full-frame painterly compositions should not be decomposed merely to
use the feature.

### Film and YouTube output: no direct fit

An `.avl` contains motion and graph data, but no narration, soundscape, prose,
or film timeline. It has no public deterministic offline frame-stepping path.

If optional Aval delivery is adopted later, native editing masters must remain
the film sources. The stories.sh canonical path must drive both outputs; an
`.avl` file may be a derived web rendition, never the only source asset.

### Story continuity and coverage: complementary

Aval validates technical media continuity. stories.sh validates narrative
continuity: who is present, where they are, which prop state is legal, whether
travel is visible, whether each sentence has a visual, and whether a
transformation occurs exactly once. Aval cannot replace `beat-board.json` or
`continuity.json`; its seam and bitstream reports could complement them.

### Accessibility: adopt the boundary

Aval correctly leaves roles, keyboard behavior, status, controls, and fallback
meaning in ordinary host DOM. The motion surface does not invent business
semantics. stories.sh should continue formalizing this separation.

### Resource, network, and security handling: reference for later hardening

Aval's decoder ownership, visibility suspension, source generations, resource
budgets, range validation, and context recovery are excellent references for a
larger catalog. Adopting the full implementation now would be disproportionate.

The assessed snapshot contains more than 100,000 lines of non-test package
TypeScript, versus roughly 2,100 lines in the stories.sh v2 experience runtime.
Aval's own preliminary delivery measurement reports about 226 KB gzip for the
loaded element/player graph plus a worker. This is a meaningful maintenance and
delivery commitment for a solo-builder project.

## Paradigms to adopt without adopting Aval

1. **Explicit motion taxonomy.** Evolve beyond `loop: boolean` toward
   `initial-one-shot`, `living-hold`, `finite-action`, `resolved-hold`,
   `transition`, and `scrubbable-shot`.
2. **Explicit handoff policy.** Distinguish `crossfade`, `cut`,
   `finish-current`, `matched-handoff`, and `semantic-hold`, with a bounded
   acceptable delay.
3. **Separate intro, body, transition, and resolved media.** Do not ask one clip
   to serve incompatible narrative roles.
4. **Latest-intent-wins settlement.** Formalize joined duplicate requests,
   superseded requests, exactly-once completion, transition lifecycle events,
   and recovery after a failed standby presentation.
5. **Compile-time media validation.** Add frame-rate, duration, dimension,
   first/middle/final decode, loop-boundary, checksum, and bitrate checks to the
   production pipeline over time.
6. **Static fallback as a valid experience.** Treat posters as an intentional
   reduced mode rather than only an error image.
7. **Explicit resource ownership.** Track active decoders and resident media at
   page/catalog level when the product grows beyond one active story.

## What not to adopt

- `.avl` as the universal story package;
- Aval's frame graph as the master story graph;
- WebCodecs/WebGL as the default renderer;
- one giant `.avl` containing an entire story;
- duplicate hand-authored graphs in `production.json` and `motion.json`;
- the full certification and release apparatus during the POC;
- re-encoding every AI-generated delivery MP4 merely to use Aval;
- exact pixel-continuity assumptions for unrelated generated shots; or
- a primary path that has not passed real iPhone and iPad Safari testing.

## Safe hybrid if a later experiment succeeds

The stories.sh production package remains the only semantic authority:

```text
production package
├── performance, reading units, beats, continuity
│   ├── interactive Watch / Read-with-me
│   └── deterministic film
└── visual delivery build
    ├── native video: seekable shots and film masters
    └── optional Aval: semantic holds and interaction motion
```

An Aval `motion.json` should be generated from stories.sh data, never maintained
as a second source of truth. A future state might distinguish:

```ts
{
  syncPolicy: "performance" | "semantic-hold",
  webDelivery: { kind: "video" | "aval", src: string },
  filmDelivery: { src: string },
  fallbackPoster: string
}
```

Initially, Aval should be legal only for `semantic-hold`. Performance-bound and
film-bearing states continue to require seekable native masters.

## Maturity and dependency risks

At assessment time:

- Aval identifies itself as an early technical preview;
- its 1.0 engineering is behind publication and certification gates;
- its React example says 1.0 is not claimed to exist on a public registry;
- Safari support remains a TODO and the release boundary is web desktop;
- output is H.264 only, with AV1, VP9, and HEVC listed as future work; and
- the local reference snapshot has no Git metadata, so this exact source cannot
  be pinned to a known upstream commit.

The MIT license permits reuse, but the technical and maintenance risks prevent
making it a foundation dependency now.

## Deferred experiment

Do this only after M7 is complete.

### Assets

1. One simple living loop, using the same source for native MP4 and Aval.
2. One newly authored idle-to-bridge-to-resolved interaction with genuinely
   matching endpoints. Do not use unrelated generated clips as proof.

### Compare

- first-visible-frame latency;
- loop-seam quality;
- transition response, cancellation, and failure recovery;
- transfer bytes and loaded JavaScript;
- decoder/GPU memory, CPU, and battery behavior;
- reduced-motion and fallback behavior;
- tab hiding and restoration;
- the five required stories.sh viewports;
- real branded Chrome and Safari on desktop, iPhone, and iPad; and
- source-authoring time and repeatability.

Do not infer efficiency from Aval's checked example. Compare against a properly
optimized native MP4 made from the identical source at comparable visual
quality.

### Adoption gate

Add an optional renderer only if all are true:

- target mobile devices are supported;
- a stable release can be pinned with provenance;
- the visual result is materially better than native video;
- scrubbing and film parity remain intact;
- the runtime is isolated and lazy-loaded; and
- recurring-series reuse justifies the authoring and maintenance cost.

If the experiment fails, retain native video and keep only the adopted schema,
validation, fallback, and transition-settlement paradigms.

## Revisit point

The intended order remains:

1. complete M7 deterministic film output;
2. run the bounded Aval comparison;
3. record the measurements and a final adopt/reject decision; and
4. produce the second story against the resulting stable architecture.
