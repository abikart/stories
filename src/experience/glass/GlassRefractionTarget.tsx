"use client";

import { useContext, useEffect } from "react";
import { GlassStageContext, type GlassTargetPaintContext } from "@/experience/glass/GlassStage";

export function GlassRefractionTarget({
  id,
  paint,
}: {
  id: string;
  paint(target: GlassTargetPaintContext): void;
}) {
  const stage = useContext(GlassStageContext);
  useEffect(() => {
    if (!stage) return;
    return stage.registerTarget({ id, paint });
  }, [id, paint, stage]);
  return null;
}
