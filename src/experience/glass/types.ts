export type LensShape = "pill" | "rounded-rect" | "circle";

export type LensGeometry = {
  width: number;
  height: number;
  cornerRadius: number;
  shape: LensShape;
};

export type LensBounds = LensGeometry & {
  x: number;
  y: number;
};

export type LensOptics = {
  displacementStrength: number;
  curvature: number;
  splay: number;
  depth: number;
  centerScale: number;
  chromaticFringe: number;
  specularDirection: number;
  specularWidth: number;
  specularIntensity: number;
  tint: readonly [number, number, number, number];
};

export const DEFAULT_LENS_OPTICS: Readonly<LensOptics> = Object.freeze({
  displacementStrength: 13,
  curvature: 2.4,
  splay: 0.58,
  depth: 0.9,
  centerScale: 0.075,
  chromaticFringe: 0.85,
  specularDirection: -0.78,
  specularWidth: 0.16,
  specularIntensity: 0.42,
  tint: [0.98, 1, 0.985, 0.08] as const,
});

export type LensMap = {
  readonly key: string;
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
};
