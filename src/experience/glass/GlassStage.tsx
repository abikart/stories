"use client";

import {
  Component,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, useFBO } from "@react-three/drei";
import * as THREE from "three";
import { GlassSourceScene, type GlassSourceElement } from "@/experience/glass/source-scene";
import { type GlassOptics, type GlassRefractionTarget, type GlassShape } from "@/experience/glass/types";
import { getLensMap, lensMapCacheStats } from "@/experience/glass/lens-model";

export type GlassSurfaceRegistration = {
  id: string;
  element: HTMLElement;
  shape: GlassShape;
  optics: GlassOptics;
  refractionTarget?: GlassRefractionTarget;
  pressAmount: number;
};

type GlassStageContextValue = {
  register(surface: GlassSurfaceRegistration): () => void;
  animateSurface(durationMs: number): void;
};

type GlassDiagnostics = {
  status: "css" | "webgl";
  frames: number;
  sourceCount: number;
  surfaceCount: number;
  sleeping: boolean;
  dpr: number;
  frameTimeMs: number;
  mapCache: { size: number; hits: number; misses: number };
  simulateContextLoss(): void;
  simulateContextRestore(): void;
};

declare global {
  interface Window {
    __storiesGlassStage?: GlassDiagnostics;
  }
}

export const GlassStageContext = createContext<GlassStageContextValue | null>(null);

function numericRadius(element: HTMLElement, shape: GlassShape) {
  const rect = element.getBoundingClientRect();
  if (shape !== "rounded-rect") return Math.min(rect.width, rect.height) / 2;
  const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius);
  return Math.min(Number.isFinite(radius) ? radius : 0, rect.width / 2, rect.height / 2);
}

function makeLensGeometry(width: number, height: number, radius: number, shape: GlassShape) {
  const depth = Math.max(6, Math.min(13, height * 0.2));
  const bevel = Math.max(1.5, Math.min(4, depth * 0.32, radius * 0.22));
  const shapeWidth = Math.max(1, width - bevel * 2);
  const shapeHeight = Math.max(1, height - bevel * 2);
  const shapeRadius = Math.max(0, Math.min(radius - bevel, shapeWidth / 2, shapeHeight / 2));
  const lens = new THREE.Shape();

  if (shape === "circle") {
    lens.absarc(0, 0, Math.max(1, Math.min(shapeWidth, shapeHeight) / 2), 0, Math.PI * 2, false);
  } else {
    const left = -shapeWidth / 2;
    const right = shapeWidth / 2;
    const bottom = -shapeHeight / 2;
    const top = shapeHeight / 2;
    lens.moveTo(left + shapeRadius, bottom);
    lens.lineTo(right - shapeRadius, bottom);
    lens.quadraticCurveTo(right, bottom, right, bottom + shapeRadius);
    lens.lineTo(right, top - shapeRadius);
    lens.quadraticCurveTo(right, top, right - shapeRadius, top);
    lens.lineTo(left + shapeRadius, top);
    lens.quadraticCurveTo(left, top, left, top - shapeRadius);
    lens.lineTo(left, bottom + shapeRadius);
    lens.quadraticCurveTo(left, bottom, left + shapeRadius, bottom);
  }

  const geometry = new THREE.ExtrudeGeometry(lens, {
    depth,
    steps: 1,
    curveSegments: 24,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: bevel,
    bevelThickness: depth * 0.42,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function LensMesh({
  registration,
  stage,
  revision,
  buffer,
}: {
  registration: GlassSurfaceRegistration;
  stage: HTMLElement;
  revision: number;
  buffer: THREE.Texture;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initial = registration.element.getBoundingClientRect();
  const radius = numericRadius(registration.element, registration.shape);
  const geometry = useMemo(
    () => makeLensGeometry(initial.width, initial.height, radius, registration.shape),
    // The revision deliberately rebuilds geometry only after layout changes, not during travel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initial.width, initial.height, radius, registration.shape, revision],
  );
  const lensMap = useMemo(
    () => getLensMap(
      initial.width,
      initial.height,
      radius,
      registration.shape,
      Math.min(0.45, (registration.optics.ior - 1) * 1.2 + registration.optics.thickness / 160),
    ),
    [initial.height, initial.width, radius, registration.optics.ior, registration.optics.thickness, registration.shape],
  );
  const normalScale = useMemo(() => new THREE.Vector2(0.42, 0.42), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rect = registration.element.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const style = getComputedStyle(registration.element);
    mesh.visible = rect.width > 0
      && rect.height > 0
      && style.display !== "none"
      && style.visibility !== "hidden"
      && Number.parseFloat(style.opacity) > 0.01;
    if (!mesh.visible) return;
    mesh.position.set(
      rect.left - stageRect.left + rect.width / 2 - stageRect.width / 2,
      stageRect.height / 2 - (rect.top - stageRect.top + rect.height / 2),
      0,
    );
    const targetScale = 1 - registration.pressAmount * 0.04;
    const nextScale = THREE.MathUtils.damp(mesh.scale.x, targetScale, 18, delta);
    mesh.scale.setScalar(nextScale);
  });

  const optics = registration.optics;
  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false} renderOrder={20}>
      <MeshTransmissionMaterial
        buffer={buffer}
        samples={6}
        transmission={1}
        roughness={optics.roughness}
        thickness={optics.thickness}
        ior={optics.ior}
        chromaticAberration={optics.chromaticAberration}
        anisotropicBlur={optics.anisotropicBlur}
        distortion={optics.distortion}
        distortionScale={optics.distortionScale}
        temporalDistortion={0}
        color="#ffffff"
        attenuationColor={optics.attenuationColor}
        attenuationDistance={optics.attenuationDistance}
        clearcoat={optics.clearcoat}
        clearcoatRoughness={optics.clearcoatRoughness}
        specularIntensity={optics.specularIntensity}
        specularColor="#ffffff"
        envMapIntensity={0.35}
        normalMap={lensMap.texture}
        normalScale={normalScale}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function GlassWorld({
  stage,
  matte,
  sources,
  registrations,
  revision,
  onFrame,
}: {
  stage: HTMLElement;
  matte: string;
  sources: readonly GlassSourceElement[];
  registrations: readonly GlassSurfaceRegistration[];
  revision: number;
  onFrame(sourceCount: number, frameTimeMs: number, dpr: number): void;
}) {
  const { gl, size, camera } = useThree();
  const sourceScene = useMemo(() => new GlassSourceScene(), []);
  const dpr = Math.min(2, gl.getPixelRatio());
  const target = useFBO(
    Math.max(1, Math.round(size.width * dpr)),
    Math.max(1, Math.round(size.height * dpr)),
    { depthBuffer: false, stencilBuffer: false, samples: 0, type: THREE.UnsignedByteType },
  );

  useEffect(() => {
    sourceScene.setElements(sources);
    return () => sourceScene.setElements([]);
  }, [sourceScene, sources]);

  useEffect(() => {
    sourceScene.setTargets(registrations.flatMap((registration) => registration.refractionTarget
      ? [{ element: registration.element, ...registration.refractionTarget }]
      : []));
    return () => sourceScene.setTargets([]);
  }, [registrations, sourceScene]);

  useEffect(() => () => sourceScene.destroy(), [sourceScene]);

  useFrame(() => {
    const started = performance.now();
    if (camera instanceof THREE.OrthographicCamera) {
      camera.left = -size.width / 2;
      camera.right = size.width / 2;
      camera.top = size.height / 2;
      camera.bottom = -size.height / 2;
      camera.updateProjectionMatrix();
    }
    sourceScene.update(stage, size.width, size.height);
    const previousTarget = gl.getRenderTarget();
    const previousColor = gl.getClearColor(new THREE.Color());
    const previousAlpha = gl.getClearAlpha();
    gl.setRenderTarget(target);
    gl.setClearColor(matte, 1);
    gl.clear(true, false, false);
    gl.render(sourceScene.scene, sourceScene.camera);
    gl.setRenderTarget(previousTarget);
    gl.setClearColor(previousColor, previousAlpha);
    onFrame(sourceScene.activeCount, performance.now() - started, dpr);
  }, -1);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[-180, 220, 260]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[240, -120, 180]} intensity={0.55} color="#dff6e5" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3.6} color="#ffffff" position={[-3, 4, -5]} scale={[7, 3, 1]} />
        <Lightformer form="rect" intensity={2.1} color="#effff6" position={[4, -2, -4]} scale={[5, 2, 1]} />
      </Environment>
      {registrations.map((registration) => (
        <LensMesh
          key={registration.id}
          registration={registration}
          stage={stage}
          revision={revision}
          buffer={target.texture}
        />
      ))}
    </>
  );
}

class GlassCanvasBoundary extends Component<{
  children: ReactNode;
  onError(): void;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function sameElements(a: readonly GlassSourceElement[], b: readonly GlassSourceElement[]) {
  return a.length === b.length && a.every((element, index) => element === b[index]);
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
  const registrationsRef = useRef(new Map<string, GlassSurfaceRegistration>());
  const surfaceObserversRef = useRef(new Map<string, ResizeObserver>());
  const invalidateRef = useRef<(() => void) | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const contextCleanupRef = useRef<(() => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wakeUntilRef = useRef(0);
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const sourcesRef = useRef<readonly GlassSourceElement[]>([]);
  const diagnosticsRef = useRef<GlassDiagnostics>({
    status: "css",
    frames: 0,
    sourceCount: 0,
    surfaceCount: 0,
    sleeping: true,
    dpr: 1,
    frameTimeMs: 0,
    mapCache: { size: 0, hits: 0, misses: 0 },
    simulateContextLoss() {},
    simulateContextRestore() {},
  });
  const [status, setStatus] = useState<"css" | "webgl">("css");
  const [stageElement, setStageElement] = useState<HTMLDivElement | null>(null);
  const [sources, setSources] = useState<readonly GlassSourceElement[]>([]);
  const [registrations, setRegistrations] = useState<readonly GlassSurfaceRegistration[]>([]);
  const [revision, setRevision] = useState(0);

  const hasAdvancingVideo = useCallback(() => sourcesRef.current.some((element) =>
    element instanceof HTMLVideoElement
    && !element.paused
    && !element.ended
    && element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
  ), []);

  const tick = useCallback((time: number) => {
    animationFrameRef.current = null;
    if (!visibleRef.current || document.hidden || diagnosticsRef.current.status !== "webgl") {
      diagnosticsRef.current.sleeping = true;
      return;
    }
    invalidateRef.current?.();
    if (time < wakeUntilRef.current || hasAdvancingVideo()) {
      diagnosticsRef.current.sleeping = false;
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      diagnosticsRef.current.sleeping = true;
    }
  }, [hasAdvancingVideo]);

  const wake = useCallback((durationMs = 80) => {
    if (reducedMotionRef.current) durationMs = Math.min(durationMs, 32);
    wakeUntilRef.current = Math.max(wakeUntilRef.current, performance.now() + durationMs);
    if (animationFrameRef.current === null) animationFrameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const refreshSources = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const next = [...stage.querySelectorAll<HTMLImageElement | HTMLVideoElement | HTMLCanvasElement>(
      ".story-player-media img, .story-player-media video, [data-glass-source]",
    )].filter((element): element is GlassSourceElement =>
      element instanceof HTMLImageElement
      || element instanceof HTMLVideoElement
      || element instanceof HTMLCanvasElement,
    );
    if (!sameElements(sourcesRef.current, next)) {
      sourcesRef.current = next;
      setSources(next);
    }
    wake(180);
  }, [wake]);

  const register = useCallback((surface: GlassSurfaceRegistration) => {
    registrationsRef.current.set(surface.id, surface);
    setRegistrations([...registrationsRef.current.values()]);
    diagnosticsRef.current.surfaceCount = registrationsRef.current.size;
    const observer = new ResizeObserver(() => {
      setRevision((value) => value + 1);
      wake(180);
    });
    observer.observe(surface.element);
    surfaceObserversRef.current.get(surface.id)?.disconnect();
    surfaceObserversRef.current.set(surface.id, observer);
    wake(180);
    return () => {
      registrationsRef.current.delete(surface.id);
      surfaceObserversRef.current.get(surface.id)?.disconnect();
      surfaceObserversRef.current.delete(surface.id);
      setRegistrations([...registrationsRef.current.values()]);
      diagnosticsRef.current.surfaceCount = registrationsRef.current.size;
      wake(120);
    };
  }, [wake]);

  const animateSurface = useCallback((durationMs: number) => wake(durationMs + 50), [wake]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const resizeObserver = new ResizeObserver(() => {
      setRevision((value) => value + 1);
      wake(180);
    });
    resizeObserver.observe(stage);
    const mutationObserver = new MutationObserver(() => {
      refreshSources();
      setRevision((value) => value + 1);
      wake(620);
    });
    mutationObserver.observe(stage, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-active", "data-entering", "data-media-phase", "data-active-mode"],
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) wake(180);
    });
    intersectionObserver.observe(stage);
    const visibility = () => {
      if (!document.hidden) wake(180);
    };
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches) {
        for (const surface of registrationsRef.current.values()) surface.pressAmount = 0;
      }
      wake(80);
    };
    const pressId = (target: EventTarget | null) => {
      if (!(target instanceof Element) || !target.closest("button, [role=button]")) return null;
      const explicit = target.closest<HTMLElement>("[data-glass-press-target]")?.dataset.glassPressTarget;
      return explicit ?? target.closest<HTMLElement>("[data-glass-surface]")?.dataset.glassSurface ?? null;
    };
    const press = (event: Event) => {
      if (reducedMotionRef.current) return;
      const id = pressId(event.target);
      const surface = id ? registrationsRef.current.get(id) : null;
      if (!surface) return;
      surface.pressAmount = 1;
      wake(140);
    };
    const release = () => {
      for (const surface of registrationsRef.current.values()) surface.pressAmount = 0;
      wake(190);
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
    motionQuery.addEventListener("change", motion);
    motion();
    refreshSources();
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      stage.removeEventListener("pointerdown", press, true);
      stage.removeEventListener("keydown", keyPress, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", release, true);
      window.removeEventListener("keyup", release, true);
      window.removeEventListener("blur", release);
      motionQuery.removeEventListener("change", motion);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
      for (const observer of surfaceObserversRef.current.values()) observer.disconnect();
      surfaceObserversRef.current.clear();
    };
  }, [refreshSources, wake]);

  useEffect(() => {
    window.__storiesGlassStage = diagnosticsRef.current;
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      contextCleanupRef.current?.();
      if (window.__storiesGlassStage === diagnosticsRef.current) delete window.__storiesGlassStage;
    };
  }, []);

  const onCreated = useCallback(({ gl, invalidate }: { gl: THREE.WebGLRenderer; invalidate: () => void }) => {
    contextCleanupRef.current?.();
    rendererRef.current = gl;
    invalidateRef.current = invalidate;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.setClearColor(0x000000, 0);
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      setStatus("css");
      diagnosticsRef.current.status = "css";
      diagnosticsRef.current.sleeping = true;
    };
    const restored = () => {
      setStatus("webgl");
      diagnosticsRef.current.status = "webgl";
      wake(240);
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    contextCleanupRef.current = () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
    diagnosticsRef.current.simulateContextLoss = () => gl.getContext().getExtension("WEBGL_lose_context")?.loseContext();
    diagnosticsRef.current.simulateContextRestore = () => gl.getContext().getExtension("WEBGL_lose_context")?.restoreContext();
    setStatus("webgl");
    diagnosticsRef.current.status = "webgl";
    window.__storiesGlassStage = diagnosticsRef.current;
    wake(240);
  }, [wake]);

  const onFrame = useCallback((sourceCount: number, frameTimeMs: number, dpr: number) => {
    const diagnostics = diagnosticsRef.current;
    window.__storiesGlassStage = diagnostics;
    diagnostics.frames += 1;
    diagnostics.sourceCount = sourceCount;
    diagnostics.frameTimeMs = frameTimeMs;
    diagnostics.dpr = dpr;
    diagnostics.mapCache = lensMapCacheStats();
    const stage = stageRef.current;
    if (stage) {
      stage.dataset.glassFrames = String(diagnostics.frames);
      stage.dataset.glassSources = String(sourceCount);
      stage.dataset.glassSleeping = String(diagnostics.sleeping);
    }
  }, []);

  const context = useMemo<GlassStageContextValue>(() => ({ register, animateSurface }), [animateSurface, register]);
  const stageStyle = { ...style, "--glass-stage-status": status } as CSSProperties;
  const attachStage = useCallback((element: HTMLDivElement | null) => {
    stageRef.current = element;
    setStageElement(element);
  }, []);

  return (
    <GlassStageContext.Provider value={context}>
      <div
        {...attributes}
        ref={attachStage}
        className={className}
        style={stageStyle}
        data-glass-renderer={status}
      >
        {children}
        {stageElement ? (
          <GlassCanvasBoundary onError={() => setStatus("css")}>
            <Canvas
              className="glass-stage-canvas"
              data-glass-canvas
              aria-hidden="true"
              orthographic
              camera={{ position: [0, 0, 100], near: 0.1, far: 300, zoom: 1 }}
              dpr={[1, 2]}
              frameloop="demand"
              gl={{ alpha: true, antialias: true, powerPreference: "high-performance", premultipliedAlpha: true }}
              fallback={<span data-glass-fallback aria-hidden="true" />}
              onCreated={onCreated}
            >
              <GlassWorld
                stage={stageElement}
                matte={matte}
                sources={sources}
                registrations={registrations}
                revision={revision}
                onFrame={onFrame}
              />
            </Canvas>
          </GlassCanvasBoundary>
        ) : null}
      </div>
    </GlassStageContext.Provider>
  );
}
