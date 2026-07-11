"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { ExperienceScene, MediaState } from "@/experience/schema";
import { createMediaGraph } from "@/experience/media/graph";

const CROSSFADE_MS = 420;
const CANONICAL_HOLD_MS = 650;

type LayerStyle = CSSProperties & {
  "--media-poster": string;
  "--media-focal-x": string;
  "--media-focal-y": string;
};

export type MediaDeckSnapshot = {
  current: string;
  phase: "idle" | "loading" | "transitioning" | "error";
  loaded: readonly string[];
};

export type MediaDeckHandle = {
  transitionTo(stateId: string): Promise<boolean>;
  runCanonicalPath(): Promise<boolean>;
  setPlaying(playing: boolean): Promise<void>;
};

type PendingTransition = {
  resolve: (completed: boolean) => void;
  slot: number;
  stateId: string;
  token: number;
};

function assetUrl(storyId: string, asset: string) {
  return `/content/${storyId}/${asset}`;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function layerStyle(storyId: string, state: MediaState, fallbackPoster: string): LayerStyle {
  const focal = state.focalPoint ?? { x: 0.5, y: 0.5 };
  return {
    "--media-poster": `url("${assetUrl(storyId, state.poster ?? fallbackPoster)}")`,
    "--media-focal-x": `${focal.x * 100}%`,
    "--media-focal-y": `${focal.y * 100}%`,
  };
}

export const MediaDeck = forwardRef<MediaDeckHandle, {
  storyId: string;
  scene: ExperienceScene;
  fallbackPoster: string;
  onSnapshot?: (snapshot: MediaDeckSnapshot) => void;
}>(function MediaDeck({ storyId, scene, fallbackPoster, onSnapshot }, ref) {
  const graph = useMemo(() => createMediaGraph(scene), [scene]);
  const initialNext = graph.likelyNext(graph.initial.id) ?? graph.initial;
  const [slots, setSlots] = useState<[string, string]>([graph.initial.id, initialNext.id]);
  const slotsRef = useRef<[string, string]>([graph.initial.id, initialNext.id]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [enteringSlot, setEnteringSlot] = useState<number | null>(null);
  const [phase, setPhase] = useState<MediaDeckSnapshot["phase"]>("idle");
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([null, null]);
  const readyBySlot = useRef<Array<string | null>>([null, null]);
  const currentRef = useRef(graph.initial.id);
  const activeSlotRef = useRef(0);
  const playingRef = useRef(true);
  const pendingRef = useRef<PendingTransition | null>(null);
  const transitionToken = useRef(0);
  const canonicalToken = useRef(0);

  const publish = useCallback((nextPhase: MediaDeckSnapshot["phase"], nextCurrent = currentRef.current) => {
    setPhase(nextPhase);
    onSnapshot?.({
      current: nextCurrent,
      phase: nextPhase,
      loaded: slotsRef.current.filter((id, index) => readyBySlot.current[index] === id),
    });
  }, [onSnapshot]);

  const beginCrossfade = useCallback((pending: PendingTransition) => {
    if (pendingRef.current?.token !== pending.token) return;
    const incoming = videoRefs.current[pending.slot];
    if (incoming) {
      incoming.currentTime = 0;
      if (playingRef.current) void incoming.play().catch(() => undefined);
    }
    setEnteringSlot(pending.slot);
    publish("transitioning");

    window.setTimeout(() => {
      if (pendingRef.current?.token !== pending.token) return;
      const oldSlot = activeSlotRef.current;
      videoRefs.current[oldSlot]?.pause();
      activeSlotRef.current = pending.slot;
      currentRef.current = pending.stateId;
      setActiveSlot(pending.slot);
      setEnteringSlot(null);
      pendingRef.current = null;
      pending.resolve(true);
      publish("idle", pending.stateId);

      const likely = graph.likelyNext(pending.stateId) ?? graph.requireState(pending.stateId);
      readyBySlot.current[oldSlot] = null;
      setSlots((previous) => {
        const next: [string, string] = [...previous];
        next[oldSlot] = likely.id;
        slotsRef.current = next;
        return next;
      });
    }, CROSSFADE_MS);
  }, [graph, publish]);

  const markReady = useCallback((slot: number, stateId: string) => {
    readyBySlot.current[slot] = stateId;
    const pending = pendingRef.current;
    if (pending && pending.slot === slot && pending.stateId === stateId) beginCrossfade(pending);
  }, [beginCrossfade]);

  const transitionTo = useCallback((stateId: string) => {
    const from = currentRef.current;
    if (stateId === from) return Promise.resolve(true);
    if (!graph.canTransition(from, stateId)) return Promise.resolve(false);

    pendingRef.current?.resolve(false);
    transitionToken.current += 1;
    const token = transitionToken.current;
    const targetSlot = 1 - activeSlotRef.current;
    const currentSlots = slotsRef.current;
    setEnteringSlot(null);
    readyBySlot.current[targetSlot] = currentSlots[targetSlot] === stateId
      ? readyBySlot.current[targetSlot]
      : null;
    setSlots((previous) => {
      if (previous[targetSlot] === stateId) return previous;
      const next: [string, string] = [...previous];
      next[targetSlot] = stateId;
      slotsRef.current = next;
      return next;
    });
    publish("loading");

    return new Promise<boolean>((resolve) => {
      const pending = { resolve, slot: targetSlot, stateId, token };
      pendingRef.current = pending;
      const alreadyDecoded = currentSlots[targetSlot] === stateId
        && (graph.requireState(stateId).kind !== "video"
          || (videoRefs.current[targetSlot]?.readyState ?? 0) >= 2);
      if (alreadyDecoded) readyBySlot.current[targetSlot] = stateId;
      if (readyBySlot.current[targetSlot] === stateId) beginCrossfade(pending);
    });
  }, [beginCrossfade, graph, publish]);

  const setPlaying = useCallback(async (playing: boolean) => {
    playingRef.current = playing;
    const relevant = enteringSlot === null ? [activeSlotRef.current] : [activeSlotRef.current, enteringSlot];
    if (playing) {
      await Promise.all(relevant.map((slot) => videoRefs.current[slot]?.play().catch(() => undefined)));
    } else {
      relevant.forEach((slot) => videoRefs.current[slot]?.pause());
    }
  }, [enteringSlot]);

  const runCanonicalPath = useCallback(async () => {
    canonicalToken.current += 1;
    const token = canonicalToken.current;
    const path = [...graph.canonicalPath];
    let start = path.indexOf(currentRef.current);

    if (start === path.length - 1) {
      const reset = path[0];
      if (!graph.canTransition(currentRef.current, reset)) return false;
      if (!(await transitionTo(reset))) return false;
      await wait(CANONICAL_HOLD_MS);
      start = 0;
    } else if (start < 0) {
      start = -1;
    }

    for (let index = start + 1; index < path.length; index++) {
      if (canonicalToken.current !== token) return false;
      if (!(await transitionTo(path[index]))) return false;
      if (index < path.length - 1) await wait(CANONICAL_HOLD_MS);
    }
    return true;
  }, [graph, transitionTo]);

  useImperativeHandle(ref, () => ({ transitionTo, runCanonicalPath, setPlaying }), [runCanonicalPath, setPlaying, transitionTo]);

  useEffect(() => {
    slots.forEach((stateId, slot) => {
      const state = graph.requireState(stateId);
      if (state.kind !== "video" || (videoRefs.current[slot]?.readyState ?? 0) >= 2) {
        markReady(slot, stateId);
      }
    });
  }, [graph, markReady, slots]);

  useEffect(() => () => {
    transitionToken.current += 1;
    canonicalToken.current += 1;
    pendingRef.current?.resolve(false);
  }, []);

  function handleError(slot: number, stateId: string) {
    const pending = pendingRef.current;
    if (pending?.slot === slot && pending.stateId === stateId) {
      pendingRef.current = null;
      setEnteringSlot(null);
      pending.resolve(false);
      publish("error");
    }
  }

  return (
    <div
      className="experience-media"
      data-media-state={slots[activeSlot]}
      data-media-phase={phase}
      aria-label="native media state player"
    >
      {slots.map((stateId, slot) => {
        const state = graph.requireState(stateId);
        const active = slot === activeSlot;
        const entering = slot === enteringSlot;
        return (
          <div
            className="experience-media-layer"
            key={`${slot}-${stateId}`}
            style={layerStyle(storyId, state, fallbackPoster)}
            data-active={active || undefined}
            data-entering={entering || undefined}
            aria-hidden={!active && !entering}
          >
            {state.kind === "video" ? (
              <video
                ref={(element) => { videoRefs.current[slot] = element; }}
                src={assetUrl(storyId, state.src)}
                poster={assetUrl(storyId, state.poster ?? fallbackPoster)}
                autoPlay={active}
                muted
                loop={state.loop}
                playsInline
                preload="auto"
                onLoadedData={() => markReady(slot, stateId)}
                onCanPlay={() => markReady(slot, stateId)}
                onError={() => handleError(slot, stateId)}
              />
            ) : null}
          </div>
        );
      })}
      <div className="experience-vignette" aria-hidden="true" />
      <div className="experience-action-safe" aria-hidden="true">
        <span>center 4:3 action-safe</span>
      </div>
      <output className="experience-state-badge" aria-live="polite">
        {slots[activeSlot]} · {phase}
      </output>
    </div>
  );
});
