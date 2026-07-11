import { z } from "zod";

const NormalizedNumberSchema = z.number().min(0).max(1);

export const PointSchema = z.object({
  x: NormalizedNumberSchema,
  y: NormalizedNumberSchema,
});

export const StageContractSchema = z.object({
  masterAspectRatio: z.literal("16:9"),
  actionSafe: z.literal("center-4:3"),
  defaultFocalPoint: PointSchema,
  backdrop: z.object({
    color: z.string().min(1),
    poster: z.string().min(1),
  }),
});

export const OverlayPlacementSchema = z.object({
  kind: z.enum(["narration", "dialogue"]),
  anchor: PointSchema.optional(),
  placement: z.enum(["above", "above-left", "above-right", "below"]).optional(),
  mobilePolicy: z.enum(["anchor", "dock"]),
});

export const PhraseSchema = z.object({
  id: z.string().min(1),
  speaker: z.string().min(1),
  text: z.string().min(1),
  start: z.number().min(0),
  end: z.number().positive(),
  safeStopAfter: z.boolean().optional(),
  words: z.array(z.object({
    text: z.string().min(1),
    start: z.number().min(0),
    end: z.number().positive(),
  })).optional(),
  overlay: OverlayPlacementSchema,
});

export const PerformanceSchema = z.object({
  audio: z.string().min(1),
  alignment: z.string().min(1),
  duration: z.number().positive(),
  model: z.string().min(1),
  selectedCandidate: z.string().min(1),
  candidatesManifest: z.string().min(1),
});

export const MediaStateSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["poster", "video", "living-illustration"]),
  src: z.string().min(1),
  poster: z.string().min(1).optional(),
  loop: z.boolean().optional(),
  focalPoint: PointSchema.optional(),
  transitionsTo: z.array(z.string().min(1)).optional(),
});

export const ExperienceSceneSchema = z.object({
  id: z.string().min(1),
  media: z.array(MediaStateSchema).min(1),
  canonicalPath: z.array(z.string().min(1)).min(1).optional(),
  phrases: z.array(PhraseSchema).default([]),
});

export const ExperienceProductionSchema = z.object({
  schemaVersion: z.literal(2),
  id: z.string().min(1),
  title: z.string().min(1),
  logline: z.string().min(1),
  accent: z.string().min(1),
  stage: StageContractSchema,
  performance: PerformanceSchema.optional(),
  scenes: z.array(ExperienceSceneSchema).min(1),
});

export type Point = z.infer<typeof PointSchema>;
export type StageContract = z.infer<typeof StageContractSchema>;
export type OverlayPlacement = z.infer<typeof OverlayPlacementSchema>;
export type ExperiencePhrase = z.infer<typeof PhraseSchema>;
export type Performance = z.infer<typeof PerformanceSchema>;
export type MediaState = z.infer<typeof MediaStateSchema>;
export type ExperienceScene = z.infer<typeof ExperienceSceneSchema>;
export type ExperienceProduction = z.infer<typeof ExperienceProductionSchema>;
