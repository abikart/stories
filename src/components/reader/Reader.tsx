"use client";

import { useEffect, useRef, useState } from "react";
import type { Page } from "@/engine/types";
import { ScrubEngine } from "@/engine/scrub";
import { chime } from "@/engine/chime";
import { HighlightPainter, measureProse } from "./measure";
import { ProseLine } from "./ProseLine";
import { SceneHost } from "./SceneHost";
import { Scrubber } from "./Scrubber";

/**
 * One page of the reader: prose + Spark scrubber wired to the scrub engine
 * (scene window joins at M2, narration modes at M3). Mount keyed by page.
 */
export function Reader({ page }: { page: Page }) {
  const [engine] = useState(() => new ScrubEngine());
  const rootRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLParagraphElement>(null);
  const painterRef = useRef<HighlightPainter | null>(null);
  const [rail, setRail] = useState({ left: 0, width: 0 });

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
    });
    const offWord = engine.onWordComplete((i) => {
      chime(i);
      const core = root.querySelector(".spark-core");
      if (core) {
        core.removeAttribute("data-hop");
        // restart the hop animation even on same-frame consecutive words
        void (core as HTMLElement).offsetWidth;
        core.setAttribute("data-hop", "");
      }
    });

    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __reader?: object }).__reader = { engine };
    }

    return () => {
      disposed = true;
      ro.disconnect();
      offFrame();
      offWord();
      engine.dispose();
    };
  }, [engine, page]);

  return (
    <div ref={rootRef} className="reader flex flex-col gap-8" style={{ "--t": "0" } as React.CSSProperties}>
      <SceneHost engine={engine} page={page} />
      <div className="flex flex-col gap-5 px-1">
        <ProseLine
          ref={proseRef}
          tokens={page.tokens}
          onWordTap={(i) => {
            const tl = engine.timeline;
            if (tl) engine.setTarget(tl.tokenStart(i) + 1e-3);
          }}
        />
        <Scrubber engine={engine} railLeft={rail.left} railWidth={rail.width} />
      </div>
    </div>
  );
}
