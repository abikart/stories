"use client";

import { useEffect, useState } from "react";

const SIZE_KEY = "stories:textSize";
const EASY_KEY = "stories:easyRead";
const SIZES = ["m", "l", "xl"] as const;
type Size = (typeof SIZES)[number];

function apply(size: Size, easy: boolean) {
  const el = document.documentElement;
  el.setAttribute("data-text-size", size);
  el.toggleAttribute("data-easy-read", easy);
}

/**
 * Accessibility toggles (docs/02): text size cycle + "easy read" (heavier
 * Lexend, wider letter/word spacing). Applied as attributes on <html> so
 * the prose CSS responds everywhere; the reader re-measures via its
 * ResizeObserver when sizes change.
 */
export function ReadingSettings() {
  const [size, setSize] = useState<Size>("m");
  const [easy, setEasy] = useState(false);

  useEffect(() => {
    try {
      const s = (localStorage.getItem(SIZE_KEY) as Size) || "m";
      const e = localStorage.getItem(EASY_KEY) === "1";
      setSize(SIZES.includes(s) ? s : "m");
      setEasy(e);
      apply(SIZES.includes(s) ? s : "m", e);
    } catch {}
  }, []);

  const cycleSize = () => {
    const next = SIZES[(SIZES.indexOf(size) + 1) % SIZES.length];
    setSize(next);
    apply(next, easy);
    try {
      localStorage.setItem(SIZE_KEY, next);
    } catch {}
  };

  const toggleEasy = () => {
    const next = !easy;
    setEasy(next);
    apply(size, next);
    try {
      localStorage.setItem(EASY_KEY, next ? "1" : "0");
    } catch {}
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="reading settings">
      <button
        type="button"
        className="setting-btn"
        onClick={cycleSize}
        aria-label={`text size: ${size} — tap to change`}
      >
        <span className="font-reading font-semibold" aria-hidden>
          {size === "m" ? "Aa" : size === "l" ? "Aa+" : "Aa++"}
        </span>
      </button>
      <button
        type="button"
        className="setting-btn"
        onClick={toggleEasy}
        aria-pressed={easy}
        aria-label="easy-read letters"
      >
        <span aria-hidden>👓</span>
      </button>
    </div>
  );
}
