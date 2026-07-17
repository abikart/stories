import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clearLensMapCache,
  generateLensMap,
  getCachedLensMap,
  getLensMapCacheStats,
} from "./lens-map";
import { DEFAULT_LENS_OPTICS, type LensGeometry } from "./types";

function pixel(map: ReturnType<typeof generateLensMap>, x: number, y: number) {
  const offset = (y * map.width + x) * 4;
  return [...map.data.slice(offset, offset + 4)];
}

describe("portable lens displacement maps", () => {
  const geometries: LensGeometry[] = [
    { shape: "pill", width: 120, height: 60, cornerRadius: 30 },
    { shape: "rounded-rect", width: 120, height: 84, cornerRadius: 22 },
    { shape: "circle", width: 84, height: 84, cornerRadius: 42 },
  ];

  it("keeps pixels outside every supported lens neutral", () => {
    for (const geometry of geometries) {
      const map = generateLensMap(geometry, DEFAULT_LENS_OPTICS);
      assert.deepEqual(pixel(map, 0, 0), [128, 128, 0, 0]);
      assert.deepEqual(pixel(map, map.width - 1, map.height - 1), [128, 128, 0, 0]);
      assert.equal(pixel(map, Math.floor(map.width / 2), Math.floor(map.height / 2))[3], 255);
    }
  });

  it("encodes bounded signed vectors that point inward", () => {
    const map = generateLensMap(geometries[1], DEFAULT_LENS_OPTICS);
    const left = pixel(map, 4, Math.floor(map.height / 2));
    const right = pixel(map, map.width - 5, Math.floor(map.height / 2));
    assert.ok(left[0] > 128, `expected left edge to bend right, received ${left[0]}`);
    assert.ok(right[0] < 128, `expected right edge to bend left, received ${right[0]}`);
    for (const channel of map.data) assert.ok(channel >= 0 && channel <= 255);
  });

  it("has exact four-fold sign symmetry", () => {
    const map = generateLensMap(geometries[1], DEFAULT_LENS_OPTICS);
    const x = 9;
    const y = 13;
    const topLeft = pixel(map, x, y);
    const topRight = pixel(map, map.width - 1 - x, y);
    const bottomLeft = pixel(map, x, map.height - 1 - y);
    assert.equal(topLeft[0] + topRight[0], 256);
    assert.equal(topLeft[1], topRight[1]);
    assert.equal(topLeft[0], bottomLeft[0]);
    assert.equal(topLeft[1] + bottomLeft[1], 256);
    assert.equal(topLeft[2], topRight[2]);
    assert.equal(topLeft[3], bottomLeft[3]);
  });

  it("reuses cache identity when only a lens position changes", () => {
    clearLensMapCache();
    const geometry = geometries[0];
    const first = getCachedLensMap(geometry, DEFAULT_LENS_OPTICS);
    const moved = getCachedLensMap({ ...geometry }, { ...DEFAULT_LENS_OPTICS });
    assert.equal(first, moved);
    assert.deepEqual(getLensMapCacheStats(), { hits: 1, misses: 1, generations: 1, entries: 1 });
  });

  it("regenerates for a shape or map-affecting optical change", () => {
    clearLensMapCache();
    const geometry = geometries[0];
    const first = getCachedLensMap(geometry, DEFAULT_LENS_OPTICS);
    const deeper = getCachedLensMap(geometry, { ...DEFAULT_LENS_OPTICS, depth: 0.65 });
    const circle = getCachedLensMap(geometries[2], DEFAULT_LENS_OPTICS);
    assert.notEqual(first, deeper);
    assert.notEqual(first, circle);
    assert.equal(getLensMapCacheStats().generations, 3);
  });
});
