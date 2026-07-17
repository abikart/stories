"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  GlassRenderer,
  type GlassRendererDiagnostics,
  type GlassRefractionTarget,
  type GlassRendererStatus,
  type RegisteredGlassLens,
} from "@/experience/glass/GlassRenderer";
import { measureGlassSource, type GlassSourceElement } from "@/experience/glass/source-compositor";
import { DEFAULT_LENS_OPTICS, type LensOptics, type LensShape } from "@/experience/glass/types";
import { getLensMapCacheStats } from "@/experience/glass/lens-map";

export type GlassSurfaceRegistration = {
  id: string;
  element: HTMLElement;
  shape: LensShape;
  optics: LensOptics;
  refractionTarget?: string;
};

export type GlassTargetPaintContext = {
  context: CanvasRenderingContext2D;
  stage: HTMLElement;
  width: number;
  height: number;
  dpr: number;
};

export type GlassTargetRegistration = {
  id: string;
  paint(target: GlassTargetPaintContext): void;
};

type GlassStageContextValue = {
  register(surface: GlassSurfaceRegistration): () => void;
  registerTarget(target: GlassTargetRegistration): () => void;
  animateSurface(id: string, durationMs: number): void;
  refresh(): void;
  status: GlassRendererStatus;
};

export const GlassStageContext = createContext<GlassStageContextValue | null>(null);

function matteTuple(color: string): readonly [number, number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  if (!match) return [1, 1, 1, 1];
  return [
    Number.parseInt(match[1].slice(0, 2), 16) / 255,
    Number.parseInt(match[1].slice(2, 4), 16) / 255,
    Number.parseInt(match[1].slice(4, 6), 16) / 255,
    1,
  ];
}

function numericRadius(style: CSSStyleDeclaration) {
  const radius = Number.parseFloat(style.borderTopLeftRadius);
  return Number.isFinite(radius) ? radius : 0;
}

export function GlassStage({
  children,
  matte,
  className,
  style,
  ...attributes
}: {
  children: ReactNode;
  matte: string;
} & HTMLAttributes<HTMLDivElement>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GlassRenderer | null>(null);
  const registrationsRef = useRef(new Map<string, GlassSurfaceRegistration>());
  const targetsRef = useRef(new Map<string, GlassTargetRegistration>());
  const targetCanvasesRef = useRef(new Map<string, { canvas: HTMLCanvasElement; version: number }>());
  const resizeObserversRef = useRef(new Map<string, ResizeObserver>());
  const surfaceAnimationsRef = useRef(new Map<string, number>());
  const pressAnimationsRef = useRef(new Map<string, number>());
  const pressAmountsRef = useRef(new Map<string, number>());
  const pressedIdsRef = useRef(new Set<string>());
  const intersectingRef = useRef(true);
  const [status, setStatus] = useState<GlassRendererStatus>("css");

  const collectSources = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return [];
    return [...stage.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
      ".story-player-media img, .story-player-media video",
    )].map((element) => measureGlassSource(
      element as GlassSourceElement,
      stage,
      element instanceof HTMLVideoElement,
    ));
  }, []);

  const paintTargets = useCallback((stageRect: DOMRect, renderer: GlassRenderer) => {
    const stage = stageRef.current;
    if (!stage) return;
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const targets: GlassRefractionTarget[] = [];
    const activeIds = new Set(targetsRef.current.keys());
    for (const id of targetCanvasesRef.current.keys()) {
      if (!activeIds.has(id)) targetCanvasesRef.current.delete(id);
    }
    for (const target of targetsRef.current.values()) {
      let record = targetCanvasesRef.current.get(target.id);
      if (!record) {
        record = { canvas: document.createElement("canvas"), version: 0 };
        targetCanvasesRef.current.set(target.id, record);
      }
      const pixelWidth = Math.max(1, Math.round(stageRect.width * dpr));
      const pixelHeight = Math.max(1, Math.round(stageRect.height * dpr));
      if (record.canvas.width !== pixelWidth || record.canvas.height !== pixelHeight) {
        record.canvas.width = pixelWidth;
        record.canvas.height = pixelHeight;
      }
      const context = record.canvas.getContext("2d");
      if (!context) continue;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, pixelWidth, pixelHeight);
      context.scale(dpr, dpr);
      target.paint({ context, stage, width: stageRect.width, height: stageRect.height, dpr });
      record.version += 1;
      targets.push({
        id: target.id,
        sources: [{
          element: record.canvas,
          x: 0,
          y: 0,
          width: stageRect.width,
          height: stageRect.height,
          opacity: 1,
          version: record.version,
        }],
      });
    }
    renderer.setRefractionTargets(targets);
  }, []);

  const refresh = useCallback(() => {
    const stage = stageRef.current;
    const renderer = rendererRef.current;
    if (!stage || !renderer) return;
    const stageRect = stage.getBoundingClientRect();
    renderer.resize(stageRect.width, stageRect.height);
    renderer.setSources(collectSources());
    const lenses: RegisteredGlassLens[] = [];
    for (const surface of registrationsRef.current.values()) {
      const rect = surface.element.getBoundingClientRect();
      const computed = getComputedStyle(surface.element);
      if (
        rect.width <= 0
        || rect.height <= 0
        || computed.display === "none"
        || computed.visibility === "hidden"
        || Number.parseFloat(computed.opacity) <= 0.01
      ) continue;
      const width = rect.width;
      const height = rect.height;
      const cornerRadius = surface.shape === "rounded-rect"
        ? Math.min(numericRadius(computed), width / 2, height / 2)
        : Math.min(width, height) / 2;
      lenses.push({
        id: surface.id,
        bounds: {
          x: rect.left - stageRect.left,
          y: rect.top - stageRect.top,
          width,
          height,
          cornerRadius,
          shape: surface.shape,
        },
        optics: surface.optics,
        refractionTarget: surface.refractionTarget,
      });
    }
    renderer.setLenses(lenses);
    paintTargets(stageRect, renderer);
    renderer.setTransitionActive(
      stage.querySelector(".experience-media")?.getAttribute("data-media-phase") === "transitioning",
    );
    renderer.requestRender();
  }, [collectSources, paintTargets]);

  const register = useCallback((surface: GlassSurfaceRegistration) => {
    registrationsRef.current.set(surface.id, surface);
    const observer = new ResizeObserver(refresh);
    observer.observe(surface.element);
    resizeObserversRef.current.get(surface.id)?.disconnect();
    resizeObserversRef.current.set(surface.id, observer);
    refresh();
    return () => {
      registrationsRef.current.delete(surface.id);
      resizeObserversRef.current.get(surface.id)?.disconnect();
      resizeObserversRef.current.delete(surface.id);
      refresh();
    };
  }, [refresh]);

  const registerTarget = useCallback((target: GlassTargetRegistration) => {
    targetsRef.current.set(target.id, target);
    refresh();
    return () => {
      targetsRef.current.delete(target.id);
      targetCanvasesRef.current.delete(target.id);
      refresh();
    };
  }, [refresh]);

  const animateSurface = useCallback((id: string, durationMs: number) => {
    const existing = surfaceAnimationsRef.current.get(id);
    if (existing !== undefined) cancelAnimationFrame(existing);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || durationMs <= 0) {
      refresh();
      return;
    }
    const started = performance.now();
    const step = (time: number) => {
      const stage = stageRef.current;
      const renderer = rendererRef.current;
      const surface = registrationsRef.current.get(id);
      if (!stage || !renderer || !surface) return;
      const stageRect = stage.getBoundingClientRect();
      const rect = surface.element.getBoundingClientRect();
      renderer.updateLensPosition(id, rect.left - stageRect.left, rect.top - stageRect.top);
      if (time - started < durationMs) {
        surfaceAnimationsRef.current.set(id, requestAnimationFrame(step));
      } else {
        surfaceAnimationsRef.current.delete(id);
        refresh();
      }
    };
    surfaceAnimationsRef.current.set(id, requestAnimationFrame(step));
  }, [refresh]);

  const animatePress = useCallback((id: string, pressed: boolean) => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const existing = pressAnimationsRef.current.get(id);
    if (existing !== undefined) cancelAnimationFrame(existing);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pressAmountsRef.current.set(id, 0);
      renderer.updateLensDeformation(id, 0);
      return;
    }
    const from = pressAmountsRef.current.get(id) ?? 0;
    const to = pressed ? 1 : 0;
    const duration = pressed ? 80 : 140;
    const started = performance.now();
    const step = (time: number) => {
      const progress = Math.min(1, Math.max(0, (time - started) / duration));
      const eased = 1 - Math.pow(1 - progress, 3);
      const amount = from + (to - from) * eased;
      pressAmountsRef.current.set(id, amount);
      rendererRef.current?.updateLensDeformation(id, amount);
      if (progress < 1) pressAnimationsRef.current.set(id, requestAnimationFrame(step));
      else pressAnimationsRef.current.delete(id);
    };
    pressAnimationsRef.current.set(id, requestAnimationFrame(step));
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const renderer = new GlassRenderer(canvas, {
      onStatus: (nextStatus) => setStatus(nextStatus),
      onDiagnostics: (diagnostics: Readonly<GlassRendererDiagnostics>) => {
        if (process.env.NODE_ENV === "production") return;
        stage.dataset.glassFrames = String(diagnostics.frames);
        stage.dataset.glassUploads = String(diagnostics.sourceUploads);
        stage.dataset.glassLenses = String(diagnostics.activeLenses);
        stage.dataset.glassSleeping = String(diagnostics.sleeping);
        stage.dataset.glassMapGenerations = String(getLensMapCacheStats().generations);
      },
    }, matteTuple(matte));
    rendererRef.current = renderer;
    const diagnosticWindow = window as typeof window & { __storiesGlassStage?: GlassRenderer };
    if (process.env.NODE_ENV !== "production") diagnosticWindow.__storiesGlassStage = renderer;
    renderer.setSourceResolver(collectSources);
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(stage);
    const mutationObserver = new MutationObserver(() => requestAnimationFrame(refresh));
    mutationObserver.observe(stage, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-active", "data-entering", "data-media-phase"],
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersectingRef.current = entry.isIntersecting;
      renderer.setVisible(entry.isIntersecting && !document.hidden);
    });
    intersectionObserver.observe(stage);
    const visibility = () => renderer.setVisible(intersectingRef.current && !document.hidden);
    const pressId = (target: EventTarget | null) => {
      if (!(target instanceof Element) || !target.closest("button, [role=button]")) return null;
      const explicit = target.closest<HTMLElement>("[data-glass-press-target]")?.dataset.glassPressTarget;
      return explicit ?? target.closest<HTMLElement>("[data-glass-surface]")?.dataset.glassSurface ?? null;
    };
    const press = (event: Event) => {
      const id = pressId(event.target);
      if (!id) return;
      pressedIdsRef.current.add(id);
      animatePress(id, true);
    };
    const release = () => {
      for (const id of pressedIdsRef.current) animatePress(id, false);
      pressedIdsRef.current.clear();
    };
    const keyPress = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== " " && event.key !== "Enter")) return;
      press(event);
    };
    document.addEventListener("visibilitychange", visibility);
    stage.addEventListener("pointerdown", press, true);
    stage.addEventListener("keydown", keyPress, true);
    window.addEventListener("pointerup", release, true);
    window.addEventListener("pointercancel", release, true);
    window.addEventListener("keyup", release, true);
    window.addEventListener("blur", release);
    refresh();
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      stage.removeEventListener("pointerdown", press, true);
      stage.removeEventListener("keydown", keyPress, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", release, true);
      window.removeEventListener("keyup", release, true);
      window.removeEventListener("blur", release);
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      for (const observer of resizeObserversRef.current.values()) observer.disconnect();
      resizeObserversRef.current.clear();
      for (const frame of surfaceAnimationsRef.current.values()) cancelAnimationFrame(frame);
      surfaceAnimationsRef.current.clear();
      for (const frame of pressAnimationsRef.current.values()) cancelAnimationFrame(frame);
      pressAnimationsRef.current.clear();
      renderer.destroy();
      rendererRef.current = null;
      if (diagnosticWindow.__storiesGlassStage === renderer) delete diagnosticWindow.__storiesGlassStage;
    };
  }, [animatePress, collectSources, matte, refresh]);

  const context = useMemo<GlassStageContextValue>(() => ({
    register,
    registerTarget,
    animateSurface,
    refresh,
    status,
  }), [animateSurface, refresh, register, registerTarget, status]);
  const stageStyle = { ...style, "--glass-stage-status": status } as CSSProperties;

  return (
    <GlassStageContext.Provider value={context}>
      <div
        {...attributes}
        ref={stageRef}
        className={className}
        style={stageStyle}
        data-glass-renderer={status}
      >
        {children}
        <canvas ref={canvasRef} className="glass-stage-canvas" data-glass-canvas aria-hidden="true" />
      </div>
    </GlassStageContext.Provider>
  );
}

export function mergeLensOptics(optics?: Partial<LensOptics>): LensOptics {
  return {
    ...DEFAULT_LENS_OPTICS,
    ...optics,
    tint: optics?.tint ?? DEFAULT_LENS_OPTICS.tint,
  };
}
