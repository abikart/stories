"use client";

import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type HTMLAttributes,
} from "react";
import { GlassStageContext, type GlassSurfaceRegistration } from "@/experience/glass/GlassStage";
import { mergeGlassOptics, type GlassOptics, type GlassRefractionTarget, type GlassShape } from "@/experience/glass/types";

export const GlassSurface = forwardRef<HTMLDivElement, {
  glassId: string;
  shape?: GlassShape;
  optics?: Partial<GlassOptics>;
  refractionTarget?: GlassRefractionTarget;
  motionKey?: string;
  motionDuration?: number;
} & HTMLAttributes<HTMLDivElement>>(function GlassSurface({
  glassId,
  shape = "rounded-rect",
  optics,
  refractionTarget,
  motionKey,
  motionDuration = 0,
  ...attributes
}, forwardedRef) {
  const stage = useContext(GlassStageContext);
  const elementRef = useRef<HTMLDivElement>(null);
  const opticsKey = JSON.stringify(optics ?? {});
  const targetKey = JSON.stringify(refractionTarget ?? null);
  // Parent playback renders are frequent. Keying by scalar material values keeps
  // a surface registered until its actual optical recipe changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mergedOptics = useMemo(() => mergeGlassOptics(optics), [opticsKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableTarget = useMemo(() => refractionTarget, [targetKey]);
  useImperativeHandle(forwardedRef, () => elementRef.current as HTMLDivElement);

  useEffect(() => {
    const element = elementRef.current;
    if (!stage || !element) return;
    const registration: GlassSurfaceRegistration = {
      id: glassId,
      element,
      shape,
      optics: mergedOptics,
      refractionTarget: stableTarget,
      pressAmount: 0,
    };
    return stage.register(registration);
  }, [glassId, mergedOptics, shape, stableTarget, stage]);

  useEffect(() => {
    if (motionKey === undefined) return;
    stage?.animateSurface(motionDuration);
  }, [motionDuration, motionKey, stage]);

  return <div {...attributes} ref={elementRef} data-glass-surface={glassId} />;
});
