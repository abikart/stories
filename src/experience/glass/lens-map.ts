import type { LensGeometry, LensMap, LensOptics } from "@/experience/glass/types";

const NEUTRAL = 128;
const MAX_VECTOR = 127;
const MAX_MAP_EDGE = 512;

type MapOptics = Pick<LensOptics, "curvature" | "splay" | "depth" | "centerScale">;

export type LensMapCacheStats = {
  hits: number;
  misses: number;
  generations: number;
  entries: number;
};

const cache = new Map<string, LensMap>();
let hits = 0;
let misses = 0;
let generations = 0;

function finite(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function stable(value: number) {
  return Number(value.toFixed(4));
}

export function normalizeLensGeometry(geometry: LensGeometry): LensGeometry {
  const width = clamp(Math.round(finite(geometry.width, 1)), 1, 4096);
  const height = clamp(Math.round(finite(geometry.height, 1)), 1, 4096);
  const maximumRadius = Math.min(width, height) / 2;
  const requestedRadius = geometry.shape === "pill" || geometry.shape === "circle"
    ? maximumRadius
    : finite(geometry.cornerRadius, maximumRadius * 0.35);

  return {
    width,
    height,
    cornerRadius: clamp(requestedRadius, 0, maximumRadius),
    shape: geometry.shape,
  };
}

function normalizeMapOptics(optics: MapOptics): MapOptics {
  return {
    curvature: clamp(finite(optics.curvature, 2.4), 0.25, 8),
    splay: clamp(finite(optics.splay, 0.58), 0.04, 1),
    depth: clamp(finite(optics.depth, 0.9), 0, 1.5),
    centerScale: clamp(finite(optics.centerScale, 0.075), 0, 0.5),
  };
}

export function lensMapCacheKey(geometryInput: LensGeometry, opticsInput: MapOptics) {
  const geometry = normalizeLensGeometry(geometryInput);
  const optics = normalizeMapOptics(opticsInput);
  return [
    geometry.shape,
    geometry.width,
    geometry.height,
    stable(geometry.cornerRadius),
    stable(optics.curvature),
    stable(optics.splay),
    stable(optics.depth),
    stable(optics.centerScale),
  ].join(":");
}

function roundedBoxDistance(x: number, y: number, halfWidth: number, halfHeight: number, radius: number) {
  const qx = Math.abs(x) - Math.max(0, halfWidth - radius);
  const qy = Math.abs(y) - Math.max(0, halfHeight - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

function signedDistance(geometry: LensGeometry, x: number, y: number) {
  if (geometry.shape === "circle") {
    return Math.hypot(x, y) - Math.min(geometry.width, geometry.height) / 2;
  }
  return roundedBoxDistance(
    x,
    y,
    geometry.width / 2,
    geometry.height / 2,
    geometry.cornerRadius,
  );
}

function encodeSigned(value: number) {
  const amount = Math.round(clamp(Math.abs(value), 0, 1) * MAX_VECTOR);
  return value < 0 ? NEUTRAL - amount : NEUTRAL + amount;
}

function writePixel(
  data: Uint8Array,
  width: number,
  x: number,
  y: number,
  dx: number,
  dy: number,
  thickness: number,
  inside: boolean,
) {
  const offset = (y * width + x) * 4;
  data[offset] = inside ? encodeSigned(dx) : NEUTRAL;
  data[offset + 1] = inside ? encodeSigned(dy) : NEUTRAL;
  data[offset + 2] = inside ? Math.round(clamp(thickness, 0, 1) * 255) : 0;
  data[offset + 3] = inside ? 255 : 0;
}

export function generateLensMap(geometryInput: LensGeometry, opticsInput: MapOptics): LensMap {
  const geometry = normalizeLensGeometry(geometryInput);
  const optics = normalizeMapOptics(opticsInput);
  const resolutionScale = Math.min(1, MAX_MAP_EDGE / Math.max(geometry.width, geometry.height));
  const width = Math.max(1, Math.round(geometry.width * resolutionScale));
  const height = Math.max(1, Math.round(geometry.height * resolutionScale));
  const data = new Uint8Array(width * height * 4);
  const quadrantWidth = Math.ceil(width / 2);
  const quadrantHeight = Math.ceil(height / 2);
  const edgeBand = Math.max(1, Math.min(geometry.width, geometry.height) * 0.5 * optics.splay);
  const halfDiagonal = Math.max(1, Math.hypot(geometry.width / 2, geometry.height / 2));

  data.fill(0);
  for (let mapY = 0; mapY < quadrantHeight; mapY += 1) {
    const logicalY = ((mapY + 0.5) / height - 0.5) * geometry.height;
    for (let mapX = 0; mapX < quadrantWidth; mapX += 1) {
      const logicalX = ((mapX + 0.5) / width - 0.5) * geometry.width;
      const distance = signedDistance(geometry, logicalX, logicalY);
      const inside = distance <= 0;
      let vectorX = 0;
      let vectorY = 0;
      let thickness = 0;

      if (inside) {
        const radialDistance = Math.hypot(logicalX, logicalY);
        const radial = clamp(radialDistance / halfDiagonal, 0, 1);
        const edge = clamp(1 + distance / edgeBand, 0, 1);
        const curvedEdge = Math.pow(edge, optics.curvature);
        thickness = clamp(optics.centerScale * radial + optics.depth * curvedEdge, 0, 1);
        if (radialDistance > 0.0001) {
          vectorX = (-logicalX / radialDistance) * thickness;
          vectorY = (-logicalY / radialDistance) * thickness;
        }
      }

      const mirrorX = width - 1 - mapX;
      const mirrorY = height - 1 - mapY;
      writePixel(data, width, mapX, mapY, vectorX, vectorY, thickness, inside);
      if (mirrorX !== mapX) writePixel(data, width, mirrorX, mapY, -vectorX, vectorY, thickness, inside);
      if (mirrorY !== mapY) writePixel(data, width, mapX, mirrorY, vectorX, -vectorY, thickness, inside);
      if (mirrorX !== mapX && mirrorY !== mapY) {
        writePixel(data, width, mirrorX, mirrorY, -vectorX, -vectorY, thickness, inside);
      }
    }
  }

  generations += 1;
  return Object.freeze({
    key: lensMapCacheKey(geometry, optics),
    width,
    height,
    data,
  });
}

export function getCachedLensMap(geometry: LensGeometry, optics: MapOptics) {
  const key = lensMapCacheKey(geometry, optics);
  const existing = cache.get(key);
  if (existing) {
    hits += 1;
    return existing;
  }
  misses += 1;
  const generated = generateLensMap(geometry, optics);
  cache.set(key, generated);
  return generated;
}

export function getLensMapCacheStats(): LensMapCacheStats {
  return { hits, misses, generations, entries: cache.size };
}

export function clearLensMapCache() {
  cache.clear();
  hits = 0;
  misses = 0;
  generations = 0;
}
