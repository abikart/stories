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
};

export const DEFAULT_GLASS_OPTICS: Readonly<GlassOptics> = Object.freeze({
  ior: 1.15,
  thickness: 5,
  roughness: 0,
  chromaticAberration: 0.05,
});

export function mergeGlassOptics(optics?: Partial<GlassOptics>): GlassOptics {
  return { ...DEFAULT_GLASS_OPTICS, ...optics };
}
