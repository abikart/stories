import { z } from "zod";

const NormalizedNumberSchema = z.number().min(0).max(1);
const SolidMatteColorSchema = z.string().regex(
  /^#[0-9a-fA-F]{6}$/,
  "solid matte colors must use six-digit hex notation",
);

export const PointSchema = z.object({
  x: NormalizedNumberSchema,
  y: NormalizedNumberSchema,
});

export const NormalizedRectSchema = PointSchema.extend({
  width: NormalizedNumberSchema,
  height: NormalizedNumberSchema,
});

const StageBackdropSchema = z.object({
  color: SolidMatteColorSchema,
  poster: z.string().min(1),
});

export const StageContractSchema = z.discriminatedUnion("masterAspectRatio", [
  z.object({
    masterAspectRatio: z.literal("4:3"),
    actionSafe: z.literal("full-frame"),
    defaultFocalPoint: PointSchema,
    backdrop: StageBackdropSchema,
  }),
  z.object({
    masterAspectRatio: z.literal("16:9"),
    actionSafe: z.literal("center-4:3"),
    defaultFocalPoint: PointSchema,
    backdrop: StageBackdropSchema,
  }),
]);

export const DialoguePlacementTokenSchema = z.enum([
  "top-left",
  "top",
  "top-right",
  "center-left",
  "center",
  "center-right",
  "bottom-left",
  "bottom",
  "bottom-right",
]);

export const CastMemberSchema = z.object({
  name: z.string().min(1),
  portrait: z.string().min(1),
  portraitAlt: z.string().min(1),
});

export const OverlayPlacementSchema = z.object({
  kind: z.enum(["narration", "dialogue"]),
  placement: DialoguePlacementTokenSchema.optional(),
  mobilePolicy: z.enum(["anchor", "dock"]),
});

export const WordTimingSchema = z.object({
  text: z.string().min(1),
  start: z.number().min(0),
  end: z.number().positive(),
});

export const ReadingUnitSchema = z.object({
  id: z.string().min(1),
  speaker: z.string().min(1),
  text: z.string().min(1),
  start: z.number().min(0),
  end: z.number().positive(),
  words: z.array(WordTimingSchema).default([]),
  mediaState: z.string().min(1),
  overlay: OverlayPlacementSchema.optional(),
});

export const PhraseSchema = z.object({
  id: z.string().min(1),
  speaker: z.string().min(1),
  text: z.string().min(1),
  start: z.number().min(0),
  end: z.number().positive(),
  safeStopAfter: z.boolean().optional(),
  words: z.array(WordTimingSchema).optional(),
  readingUnits: z.array(ReadingUnitSchema).min(1).optional(),
  overlay: OverlayPlacementSchema,
});

export const PerformanceSchema = z.object({
  audio: z.string().min(1),
  alignment: z.string().min(1),
  duration: z.number().positive(),
  model: z.string().min(1),
  selectedCandidate: z.string().min(1),
  candidatesManifest: z.string().min(1),
  stems: z.object({
    music: z.string().min(1).optional(),
    ambience: z.string().min(1).optional(),
    effects: z.string().min(1).optional(),
  }).optional(),
});

export const SceneRenditionSchema = z.object({
  src: z.string().min(1),
  mimeType: z.string().min(1),
  codec: z.string().min(1).optional(),
  alpha: z.enum(["none", "native", "packed"]).default("none"),
});

export const ScenePlateSchema = z.object({
  kind: z.enum(["image", "video"]),
  src: z.string().min(1),
  poster: z.string().min(1).optional(),
  loop: z.boolean().optional(),
  fit: z.enum(["contain", "cover"]).default("contain"),
});

export const SceneMotionLayerSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["motion", "effect", "foreground"]),
  kind: z.enum(["image", "video"]),
  renditions: z.array(SceneRenditionSchema).min(1),
  fallback: SceneRenditionSchema.optional(),
  poster: z.string().min(1).optional(),
  loop: z.boolean().optional(),
  fit: z.enum(["contain", "cover"]).default("contain"),
  anchor: PointSchema.default({ x: 0.5, y: 0.5 }),
  scale: z.number().positive().default(1),
  opacity: NormalizedNumberSchema.default(1),
  blendMode: z.enum(["normal", "multiply", "screen", "overlay"]).default("normal"),
});

export const LayeredSceneCompositionSchema = z.object({
  plate: ScenePlateSchema,
  layers: z.array(SceneMotionLayerSchema).min(1),
  fallback: z.object({
    src: z.string().min(1),
    poster: z.string().min(1).optional(),
  }).optional(),
});

export const MediaStateSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["poster", "video", "living-illustration"]),
  src: z.string().min(1),
  poster: z.string().min(1).optional(),
  loop: z.boolean().optional(),
  focalPoint: PointSchema.optional(),
  transitionsTo: z.array(z.string().min(1)).optional(),
  composition: LayeredSceneCompositionSchema.optional(),
});

export const InteractionBindingSchema = z.object({
  recipe: z.literal("drag-to-guide"),
  triggerAfterPhrase: z.string().min(1),
  triggerAtReadingUnit: z.string().min(1).optional(),
  prompt: z.string().min(1),
  startRegion: NormalizedRectSchema,
  targetRegion: NormalizedRectSchema,
  path: z.array(PointSchema).min(2),
  completeMediaState: z.string().min(1),
});

export const ExperienceSceneSchema = z.object({
  id: z.string().min(1),
  overlayPlacement: DialoguePlacementTokenSchema.default("bottom"),
  media: z.array(MediaStateSchema).min(1),
  canonicalPath: z.array(z.string().min(1)).min(1).optional(),
  phrases: z.array(PhraseSchema).default([]),
  interaction: InteractionBindingSchema.optional(),
});

export const ExperienceProductionSchema = z.object({
  schemaVersion: z.literal(2),
  id: z.string().min(1),
  title: z.string().min(1),
  logline: z.string().min(1),
  accent: z.string().min(1),
  cast: z.array(CastMemberSchema).default([]),
  stage: StageContractSchema,
  performance: PerformanceSchema.optional(),
  productionPlan: z.object({
    coverage: z.literal("reading-unit"),
    watchMotion: z.literal("continuous").optional(),
    beatBoard: z.string().min(1),
    continuityLedger: z.string().min(1),
    layerManifest: z.string().min(1).optional(),
  }).optional(),
  scenes: z.array(ExperienceSceneSchema).min(1),
});

export type Point = z.infer<typeof PointSchema>;
export type NormalizedRect = z.infer<typeof NormalizedRectSchema>;
export type StageContract = z.infer<typeof StageContractSchema>;
export type DialoguePlacementToken = z.infer<typeof DialoguePlacementTokenSchema>;
export type CastMember = z.infer<typeof CastMemberSchema>;
export type OverlayPlacement = z.infer<typeof OverlayPlacementSchema>;
export type WordTiming = z.infer<typeof WordTimingSchema>;
export type ReadingUnit = z.infer<typeof ReadingUnitSchema>;
export type ExperiencePhrase = z.infer<typeof PhraseSchema>;
export type Performance = z.infer<typeof PerformanceSchema>;
export type SceneRendition = z.infer<typeof SceneRenditionSchema>;
export type ScenePlate = z.infer<typeof ScenePlateSchema>;
export type SceneMotionLayer = z.infer<typeof SceneMotionLayerSchema>;
export type LayeredSceneComposition = z.infer<typeof LayeredSceneCompositionSchema>;
export type MediaState = z.infer<typeof MediaStateSchema>;
export type InteractionBinding = z.infer<typeof InteractionBindingSchema>;
export type ExperienceScene = z.infer<typeof ExperienceSceneSchema>;
export type ExperienceProduction = z.infer<typeof ExperienceProductionSchema>;
