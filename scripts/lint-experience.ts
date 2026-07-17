import { promises as fs } from "fs";
import path from "path";
import { ExperienceProductionSchema } from "../src/experience/schema";
import { createMediaGraph } from "../src/experience/media/graph";
import {
  BeatBoardSchema,
  ContinuityLedgerSchema,
  validateProductionPlan,
} from "../src/experience/production-plan";

const CONTENT = path.resolve(process.cwd(), "content");

async function exists(file: string) {
  return fs.access(file).then(() => true, () => false);
}

async function main() {
  const allowPendingAssets = process.argv.includes("--allow-pending");
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const entries = requested.length > 0
    ? requested
    : (await fs.readdir(CONTENT, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

  let checked = 0;
  let errors = 0;
  for (const id of entries) {
    const productionPath = path.join(CONTENT, id, "production.json");
    if (!(await exists(productionPath))) continue;
    checked += 1;
    try {
      const production = ExperienceProductionSchema.parse(
        JSON.parse(await fs.readFile(productionPath, "utf8")),
      );
      const assets = new Set<string>([production.stage.backdrop.poster]);
      if (production.performance) {
        assets.add(production.performance.audio);
        assets.add(production.performance.alignment);
        assets.add(production.performance.candidatesManifest);
        Object.values(production.performance.stems ?? {}).forEach((asset) => {
          if (asset) assets.add(asset);
        });
      }
      if (production.productionPlan) {
        assets.add(production.productionPlan.beatBoard);
        assets.add(production.productionPlan.continuityLedger);
        if (production.productionPlan.layerManifest) {
          assets.add(production.productionPlan.layerManifest);
        }
        const beatBoard = BeatBoardSchema.parse(JSON.parse(await fs.readFile(
          path.join(CONTENT, id, production.productionPlan.beatBoard),
          "utf8",
        )));
        const continuityLedger = ContinuityLedgerSchema.parse(JSON.parse(await fs.readFile(
          path.join(CONTENT, id, production.productionPlan.continuityLedger),
          "utf8",
        )));
        const planErrors = validateProductionPlan(production, beatBoard, continuityLedger, { allowPendingAssets });
        if (planErrors.length > 0) throw new Error(planErrors.join("; "));
      }
      for (const scene of production.scenes) {
        const graph = createMediaGraph(scene);
        if (scene.interaction) {
          if (!scene.phrases.some((phrase) => phrase.id === scene.interaction?.triggerAfterPhrase)) {
            throw new Error(`${scene.id}: interaction trigger phrase is not in the scene`);
          }
          graph.requireState(scene.interaction.completeMediaState);
        }
        for (const state of scene.media) {
          assets.add(state.src);
          if (state.poster) assets.add(state.poster);
          if (state.composition) {
            assets.add(state.composition.plate.src);
            if (state.composition.plate.poster) assets.add(state.composition.plate.poster);
            if (state.composition.fallback) {
              assets.add(state.composition.fallback.src);
              if (state.composition.fallback.poster) assets.add(state.composition.fallback.poster);
            }
            for (const layer of state.composition.layers) {
              layer.renditions.forEach((rendition) => assets.add(rendition.src));
              if (layer.fallback) assets.add(layer.fallback.src);
              if (layer.poster) assets.add(layer.poster);
            }
          }
        }
      }
      for (const asset of assets) {
        if (!(await exists(path.join(CONTENT, id, asset)))) {
          throw new Error(`missing asset: ${asset}`);
        }
      }
      console.log(`✓ ${id} — schema, graph, and ${assets.size} asset(s)`);
    } catch (error) {
      errors += 1;
      console.error(`✗ ${id} — ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`\n${checked} experience(s): ${errors} error(s)`);
  if (checked === 0 || errors > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
