"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  type SyntheticEvent,
} from "react";
import type { Performance } from "@/experience/schema";

export type SoundscapeHandle = {
  play(time: number): Promise<void>;
  enterReadingPause(time: number): Promise<void>;
  resumeFromReadingPause(time: number): Promise<void>;
  pause(): void;
  seek(time: number): void;
};

const MUSIC_VOLUME = 0.24;
const AMBIENCE_VOLUME = 0.3;
const READING_AMBIENCE_VOLUME = 0.36;
const EFFECTS_VOLUME = 0.7;
const DUCK_MS = 240;
const RESTORE_MS = 320;

type PendingFade = {
  frame: number;
  resolve: () => void;
};

function assetUrl(storyId: string, asset: string) {
  return `/content/${storyId}/${asset}`;
}

export const Soundscape = memo(forwardRef<SoundscapeHandle, {
  storyId: string;
  stems: NonNullable<Performance["stems"]>;
}>(function Soundscape({ storyId, stems }, ref) {
  const musicRef = useRef<HTMLAudioElement>(null);
  const ambienceRef = useRef<HTMLAudioElement>(null);
  const effectsRef = useRef<HTMLAudioElement>(null);
  const pendingTimeRef = useRef(0);
  const fadesRef = useRef(new Map<HTMLAudioElement, PendingFade>());
  const transitionTokenRef = useRef(0);

  function elements() {
    return [musicRef.current, ambienceRef.current, effectsRef.current].filter(
      (stem): stem is HTMLAudioElement => Boolean(stem),
    );
  }

  function timeFor(stem: HTMLAudioElement, time: number) {
    return Math.min(time, Math.max(0, stem.duration - 0.02));
  }

  function cancelFade(stem: HTMLAudioElement) {
    const pending = fadesRef.current.get(stem);
    if (!pending) return;
    cancelAnimationFrame(pending.frame);
    fadesRef.current.delete(stem);
    pending.resolve();
  }

  function fadeTo(stem: HTMLAudioElement, target: number, duration: number) {
    cancelFade(stem);
    const from = stem.volume;
    if (duration <= 0 || Math.abs(from - target) < 0.001) {
      stem.volume = target;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const startedAt = performance.now();
      const pending: PendingFade = { frame: 0, resolve };
      const step = (now: number) => {
        const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
        const eased = 1 - ((1 - progress) ** 3);
        stem.volume = from + ((target - from) * eased);
        if (progress >= 1) {
          fadesRef.current.delete(stem);
          resolve();
          return;
        }
        pending.frame = requestAnimationFrame(step);
      };
      pending.frame = requestAnimationFrame(step);
      fadesRef.current.set(stem, pending);
    });
  }

  function seek(time: number) {
    pendingTimeRef.current = time;
    elements().forEach((stem) => {
      if (stem.readyState >= 1) stem.currentTime = timeFor(stem, time);
    });
  }

  useEffect(() => () => {
    transitionTokenRef.current += 1;
    for (const stem of fadesRef.current.keys()) cancelFade(stem);
  }, []);

  useImperativeHandle(ref, () => ({
    async play(time: number) {
      transitionTokenRef.current += 1;
      seek(time);
      if (musicRef.current) {
        cancelFade(musicRef.current);
        musicRef.current.volume = MUSIC_VOLUME;
      }
      if (ambienceRef.current) {
        cancelFade(ambienceRef.current);
        ambienceRef.current.volume = AMBIENCE_VOLUME;
      }
      if (effectsRef.current) effectsRef.current.volume = EFFECTS_VOLUME;
      await Promise.all(elements().map((stem) => stem.play().catch(() => undefined)));
    },
    async enterReadingPause(time: number) {
      const token = transitionTokenRef.current + 1;
      transitionTokenRef.current = token;
      pendingTimeRef.current = time;
      const effects = effectsRef.current;
      if (effects) {
        effects.pause();
        if (effects.readyState >= 1) effects.currentTime = timeFor(effects, time);
      }

      const ambience = ambienceRef.current;
      if (ambience) {
        await ambience.play().catch(() => undefined);
        void fadeTo(ambience, READING_AMBIENCE_VOLUME, DUCK_MS);
      }

      const music = musicRef.current;
      if (music) {
        await fadeTo(music, 0, DUCK_MS);
        if (transitionTokenRef.current !== token) return;
        music.pause();
        if (music.readyState >= 1) music.currentTime = timeFor(music, time);
      }
    },
    async resumeFromReadingPause(time: number) {
      transitionTokenRef.current += 1;
      pendingTimeRef.current = time;
      const music = musicRef.current;
      const effects = effectsRef.current;
      const ambience = ambienceRef.current;

      if (music) {
        cancelFade(music);
        if (music.readyState >= 1) music.currentTime = timeFor(music, time);
        music.volume = 0;
      }
      if (effects) {
        if (effects.readyState >= 1) effects.currentTime = timeFor(effects, time);
        effects.volume = EFFECTS_VOLUME;
      }

      await Promise.all([
        music?.play().catch(() => undefined),
        effects?.play().catch(() => undefined),
        ambience?.play().catch(() => undefined),
      ]);
      if (music) void fadeTo(music, MUSIC_VOLUME, RESTORE_MS);
      if (ambience) void fadeTo(ambience, AMBIENCE_VOLUME, RESTORE_MS);
    },
    pause() {
      transitionTokenRef.current += 1;
      elements().forEach((stem) => {
        cancelFade(stem);
        stem.pause();
      });
    },
    seek,
  }));

  function prepare(event: SyntheticEvent<HTMLAudioElement>, volume: number) {
    event.currentTarget.volume = volume;
    event.currentTarget.currentTime = Math.min(
      pendingTimeRef.current,
      Math.max(0, event.currentTarget.duration - 0.02),
    );
  }

  return (
    <>
      {stems.music ? (
        <audio data-soundscape-stem="music" ref={musicRef} src={assetUrl(storyId, stems.music)} preload="auto" onLoadedMetadata={(event) => prepare(event, MUSIC_VOLUME)} />
      ) : null}
      {stems.ambience ? (
        <audio data-soundscape-stem="ambience" ref={ambienceRef} src={assetUrl(storyId, stems.ambience)} preload="auto" loop onLoadedMetadata={(event) => prepare(event, AMBIENCE_VOLUME)} />
      ) : null}
      {stems.effects ? (
        <audio data-soundscape-stem="effects" ref={effectsRef} src={assetUrl(storyId, stems.effects)} preload="auto" onLoadedMetadata={(event) => prepare(event, EFFECTS_VOLUME)} />
      ) : null}
    </>
  );
}));
