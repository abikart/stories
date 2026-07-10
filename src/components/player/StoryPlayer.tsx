"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Story } from "@/engine/types";
import { AmbientBed } from "@/engine/ambient";
import { getAudioContext, unlockAudio } from "@/engine/chime";
import { Reader } from "@/components/reader/Reader";
import type { ReadingMode } from "@/components/reader/ModeSwitcher";
import { Sticker } from "./stickers";

const MODE_KEY = "stories:mode";
const MUTE_KEY = "stories:ambientMuted";
const WORDS_KEY = "stories:wordsRead";
const STICKERS_KEY = "stories:stickers";

type Phase = "start" | "reading" | "celebrate";

const CANDY = new Set(["green", "blue", "purple", "orange", "yellow", "red", "teal"]);

/**
 * The full story flow (docs/03 M4): start screen (the trusted tap that
 * unlocks audio) → pages with enter transitions (each mounts dormant) →
 * story celebration with a sticker into the localStorage sticker book.
 */
export function StoryPlayer({ story, initialPage = 0 }: { story: Story; initialPage?: number }) {
  const [phase, setPhase] = useState<Phase>("start");
  const [pageIndex, setPageIndex] = useState(Math.min(initialPage, story.pages.length - 1));
  const [mode, setModeState] = useState<ReadingMode>("read-along");
  const [pageDone, setPageDone] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [autoReading, setAutoReading] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const ambientRef = useRef<AmbientBed | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const countedPages = useRef(new Set<string>());

  const page = story.pages[pageIndex];
  const isLast = pageIndex === story.pages.length - 1;
  const accentVar =
    story.accent && CANDY.has(story.accent)
      ? `var(--color-candy-${story.accent})`
      : "var(--color-candy-purple)";

  useEffect(() => {
    try {
      const m = localStorage.getItem(MODE_KEY) as ReadingMode | null;
      if (m === "read-it" || m === "read-along" || m === "read-to-me") setModeState(m);
      setMutedState(localStorage.getItem(MUTE_KEY) === "1");
    } catch {}
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      ambientRef.current?.dispose();
    };
  }, []);

  const setMode = (m: ReadingMode) => {
    setModeState(m);
    setAutoReading(false);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {}
  };

  const setMuted = (v: boolean) => {
    setMutedState(v);
    ambientRef.current?.setMuted(v);
    try {
      localStorage.setItem(MUTE_KEY, v ? "1" : "0");
    } catch {}
  };

  const clearAdvance = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };

  const start = () => {
    unlockAudio();
    const ctx = getAudioContext();
    if (ctx && !ambientRef.current) {
      ambientRef.current = new AmbientBed(ctx);
      ambientRef.current.start();
      ambientRef.current.setMuted(muted);
      ambientRef.current.setLevel(1);
    }
    setPhase("reading"); // pageIndex stays at initialPage (?p= dev/render entry)
  };

  const goTo = (i: number) => {
    clearAdvance();
    setPageDone(false);
    setPageIndex(i);
  };

  const celebrate = () => {
    clearAdvance();
    try {
      const words = Number(localStorage.getItem(WORDS_KEY) ?? 0);
      localStorage.setItem(WORDS_KEY, String(words));
      const stickers: Array<{ storyId: string; earnedAt: string }> = JSON.parse(
        localStorage.getItem(STICKERS_KEY) ?? "[]",
      );
      if (!stickers.some((s) => s.storyId === story.id)) {
        stickers.push({ storyId: story.id, earnedAt: new Date().toISOString() });
        localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
      }
    } catch {}
    ambientRef.current?.swell();
    setPhase("celebrate");
  };

  const next = () => {
    if (isLast) celebrate();
    else goTo(pageIndex + 1);
  };

  const onPageComplete = () => {
    setPageDone(true);
    ambientRef.current?.swell();
    if (!countedPages.current.has(page.id)) {
      countedPages.current.add(page.id);
      try {
        const words = Number(localStorage.getItem(WORDS_KEY) ?? 0) + page.tokens.length;
        localStorage.setItem(WORDS_KEY, String(words));
      } catch {}
    }
    if (mode === "read-to-me" && autoReading) {
      advanceTimer.current = window.setTimeout(next, 1500);
    } else if (isLast) {
      advanceTimer.current = window.setTimeout(celebrate, 900);
    }
  };

  if (phase === "start") {
    return (
      <main
        className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-6 text-center"
        style={{ "--accent": accentVar } as React.CSSProperties}
      >
        <Sticker storyId={story.id} size={120} />
        <div>
          <h1 className="font-display text-5xl font-bold">{story.title}</h1>
          <p className="mt-2 text-ink-soft">
            Level {story.level} · {story.pages.length} pages
          </p>
        </div>
        <button type="button" className="play-btn text-lg" onClick={start}>
          <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden>
            <path d="M2.5 1.5 L12.5 7 L2.5 12.5 Z" fill="currentColor" />
          </svg>
          Start reading
        </button>
        <Link href="/" className="text-sm text-ink-soft">
          ← library
        </Link>
      </main>
    );
  }

  return (
    <main
      className="mx-auto flex min-h-dvh flex-col justify-center gap-4 px-6 py-6"
      style={{
        maxWidth: "min(58rem, calc((100dvh - 330px) * 16 / 9))",
        "--accent": accentVar,
      } as React.CSSProperties}
    >
      <header className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <Link href="/" className="text-sm text-ink-soft" aria-label="back to library">
            ‹ library
          </Link>
          <h1 className="font-display text-xl font-semibold">{story.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="mute-btn"
            aria-label={muted ? "unmute sounds" : "mute sounds"}
            aria-pressed={muted}
            onClick={() => setMuted(!muted)}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <span className="text-sm text-ink-soft">
            page {pageIndex + 1} / {story.pages.length}
          </span>
        </div>
      </header>

      <div key={page.id} className={reducedMotion ? undefined : "page-enter"}>
        <Reader
          page={page}
          storyId={story.id}
          accent={story.accent}
          mode={mode}
          onModeChange={setMode}
          autoPlay={mode === "read-to-me" && autoReading}
          onNarratingChange={(playing) => {
            if (playing) setAutoReading(true);
          }}
          onInterrupt={() => {
            setAutoReading(false);
            clearAdvance();
          }}
          onPageComplete={onPageComplete}
        />
      </div>

      <nav className="flex min-h-8 items-center justify-between text-sm text-ink-soft">
        {pageIndex > 0 ? (
          <button type="button" onClick={() => goTo(pageIndex - 1)}>
            ← previous
          </button>
        ) : (
          <span />
        )}
        {pageDone && !isLast && (
          <button type="button" className="next-arrow" onClick={next} aria-label="next page">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 4 L18 12 L8 20 Z" fill="currentColor" />
            </svg>
          </button>
        )}
      </nav>

      {phase === "celebrate" && (
        <div className="celebration" role="dialog" aria-label="story complete">
          {!reducedMotion &&
            Array.from({ length: 26 }, (_, i) => (
              <span
                key={i}
                className="confetti"
                style={{
                  left: `${(i * 37) % 100}%`,
                  background: `var(--color-candy-${["green", "blue", "purple", "orange", "yellow", "red"][i % 6]})`,
                  animationDelay: `${(i % 9) * 0.12}s`,
                  animationDuration: `${2.2 + (i % 5) * 0.35}s`,
                }}
              />
            ))}
          <div className="celebration-card">
            <div className="sticker-drop">
              <Sticker storyId={story.id} />
            </div>
            <h2 className="font-display text-3xl font-bold">You read the whole story!</h2>
            <p className="text-ink-soft">
              {story.pages.reduce((n, p) => n + p.tokens.length, 0)} words — a new sticker is
              yours.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="play-btn"
                onClick={() => {
                  countedPages.current.clear();
                  setPhase("reading");
                  goTo(0);
                }}
              >
                Read again
              </button>
              <Link href="/" className="play-btn play-btn-secondary">
                Library
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
