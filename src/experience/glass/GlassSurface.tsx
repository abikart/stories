"use client";

import {
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type HTMLAttributes,
} from "react";
import { GlassStageContext, mergeLensOptics } from "@/experience/glass/GlassStage";
import type { LensOptics, LensShape } from "@/experience/glass/types";

export function GlassSurface({
  glassId,
  shape = "rounded-rect",
  optics,
  refractionTarget,
  children,
  ...attributes
}: {
  glassId?: string;
  shape?: LensShape;
  optics?: Partial<LensOptics>;
  refractionTarget?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const generatedId = useId();
  const id = glassId ?? generatedId;
  const elementRef = useRef<HTMLDivElement>(null);
  const stage = useContext(GlassStageContext);
  const mergedOptics = useMemo(() => mergeLensOptics(optics), [optics]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !stage) return;
    return stage.register({ id, element, shape, optics: mergedOptics, refractionTarget });
  }, [id, mergedOptics, refractionTarget, shape, stage]);

  return (
    <div
      {...attributes}
      ref={elementRef}
      data-glass-surface={id}
      data-glass-active={stage?.status === "webgl" ? "true" : undefined}
    >
      {children}
    </div>
  );
}
