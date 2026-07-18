"use client";

import { useEffect, useRef, useState } from "react";
import { GlassStage } from "@/experience/glass/GlassStage";
import { GlassSurface } from "@/experience/glass/GlassSurface";
import { DEFAULT_GLASS_OPTICS, type GlassOptics } from "@/experience/glass/types";

function drawProofGrid(canvas: HTMLCanvasElement) {
  const width = 1400;
  const height = 760;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#f8faf8";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#16221b";
  context.lineWidth = 3;
  for (let x = 0; x <= width; x += 50) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 50) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.fillStyle = "#ef3150";
  context.fillRect(width * 0.485, 0, width * 0.03, height);
  context.fillStyle = "#175cff";
  context.fillRect(0, height * 0.47, width, height * 0.06);
}

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(value: number): void;
}) {
  return (
    <label className="transmission-fixture-range">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.currentTarget.value))} />
      <output>{value.toFixed(step < 0.1 ? 3 : step < 1 ? 2 : 0)}</output>
    </label>
  );
}

export function TransmissionFixture() {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState(13);
  const [optics, setOptics] = useState<GlassOptics>({ ...DEFAULT_GLASS_OPTICS });
  const [diagnostics, setDiagnostics] = useState("Renderer starting");
  useEffect(() => {
    if (gridRef.current) drawProofGrid(gridRef.current);
    const updateDiagnostics = () => {
      const stage = document.querySelector<HTMLElement>(".transmission-fixture-stage");
      const diagnostic = window.__storiesGlassStage;
      setDiagnostics([
        `Renderer ${stage?.dataset.glassRenderer ?? "starting"}`,
        diagnostic ? `${diagnostic.surfaceCount} lenses` : "",
        diagnostic ? `${diagnostic.sourceCount} sources` : "",
        diagnostic?.lastError ? `error: ${diagnostic.lastError}` : "",
      ].filter(Boolean).join(" · "));
    };
    updateDiagnostics();
    const interval = window.setInterval(updateDiagnostics, 500);
    return () => window.clearInterval(interval);
  }, []);

  const update = (key: keyof GlassOptics, value: number) => {
    setOptics((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="transmission-fixture-shell">
      <header className="transmission-fixture-header">
        <p>Stories optics laboratory</p>
        <h1>Live displacement glass</h1>
        <span>Portable lens displacement, restrained chromatic separation, shape-aware rim light, and live-media sampling.</span>
      </header>

      <section className="transmission-fixture-controls" aria-label="Transmission parameters">
        <Range label="IOR" value={optics.ior} min={1} max={1.5} step={0.01} onChange={(value) => update("ior", value)} />
        <Range label="Thickness" value={optics.thickness} min={0} max={36} step={1} onChange={(value) => update("thickness", value)} />
        <Range label="Roughness" value={optics.roughness} min={0} max={0.3} step={0.01} onChange={(value) => update("roughness", value)} />
        <Range label="Chromatic aberration" value={optics.chromaticAberration} min={0} max={0.12} step={0.002} onChange={(value) => update("chromaticAberration", value)} />
      </section>

      <GlassStage className="transmission-fixture-stage" matte="#f8faf8" aria-label="High contrast transmission proof">
        <output className="transmission-fixture-diagnostics" aria-live="polite">{diagnostics}</output>
        <canvas ref={gridRef} data-glass-source className="transmission-fixture-grid" aria-hidden="true" />
        <img
          data-glass-source
          className="transmission-fixture-still"
          src="/content/fern-and-the-silent-seed-bells/scenes/the-quiet-morning/bell-tree-dawn-motion-poster.png"
          alt="Still watercolor transmission source"
        />
        <video
          data-glass-source
          className="transmission-fixture-video"
          src="/content/fern-and-the-silent-seed-bells/scenes/the-ringing-morning/seed-bells-ringing.mp4"
          muted
          autoPlay
          loop
          playsInline
          aria-label="Playing watercolor transmission source"
        />
        <GlassSurface
          glassId="moving-pill"
          shape="pill"
          optics={optics}
          className="transmission-fixture-lens transmission-fixture-lens--pill"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        />
        <GlassSurface
          glassId="rounded"
          optics={{ ...optics, thickness: optics.thickness * 0.85 }}
          className="transmission-fixture-lens transmission-fixture-lens--rounded"
          aria-hidden="true"
        />
        <GlassSurface
          glassId="circle"
          shape="circle"
          optics={{ ...optics, thickness: optics.thickness * 1.15 }}
          className="transmission-fixture-lens transmission-fixture-lens--circle"
          aria-hidden="true"
        />
        <label className="transmission-fixture-travel">
          Move the same refractive lens
          <input type="range" min={4} max={52} value={position} onChange={(event) => setPosition(Number(event.currentTarget.value))} />
        </label>
      </GlassStage>
    </main>
  );
}
