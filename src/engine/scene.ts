import type { SceneSpec } from "./types";

/**
 * The Scene Contract (docs/04): every illustration backend — coded SVG,
 * frame sequences, future rigs — implements this, so the reader engine
 * never knows which kind it's driving.
 */
export interface SceneCtx {
  pageId: string;
  storyId: string;
  reducedMotion: boolean;
}

export interface Scene {
  /** Build/preload into the host element. */
  mount(host: HTMLElement, ctx: SceneCtx): Promise<void> | void;
  /** Called every frame with the page timeline value — must be cheap. */
  seek(t: number): void;
  /** Discrete story beat ("jump", "wobble", "pop") — latched by the engine. */
  cue(name: string): void;
  /** 0 = dormant (desaturated, still, quiet) … 1 = fully awake. */
  setAwake(a: number): void;
  /** Optional: taps into the scene (post-wake easter eggs). */
  event?(name: string, xy?: { x: number; y: number }): void;
  destroy(): void;
}

export type SceneFactory = () => Scene;

const codedScenes: Record<string, () => Promise<{ default: SceneFactory }>> = {
  "fox-box": () => import("./scenes/fox-box"),
  none: () => import("./scenes/none"),
};

export async function loadSceneFactory(spec: SceneSpec): Promise<SceneFactory> {
  if (spec.backend === "coded") {
    const loader = codedScenes[spec.module];
    if (!loader) throw new Error(`unknown coded scene module: ${spec.module}`);
    return (await loader()).default;
  }
  const { createFramesScene } = await import("./scenes/frames");
  return () => createFramesScene(spec.frames);
}
