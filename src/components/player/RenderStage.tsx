"use client";

import { useEffect, useRef, useState } from "react";
import type { Story } from "@/engine/types";
import { ScrubEngine } from "@/engine/scrub";
import { audioTimeToT } from "@/engine/narration";
import type { WordTimestamps } from "@/engine/types";
import { HighlightPainter, measureProse } from "@/components/reader/measure";
import { ProseLine } from "@/components/reader/ProseLine";
import { SceneHost } from "@/components/reader/SceneHost";

const CANDY = new Set(["green", "blue", "purple", "orange", "yellow", "red", "teal"]);

interface PagePlan {
  id: string;
  start: number; // seconds on the global clock
  enter: number; // dormant beat before narration
  audio: number; // decoded narration duration
  hold: number; // wake beat after completion
}

interface RenderApi {
  ready: boolean;
  plan: { pages: PagePlan[]; total: number; fps: number };
  seek: (t: number) => Promise<{ page: number; done: boolean }>;
}

/**
 * Chrome-free 16:9 stage for video capture (docs/03 M7, docs/06). No wall
 * clock, no audio playback: Playwright drives window.__render.seek(T) one
 * frame at a time and screenshots. The same engine/painter/scenes as the
 * app render every frame, so the video IS Read-to-me mode.
 */
export function RenderStage({ story }: { story: Story }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [engine, setEngine] = useState(() => new ScrubEngine());
  const rootRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLParagraphElement>(null);
  const painterRef = useRef<HighlightPainter | null>(null);
  const wordsRef = useRef<WordTimestamps[]>([]);
  const planRef = useRef<RenderApi["plan"] | null>(null);
  const measuredRef = useRef<(() => void) | null>(null);
  const [rail, setRail] = useState({ left: 0, width: 0 });

  const page = story.pages[pageIndex];

  // build the plan: decode every page's narration for exact durations
  useEffect(() => {
    let dead = false;
    (async () => {
      const words: WordTimestamps[] = [];
      const pages: PagePlan[] = [];
      let clock = 0;
      for (const p of story.pages) {
        if (!p.narration) throw new Error(`${p.id}: no narration — run pnpm narrate first`);
        const [w, audioBuf] = await Promise.all([
          fetch(`/content/${story.id}/${p.narration.words}`).then((r) => r.json()),
          fetch(`/content/${story.id}/${p.narration.audio}`).then((r) => r.arrayBuffer()),
        ]);
        const probe = new OfflineAudioContext(1, 44100, 44100);
        const decoded = await probe.decodeAudioData(audioBuf);
        words.push(w);
        const plan: PagePlan = {
          id: p.id,
          start: clock,
          enter: 0.7,
          audio: decoded.duration + 0.15,
          hold: 1.3,
        };
        pages.push(plan);
        clock += plan.enter + plan.audio + plan.hold;
      }
      if (dead) return;
      wordsRef.current = words;
      planRef.current = { pages, total: clock, fps: 30 };
      await document.fonts.ready;
      installApi();
    })().catch((err) => {
      console.error("render plan failed", err);
      (window as unknown as { __renderError?: string }).__renderError = String(err);
    });
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story]);

  const pageIndexRef = useRef(0);
  pageIndexRef.current = pageIndex;
  const engineRef = useRef(engine);
  engineRef.current = engine;

  const installApi = () => {
    const api: RenderApi = {
      ready: true,
      plan: planRef.current!,
      seek: async (T: number) => {
        const plan = planRef.current!;
        // which page owns this instant?
        let idx = plan.pages.length - 1;
        for (let i = 0; i < plan.pages.length; i++) {
          const p = plan.pages[i];
          if (T < p.start + p.enter + p.audio + p.hold) {
            idx = i;
            break;
          }
        }
        if (idx !== pageIndexRef.current) {
          // mount the page, wait for measurement + scene
          const fresh = new ScrubEngine();
          await new Promise<void>((resolve) => {
            measuredRef.current = resolve;
            setEngine(fresh);
            setPageIndex(idx);
          });
          await waitFor(() => !!rootRef.current?.querySelector("[data-scene-ready]"));
        }
        const p = plan.pages[idx];
        const local = T - p.start;
        const e = engineRef.current;
        if (e.timeline) {
          if (local <= p.enter) {
            e.setTarget(0);
          } else {
            const at = Math.min(local - p.enter, p.audio);
            const t = audioTimeToT(wordsRef.current[idx], at, e.timeline);
            e.setTarget(local - p.enter >= p.audio ? 1 : t);
          }
          e.tick(1 / plan.fps);
          e.tick(1 / plan.fps);
        }
        return { page: idx, done: T >= plan.total };
      },
    };
    (window as unknown as { __render?: RenderApi }).__render = api;
  };

  // per-page wiring (same shape as the Reader, minus interaction)
  useEffect(() => {
    const root = rootRef.current;
    const prose = proseRef.current;
    if (!root || !prose) return;
    let disposed = false;

    const setup = () => {
      if (disposed) return;
      const m = measureProse(prose);
      if (!m) return;
      engine.setTimeline(m.timeline);
      painterRef.current = new HighlightPainter(m.cellEls, m.tokenEls, m.timeline);
      painterRef.current.paint(engine.t, engine.furthest);
      setRail({ left: m.railLeft, width: m.railWidth });
      measuredRef.current?.();
      measuredRef.current = null;
    };
    void document.fonts.ready.then(setup);

    const offFrame = engine.onFrame((t, furthest) => {
      painterRef.current?.paint(t, furthest);
      root.style.setProperty("--t", String(t));
    });
    return () => {
      disposed = true;
      offFrame();
      engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, page]);

  const accentVar =
    story.accent && CANDY.has(story.accent)
      ? `var(--color-candy-${story.accent})`
      : "var(--color-candy-purple)";

  return (
    <div
      ref={rootRef}
      className="reader relative flex h-dvh w-dvw flex-col items-center justify-between overflow-hidden bg-paper"
      style={{ "--t": "0", "--accent": accentVar, padding: "56px 120px 48px" } as React.CSSProperties}
    >
      <div className="w-full" style={{ maxWidth: 1360 }}>
        <SceneHost key={page.id} engine={engine} page={page} storyId={story.id} />
      </div>
      <div className="render-prose flex w-full flex-col items-center gap-8" style={{ maxWidth: 1360 }}>
        <ProseLine ref={proseRef} tokens={page.tokens} />
        <div
          className="rail"
          aria-hidden
          style={
            {
              marginLeft: rail.left,
              width: rail.width,
              alignSelf: "flex-start",
              pointerEvents: "none",
              "--rail-w": String(rail.width),
            } as React.CSSProperties
          }
        >
          <div className="rail-fill" />
          <div className="spark">
            <div className="spark-core" />
          </div>
        </div>
      </div>
      <span
        className="absolute font-display text-2xl font-semibold text-ink-soft"
        style={{ right: 48, bottom: 24 }}
      >
        stories.sh
      </span>
    </div>
  );
}

async function waitFor(cond: () => boolean, timeoutMs = 8000): Promise<void> {
  const t0 = performance.now();
  while (!cond()) {
    if (performance.now() - t0 > timeoutMs) throw new Error("waitFor timeout");
    await new Promise((r) => setTimeout(r, 40));
  }
}
