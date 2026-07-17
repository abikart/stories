export type GlassShape = "pill" | "rounded-rect" | "circle";

export type GlassRefractionTarget = {
  color: string;
  opacity?: number;
};

export type GlassOptics = {
  ior: number;
  thickness: number;
  roughness: number;
  chromaticAberration: number;
  anisotropicBlur: number;
  distortion: number;
  distortionScale: number;
  attenuationColor: string;
  attenuationDistance: number;
  clearcoat: number;
  clearcoatRoughness: number;
  specularIntensity: number;
};

export const DEFAULT_GLASS_OPTICS: Readonly<GlassOptics> = Object.freeze({
  ior: 1.18,
  thickness: 18,
  roughness: 0.04,
  chromaticAberration: 0.028,
  anisotropicBlur: 0.08,
  distortion: 0.018,
  distortionScale: 0.36,
  attenuationColor: "#f5fff7",
  attenuationDistance: 180,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  specularIntensity: 1.15,
});

export function mergeGlassOptics(optics?: Partial<GlassOptics>): GlassOptics {
  return { ...DEFAULT_GLASS_OPTICS, ...optics };
}
