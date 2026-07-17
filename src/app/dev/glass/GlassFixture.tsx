"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  GlassRenderer,
  type GlassRendererDiagnostics,
  type GlassRendererStatus,
  type RegisteredGlassLens,
} from "@/experience/glass/GlassRenderer";
import {
  getCachedLensMap,
  getLensMapCacheStats,
  type LensMapCacheStats,
} from "@/experience/glass/lens-map";
import { DEFAULT_LENS_OPTICS, type LensGeometry, type LensOptics } from "@/experience/glass/types";
import { measureGlassSource } from "@/experience/glass/source-compositor";

const GEOMETRIES: LensGeometry[] = [
  { shape: "pill", width: 190, height: 76, cornerRadius: 38 },
  { shape: "rounded-rect", width: 236, height: 146, cornerRadius: 34 },
  { shape: "circle", width: 132, height: 132, cornerRadius: 66 },
];

const EMPTY_STATS: LensMapCacheStats = { hits: 0, misses: 0, generations: 0, entries: 0 };
const EMPTY_RENDERER_DIAGNOSTICS: GlassRendererDiagnostics = {
  status: "css",
  frames: 0,
  activeLenses: 0,
  sourceUploads: 0,
  mapUploads: 0,
  contextLosses: 0,
  restorations: 0,
  frameTimeMs: 0,
  sleeping: true,
  dpr: 1,
};

function drawGrid(canvas: HTMLCanvasElement) {
  const width = 1120;
  const height = 560;
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#17201a";
  context.lineWidth = 2;
  for (let x = 0; x <= width; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.fillStyle = "#ff314f";
  context.fillRect(width * 0.48, 0, width * 0.04, height);
  context.fillStyle = "#175cff";
  context.fillRect(0, height * 0.48, width, height * 0.04);
}

function lensBounds(element: HTMLElement, stage: HTMLElement, geometry: LensGeometry) {
  const stageRect = stage.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return {
    ...geometry,
    x: rect.left - stageRect.left,
    y: rect.top - stageRect.top,
    width: rect.width,
    height: rect.height,
    cornerRadius: geometry.shape === "rounded-rect"
      ? Math.min(geometry.cornerRadius, rect.width / 2, rect.height / 2)
      : Math.min(rect.width, rect.height) / 2,
  };
}

function DisplacementMap({ geometry, optics }: { geometry: LensGeometry; optics: LensOptics }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const map = useMemo(() => getCachedLensMap(geometry, optics), [geometry, optics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    canvas.width = map.width;
    canvas.height = map.height;
    context.putImageData(
      new ImageData(new Uint8ClampedArray(map.data), map.width, map.height),
      0,
      0,
    );
  }, [map]);

  return <canvas ref={canvasRef} className="glass-fixture-map" aria-label={`${geometry.shape} signed displacement map`} />;
}

function Range({
  label,
  value,
  minimum,
  maximum,
  step,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  onChange(value: number): void;
}) {
  return (
    <label className="glass-fixture-range">
      <span>{label}</span>
      <input type="range" min={minimum} max={maximum} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <output>{value.toFixed(step < 1 ? 2 : 0)}</output>
    </label>
  );
}

export function GlassFixture() {
  const [optics, setOptics] = useState<LensOptics>({ ...DEFAULT_LENS_OPTICS });
  const [position, setPosition] = useState(16);
  const [stats, setStats] = useState<LensMapCacheStats>(EMPTY_STATS);
  const [rendererStatus, setRendererStatus] = useState<GlassRendererStatus>("css");
  const [rendererDiagnostics, setRendererDiagnostics] = useState<GlassRendererDiagnostics>(EMPTY_RENDERER_DIAGNOSTICS);
  const stageRef = useRef<HTMLElement>(null);
  const rendererCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const roundedRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<GlassRenderer | null>(null);
  const movingGeometry = GEOMETRIES[0];
  const movingMap = useMemo(() => getCachedLensMap(movingGeometry, optics), [movingGeometry, optics]);

  useEffect(() => setStats(getLensMapCacheStats()), [movingMap, position]);

  useEffect(() => {
    if (gridRef.current) drawGrid(gridRef.current);
  }, []);

  useEffect(() => {
    const canvas = rendererCanvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const renderer = new GlassRenderer(canvas, {
      onStatus: setRendererStatus,
      onDiagnostics: setRendererDiagnostics,
    });
    rendererRef.current = renderer;
    const fixtureWindow = window as typeof window & { __storiesGlassFixture?: GlassRenderer };
    fixtureWindow.__storiesGlassFixture = renderer;
    const resizeObserver = new ResizeObserver(() => {
      const rect = stage.getBoundingClientRect();
      renderer.resize(rect.width, rect.height);
      renderer.requestRender();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => renderer.setVisible(entry.isIntersecting));
    resizeObserver.observe(stage);
    intersectionObserver.observe(stage);
    const visibility = () => renderer.setVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    const rect = stage.getBoundingClientRect();
    renderer.resize(rect.width, rect.height);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.destroy();
      rendererRef.current = null;
      delete fixtureWindow.__storiesGlassFixture;
    };
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    const stage = stageRef.current;
    const grid = gridRef.current;
    const still = stillRef.current;
    const video = videoRef.current;
    const pill = pillRef.current;
    const rounded = roundedRef.current;
    const circle = circleRef.current;
    if (!renderer || !stage || !grid || !still || !video || !pill || !rounded || !circle) return;
    const sources = [
      measureGlassSource(grid, stage),
      measureGlassSource(still, stage),
      measureGlassSource(video, stage, true),
    ];
    const lenses: RegisteredGlassLens[] = [
      { id: "moving-pill", bounds: lensBounds(pill, stage, GEOMETRIES[0]), optics },
      { id: "still-rounded", bounds: lensBounds(rounded, stage, GEOMETRIES[1]), optics },
      { id: "video-circle", bounds: lensBounds(circle, stage, GEOMETRIES[2]), optics },
    ];
    renderer.setSources(sources);
    renderer.setLenses(lenses);
    renderer.requestRender();
    setStats(getLensMapCacheStats());
  }, [optics, position, rendererStatus]);

  const update = (name: keyof LensOptics, value: number) => {
    setOptics((current) => ({ ...current, [name]: value }));
  };
  const movingStyle = {
    "--fixture-lens-x": `${position}%`,
    width: movingGeometry.width,
    height: movingGeometry.height,
    borderRadius: movingGeometry.cornerRadius,
  } as CSSProperties;

  return (
    <main className="glass-fixture-shell">
      <header className="glass-fixture-header">
        <p>Stories optics laboratory</p>
        <h1>Portable liquid-glass displacement</h1>
        <p>The neutral gray field outside each shape leaves source pixels untouched. Red and green encode signed horizontal and vertical bend.</p>
      </header>

      <section className="glass-fixture-controls" aria-label="Lens optical parameters">
        <Range label="Scale" value={optics.displacementStrength} minimum={0} maximum={28} step={1} onChange={(value) => update("displacementStrength", value)} />
        <Range label="Depth" value={optics.depth} minimum={0} maximum={1.5} step={0.05} onChange={(value) => update("depth", value)} />
        <Range label="Curvature" value={optics.curvature} minimum={0.25} maximum={6} step={0.05} onChange={(value) => update("curvature", value)} />
        <Range label="Splay" value={optics.splay} minimum={0.04} maximum={1} step={0.02} onChange={(value) => update("splay", value)} />
        <Range label="Chroma" value={optics.chromaticFringe} minimum={0} maximum={2.4} step={0.05} onChange={(value) => update("chromaticFringe", value)} />
        <Range label="Specular angle" value={optics.specularDirection} minimum={-3.14} maximum={3.14} step={0.05} onChange={(value) => update("specularDirection", value)} />
      </section>

      <section
        ref={stageRef}
        className="glass-fixture-stage"
        aria-label="High contrast line, still image, and playing video refraction source"
        data-glass-renderer={rendererStatus}
      >
        <canvas ref={gridRef} className="glass-fixture-grid" aria-hidden="true" />
        <img
          ref={stillRef}
          className="glass-fixture-still"
          src="/content/fern-and-the-silent-seed-bells/scenes/the-quiet-morning/bell-tree-dawn-motion-poster.png"
          alt="Still watercolor source"
        />
        <video
          ref={videoRef}
          className="glass-fixture-video"
          src="/content/fern-and-the-silent-seed-bells/scenes/the-ringing-morning/seed-bells-ringing.mp4"
          muted
          autoPlay
          loop
          playsInline
          aria-label="Playing watercolor video source"
        />
        <canvas ref={rendererCanvasRef} className="glass-stage-canvas" data-glass-canvas aria-hidden="true" />
        <div ref={pillRef} className="glass-fixture-lens-preview" style={movingStyle} data-shape="pill" aria-hidden="true" />
        <div ref={roundedRef} className="glass-fixture-lens-preview glass-fixture-lens-preview--rounded" aria-hidden="true" />
        <div ref={circleRef} className="glass-fixture-lens-preview glass-fixture-lens-preview--circle" aria-hidden="true" />
        <label className="glass-fixture-travel">
          Move the same lens
          <input type="range" min={0} max={68} value={position} onChange={(event) => setPosition(Number(event.target.value))} />
        </label>
      </section>

      <section className="glass-fixture-diagnostics" aria-label="Displacement diagnostics">
        <div><span>Renderer</span><strong data-glass-renderer={rendererStatus}>{rendererStatus}</strong></div>
        <div><span>Frames</span><strong>{rendererDiagnostics.frames}</strong></div>
        <div><span>Source uploads</span><strong>{rendererDiagnostics.sourceUploads}</strong></div>
        <div><span>Frame time</span><strong>{rendererDiagnostics.frameTimeMs.toFixed(2)} ms</strong></div>
        <div><span>Map generations</span><strong>{stats.generations}</strong></div>
        <div><span>Cache hits</span><strong>{stats.hits}</strong></div>
        <div><span>Cache entries</span><strong>{stats.entries}</strong></div>
        <div><span>Loop</span><strong>{rendererDiagnostics.sleeping ? "sleeping" : "rendering"}</strong></div>
        <div className="glass-fixture-diagnostic-wide"><span>Moving map</span><strong>{movingMap.key}</strong></div>
        <div className="glass-fixture-recovery">
          <span>Recovery proof</span>
          <button type="button" onClick={() => rendererRef.current?.simulateContextLoss()}>Lose context</button>
          <button type="button" onClick={() => rendererRef.current?.simulateContextRestore()}>Restore context</button>
        </div>
      </section>

      <section className="glass-fixture-maps" aria-label="Supported lens shapes">
        {GEOMETRIES.map((geometry) => (
          <figure key={geometry.shape}>
            <DisplacementMap geometry={geometry} optics={optics} />
            <figcaption>{geometry.shape}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}
