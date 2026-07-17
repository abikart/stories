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
import type {
  ExperienceScene,
  MediaState,
  SceneMotionLayer,
} from "@/experience/schema";
import { createMediaGraph } from "@/experience/media/graph";

const CROSSFADE_MS = 420;
const CANONICAL_HOLD_MS = 650;

type LayerStyle = CSSProperties & {
  "--media-poster": string;
  "--media-focal-x": string;
  "--media-focal-y": string;
};

type MotionLayerStyle = CSSProperties & {
  "--layer-anchor-x": string;
  "--layer-anchor-y": string;
  "--layer-scale": string;
};

export type MediaDeckSnapshot = {
  current: string;
  phase: "idle" | "loading" | "transitioning" | "error";
  loaded: readonly string[];
};

export type MediaDeckHandle = {
  transitionTo(stateId: string): Promise<boolean>;
  syncTo(stateId: string): Promise<boolean>;
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
  const poster = state.kind === "poster" ? state.src : state.poster ?? fallbackPoster;
  return {
    "--media-poster": `url("${assetUrl(storyId, poster)}")`,
    "--media-focal-x": `${focal.x * 100}%`,
    "--media-focal-y": `${focal.y * 100}%`,
  };
}

function motionLayerStyle(layer: SceneMotionLayer): MotionLayerStyle {
  return {
    "--layer-anchor-x": `${layer.anchor.x * 100}%`,
    "--layer-anchor-y": `${layer.anchor.y * 100}%`,
    "--layer-scale": String(layer.scale),
    opacity: layer.opacity,
    mixBlendMode: layer.blendMode,
  };
}

function videoKeys(state: MediaState) {
  if (!state.composition) return state.kind === "video" ? ["state"] : [];
  const keys = state.composition.layers
    .filter((layer) => layer.kind === "video")
    .map((layer) => `layer:${layer.id}`);
  if (state.composition.plate.kind === "video") keys.unshift("plate");
  return keys;
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
  const videoRefs = useRef<Array<Map<string, HTMLVideoElement>>>([new Map(), new Map()]);
  const readyBySlot = useRef<Array<string | null>>([null, null]);
  const currentRef = useRef(graph.initial.id);
  const activeSlotRef = useRef(0);
  const playingRef = useRef(true);
  const reducedMotionRef = useRef(false);
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
    const incoming = [...videoRefs.current[pending.slot].values()];
    incoming.forEach((video) => { video.currentTime = 0; });
    if (playingRef.current && !reducedMotionRef.current) {
      incoming.forEach((video) => { void video.play().catch(() => undefined); });
    }
    setEnteringSlot(pending.slot);
    publish("transitioning");

    window.setTimeout(() => {
      if (pendingRef.current?.token !== pending.token) return;
      const oldSlot = activeSlotRef.current;
      videoRefs.current[oldSlot].forEach((video) => video.pause());
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

  const maybeMarkReady = useCallback((slot: number, stateId: string) => {
    const keys = videoKeys(graph.requireState(stateId));
    const refs = videoRefs.current[slot];
    if (keys.every((key) => (refs.get(key)?.readyState ?? 0) >= 2)) {
      markReady(slot, stateId);
    }
  }, [graph, markReady]);

  const registerVideo = useCallback((
    slot: number,
    key: string,
    stateId: string,
    element: HTMLVideoElement | null,
  ) => {
    if (element) videoRefs.current[slot].set(key, element);
    else videoRefs.current[slot].delete(key);
    if (element) maybeMarkReady(slot, stateId);
  }, [maybeMarkReady]);

  const moveTo = useCallback((stateId: string, requireGraphEdge: boolean) => {
    const from = currentRef.current;
    if (stateId === from) {
      const pending = pendingRef.current;
      if (pending && pending.stateId !== stateId) {
        pendingRef.current = null;
        transitionToken.current += 1;
        setEnteringSlot(null);
        pending.resolve(false);

        const likely = graph.likelyNext(from) ?? graph.requireState(from);
        readyBySlot.current[pending.slot] = null;
        setSlots((previous) => {
          const next: [string, string] = [...previous];
          next[pending.slot] = likely.id;
          slotsRef.current = next;
          return next;
        });
        publish("idle", from);
      }
      return Promise.resolve(true);
    }
    if (requireGraphEdge && !graph.canTransition(from, stateId)) return Promise.resolve(false);

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
      const target = graph.requireState(stateId);
      const alreadyDecoded = currentSlots[targetSlot] === stateId
        && videoKeys(target).every(
          (key) => (videoRefs.current[targetSlot].get(key)?.readyState ?? 0) >= 2,
        );
      if (alreadyDecoded) readyBySlot.current[targetSlot] = stateId;
      if (readyBySlot.current[targetSlot] === stateId) beginCrossfade(pending);
    });
  }, [beginCrossfade, graph, publish]);

  const transitionTo = useCallback(
    (stateId: string) => moveTo(stateId, true),
    [moveTo],
  );

  const syncTo = useCallback(
    (stateId: string) => moveTo(stateId, false),
    [moveTo],
  );

  const setPlaying = useCallback(async (playing: boolean) => {
    playingRef.current = playing;
    const relevant = enteringSlot === null ? [activeSlotRef.current] : [activeSlotRef.current, enteringSlot];
    if (playing && !reducedMotionRef.current) {
      await Promise.all(relevant.flatMap((slot) =>
        [...videoRefs.current[slot].values()].map((video) => video.play().catch(() => undefined)),
      ));
    } else {
      relevant.forEach((slot) => videoRefs.current[slot].forEach((video) => video.pause()));
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

  useImperativeHandle(
    ref,
    () => ({ transitionTo, syncTo, runCanonicalPath, setPlaying }),
    [runCanonicalPath, setPlaying, syncTo, transitionTo],
  );

  useEffect(() => {
    slots.forEach((stateId, slot) => {
      const state = graph.requireState(stateId);
      if (videoKeys(state).length === 0) markReady(slot, stateId);
      else maybeMarkReady(slot, stateId);
    });
  }, [graph, markReady, maybeMarkReady, slots]);

  useEffect(() => () => {
    transitionToken.current += 1;
    canonicalToken.current += 1;
    pendingRef.current?.resolve(false);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reconcile = () => {
      reducedMotionRef.current = query.matches;
      const relevant = enteringSlot === null
        ? [activeSlotRef.current]
        : [activeSlotRef.current, enteringSlot];
      relevant.forEach((slot) => videoRefs.current[slot].forEach((video) => {
        if (query.matches || !playingRef.current) video.pause();
        else void video.play().catch(() => undefined);
      }));
    };
    reconcile();
    query.addEventListener("change", reconcile);
    return () => query.removeEventListener("change", reconcile);
  }, [enteringSlot]);

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
            {state.composition ? (
              <div className="layered-scene" data-layer-count={state.composition.layers.length}>
                {state.composition.plate.kind === "video" ? (
                  <video
                    className="layered-scene-plate"
                    ref={(element) => registerVideo(slot, "plate", stateId, element)}
                    src={assetUrl(storyId, state.composition.plate.src)}
                    poster={state.composition.plate.poster
                      ? assetUrl(storyId, state.composition.plate.poster)
                      : undefined}
                    autoPlay={active}
                    muted
                    loop={state.composition.plate.loop ?? true}
                    playsInline
                    preload="auto"
                    data-fit={state.composition.plate.fit}
                    onLoadedData={() => maybeMarkReady(slot, stateId)}
                    onCanPlay={() => maybeMarkReady(slot, stateId)}
                    onError={() => handleError(slot, stateId)}
                  />
                ) : (
                  <img
                    className="layered-scene-plate"
                    src={assetUrl(storyId, state.composition.plate.src)}
                    alt=""
                    data-fit={state.composition.plate.fit}
                  />
                )}
                {state.composition.layers.map((layer) => (
                  <div
                    className="layered-scene-motion"
                    data-role={layer.role}
                    key={layer.id}
                    style={motionLayerStyle(layer)}
                  >
                    {layer.kind === "video" ? (
                      <video
                        ref={(element) => registerVideo(slot, `layer:${layer.id}`, stateId, element)}
                        poster={layer.poster ? assetUrl(storyId, layer.poster) : undefined}
                        autoPlay={active}
                        muted
                        loop={layer.loop ?? state.loop}
                        playsInline
                        preload="auto"
                        data-fit={layer.fit}
                        onLoadedData={() => maybeMarkReady(slot, stateId)}
                        onCanPlay={() => maybeMarkReady(slot, stateId)}
                        onError={() => handleError(slot, stateId)}
                      >
                        {layer.renditions.map((rendition) => (
                          <source
                            key={`${rendition.src}-${rendition.mimeType}`}
                            src={assetUrl(storyId, rendition.src)}
                            type={rendition.mimeType}
                          />
                        ))}
                        {layer.fallback ? (
                          <source
                            src={assetUrl(storyId, layer.fallback.src)}
                            type={layer.fallback.mimeType}
                          />
                        ) : null}
                      </video>
                    ) : (
                      <img
                        src={assetUrl(storyId, layer.renditions[0].src)}
                        alt=""
                        data-fit={layer.fit}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : state.kind === "video" ? (
              <video
                ref={(element) => registerVideo(slot, "state", stateId, element)}
                src={assetUrl(storyId, state.src)}
                poster={assetUrl(storyId, state.poster ?? fallbackPoster)}
                autoPlay={active}
                muted
                loop={state.loop}
                playsInline
                preload="auto"
                onLoadedData={() => maybeMarkReady(slot, stateId)}
                onCanPlay={() => maybeMarkReady(slot, stateId)}
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
