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
import { GlassStage, type GlassTargetPaintContext } from "@/experience/glass/GlassStage";
import { GlassSurface } from "@/experience/glass/GlassSurface";
import { GlassRefractionTarget } from "@/experience/glass/GlassRefractionTarget";

type PlayerMode = "watch" | "read";
type ReadingPhase = "idle" | "settling" | "reading" | "resuming";

const READING_SETTLE_MS = 420;
const READING_EXIT_MS = 180;
const READING_TARGET_LEAD_MS = 500;
const READING_AUDIO_LEAD_SECONDS = 0.32;

type PlayerStyle = CSSProperties & {
  "--experience-accent": string;
  "--experience-matte": string;
  "--focal-x": string;
  "--focal-y": string;
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
  const castByName = useMemo(
    () => new Map(production.cast.map((member) => [member.name.toLocaleLowerCase(), member])),
    [production.cast],
  );
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
  const paintModeTarget = useCallback(({ context, stage }: GlassTargetPaintContext) => {
    const switchElement = stage.querySelector<HTMLElement>(".story-mode-switch");
    if (!switchElement) return;
    const stageRect = stage.getBoundingClientRect();
    const switchRect = switchElement.getBoundingClientRect();
    const x = switchRect.left - stageRect.left;
    const y = switchRect.top - stageRect.top;
    const width = switchRect.width;
    const height = switchRect.height;
    const inset = 3;
    const gap = 3;
    const optionWidth = (width - inset * 2 - gap) / 2;
    const selectedX = x + inset + (mode === "read" ? optionWidth + gap : 0);
    context.save();
    context.beginPath();
    context.roundRect(x, y, width, height, height / 2);
    context.clip();
    context.fillStyle = "rgba(226, 239, 228, 0.78)";
    context.fillRect(x, y, width, height);
    context.strokeStyle = "rgba(82, 125, 96, 0.22)";
    context.lineWidth = 1;
    for (let lineX = x - height; lineX < x + width + height; lineX += 9) {
      context.beginPath();
      context.moveTo(lineX, y + height);
      context.lineTo(lineX + height, y);
      context.stroke();
    }
    context.fillStyle = "rgba(127, 169, 134, 0.42)";
    context.beginPath();
    context.roundRect(selectedX, y + inset, optionWidth, height - inset * 2, (height - inset * 2) / 2);
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.82)";
    context.lineWidth = 2;
    context.stroke();
    context.restore();
  }, [mode]);
  const paintTitleTarget = useCallback(({ context, stage }: GlassTargetPaintContext) => {
    const title = stage.querySelector<HTMLElement>("[data-glass-surface=title]");
    if (!title) return;
    const stageRect = stage.getBoundingClientRect();
    const rect = title.getBoundingClientRect();
    const x = rect.left - stageRect.left;
    const y = rect.top - stageRect.top;
    context.save();
    context.beginPath();
    context.roundRect(x, y, rect.width, rect.height, 18);
    context.clip();
    context.strokeStyle = "rgba(86, 126, 96, 0.2)";
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(x - 8, y + rect.height * 0.7);
    context.bezierCurveTo(
      x + rect.width * 0.28,
      y + rect.height * 0.42,
      x + rect.width * 0.7,
      y + rect.height * 0.9,
      x + rect.width + 8,
      y + rect.height * 0.55,
    );
    context.stroke();
    context.restore();
  }, []);
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
  const speaker = castByName.get(displayUnit.speaker.toLocaleLowerCase());
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
  const stageStyle: PlayerStyle = {
    "--experience-accent": production.accent,
    "--experience-matte": production.stage.backdrop.color,
    "--focal-x": `${focal.x * 100}%`,
    "--focal-y": `${focal.y * 100}%`,
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
      data-at-start={snapshot.time === 0 && !snapshot.playing ? "true" : undefined}
    >
      <section className="story-player-composition" aria-label="Interactive story player">
        <GlassStage className="story-player-stage" matte={production.stage.backdrop.color}>
          <GlassRefractionTarget id="mode-accent" paint={paintModeTarget} />
          <GlassRefractionTarget id="title-accent" paint={paintTitleTarget} />
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

          <header className="story-player-header">
            <GlassSurface
              glassId="title"
              refractionTarget="title-accent"
              optics={{
                displacementStrength: 4,
                curvature: 3,
                splay: 0.22,
                depth: 0.68,
                centerScale: 0.025,
                chromaticFringe: 0.42,
                specularIntensity: 0.28,
              }}
              className="story-player-title story-glass story-glass--quiet"
            >
              <span>A Lanternleaf story</span>
              <h1>{production.title}</h1>
            </GlassSurface>
            <div className="story-mode-switch story-glass story-glass--control" data-active-mode={mode} role="group" aria-label="Story mode">
              <GlassSurface
                glassId="mode"
                shape="pill"
                refractionTarget="mode-accent"
                motionKey={mode}
                motionDuration={220}
                optics={{ displacementStrength: 12, splay: 0.42, chromaticFringe: 0.9, specularIntensity: 0.48 }}
                className="story-mode-lens"
                aria-hidden="true"
              />
              <button type="button" aria-pressed={mode === "watch"} onClick={() => changeMode("watch")}>
                Watch
              </button>
              <button type="button" aria-pressed={mode === "read"} onClick={() => changeMode("read")}>
                Read with me
              </button>
            </div>
          </header>

          <GlassSurface
            glassId="dialogue"
            className="story-overlay story-glass story-glass--reading"
            optics={{
              displacementStrength: 5,
              curvature: 3,
              splay: 0.24,
              depth: 0.72,
              centerScale: 0.03,
              chromaticFringe: 0.5,
              specularIntensity: 0.32,
            }}
            data-kind={displayUnit.overlay.kind}
            data-placement={displayUnit.overlay.placement ?? scene.overlayPlacement}
            data-has-portrait={speaker ? "true" : undefined}
            data-mobile-policy={displayUnit.overlay.mobilePolicy}
            data-reading-phase={waiting ? readingPhase : undefined}
          >
            {waiting && !requiredInteraction ? (
              <div className="story-reading-passage story-overlay-content" role="group" aria-label="Reading passage" key={`passage-${waiting.id}`}>
                <span className="story-reading-passage-heading" aria-live="polite">Your turn</span>
                <ol aria-label="Lines to read">
                  {passageUnits.map((unit) => {
                    const passageSpeaker = castByName.get(unit.speaker.toLocaleLowerCase());
                    return (
                      <li className="story-reading-line" data-has-portrait={passageSpeaker ? "true" : undefined} data-reading-line key={unit.id}>
                        {passageSpeaker ? (
                          <img
                            className="story-reading-portrait"
                            src={assetUrl(production.id, passageSpeaker.portrait)}
                            alt={passageSpeaker.portraitAlt}
                          />
                        ) : null}
                        <p>{unit.text}</p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : (
              <div className="story-overlay-content" key={displayUnit.id}>
                {speaker ? (
                  <img
                    className="story-overlay-portrait"
                    src={assetUrl(production.id, speaker.portrait)}
                    alt={speaker.portraitAlt}
                  />
                ) : null}
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
          </GlassSurface>

          {snapshot.time === 0 && !snapshot.playing ? (
            <GlassSurface
              glassId="start"
              optics={{
                displacementStrength: 6,
                curvature: 2.8,
                splay: 0.3,
                depth: 0.75,
                centerScale: 0.035,
                chromaticFringe: 0.58,
                specularIntensity: 0.36,
              }}
              className="story-start-card story-glass story-glass--reading"
            >
              <span>{mode === "watch" ? "Story time" : "Read together"}</span>
              <p>{mode === "watch" ? "Settle in. The story is about to begin." : "The story will wait after each thought."}</p>
              <button type="button" onClick={togglePlayback}>
                Begin story
              </button>
            </GlassSurface>
          ) : null}

          <GlassSurface
            glassId="transport"
            shape="pill"
            optics={{
              displacementStrength: 15,
              chromaticFringe: 1.05,
              specularIntensity: 0.5,
            }}
            className="story-transport story-glass story-glass--control"
            aria-label="Story controls"
          >
            <button className="story-icon-button" type="button" onClick={replay} aria-label="Replay story">
              ↺
            </button>
            <button
              className="story-play-button"
              type="button"
              onClick={togglePlayback}
              disabled={requiredInteraction || Boolean(waiting && readingPhase !== "reading")}
            >
              {requiredInteraction ? "Guide along path" : waiting ? "Continue" : snapshot.playing ? "Pause" : snapshot.ended ? "Play again" : "Play"}
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
                <span>{requiredInteraction ? "complete the story action" : mode === "read" ? (waiting ? "waiting for you" : "pauses at safe lines") : "continuous story"}</span>
                <span>{formatTime(performance.duration)}</span>
              </div>
            </div>
          </GlassSurface>
        </GlassStage>

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
        {playbackError ? <p className="story-player-error" role="alert">{playbackError}</p> : null}
      </section>
    </main>
  );
}
