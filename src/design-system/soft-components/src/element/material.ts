/*
 * Portable Canvas 2D surface materials for JellyElement.
 *
 * The gel painter deliberately works only with a projected outline and color
 * tuples. It has no DOM or component knowledge, so product presets can tune
 * the material without forking component behavior or physics.
 */

import { traceSmoothPath } from '../core/index.js';
import type { SurfacePoint } from '../core/index.js';

import type { GelMaterialOptions, RGBA } from './types.js';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

function mixChannel (from: number, to: number, amount: number): number {
  return from + (to - from) * clamp01(amount);
}

function tint ([r, g, b, a]: RGBA, target: RGBA, amount: number, alpha: number): string {
  return `rgba(${Math.round(mixChannel(r, target[0], amount))}, ${Math.round(mixChannel(g, target[1], amount))}, ${Math.round(mixChannel(b, target[2], amount))}, ${Number(clamp01(a * alpha).toFixed(4))})`;
}

function translucent ([r, g, b, a]: RGBA, alpha: number): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(clamp01(a * alpha).toFixed(4))})`;
}

function depthAnchor (points: SurfacePoint[], width: number, height: number): { x: number; y: number; influence: number } {
  let maximum = points[0] ?? { x: -width * 0.2, y: -height * 0.22, z: 0 };
  let minimumZ = maximum.z;

  for (const point of points) {
    if (point.z > maximum.z) maximum = point;
    if (point.z < minimumZ) minimumZ = point.z;
  }

  const influence = clamp01((maximum.z - minimumZ) / 12);

  // At rest the key light remains above-left. As depth develops, the small
  // specular response follows the point rising furthest toward the viewer.
  return {
    x: mixChannel(-width * 0.22, maximum.x, influence * 0.38),
    y: mixChannel(-height * 0.24, maximum.y, influence * 0.3),
    influence,
  };
}

/** Paint the low, colored shadow that visually seats a translucent body. */
export function paintGelContactShadow (
  ctx: CanvasRenderingContext2D,
  points: SurfacePoint[],
  height: number,
  material: GelMaterialOptions,
): void {
  if (material.contactShadowStrength <= 0) return;

  const [r, g, b, a] = material.shadowColor;

  ctx.save();
  traceSmoothPath(ctx, points);
  ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.01)`;
  ctx.shadowColor = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(clamp01(a * material.contactShadowStrength).toFixed(4))})`;
  ctx.shadowBlur = Math.min(9, Math.max(4, height * 0.1));
  ctx.shadowOffsetY = Math.min(5, Math.max(2, height * 0.055));
  ctx.fill();
  ctx.restore();
}

/**
 * Paint a layered, translucent gel body inside an already transformed canvas
 * coordinate system. Focus rings and structural borders remain the caller's
 * responsibility so they keep exact accessibility colors.
 */
export function paintGelSurface (
  ctx: CanvasRenderingContext2D,
  points: SurfacePoint[],
  color: RGBA,
  width: number,
  height: number,
  material: GelMaterialOptions,
): void {
  const halfW = width / 2;
  const halfH = height / 2;
  const highlight = material.highlightColor;
  const shadow = material.shadowColor;
  const anchor = depthAnchor(points, width, height);

  ctx.save();
  traceSmoothPath(ctx, points);
  ctx.clip();

  // Transmitted body color: a brighter, thinner top edge and denser lower
  // edge create volume while preserving genuine canvas transparency.
  const body = ctx.createLinearGradient(-halfW * 0.72, -halfH, halfW * 0.62, halfH);
  body.addColorStop(0, tint(color, highlight, 0.22, material.opacity * 0.78));
  body.addColorStop(0.42, translucent(color, material.opacity));
  body.addColorStop(1, tint(color, shadow, 0.18, material.opacity * 0.96));
  ctx.fillStyle = body;
  ctx.fillRect(-halfW - 4, -halfH - 4, width + 8, height + 8);

  // A broad internal glow gives candy colors a luminous gel core without
  // washing out labels, which are painted in the separate content layer.
  if (material.highlightStrength > 0) {
    const glowRadius = Math.max(width, height) * 0.72;
    const glow = ctx.createRadialGradient(
      anchor.x,
      anchor.y,
      0,
      anchor.x,
      anchor.y,
      glowRadius,
    );
    glow.addColorStop(0, tint(highlight, highlight, 0, material.highlightStrength * 0.72));
    glow.addColorStop(0.3, tint(highlight, highlight, 0, material.highlightStrength * 0.24));
    glow.addColorStop(1, tint(highlight, highlight, 0, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(-halfW - 4, -halfH - 4, width + 8, height + 8);
  }

  // Edge density suggests thickness. The center stays transparent while the
  // far/lower perimeter receives a restrained colored shadow.
  if (material.innerShadowStrength > 0) {
    const inner = ctx.createRadialGradient(
      -width * 0.08,
      -height * 0.14,
      Math.min(width, height) * 0.12,
      0,
      0,
      Math.max(width, height) * 0.68,
    );
    inner.addColorStop(0, tint(shadow, shadow, 0, 0));
    inner.addColorStop(0.66, tint(shadow, shadow, 0, material.innerShadowStrength * 0.08));
    inner.addColorStop(1, tint(shadow, shadow, 0, material.innerShadowStrength));
    ctx.fillStyle = inner;
    ctx.fillRect(-halfW - 4, -halfH - 4, width + 8, height + 8);
  }

  ctx.restore();

  // Directional rim: the upper-left edge catches the key light while the
  // lower-right edge holds colored density. Because the path is the projected
  // membrane, this highlight deforms with the component rather than sitting
  // on a rectangular overlay.
  if (material.rimStrength > 0) {
    const rim = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    rim.addColorStop(0, tint(highlight, highlight, 0, material.rimStrength));
    rim.addColorStop(0.5, tint(highlight, highlight, 0, material.rimStrength * 0.08));
    rim.addColorStop(1, tint(shadow, shadow, 0, material.rimStrength * 0.48));

    traceSmoothPath(ctx, points);
    ctx.strokeStyle = rim;
    ctx.lineWidth = material.thickness;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // A small extra glint follows positive depth only. At rest its alpha is
    // effectively zero, so settled controls retain a stable material surface.
    if (anchor.influence > 0.01) {
      const depthGlint = ctx.createRadialGradient(
        anchor.x,
        anchor.y,
        0,
        anchor.x,
        anchor.y,
        Math.max(18, Math.min(width, height) * 0.7),
      );
      depthGlint.addColorStop(0, tint(highlight, highlight, 0, material.rimStrength * anchor.influence * 0.85));
      depthGlint.addColorStop(1, tint(highlight, highlight, 0, 0));
      traceSmoothPath(ctx, points);
      ctx.strokeStyle = depthGlint;
      ctx.lineWidth = material.thickness * 1.35;
      ctx.stroke();
    }
  }
}
