import assert from "node:assert/strict";
import { getLensMap, lensMapCacheStats, resetLensMapCache } from "@/experience/glass/lens-model";
import type { GlassShape } from "@/experience/glass/types";

function pixel(model: ReturnType<typeof getLensMap>, x: number, y: number) {
  const offset = (y * model.width + x) * 4;
  return [...model.data.slice(offset, offset + 4)];
}

resetLensMapCache();
for (const shape of ["pill", "rounded-rect", "circle"] satisfies GlassShape[]) {
  const dimensions = shape === "circle" ? [160, 160] : shape === "pill" ? [260, 92] : [240, 150];
  const model = getLensMap(dimensions[0], dimensions[1], 28, shape, 0.32);
  assert(model.data.every((value) => value >= 0 && value <= 255), `${shape}: map escaped byte range`);
  assert.deepEqual(pixel(model, 0, 0), [128, 128, 255, 0], `${shape}: outside pixel was not neutral and transparent`);

  const y = Math.floor(model.height / 2);
  const center = pixel(model, Math.floor(model.width / 2), y);
  assert.equal(center[0], 128, `${shape}: clear center carried horizontal displacement`);
  assert.equal(center[1], 128, `${shape}: clear center carried vertical displacement`);
  assert.equal(center[3], 255, `${shape}: clear center lost shape coverage`);
  const left = pixel(model, 1, y);
  const right = pixel(model, model.width - 2, y);
  assert(left[0] < 128 && right[0] > 128, `${shape}: horizontal displacement sign is incorrect`);
  assert(Math.abs((left[0] + right[0]) - 255) <= 2, `${shape}: horizontal map is not mirror symmetric`);

  const cached = getLensMap(dimensions[0], dimensions[1], 28, shape, 0.32);
  assert.strictEqual(cached, model, `${shape}: equivalent lens did not reuse cache identity`);
}

const stats = lensMapCacheStats();
assert.equal(stats.misses, 3, "supported shapes should generate exactly three maps");
assert.equal(stats.hits, 3, "equivalent requests should hit the cache");
console.log(`✓ glass lens maps — ${stats.size} shapes, ${stats.hits} cache hits`);
