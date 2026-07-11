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
import { flattenPhrases } from "@/experience/performance/timeline";
import { DragToGuide } from "@/experience/interactions/DragToGuide";
import { Soundscape, type SoundscapeHandle } from "@/experience/audio/Soundscape";

type PlayerMode = "watch" | "read";

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
};

function assetUrl(storyId: string, asset: string) {
  return `/content/${storyId}/${asset}`;
}

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function ExperiencePlayer({ production }: { production: ExperienceProduction }) {
  if (!production.performance) throw new Error("Interactive playback requires performance metadata");

  const performance = production.performance;
  const phrases = useMemo(() => flattenPhrases(production), [production]);
  const safeStops = useMemo<SafeStop[]>(() => phrases.flatMap((phrase, phraseIndex) => (
    phrase.safeStopAfter ? [{ id: phrase.id, phraseIndex, time: phrase.end }] : []
  )), [phrases]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const soundscapeRef = useRef<SoundscapeHandle>(null);
  const clockRef = useRef<PerformanceClock | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const deckRef = useRef<MediaDeckHandle>(null);
  const stopCursorRef = useRef(0);
  const [mode, setMode] = useState<PlayerMode>("watch");
  const [displayPhraseIndex, setDisplayPhraseIndex] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [waiting, setWaiting] = useState<SafeStop | null>(null);
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

  const play = useCallback(async (clock: PerformanceClock | null) => {
    if (!clock) return;
    setPlaybackError("");
    try {
      const time = audioRef.current?.currentTime ?? 0;
      await Promise.all([clock.play(), soundscapeRef.current?.play(time)]);
    } catch {
      setPlaybackError("Your browser blocked narration. Tap play again or open the story in Chrome or Safari.");
    }
  }, []);

  useEffect(() => () => {
    unsubscribeRef.current?.();
    clockRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (snapshot.phraseIndex < 0) return;
    setDisplayPhraseIndex(snapshot.phraseIndex);
    setActiveSceneIndex(snapshot.sceneIndex);
  }, [snapshot.phraseIndex, snapshot.sceneIndex]);

  useEffect(() => {
    void deckRef.current?.setPlaying(snapshot.playing);
    if (!snapshot.playing) soundscapeRef.current?.pause();
    soundscapeRef.current?.seek(snapshot.time);
  }, [activeSceneIndex, snapshot.playing]);

  useEffect(() => {
    if (mode !== "read" || waiting || !snapshot.playing) return;
    const stop = safeStops[stopCursorRef.current];
    if (!stop || snapshot.time < stop.time) return;
    clockRef.current?.pause();
    stopCursorRef.current += 1;
    setDisplayPhraseIndex(stop.phraseIndex);
    setWaiting(stop);
  }, [mode, safeStops, snapshot.playing, snapshot.time, waiting]);

  const phrase = phrases[displayPhraseIndex] ?? phrases[0];
  const scene = production.scenes[activeSceneIndex] ?? production.scenes[0];
  const interaction = scene.interaction;
  const interactionTrigger = interaction
    ? phrases.find((candidate) => candidate.id === interaction.triggerAfterPhrase)
    : null;
  const interactionComplete = completedInteractions.has(scene.id);
  const requiredInteraction = Boolean(
    interaction && !interactionComplete && mode === "read" && waiting?.id === interaction.triggerAfterPhrase,
  );
  const recipeMode = requiredInteraction
    ? "interactive"
    : interaction && !interactionComplete && mode === "watch"
      && snapshot.time >= (interactionTrigger?.end ?? Number.POSITIVE_INFINITY)
      ? "canonical"
      : null;
  const media = scene.media[0];
  const focal = media.focalPoint ?? production.stage.defaultFocalPoint;
  const anchor = phrase.overlay.anchor ?? { x: 0.5, y: 0.5 };
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
    ? (phrase.words?.length ?? 1) - 1
    : phrase.id === phrases[snapshot.phraseIndex]?.id
      ? snapshot.wordIndex
      : (phrase.words?.length ?? 1) - 1;

  function changeMode(nextMode: PlayerMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setStopCursor(snapshot.time);
    if (nextMode === "watch" && waiting) {
      setWaiting(null);
      void play(clockRef.current);
    }
  }

  function togglePlayback() {
    if (requiredInteraction) return;
    const clock = initializeClock(audioRef.current);
    if (!clock) return;
    if (waiting) {
      setWaiting(null);
      void play(clock);
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
    stopCursorRef.current = 0;
    setWaiting(null);
    setDisplayPhraseIndex(0);
    setActiveSceneIndex(0);
    setCompletedInteractions(new Set());
    setPlaybackError("");
    clock.seek(0);
    void play(clock);
  }

  function seek(time: number) {
    setWaiting(null);
    setStopCursor(time);
    setCompletedInteractions((current) => {
      const next = new Set(current);
      for (const candidate of production.scenes) {
        const trigger = candidate.interaction
          ? phrases.find((phraseCandidate) => phraseCandidate.id === candidate.interaction?.triggerAfterPhrase)
          : null;
        if (trigger && time < trigger.end) next.delete(candidate.id);
      }
      return next;
    });
    soundscapeRef.current?.seek(time);
    clockRef.current?.seek(time);
  }

  async function completeInteraction() {
    if (!interaction || completedInteractions.has(scene.id)) return;
    await deckRef.current?.transitionTo(interaction.completeMediaState);
    setCompletedInteractions((current) => new Set(current).add(scene.id));
    if (waiting?.id === interaction.triggerAfterPhrase) {
      setWaiting(null);
      void play(clockRef.current);
    }
  }

  return (
    <main className="story-player" style={stageStyle} data-mode={mode} data-waiting={waiting ? "true" : undefined}>
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
            data-kind={phrase.overlay.kind}
            data-placement={phrase.overlay.placement ?? "above"}
            data-mobile-policy={phrase.overlay.mobilePolicy}
            style={overlayStyle}
          >
            <div className="story-overlay-content" key={phrase.id}>
              <span className="story-overlay-speaker">{phrase.speaker}</span>
              <p aria-label={phrase.text}>
                {phrase.words?.map((word, index) => (
                  <span
                    aria-hidden="true"
                    key={`${phrase.id}-${index}`}
                    data-word-state={index < shownWordIndex ? "past" : index === shownWordIndex ? "active" : "future"}
                  >
                    {word.text}{" "}
                  </span>
                )) ?? phrase.text}
              </p>
            </div>
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

          {waiting && !requiredInteraction ? (
            <div className="story-wait-card" role="status">
              <span>Your turn</span>
              <p>Take your time with the words. Pip will wait.</p>
              <button type="button" onClick={togglePlayback}>Continue the story</button>
            </div>
          ) : null}
        </div>

        <audio
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
          <button className="story-play-button" type="button" onClick={togglePlayback} disabled={requiredInteraction}>
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
