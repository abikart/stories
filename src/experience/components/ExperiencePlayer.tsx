"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { ExperienceProduction } from "@/experience/schema";
import {
  MediaDeck,
  type MediaDeckHandle,
} from "@/experience/media/MediaDeck";
import {
  PerformanceClock,
  type PerformanceClockSnapshot,
} from "@/experience/performance/PerformanceClock";
import {
  flattenPhrases,
  flattenReadingUnits,
  sampleReadingUnit,
} from "@/experience/performance/timeline";
import { DragToGuide } from "@/experience/interactions/DragToGuide";
import { Soundscape, type SoundscapeHandle } from "@/experience/audio/Soundscape";

type PlayerMode = "watch" | "read";
type ReadingPhase = "idle" | "settling" | "reading" | "resuming";

const READING_SETTLE_MS = 420;
const READING_EXIT_MS = 180;
const READING_TARGET_LEAD_MS = 500;
const READING_AUDIO_LEAD_SECONDS = 0.32;

type PlayerStyle = CSSProperties & {
  "--experience-accent": string;
  "--experience-backdrop": string;
  "--focal-x": string;
  "--focal-y": string;
};

type OverlayStyle = CSSProperties & {
  "--phrase-anchor-x": string;
  "--phrase-anchor-y": string;
};

type SafeStop = {
  id: string;
  phraseIndex: number;
  time: number;
  resumeTime: number;
  resumeDelayMs: number;
  unitStartIndex: number;
  unitEndIndex: number;
};

function assetUrl(storyId: string, asset: string) {
  return `/content/${storyId}/${asset}`;
}

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function ExperiencePlayer({ production }: { production: ExperienceProduction }) {
  if (!production.performance) throw new Error("Interactive playback requires performance metadata");

  const performance = production.performance;
  const phrases = useMemo(() => flattenPhrases(production), [production]);
  const readingUnits = useMemo(() => flattenReadingUnits(production), [production]);
  const safeStops = useMemo<SafeStop[]>(() => {
    let previousUnitEnd = -1;
    return phrases.flatMap((phrase, phraseIndex) => {
      if (!phrase.safeStopAfter) return [];
      let unitEndIndex = previousUnitEnd;
      for (let index = previousUnitEnd + 1; index < readingUnits.length; index++) {
        if (readingUnits[index].end <= phrase.end + 0.04) unitEndIndex = index;
        else break;
      }
      const stop = {
        id: phrase.id,
        phraseIndex,
        time: phrase.end,
        resumeTime: phrase.end,
        resumeDelayMs: READING_TARGET_LEAD_MS,
        unitStartIndex: previousUnitEnd + 1,
        unitEndIndex,
      };
      const nextStart = phrases[phraseIndex + 1]?.start;
      if (nextStart !== undefined) {
        stop.resumeTime = Math.max(phrase.end, nextStart - READING_AUDIO_LEAD_SECONDS);
        const remainingAudioLeadMs = Math.max(0, nextStart - stop.resumeTime) * 1000;
        stop.resumeDelayMs = Math.max(READING_EXIT_MS, READING_TARGET_LEAD_MS - remainingAudioLeadMs);
      }
      previousUnitEnd = unitEndIndex;
      return [stop];
    });
  }, [phrases, readingUnits]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const soundscapeRef = useRef<SoundscapeHandle>(null);
  const clockRef = useRef<PerformanceClock | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const deckRef = useRef<MediaDeckHandle>(null);
  const stopCursorRef = useRef(0);
  const readingTransitionTokenRef = useRef(0);
  const [mode, setMode] = useState<PlayerMode>("watch");
  const [displayUnitIndex, setDisplayUnitIndex] = useState(0);
  const [waiting, setWaiting] = useState<SafeStop | null>(null);
  const [readingPhase, setReadingPhase] = useState<ReadingPhase>("idle");
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(() => new Set());
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
  const activeReadingSample = useMemo(
    () => sampleReadingUnit(readingUnits, snapshot.time),
    [readingUnits, snapshot.time],
  );
  const displayUnit = readingUnits[displayUnitIndex] ?? readingUnits[0];
  const liveUnit = readingUnits[activeReadingSample.unitIndex] ?? readingUnits[0] ?? displayUnit;
  const visualUnit = waiting ? displayUnit : liveUnit;
  const activeSceneIndex = visualUnit.sceneIndex;

  const initializeClock = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return null;
    if (clockRef.current) return clockRef.current;
    const clock = new PerformanceClock(audio, phrases, performance.duration);
    clockRef.current = clock;
    unsubscribeRef.current = clock.subscribe(setSnapshot);
    return clock;
  }, [performance.duration, phrases]);

  const setStopCursor = useCallback((time: number) => {
    const index = safeStops.findIndex((stop) => stop.time > time + 0.04);
    stopCursorRef.current = index < 0 ? safeStops.length : index;
  }, [safeStops]);

  const play = useCallback(async (clock: PerformanceClock | null, fromReadingPause = false) => {
    if (!clock) return;
    setPlaybackError("");
    try {
      const time = audioRef.current?.currentTime ?? 0;
      const soundscape = fromReadingPause
        ? soundscapeRef.current?.resumeFromReadingPause(time)
        : soundscapeRef.current?.play(time);
      await Promise.all([clock.play(), soundscape]);
    } catch {
      setPlaybackError("Your browser blocked narration. Tap play again or open the story in Chrome or Safari.");
    }
  }, []);

  useEffect(() => () => {
    unsubscribeRef.current?.();
    clockRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (waiting || activeReadingSample.unitIndex < 0) return;
    setDisplayUnitIndex(activeReadingSample.unitIndex);
  }, [activeReadingSample.unitIndex, waiting]);

  useEffect(() => {
    const worldShouldMove = snapshot.playing || Boolean(waiting);
    void deckRef.current?.setPlaying(worldShouldMove);
    if (!snapshot.playing && !waiting) soundscapeRef.current?.pause();
    if (!waiting) soundscapeRef.current?.seek(snapshot.time);
  }, [activeSceneIndex, snapshot.playing, waiting]);

  useEffect(() => {
    if (mode !== "read" || waiting || !snapshot.playing) return;
    const stop = safeStops[stopCursorRef.current];
    if (!stop || snapshot.time < stop.time) return;
    stopCursorRef.current += 1;
    setDisplayUnitIndex(stop.unitEndIndex);
    setReadingPhase("settling");
    setWaiting(stop);
    void soundscapeRef.current?.enterReadingPause(stop.time);
    clockRef.current?.pause();
  }, [mode, safeStops, snapshot.playing, snapshot.time, waiting]);

  useEffect(() => {
    if (!waiting || readingPhase !== "settling") return;
    const timer = window.setTimeout(() => setReadingPhase("reading"), READING_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [readingPhase, waiting]);

  const scene = production.scenes[activeSceneIndex] ?? production.scenes[0];
  const interaction = scene.interaction;
  const interactionTrigger = interaction
    ? phrases.find((candidate) => candidate.id === interaction.triggerAfterPhrase)
    : null;
  const interactionTriggerUnit = interaction?.triggerAtReadingUnit
    ? readingUnits.find((candidate) => candidate.id === interaction.triggerAtReadingUnit)
    : null;
  const interactionComplete = completedInteractions.has(scene.id);
  const requiredInteraction = Boolean(
    interaction && !interactionComplete && mode === "read" && waiting?.id === interaction.triggerAfterPhrase,
  );
  const recipeMode = requiredInteraction
    ? "interactive"
    : interaction && !interactionComplete && mode === "watch"
      && snapshot.time >= (interactionTriggerUnit?.start ?? interactionTrigger?.end ?? Number.POSITIVE_INFINITY)
      ? "canonical"
      : null;
  const visualState = interactionComplete && visualUnit.phraseId === interaction?.triggerAfterPhrase
    ? interaction.completeMediaState
    : visualUnit.mediaState;
  const media = scene.media.find((state) => state.id === visualState) ?? scene.media[0];
  const focal = media.focalPoint ?? production.stage.defaultFocalPoint;
  const anchor = displayUnit.overlay.anchor ?? { x: 0.5, y: 0.5 };
  const stageStyle: PlayerStyle = {
    "--experience-accent": production.accent,
    "--experience-backdrop": `url("${assetUrl(production.id, production.stage.backdrop.poster)}")`,
    "--focal-x": `${focal.x * 100}%`,
    "--focal-y": `${focal.y * 100}%`,
    backgroundColor: production.stage.backdrop.color,
  };
  const overlayStyle: OverlayStyle = {
    "--phrase-anchor-x": `${anchor.x * 100}%`,
    "--phrase-anchor-y": `${anchor.y * 100}%`,
  };
  const shownWordIndex = snapshot.time === 0 && !snapshot.playing
    ? -1
    : waiting
    ? displayUnit.words.length
    : displayUnit.id === liveUnit.id
      ? activeReadingSample.wordIndex
      : displayUnit.words.length - 1;
  const passageUnits = waiting
    ? readingUnits.slice(waiting.unitStartIndex, waiting.unitEndIndex + 1)
    : [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void deckRef.current?.syncTo(visualState);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeSceneIndex, visualState]);

  function changeMode(nextMode: PlayerMode) {
    if (nextMode === mode) return;
    const token = readingTransitionTokenRef.current + 1;
    readingTransitionTokenRef.current = token;
    setMode(nextMode);
    setStopCursor(snapshot.time);
    if (nextMode === "watch" && waiting) {
      setDisplayUnitIndex(waiting.unitEndIndex);
      clockRef.current?.seek(waiting.resumeTime);
      setReadingPhase("resuming");
      void (async () => {
        await play(clockRef.current, true);
        if (readingTransitionTokenRef.current !== token) return;
        setWaiting(null);
        setReadingPhase("idle");
      })();
    }
  }

  async function resumeReading(clock: PerformanceClock) {
    if (!waiting || readingPhase !== "reading") return;
    const token = readingTransitionTokenRef.current + 1;
    readingTransitionTokenRef.current = token;
    setDisplayUnitIndex(waiting.unitEndIndex);
    setReadingPhase("resuming");
    clock.seek(waiting.resumeTime);
    await wait(waiting.resumeDelayMs);
    if (readingTransitionTokenRef.current !== token) return;
    await play(clock, true);
    if (readingTransitionTokenRef.current !== token) return;
    setWaiting(null);
    setReadingPhase("idle");
  }

  function togglePlayback() {
    if (requiredInteraction) return;
    const clock = initializeClock(audioRef.current);
    if (!clock) return;
    if (waiting) {
      void resumeReading(clock);
    } else if (snapshot.playing) {
      clock.pause();
    } else if (snapshot.ended || snapshot.time >= performance.duration - 0.05) {
      setStopCursor(0);
      clock.seek(0);
      void play(clock);
    } else {
      void play(clock);
    }
  }

  function replay() {
    const clock = initializeClock(audioRef.current);
    if (!clock) return;
    const token = readingTransitionTokenRef.current + 1;
    readingTransitionTokenRef.current = token;
    const wasWaiting = Boolean(waiting);
    stopCursorRef.current = 0;
    setReadingPhase(wasWaiting ? "resuming" : "idle");
    setDisplayUnitIndex(0);
    setCompletedInteractions(new Set());
    setPlaybackError("");
    clock.seek(0);
    if (wasWaiting) {
      void (async () => {
        await play(clock);
        if (readingTransitionTokenRef.current !== token) return;
        setWaiting(null);
        setReadingPhase("idle");
      })();
    } else {
      setWaiting(null);
      void play(clock);
    }
  }

  function seek(time: number) {
    const clock = initializeClock(audioRef.current);
    const wasWaiting = Boolean(waiting);
    readingTransitionTokenRef.current += 1;
    setReadingPhase("idle");
    setWaiting(null);
    setStopCursor(time);
    setCompletedInteractions((current) => {
      const next = new Set(current);
      for (const candidate of production.scenes) {
        const trigger = candidate.interaction
          ? phrases.find((phraseCandidate) => phraseCandidate.id === candidate.interaction?.triggerAfterPhrase)
          : null;
        if (!trigger) continue;
        if (time >= trigger.end) next.add(candidate.id);
        else next.delete(candidate.id);
      }
      return next;
    });
    if (wasWaiting) soundscapeRef.current?.pause();
    soundscapeRef.current?.seek(time);
    clock?.seek(time);
  }

  async function completeInteraction() {
    if (!interaction || completedInteractions.has(scene.id)) return;
    await deckRef.current?.transitionTo(interaction.completeMediaState);
    if (waiting) setReadingPhase("settling");
    setCompletedInteractions((current) => new Set(current).add(scene.id));
  }

  return (
    <main
      className="story-player"
      style={stageStyle}
      data-mode={mode}
      data-waiting={waiting ? "true" : undefined}
      data-reading-phase={readingPhase}
    >
      <div className="experience-atmosphere" aria-hidden="true" />
      <header className="story-player-header">
        <div className="story-player-title">
          <span>A Bramble Hollow story</span>
          <h1>{production.title}</h1>
        </div>
        <div className="story-mode-switch" role="group" aria-label="Story mode">
          <button type="button" aria-pressed={mode === "watch"} onClick={() => changeMode("watch")}>
            Watch
          </button>
          <button type="button" aria-pressed={mode === "read"} onClick={() => changeMode("read")}>
            Read with me
          </button>
        </div>
      </header>

      <section className="story-player-composition" aria-label="Interactive story player">
        <div className="story-player-stage">
          <div className="story-player-media">
            <MediaDeck
              key={scene.id}
              ref={deckRef}
              storyId={production.id}
              scene={scene}
              fallbackPoster={production.stage.backdrop.poster}
            />
            {interaction && recipeMode ? (
              <DragToGuide
                key={`${scene.id}-${recipeMode}`}
                binding={interaction}
                mode={recipeMode}
                onComplete={() => void completeInteraction()}
              />
            ) : null}
          </div>

          <div
            className="story-overlay"
            data-kind={displayUnit.overlay.kind}
            data-placement={displayUnit.overlay.placement ?? "above"}
            data-mobile-policy={displayUnit.overlay.mobilePolicy}
            data-reading-phase={waiting ? readingPhase : undefined}
            style={overlayStyle}
          >
            {waiting && !requiredInteraction ? (
              <div className="story-reading-passage story-overlay-content" role="group" aria-label="Reading passage" key={`passage-${waiting.id}`}>
                <span className="story-reading-passage-heading" aria-live="polite">Your turn</span>
                <ol aria-label="Lines to read">
                  {passageUnits.map((unit) => (
                    <li className="story-reading-line" data-reading-line key={unit.id}>
                      <span>{unit.speaker}</span>
                      <p>{unit.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="story-overlay-content" key={displayUnit.id}>
                <span className="story-overlay-speaker">{displayUnit.speaker}</span>
                <p aria-label={displayUnit.text}>
                  {displayUnit.words.map((word, index) => (
                    <span
                      aria-hidden="true"
                      key={`${displayUnit.id}-${index}`}
                      data-word-state={index < shownWordIndex ? "past" : index === shownWordIndex ? "active" : "future"}
                    >
                      {word.text}{" "}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>

          {snapshot.time === 0 && !snapshot.playing ? (
            <div className="story-start-card">
              <span>{mode === "watch" ? "Story time" : "Read together"}</span>
              <p>{mode === "watch" ? "Settle in. Pip's light is about to wake." : "The story will wait after each thought."}</p>
              <button type="button" onClick={togglePlayback}>
                Begin story
              </button>
            </div>
          ) : null}
        </div>

        <audio
          data-performance-audio
          ref={audioRef}
          src={assetUrl(production.id, performance.audio)}
          preload="auto"
          onLoadedMetadata={(event) => initializeClock(event.currentTarget)}
          onCanPlay={(event) => initializeClock(event.currentTarget)}
        />
        {performance.stems ? (
          <Soundscape ref={soundscapeRef} storyId={production.id} stems={performance.stems} />
        ) : null}

        <div className="story-transport" aria-label="Story controls">
          <button className="story-icon-button" type="button" onClick={replay} aria-label="Replay story">
            ↺
          </button>
          <button
            className="story-play-button"
            type="button"
            onClick={togglePlayback}
            disabled={requiredInteraction || Boolean(waiting && readingPhase !== "reading")}
          >
            {requiredInteraction ? "Guide Glow above" : waiting ? "Continue" : snapshot.playing ? "Pause" : snapshot.ended ? "Play again" : "Play"}
          </button>
          <div className="story-progress">
            <input
              type="range"
              min="0"
              max={performance.duration}
              step="0.05"
              value={snapshot.time}
              aria-label="Story position"
              onInput={(event) => seek(Number(event.currentTarget.value))}
            />
            <div>
              <span>{formatTime(snapshot.time)}</span>
              <span>{requiredInteraction ? "help Glow find home" : mode === "read" ? (waiting ? "waiting for you" : "pauses at safe lines") : "continuous story"}</span>
              <span>{formatTime(performance.duration)}</span>
            </div>
          </div>
        </div>
        {playbackError ? <p className="story-player-error" role="alert">{playbackError}</p> : null}
      </section>
    </main>
  );
}
