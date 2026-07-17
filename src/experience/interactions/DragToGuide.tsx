"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { InteractionBinding, Point } from "@/experience/schema";

type GuideStyle = CSSProperties & {
  "--guide-target-x": string;
  "--guide-target-y": string;
  "--guide-target-width": string;
  "--guide-target-height": string;
};

function center(region: InteractionBinding["startRegion"]): Point {
  return { x: region.x + region.width / 2, y: region.y + region.height / 2 };
}

function inside(point: Point, region: InteractionBinding["targetRegion"]) {
  return point.x >= region.x
    && point.x <= region.x + region.width
    && point.y >= region.y
    && point.y <= region.y + region.height;
}

function clamp(value: number) {
  return Math.max(0.04, Math.min(0.96, value));
}

export function DragToGuide({
  binding,
  mode,
  onComplete,
}: {
  binding: InteractionBinding;
  mode: "interactive" | "canonical";
  onComplete: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<HTMLButtonElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const positionRef = useRef<Point>(center(binding.startRegion));
  const pointerRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const [status, setStatus] = useState<"ready" | "complete">("ready");

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const place = useCallback((point: Point, moving: boolean) => {
    const token = tokenRef.current;
    const rect = rectRef.current;
    if (!token || !rect) return;
    positionRef.current = point;
    token.dataset.moving = moving ? "true" : "false";
    token.style.transform = `translate3d(${point.x * rect.width - 26}px, ${point.y * rect.height - 26}px, 0)`;
  }, []);

  const complete = useCallback((delay: number) => {
    if (completedRef.current) return;
    completedRef.current = true;
    window.setTimeout(() => {
      setStatus("complete");
      onCompleteRef.current();
    }, delay);
  }, []);

  const guideHome = useCallback((animate: boolean) => {
    const target = center(binding.targetRegion);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    place(target, animate && !reduceMotion);
    complete(animate && !reduceMotion ? 280 : 0);
  }, [binding.targetRegion, complete, place]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateRect = () => {
      rectRef.current = container.getBoundingClientRect();
      place(positionRef.current, false);
    };
    updateRect();
    const observer = new ResizeObserver(updateRect);
    observer.observe(container);
    return () => observer.disconnect();
  }, [place]);

  useEffect(() => {
    if (mode !== "canonical") return;
    const frame = requestAnimationFrame(() => guideHome(true));
    return () => cancelAnimationFrame(frame);
  }, [guideHome, mode]);

  function pointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (mode !== "interactive" || completedRef.current) return;
    rectRef.current = containerRef.current?.getBoundingClientRect() ?? null;
    pointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "true";
    event.currentTarget.dataset.moving = "false";
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const rect = rectRef.current;
    if (pointerRef.current !== event.pointerId || !rect) return;
    place({
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
    }, false);
  }

  function pointerEnd(event: PointerEvent<HTMLButtonElement>) {
    if (pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    event.currentTarget.dataset.dragging = "false";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (inside(positionRef.current, binding.targetRegion)) {
      guideHome(true);
    } else {
      place(center(binding.startRegion), true);
    }
  }

  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (mode !== "interactive" || completedRef.current) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      guideHome(false);
      return;
    }
    const step = event.shiftKey ? 0.08 : 0.04;
    const delta = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = {
      x: clamp(positionRef.current.x + delta.x),
      y: clamp(positionRef.current.y + delta.y),
    };
    place(next, false);
    if (inside(next, binding.targetRegion)) guideHome(false);
  }

  const target = binding.targetRegion;
  const style: GuideStyle = {
    "--guide-target-x": `${target.x * 100}%`,
    "--guide-target-y": `${target.y * 100}%`,
    "--guide-target-width": `${target.width * 100}%`,
    "--guide-target-height": `${target.height * 100}%`,
  };
  const path = binding.path.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x * 100} ${point.y * 100}`).join(" ");

  return (
    <div
      className="drag-guide"
      data-mode={mode}
      data-status={status}
      ref={containerRef}
      style={style}
      aria-label={mode === "interactive" ? binding.prompt : "Canonical guide path"}
    >
      <svg className="drag-guide-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={path} />
      </svg>
      <div className="drag-guide-target" aria-hidden="true"><span>Goal</span></div>
      <p className="drag-guide-prompt" id="drag-guide-instructions">
        {mode === "interactive" ? binding.prompt : "The story is following the path…"}
      </p>
      <button
        className="drag-guide-token"
        type="button"
        ref={tokenRef}
        aria-label="Guide along the path. Drag toward the Goal ring, use arrow keys, or press Enter."
        aria-describedby="drag-guide-instructions"
        disabled={mode === "canonical" || status === "complete"}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerEnd}
        onPointerCancel={pointerEnd}
        onKeyDown={keyDown}
      >
        <span aria-hidden="true" />
      </button>
      <output className="drag-guide-status" aria-live="polite">
        {status === "complete" ? "Path complete." : ""}
      </output>
    </div>
  );
}
