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
  type GlassRendererStatus,
  type RegisteredGlassLens,
} from "@/experience/glass/GlassRenderer";
import { measureGlassSource, type GlassSourceElement } from "@/experience/glass/source-compositor";
import { DEFAULT_LENS_OPTICS, type LensOptics, type LensShape } from "@/experience/glass/types";

export type GlassSurfaceRegistration = {
  id: string;
  element: HTMLElement;
  shape: LensShape;
  optics: LensOptics;
  refractionTarget?: string;
};

type GlassStageContextValue = {
  register(surface: GlassSurfaceRegistration): () => void;
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
  const resizeObserversRef = useRef(new Map<string, ResizeObserver>());
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
    renderer.setTransitionActive(
      stage.querySelector(".experience-media")?.getAttribute("data-media-phase") === "transitioning",
    );
    renderer.requestRender();
  }, [collectSources]);

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
    document.addEventListener("visibilitychange", visibility);
    refresh();
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      for (const observer of resizeObserversRef.current.values()) observer.disconnect();
      resizeObserversRef.current.clear();
      renderer.destroy();
      rendererRef.current = null;
      if (diagnosticWindow.__storiesGlassStage === renderer) delete diagnosticWindow.__storiesGlassStage;
    };
  }, [collectSources, matte, refresh]);

  const context = useMemo<GlassStageContextValue>(() => ({ register, refresh, status }), [refresh, register, status]);
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
