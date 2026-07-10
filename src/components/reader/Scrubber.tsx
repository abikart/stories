"use client";

import { useEffect, useRef } from "react";
import type { ScrubEngine } from "@/engine/scrub";
import { unlockAudio } from "@/engine/chime";

/**
 * The rail + the Spark. Pointer position maps linearly to t (the rail is
 * sized/positioned to the measured prose line, so the Spark rides directly
 * under the letters). Keyboard: arrows step one grapheme, Home/End jump.
 */
export function Scrubber({
  engine,
  railLeft,
  railWidth,
  onEngage,
}: {
  engine: ScrubEngine;
  railLeft: number;
  railWidth: number;
  onEngage?: () => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || railWidth <= 0) return;
    rail.style.setProperty("--rail-w", String(railWidth));
    // aria + fill/Spark position piggyback on the engine's frame loop
    let lastPct = -1;
    return engine.onFrame((t) => {
      const pct = Math.round(t * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        rail.setAttribute("aria-valuenow", String(pct));
        const word = engine.timeline?.tokenIndexAt(t) ?? -1;
        if (word >= 0) rail.setAttribute("aria-valuetext", `word ${word + 1}`);
      }
    });
  }, [engine, railWidth]);

  const apply = (clientX: number) => {
    const rect = rectRef.current;
    if (!rect || rect.width === 0) return;
    engine.setTarget((clientX - rect.left) / rect.width);
  };

  return (
    <div
      ref={railRef}
      role="slider"
      aria-label="reading slider — slide under the words"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      tabIndex={0}
      className="rail"
      style={{ marginLeft: railLeft, width: railWidth }}
      onPointerDown={(e) => {
        unlockAudio();
        onEngage?.();
        draggingRef.current = true;
        rectRef.current = railRef.current!.getBoundingClientRect();
        try {
          railRef.current!.setPointerCapture(e.pointerId);
        } catch {
          // capture is a nicety (drag continues off-element); not load-bearing
        }
        railRef.current!.closest(".reader")?.setAttribute("data-dragging", "");
        apply(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) apply(e.clientX);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
        railRef.current?.closest(".reader")?.removeAttribute("data-dragging");
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
        railRef.current?.closest(".reader")?.removeAttribute("data-dragging");
      }}
      onKeyDown={(e) => {
        const step = engine.timeline?.step ?? 0.05;
        if (e.key === "ArrowRight") engine.setTarget(engine.target + step);
        else if (e.key === "ArrowLeft") engine.setTarget(engine.target - step);
        else if (e.key === "Home") engine.setTarget(0);
        else if (e.key === "End") engine.setTarget(1);
        else return;
        unlockAudio();
        e.preventDefault();
      }}
    >
      <div className="rail-fill" aria-hidden />
      <div className="spark" aria-hidden>
        <div className="spark-core" />
      </div>
    </div>
  );
}
