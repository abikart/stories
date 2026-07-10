import { z } from "zod";

/**
 * Storyspec — the data format for stories (docs/05-story-format.md).
 * A story is a directory under content/<id>/ with a story.json validated
 * against these schemas. Every token is either grapheme-segmented or a
 * sight word; the decodability linter is the authority on scope.
 */

export const TokenSchema = z
  .object({
    /** The bare word, no punctuation. */
    w: z.string().min(1),
    /** Grapheme segmentation, e.g. ["sh","i","p"]. Absent for sight words. */
    g: z.array(z.string().min(1)).min(1).optional(),
    /** Sight/tricky word — highlighted whole, exempt from scope checks. */
    sight: z.boolean().optional(),
    /** Trailing punctuation rendered after the word; owns no timeline range. */
    punct: z.string().optional(),
  })
  .refine((t) => (t.sight === true) !== (t.g !== undefined && t.g.length > 0), {
    message: "token must be either grapheme-segmented (g) or sight, not both/neither",
  });

export const CueSchema = z.object({
  /** Token index whose timeline entry fires this cue. */
  atWord: z.number().int().min(0),
  /** Scene beat name, e.g. "jump", "wobble", "pop". */
  cue: z.string().min(1),
});

export const SceneSpecSchema = z.discriminatedUnion("backend", [
  z.object({
    backend: z.literal("coded"),
    /** Registry key of a coded scene module (src/engine/scenes/registry). */
    module: z.string().min(1),
    cues: z.array(CueSchema).optional(),
  }),
  z.object({
    backend: z.literal("frames"),
    frames: z.object({
      /** Directory of WebP frames relative to the story dir. */
      dir: z.string().min(1),
      count: z.number().int().min(2),
    }),
    cues: z.array(CueSchema).optional(),
  }),
]);

export const NarrationSchema = z.object({
  /** Audio file relative to the story dir. */
  audio: z.string().min(1),
  /** Word-timestamp JSON file relative to the story dir. */
  words: z.string().min(1),
});

export const PageSchema = z.object({
  id: z.string().min(1),
  /** Display text — the tokens are the source of truth; this is for search/render checks. */
  text: z.string().min(1),
  tokens: z.array(TokenSchema).min(1),
  /** Optional until the narrate script has run (linter warns, build errors). */
  narration: NarrationSchema.optional(),
  scene: SceneSpecSchema,
});

export const PhonicsScopeSchema = z.object({
  /** Grapheme–phoneme correspondences the reader is assumed to know. */
  graphemes: z.array(z.string().min(1)),
  /** Whole-word exemptions ("heart words"). */
  sightWords: z.array(z.string().min(1)),
});

export const StorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: z.number().int().min(1),
  phonicsScope: PhonicsScopeSchema,
  /** Ambient audio bed relative to the story dir. */
  ambient: z.string().optional(),
  /** Reward sticker image relative to the story dir. */
  sticker: z.string().optional(),
  /** Candy accent for this story's UI (docs/08): green|blue|purple|orange|yellow|red|teal. */
  accent: z.string().optional(),
  pages: z.array(PageSchema).min(1),
});

export type Token = z.infer<typeof TokenSchema>;
export type Cue = z.infer<typeof CueSchema>;
export type SceneSpec = z.infer<typeof SceneSpecSchema>;
export type Narration = z.infer<typeof NarrationSchema>;
export type Page = z.infer<typeof PageSchema>;
export type PhonicsScope = z.infer<typeof PhonicsScopeSchema>;
export type Story = z.infer<typeof StorySchema>;

/** Word timestamps: indices into page.tokens with narration-clock seconds. */
export const WordTimestampsSchema = z.array(
  z.object({
    i: z.number().int().min(0),
    start: z.number().min(0),
    end: z.number().min(0),
  }),
);
export type WordTimestamps = z.infer<typeof WordTimestampsSchema>;
