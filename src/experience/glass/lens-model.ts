import * as THREE from "three";
import type { GlassShape } from "@/experience/glass/types";

export type LensMap = {
  key: string;
  width: number;
  height: number;
  data: Uint8Array;
  texture: THREE.DataTexture;
};

const cache = new Map<string, LensMap>();
let hits = 0;
let misses = 0;

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function roundedBoxDistance(x: number, y: number, halfWidth: number, halfHeight: number, radius: number) {
  const qx = Math.abs(x) - (halfWidth - radius);
  const qy = Math.abs(y) - (halfHeight - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

function mapDimensions(width: number, height: number) {
  const longest = 96;
  const ratio = width / Math.max(1, height);
  return ratio >= 1
    ? { width: longest, height: Math.max(24, Math.round(longest / ratio)) }
    : { width: Math.max(24, Math.round(longest * ratio)), height: longest };
}

export function getLensMap(
  width: number,
  height: number,
  radius: number,
  shape: GlassShape,
  strength: number,
) {
  const dimensions = mapDimensions(width, height);
  const radiusRatio = shape === "rounded-rect" ? radius / Math.max(1, Math.min(width, height)) : 0.5;
  const key = [shape, dimensions.width, dimensions.height, radiusRatio.toFixed(3), strength.toFixed(3)].join(":");
  const cached = cache.get(key);
  if (cached) {
    hits += 1;
    return cached;
  }
  misses += 1;

  const data = new Uint8Array(dimensions.width * dimensions.height * 4);
  const aspect = width / Math.max(1, height);
  const halfWidth = aspect >= 1 ? aspect : 1;
  const halfHeight = aspect >= 1 ? 1 : 1 / aspect;
  const normalizedRadius = shape === "rounded-rect"
    ? Math.max(0.02, Math.min(Math.min(halfWidth, halfHeight), radiusRatio * 2 * Math.min(halfWidth, halfHeight)))
    : Math.min(halfWidth, halfHeight);
  const edgeDepth = Math.max(0.18, Math.min(halfWidth, halfHeight) * 0.52);
  const epsilon = 0.002;
  const antialiasWidth = Math.max(
    halfWidth * 2 / dimensions.width,
    halfHeight * 2 / dimensions.height,
  ) * 1.35;

  for (let py = 0; py < dimensions.height; py += 1) {
    for (let px = 0; px < dimensions.width; px += 1) {
      const x = ((px + 0.5) / dimensions.width * 2 - 1) * halfWidth;
      const y = ((py + 0.5) / dimensions.height * 2 - 1) * halfHeight;
      const distance = roundedBoxDistance(x, y, halfWidth, halfHeight, normalizedRadius);
      const offset = (py * dimensions.width + px) * 4;
      const coverage = 1 - smoothstep(-antialiasWidth, antialiasWidth, distance);
      if (distance > antialiasWidth) {
        data.set([128, 128, 255, 0], offset);
        continue;
      }
      const gx = roundedBoxDistance(x + epsilon, y, halfWidth, halfHeight, normalizedRadius)
        - roundedBoxDistance(x - epsilon, y, halfWidth, halfHeight, normalizedRadius);
      const gy = roundedBoxDistance(x, y + epsilon, halfWidth, halfHeight, normalizedRadius)
        - roundedBoxDistance(x, y - epsilon, halfWidth, halfHeight, normalizedRadius);
      const magnitude = Math.hypot(gx, gy) || 1;
      const edge = 1 - smoothstep(0, edgeDepth, -distance);
      const bend = Math.min(0.48, strength * edge);
      const nx = gx / magnitude * bend;
      const ny = gy / magnitude * bend;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      data[offset] = Math.round((nx * 0.5 + 0.5) * 255);
      data[offset + 1] = Math.round((-ny * 0.5 + 0.5) * 255);
      data[offset + 2] = Math.round(nz * 255);
      data[offset + 3] = Math.round(coverage * 255);
    }
  }

  const texture = new THREE.DataTexture(data, dimensions.width, dimensions.height, THREE.RGBAFormat);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  const model = { key, ...dimensions, data, texture };
  cache.set(key, model);
  return model;
}

export function lensMapCacheStats() {
  return { size: cache.size, hits, misses };
}

export function resetLensMapCache() {
  for (const model of cache.values()) model.texture.dispose();
  cache.clear();
  hits = 0;
  misses = 0;
}
