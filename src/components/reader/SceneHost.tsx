"use client";

import { useEffect, useRef } from "react";
import type { Page } from "@/engine/types";
import type { Scene } from "@/engine/scene";
import { loadSceneFactory } from "@/engine/scene";
import type { ScrubEngine } from "@/engine/scrub";

/**
 * Binds a page's scene (any backend) to the scrub engine: seek + awake
 * every frame, latched cues, all from the same t as the text.
 */
export function SceneHost({ engine, page }: { engine: ScrubEngine; page: Page }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let scene: Scene | null = null;
    let dead = false;

    engine.setCues(page.scene.cues ?? []);

    void loadSceneFactory(page.scene).then(async (factory) => {
      if (dead) return;
      const s = factory();
      await s.mount(host, {
        pageId: page.id,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
      if (dead) {
        s.destroy();
        return;
      }
      scene = s;
      scene.seek(engine.t);
      scene.setAwake(engine.furthest);
    });

    const offFrame = engine.onFrame((t, furthest) => {
      scene?.seek(t);
      scene?.setAwake(furthest);
    });
    const offCue = engine.onCue((name) => scene?.cue(name));

    return () => {
      dead = true;
      offFrame();
      offCue();
      scene?.destroy();
      scene = null;
    };
  }, [engine, page]);

  return <div ref={hostRef} className="scene-window aspect-[16/9] w-full overflow-hidden rounded-xl bg-paper-deep shadow-card" />;
}
