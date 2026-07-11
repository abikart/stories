import { z } from "zod";
import type { ExperienceProduction } from "@/experience/schema";

const AssetStatusSchema = z.enum([
  "approved-existing",
  "approved-generated",
  "approved-derived",
  "needs-generation",
  "derived-pending",
  "replace-needed",
]);

export const BeatBoardSchema = z.object({
  schemaVersion: z.literal(1),
  storyId: z.string().min(1),
  coverage: z.literal("reading-unit"),
  beats: z.array(z.object({
    id: z.string().min(1),
    readingUnitIds: z.array(z.string().min(1)).min(1),
    scene: z.string().min(1),
    mediaState: z.string().min(1),
    tier: z.enum([
      "keyframe",
      "living-illustration",
      "motion-shot",
      "hero-interaction",
      "resolved-hold",
    ]),
    visual: z.string().min(1),
    interactionOutcome: z.string().min(1).optional(),
    assetStatus: AssetStatusSchema,
    continuity: z.record(z.string().min(1)),
  })).min(1),
});

export const ContinuityLedgerSchema = z.object({
  schemaVersion: z.literal(1),
  storyId: z.string().min(1),
  subjects: z.record(z.object({
    description: z.string().min(1),
    initial: z.string().min(1),
    transitions: z.array(z.object({
      from: z.string().min(1),
      to: z.string().min(1),
      atReadingUnit: z.string().min(1),
    })),
  })),
});

export type BeatBoard = z.infer<typeof BeatBoardSchema>;
export type ContinuityLedger = z.infer<typeof ContinuityLedgerSchema>;

type CoverageUnit = {
  id: string;
  scene: string;
  mediaState: string;
};

export function validateProductionPlan(
  production: ExperienceProduction,
  beatBoard: BeatBoard,
  ledger: ContinuityLedger,
  options: { allowPendingAssets?: boolean } = {},
) {
  const errors: string[] = [];
  if (beatBoard.storyId !== production.id) errors.push("beat board storyId does not match production");
  if (ledger.storyId !== production.id) errors.push("continuity ledger storyId does not match production");

  const units = new Map<string, CoverageUnit>();
  for (const scene of production.scenes) {
    const stateIds = new Set(scene.media.map((state) => state.id));
    for (const phrase of scene.phrases) {
      if (!phrase.readingUnits) {
        errors.push(`${scene.id}/${phrase.id}: reading-unit coverage requires explicit readingUnits`);
        continue;
      }
      let previousEnd = phrase.start;
      for (const unit of phrase.readingUnits) {
        if (units.has(unit.id)) errors.push(`duplicate reading unit ${unit.id}`);
        if (!stateIds.has(unit.mediaState)) {
          errors.push(`${unit.id}: missing media state ${scene.id}/${unit.mediaState}`);
        }
        const mediaState = scene.media.find((state) => state.id === unit.mediaState);
        if (production.productionPlan?.watchMotion === "continuous"
          && mediaState
          && mediaState.kind !== "video") {
          errors.push(`${unit.id}: continuous Watch requires video media state ${scene.id}/${unit.mediaState}`);
        }
        if (unit.start < phrase.start || unit.end > phrase.end) {
          errors.push(`${unit.id}: timing falls outside performance phrase ${phrase.id}`);
        }
        if (unit.start < previousEnd - 0.001) errors.push(`${unit.id}: reading units are not ordered`);
        previousEnd = unit.end;
        units.set(unit.id, { id: unit.id, scene: scene.id, mediaState: unit.mediaState });
      }
    }
    if (scene.interaction?.triggerAtReadingUnit && !units.has(scene.interaction.triggerAtReadingUnit)) {
      errors.push(`${scene.id}: missing interaction reading unit ${scene.interaction.triggerAtReadingUnit}`);
    }
    if (production.productionPlan?.watchMotion === "continuous" && scene.interaction) {
      const completeState = scene.media.find((state) => state.id === scene.interaction?.completeMediaState);
      if (completeState && completeState.kind !== "video") {
        errors.push(`${scene.id}: continuous Watch requires video interaction outcome ${completeState.id}`);
      }
    }
  }

  const covered = new Map<string, string>();
  for (const beat of beatBoard.beats) {
    const scene = production.scenes.find((candidate) => candidate.id === beat.scene);
    const state = scene?.media.find((candidate) => candidate.id === beat.mediaState);
    if (!scene || !state) errors.push(`${beat.id}: missing beat media ${beat.scene}/${beat.mediaState}`);
    if (!options.allowPendingAssets
      && (beat.assetStatus.startsWith("needs-")
        || beat.assetStatus.endsWith("-pending")
        || beat.assetStatus === "replace-needed")) {
      errors.push(`${beat.id}: unresolved asset status ${beat.assetStatus}`);
    }
    if (beat.tier === "motion-shot" && state?.loop) {
      errors.push(`${beat.id}: action-bearing motion shots cannot loop`);
    }
    for (const unitId of beat.readingUnitIds) {
      const unit = units.get(unitId);
      if (!unit) {
        errors.push(`${beat.id}: unknown reading unit ${unitId}`);
        continue;
      }
      if (covered.has(unitId)) errors.push(`${unitId}: covered by both ${covered.get(unitId)} and ${beat.id}`);
      covered.set(unitId, beat.id);
      if (unit.scene !== beat.scene || unit.mediaState !== beat.mediaState) {
        errors.push(`${beat.id}/${unitId}: beat media does not match reading-unit media`);
      }
    }
  }
  for (const unitId of units.keys()) {
    if (!covered.has(unitId)) errors.push(`${unitId}: no beat-board coverage`);
  }

  const subjects = Object.entries(ledger.subjects);
  const observedTransitions = new Set<string>();
  for (const [subject, contract] of subjects) {
    let previous = contract.initial;
    for (const beat of beatBoard.beats) {
      const current = beat.continuity[subject];
      if (!current) {
        errors.push(`${beat.id}: missing continuity subject ${subject}`);
        continue;
      }
      if (current !== previous) {
        const atReadingUnit = beat.readingUnitIds[0];
        const key = `${subject}:${previous}>${current}@${atReadingUnit}`;
        const allowed = contract.transitions.some((transition) => (
          transition.from === previous
          && transition.to === current
          && transition.atReadingUnit === atReadingUnit
        ));
        if (!allowed) errors.push(`${beat.id}: illegal ${subject} transition ${previous} → ${current}`);
        observedTransitions.add(key);
      }
      previous = current;
    }
    for (const transition of contract.transitions) {
      const key = `${subject}:${transition.from}>${transition.to}@${transition.atReadingUnit}`;
      if (!observedTransitions.has(key)) errors.push(`unused continuity transition ${key}`);
    }
  }

  return errors;
}
