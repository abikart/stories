"use client";

import { useEffect, useRef, useState } from "react";
import type { Page } from "@/engine/types";
import { ScrubEngine } from "@/engine/scrub";
import { chime, getAudioContext, unlockAudio } from "@/engine/chime";
import { ClockDriver } from "@/engine/drivers";
import { PageNarration } from "@/engine/narration";
import { HighlightPainter, measureProse } from "./measure";
import { ModeSwitcher, type ReadingMode } from "./ModeSwitcher";
import { ProseLine } from "./ProseLine";
import { SceneHost } from "./SceneHost";
import { Scrubber } from "./Scrubber";

const CANDY = new Set(["green", "blue", "purple", "orange", "yellow", "red", "teal"]);
const MODE_KEY = "stories:mode";

/**
 * One page of the reader. Three modes, one timeline (docs/02):
 *  - Read it: the finger drives; tap-a-word sweeps the graphemes then speaks it
 *  - Read along: the finger drives; entering a word speaks its slice
 *  - Read to me: the narration clock drives; highlights + scene follow
 */
export function Reader({
  page,
  storyId,
  accent,
}: {
  page: Page;
  storyId: string;
  accent?: string;
}) {
  const [engine] = useState(() => new ScrubEngine());
  const rootRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLParagraphElement>(null);
  const painterRef = useRef<HighlightPainter | null>(null);
  const narrationRef = useRef<PageNarration | null>(null);
  const driverRef = useRef<ClockDriver | null>(null);
  const sweepRef = useRef<number | null>(null);
  const lastTokRef = useRef(-1);
  const modeRef = useRef<ReadingMode>("read-along");
  const statsRef = useRef({ slices: 0 });

  const [rail, setRail] = useState({ left: 0, width: 0 });
  const [mode, setModeState] = useState<ReadingMode>("read-along");
  const [narrReady, setNarrReady] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);

  const stopSweep = () => {
    if (sweepRef.current !== null) {
      clearInterval(sweepRef.current);
      sweepRef.current = null;
    }
  };

  const stopPlayback = () => {
    narrationRef.current?.stop();
    driverRef.current?.stop();
    setIsNarrating(false);
  };

  const setMode = (m: ReadingMode) => {
    stopPlayback();
    stopSweep();
    modeRef.current = m;
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {}
  };

  /** Tap-a-word: glide through its graphemes slowly, then speak the whole word. */
  const sweepWord = (i: number) => {
    const tl = engine.timeline;
    if (!tl || !tl.tokens[i]) return;
    unlockAudio();
    stopPlayback();
    stopSweep();
    const tok = tl.tokens[i];
    const cellCount = Math.max(1, tl.cells.filter((c) => c.tokenIndex === i).length);
    const duration = Math.max(480, cellCount * 340);
    const t0 = performance.now();
    engine.setTarget(tok.start + 1e-3);
    sweepRef.current = window.setInterval(() => {
      const f = Math.min(1, (performance.now() - t0) / duration);
      engine.setTarget(tok.start + f * (tok.end - tok.start));
      if (f >= 1) {
        stopSweep();
        if (narrationRef.current?.playWord(i)) statsRef.current.slices++;
      }
    }, 40);
  };

  const play = () => {
    const n = narrationRef.current;
    const tl = engine.timeline;
    if (!n || !tl) return;
    unlockAudio();
    stopSweep();
    driverRef.current?.stop();
    driverRef.current = new ClockDriver(
      engine,
      () => n.position,
      (at) => n.audioTimeToT(at, tl),
    );
    n.playAll(() => {
      driverRef.current?.stop();
      setIsNarrating(false);
      engine.setTarget(1);
    });
    driverRef.current.start();
    setIsNarrating(true);
  };

  // restore persisted mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY) as ReadingMode | null;
      if (saved === "read-it" || saved === "read-along" || saved === "read-to-me") {
        modeRef.current = saved;
        setModeState(saved);
      }
    } catch {}
  }, []);

  // narration assets
  useEffect(() => {
    if (!page.narration) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    let dead = false;
    PageNarration.load(
      ctx,
      `/content/${storyId}/${page.narration.audio}`,
      `/content/${storyId}/${page.narration.words}`,
    )
      .then((n) => {
        if (dead) return;
        narrationRef.current = n;
        setNarrReady(true);
      })
      .catch((err) => console.error("narration load failed", err));
    return () => {
      dead = true;
      narrationRef.current?.stop();
      narrationRef.current = null;
      setNarrReady(false);
    };
  }, [page, storyId]);

  // engine wiring: measurement, painter, frame paint, word events
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
    };

    void document.fonts.ready.then(setup);
    const ro = new ResizeObserver(setup);
    ro.observe(prose);

    const offFrame = engine.onFrame((t, furthest) => {
      painterRef.current?.paint(t, furthest);
      root.style.setProperty("--t", String(t));
      // read-along: speak each word as the Spark enters it (forward only)
      const tok = engine.timeline?.tokenIndexAt(t) ?? -1;
      if (tok !== lastTokRef.current) {
        if (
          tok > lastTokRef.current &&
          modeRef.current === "read-along" &&
          sweepRef.current === null &&
          narrationRef.current &&
          !narrationRef.current.isPlaying
        ) {
          if (narrationRef.current.playWord(tok)) statsRef.current.slices++;
        }
        lastTokRef.current = tok;
      }
    });
    const offWord = engine.onWordComplete((i) => {
      chime(i);
      const core = root.querySelector(".spark-core");
      if (core) {
        core.removeAttribute("data-hop");
        void (core as HTMLElement).offsetWidth;
        core.setAttribute("data-hop", "");
      }
    });

    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __reader?: object }).__reader = {
        engine,
        narration: () => narrationRef.current,
        stats: statsRef.current,
      };
    }

    return () => {
      disposed = true;
      ro.disconnect();
      offFrame();
      offWord();
      stopSweep();
      engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, page]);

  const accentVar =
    accent && CANDY.has(accent) ? `var(--color-candy-${accent})` : "var(--color-candy-purple)";

  return (
    <div
      ref={rootRef}
      className="reader flex flex-col gap-6"
      style={{ "--t": "0", "--accent": accentVar } as React.CSSProperties}
    >
      <SceneHost engine={engine} page={page} />
      <div className="flex min-h-12 items-center justify-between gap-4">
        {mode === "read-to-me" ? (
          <button
            type="button"
            className="play-btn"
            disabled={!narrReady}
            onClick={isNarrating ? stopPlayback : play}
          >
            {isNarrating ? (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <rect x="1" y="1" width="12" height="12" rx="2" fill="currentColor" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M2.5 1.5 L12.5 7 L2.5 12.5 Z" fill="currentColor" />
              </svg>
            )}
            {isNarrating ? "Stop" : "Read to me"}
          </button>
        ) : (
          <span />
        )}
        <ModeSwitcher mode={mode} onChange={setMode} />
      </div>
      <div className="flex flex-col gap-5 px-1">
        <ProseLine ref={proseRef} tokens={page.tokens} onWordTap={sweepWord} />
        <Scrubber
          engine={engine}
          railLeft={rail.left}
          railWidth={rail.width}
          onEngage={() => {
            stopPlayback();
            stopSweep();
          }}
        />
      </div>
    </div>
  );
}
