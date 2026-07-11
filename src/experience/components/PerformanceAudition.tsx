"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Performance } from "@/experience/schema";
import {
  PerformanceClock,
  type PerformanceClockSnapshot,
} from "@/experience/performance/PerformanceClock";
import type { TimedPhrase } from "@/experience/performance/timeline";

export type PerformanceAuditionStory = {
  id: string;
  title: string;
  accent: string;
  poster: string;
  performance: Performance;
  phrases: TimedPhrase[];
};

type AuditionStyle = CSSProperties & {
  "--audition-backdrop": string;
  "--audition-accent": string;
};

function assetUrl(storyId: string, asset: string) {
  return `/content/${storyId}/${asset}`;
}

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function PerformanceAudition({ story }: { story: PerformanceAuditionStory }) {
  const performance = story.performance;
  const audioRef = useRef<HTMLAudioElement>(null);
  const clockRef = useRef<PerformanceClock | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const phrases = useMemo(() => story.phrases, [story.phrases]);
  const [clockReady, setClockReady] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const [snapshot, setSnapshot] = useState<PerformanceClockSnapshot>({
    time: 0,
    duration: performance.duration,
    playing: false,
    ended: false,
    phraseIndex: -1,
    sceneIndex: -1,
    wordIndex: -1,
  });
  const phrase = snapshot.phraseIndex >= 0 ? phrases[snapshot.phraseIndex] : null;
  const style: AuditionStyle = {
    "--audition-backdrop": `url("${assetUrl(story.id, story.poster)}")`,
    "--audition-accent": story.accent,
  };

  const initializeClock = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return null;
    if (clockRef.current) return clockRef.current;
    const clock = new PerformanceClock(audio, phrases, performance.duration);
    clockRef.current = clock;
    setClockReady(true);
    unsubscribeRef.current = clock.subscribe(setSnapshot);
    return clock;
  }, [performance.duration, phrases]);

  useEffect(() => () => {
    unsubscribeRef.current?.();
    clockRef.current?.destroy();
  }, []);

  return (
    <main className="performance-audition" style={style}>
      <div className="performance-audition-backdrop" aria-hidden="true" />
      <section className="performance-audition-card">
        <div className="performance-audition-art" aria-hidden="true" />
        <div className="performance-audition-copy">
          <p className="performance-kicker">Eleven v3 · aligned final performance</p>
          <h1>{story.title}</h1>
          <p className="performance-meta">
            {performance.selectedCandidate} · {formatTime(performance.duration)} · {phrases.length} phrases
            {clockReady ? " · clock ready" : " · loading clock"}
          </p>

          <div className="performance-phrase" aria-live="polite">
            <span>{phrase?.speaker ?? "Ready"}</span>
            <p>
              {phrase ? phrase.words?.map((word, index) => (
                <span
                  key={`${phrase.id}-${index}`}
                  data-word-state={index < snapshot.wordIndex ? "past" : index === snapshot.wordIndex ? "active" : "future"}
                >
                  {word.text}{" "}
                </span>
              )) : "Press play to audition the continuous story performance."}
            </p>
          </div>

          {playbackError ? <p className="performance-error" role="alert">{playbackError}</p> : null}

          <audio
            ref={audioRef}
            src={assetUrl(story.id, performance.audio)}
            preload="metadata"
            onLoadedMetadata={(event) => initializeClock(event.currentTarget)}
            onCanPlay={(event) => initializeClock(event.currentTarget)}
          />
          <input
            className="performance-seek"
            type="range"
            min="0"
            max={performance.duration}
            step="0.05"
            value={snapshot.time}
            aria-label="performance position"
            onInput={(event) => clockRef.current?.seek(Number(event.currentTarget.value))}
          />
          <div className="performance-time" aria-label="performance time">
            <span>{formatTime(snapshot.time)}</span>
            <span>{formatTime(performance.duration)}</span>
          </div>
          <div className="performance-actions">
            <button
              type="button"
              onClick={() => {
                const clock = initializeClock(audioRef.current);
                setPlaybackError("");
                if (snapshot.playing) {
                  clock?.pause();
                  return;
                }
                void clock?.play().catch(() => {
                  setPlaybackError("Playback is blocked in this preview. Try the story in Chrome or Safari.");
                });
              }}
            >
              {snapshot.playing ? "Pause performance" : "Play performance"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaybackError("");
                void initializeClock(audioRef.current)?.replay().catch(() => {
                  setPlaybackError("Playback is blocked in this preview. Try the story in Chrome or Safari.");
                });
              }}
            >
              Replay from beginning
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
