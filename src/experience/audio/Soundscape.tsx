"use client";

import {
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
  type SyntheticEvent,
} from "react";
import type { Performance } from "@/experience/schema";

export type SoundscapeHandle = {
  play(time: number): Promise<void>;
  pause(): void;
  seek(time: number): void;
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

  function elements() {
    return [musicRef.current, ambienceRef.current, effectsRef.current].filter(
      (stem): stem is HTMLAudioElement => Boolean(stem),
    );
  }

  function seek(time: number) {
    pendingTimeRef.current = time;
    elements().forEach((stem) => {
      if (stem.readyState >= 1) stem.currentTime = Math.min(time, Math.max(0, stem.duration - 0.02));
    });
  }

  useImperativeHandle(ref, () => ({
    async play(time: number) {
      seek(time);
      await Promise.all(elements().map((stem) => stem.play().catch(() => undefined)));
    },
    pause() {
      elements().forEach((stem) => stem.pause());
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
        <audio ref={musicRef} src={assetUrl(storyId, stems.music)} preload="auto" onLoadedMetadata={(event) => prepare(event, 0.24)} />
      ) : null}
      {stems.ambience ? (
        <audio ref={ambienceRef} src={assetUrl(storyId, stems.ambience)} preload="auto" onLoadedMetadata={(event) => prepare(event, 0.3)} />
      ) : null}
      {stems.effects ? (
        <audio ref={effectsRef} src={assetUrl(storyId, stems.effects)} preload="auto" onLoadedMetadata={(event) => prepare(event, 0.7)} />
      ) : null}
    </>
  );
}));
