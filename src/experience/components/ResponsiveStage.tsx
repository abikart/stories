"use client";

import { useRef, useState, type CSSProperties } from "react";
import type {
  ExperiencePhrase,
  ExperienceProduction,
} from "@/experience/schema";
import {
  MediaDeck,
  type MediaDeckHandle,
  type MediaDeckSnapshot,
} from "@/experience/media/MediaDeck";

type StageStyle = CSSProperties & {
  "--experience-accent": string;
  "--experience-backdrop": string;
  "--focal-x": string;
  "--focal-y": string;
  "--anchor-x": string;
  "--anchor-y": string;
};

function assetUrl(storyId: string, asset: string) {
  return `/content/${storyId}/${asset}`;
}

function primaryPhrase(production: ExperienceProduction): ExperiencePhrase {
  const phrase = production.scenes[0]?.phrases[0];
  if (!phrase) throw new Error("Responsive stage fixture requires a phrase");
  return phrase;
}

export function ResponsiveStage({ production }: { production: ExperienceProduction }) {
  const deckRef = useRef<MediaDeckHandle>(null);
  const [playing, setPlaying] = useState(true);
  const [debug, setDebug] = useState(false);
  const [snapshot, setSnapshot] = useState<MediaDeckSnapshot>({
    current: production.scenes[0].media[0].id,
    phase: "idle",
    loaded: [],
  });
  const scene = production.scenes[0];
  const video = scene.media[0];
  const phrase = primaryPhrase(production);
  const focalPoint = video.focalPoint ?? production.stage.defaultFocalPoint;
  const anchor = phrase.overlay.anchor ?? { x: 0.5, y: 0.5 };
  const poster = assetUrl(production.id, video.poster ?? production.stage.backdrop.poster);
  const style: StageStyle = {
    "--experience-accent": production.accent,
    "--experience-backdrop": `url("${assetUrl(production.id, production.stage.backdrop.poster)}")`,
    "--focal-x": `${focalPoint.x * 100}%`,
    "--focal-y": `${focalPoint.y * 100}%`,
    "--anchor-x": `${anchor.x * 100}%`,
    "--anchor-y": `${anchor.y * 100}%`,
    backgroundColor: production.stage.backdrop.color,
  };

  async function togglePlayback() {
    const next = !playing;
    await deckRef.current?.setPlaying(next);
    setPlaying(next);
  }

  return (
    <main className="experience-shell" style={style} data-debug={debug || undefined}>
      <div className="experience-atmosphere" aria-hidden="true" />

      <header className="experience-header">
        <div>
          <p className="experience-eyebrow">v2 responsive-stage fixture</p>
          <h1>{production.title}</h1>
          <p className="experience-logline">{production.logline}</p>
        </div>
        <span className="experience-preset" aria-label="active responsive preset">
          <span className="preset-pocket">Pocket</span>
          <span className="preset-book">Book</span>
          <span className="preset-cinema">Cinema</span>
        </span>
      </header>

      <section className="experience-composition" aria-label="responsive story stage">
        <div className="experience-stage">
          <MediaDeck
            ref={deckRef}
            storyId={production.id}
            scene={scene}
            fallbackPoster={production.stage.backdrop.poster}
            onSnapshot={setSnapshot}
          />

          <div
            className="experience-bubble"
            data-kind={phrase.overlay.kind}
            data-mobile-policy={phrase.overlay.mobilePolicy}
          >
            <span className="experience-speaker">{phrase.speaker}</span>
            <p>{phrase.text}</p>
          </div>
        </div>

        <div className="experience-controls" aria-label="stage controls">
          <button type="button" onClick={togglePlayback} aria-pressed={!playing}>
            <span className="experience-control-icon" aria-hidden="true">
              {playing ? "Ⅱ" : "▶"}
            </span>
            {playing ? "Pause scene" : "Play scene"}
          </button>
          <button type="button" onClick={() => setDebug((value) => !value)} aria-pressed={debug}>
            <span className="experience-control-icon" aria-hidden="true">⌗</span>
            {debug ? "Hide guides" : "Show guides"}
          </button>
        </div>
        <div className="experience-state-controls" aria-label="media state controls">
          <span>Current: {snapshot.current}</span>
          {(scene.media.find((state) => state.id === snapshot.current)?.transitionsTo ?? []).map((target) => (
            <button
              type="button"
              key={target}
              onClick={() => void deckRef.current?.transitionTo(target)}
            >
              Transition to {target}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void deckRef.current?.runCanonicalPath()}
            disabled={snapshot.phase === "loading" || snapshot.phase === "transitioning"}
          >
            Run canonical path
          </button>
        </div>
      </section>
    </main>
  );
}
