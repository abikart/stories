# Experience production format

## Why a new format

V1 describes pages whose prose, audio slices, and scene frames share a
normalized `0..1` timeline. V2 describes an authored performance in real
seconds. Pages may remain an editorial grouping, but scenes, phrases, shots,
and media states are the playback units.

Each v2 story lives beside its assets:

```text
content/<story-id>/
  production.json
  beat-board.json
  continuity.json
  audio/
    performance.mp3
    alignment.json
    music.mp3
    ambience.mp3
  scenes/
    <scene-id>/
      poster.jpg
      enter.mp4
      idle.mp4
      action.mp4
      resolve.mp4
```

## Conceptual schema

```ts
type ExperienceProduction = {
  schemaVersion: 2;
  id: string;
  title: string;
  logline: string;
  accent: string;
  stage: StageContract;
  cast: CastMember[];
  performance: Performance;
  productionPlan?: {
    coverage: "reading-unit";
    beatBoard: string;
    continuityLedger: string;
  };
  scenes: Scene[];
  canonicalPath: CanonicalAction[];
};

type StageContract = {
  masterAspectRatio: "16:9";
  actionSafe: "center-4:3";
  defaultFocalPoint: Point;
  backdrop: { color: string; poster?: string };
};

type Performance = {
  audio: string;
  alignment: string;
  duration: number;
  phrases: Phrase[];
  stems?: { music?: string; ambience?: string; effects?: string };
};

type Phrase = {
  id: string;
  speaker: string;
  text: string;
  start: number;
  end: number;
  safeStopAfter?: boolean;
  words: AlignedWord[];
  overlay: OverlayPlacement;
  readingUnits?: ReadingUnit[];
};

type ReadingUnit = {
  id: string;
  speaker: string;
  text: string;
  start: number;
  end: number;
  words: AlignedWord[];
  mediaState: string;
  overlay?: OverlayPlacement;
};

type Scene = {
  id: string;
  start: number;
  end: number;
  media: MediaState[];
  beats: Beat[];
  interaction?: InteractionBinding;
  transitionIn?: TransitionRecipe;
  transitionOut?: TransitionRecipe;
};

type MediaState = {
  id: string;
  kind: "poster" | "video" | "living-illustration";
  src: string;
  poster?: string;
  loop?: boolean;
  focalPoint?: Point;
  transitionsTo?: string[];
};
```

The actual Zod schema in `src/experience/schema.ts` is authoritative once
implemented. This document defines intent.

## Story graph rules

- Scenes form a directed graph; the golden POC may be a linear graph.
- Every interactive scene also declares a deterministic `canonicalPath` so the
  film renderer can perform it automatically.
- Media transitions are explicit. A state may only transition to declared
  successors.
- Every phrase references final-audio seconds and the words inside that range.
- Expressive phrases remain performance units. `readingUnits` subdivide them
  into sentence-sized display and visual-cue units without cutting the audio.
- A reading-unit production plan must cover every reading unit exactly once in
  its beat board. Every referenced media state must exist in the owning scene.
- The continuity ledger declares legal subject transitions at exact reading
  units. Release lint fails on undeclared changes or unresolved asset statuses.
- Safe stops occur after complete performance phrases, never inside a word.
- Interaction coordinates use normalized media space, not CSS pixels.
- Story-specific behavior lives in data bindings to registered recipes.

## Overlay placement

```ts
type OverlayPlacement = {
  kind: "narration" | "dialogue";
  anchor?: Point;
  placement?: "above" | "above-left" | "above-right" | "below";
  mobilePolicy: "anchor" | "dock";
};
```

Anchors attach dialogue to the world in Cinema and Book presets. Pocket may
dock the same content into a reading sheet without changing the phrase.

## Interaction binding

```ts
type InteractionBinding = {
  recipe: "drag-to-guide";
  triggerAfterPhrase: string;
  prompt: string;
  startRegion: NormalizedRect;
  targetRegion: NormalizedRect;
  path: Point[];
  completeMediaState: string;
};
```

Initial recipes are finite and engine-owned. Adding a story must not add a new
React component or runtime module. The registered recipe derives its interactive
and deterministic Watch/film paths from the same binding.

## Asset distinction

- A **creative master** is a unique authored visual performance. There is one
  16:9 creative master per video state.
- **Delivery renditions** (for example 540p, 720p, and 1080p encodes) are
  automatically derived from that master and do not count as separate art.
- Posters are deterministic stills extracted from or designed for a state.
- Frame sequences are reserved for short moments that require true arbitrary
  scrubbing. Normal playback and state transitions use native video.
