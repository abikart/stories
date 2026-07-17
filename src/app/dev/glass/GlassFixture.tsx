"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  getCachedLensMap,
  getLensMapCacheStats,
  type LensMapCacheStats,
} from "@/experience/glass/lens-map";
import { DEFAULT_LENS_OPTICS, type LensGeometry, type LensOptics } from "@/experience/glass/types";

const GEOMETRIES: LensGeometry[] = [
  { shape: "pill", width: 190, height: 76, cornerRadius: 38 },
  { shape: "rounded-rect", width: 236, height: 146, cornerRadius: 34 },
  { shape: "circle", width: 132, height: 132, cornerRadius: 66 },
];

const EMPTY_STATS: LensMapCacheStats = { hits: 0, misses: 0, generations: 0, entries: 0 };

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
  const movingGeometry = GEOMETRIES[0];
  const movingMap = useMemo(() => getCachedLensMap(movingGeometry, optics), [movingGeometry, optics]);

  useEffect(() => setStats(getLensMapCacheStats()), [movingMap, position]);

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

      <section className="glass-fixture-stage" aria-label="High contrast line and grid source">
        <div className="glass-fixture-grid" aria-hidden="true" />
        <div className="glass-fixture-lens-preview" style={movingStyle} data-shape="pill" aria-hidden="true" />
        <label className="glass-fixture-travel">
          Move the same lens
          <input type="range" min={0} max={68} value={position} onChange={(event) => setPosition(Number(event.target.value))} />
        </label>
      </section>

      <section className="glass-fixture-diagnostics" aria-label="Displacement diagnostics">
        <div><span>Renderer</span><strong data-glass-renderer="pending">map checkpoint</strong></div>
        <div><span>Map generations</span><strong>{stats.generations}</strong></div>
        <div><span>Cache hits</span><strong>{stats.hits}</strong></div>
        <div><span>Cache entries</span><strong>{stats.entries}</strong></div>
        <div><span>Moving map</span><strong>{movingMap.key}</strong></div>
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
