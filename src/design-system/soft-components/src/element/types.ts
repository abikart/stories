/*
 * Shared shape / paint / wiring types for JellyElement and its subclasses.
 */

import type { SurfacePoint } from '../core/index.js';

// [r, g, b, a] with rgb in 0–255 and alpha in 0–1
export type RGBA = [number, number, number, number];

// The jelly shape a subclass builds from its measured host size
export interface Shape {
  width: number;
  height: number;
  radius: number;
}

// A focus-ring stroke descriptor
export interface Ring {
  color: string;
  width: number;
  gap: number;
}

// A border stroke descriptor painted on the jelly surface
export interface Border {
  width: number;
  color: string;
}

// Surface material selected through --jelly-material or per-paint override.
// "flat" preserves the upstream renderer; "gel" adds translucent volume.
export type JellyMaterial = 'flat' | 'gel';

// Resolved gel painter controls. CSS custom properties are read by
// JellyElement so the painter stays independent from the DOM and theme layer.
export interface GelMaterialOptions {
  opacity: number;
  highlightStrength: number;
  rimStrength: number;
  innerShadowStrength: number;
  contactShadowStrength: number;
  thickness: number;
  highlightColor: RGBA;
  shadowColor: RGBA;
}

// Options for paintBody
export interface PaintOptions {
  fill?: string;
  cx?: number;
  cy?: number;
  alpha?: number;
  ctx?: CanvasRenderingContext2D;
  cssW?: number;
  cssH?: number;
  ring?: Ring | null;
  scaleX?: number;
  scaleY?: number;
  border?: Border | null;
  warp?: ((point: SurfacePoint) => SurfacePoint) | null;
  ease?: boolean;
  easeKey?: string;
  material?: JellyMaterial;
}

// Options for wirePress
export interface WirePressOptions {
  keyboard?: boolean;
  disabled?: () => boolean;
}
