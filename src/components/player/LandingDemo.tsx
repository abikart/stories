"use client";

import { useState } from "react";
import type { Page } from "@/engine/types";
import { Reader } from "@/components/reader/Reader";
import type { ReadingMode } from "@/components/reader/ModeSwitcher";

/** The hero demo: the REAL reader, not a video (docs/03 M8). */
export function LandingDemo({ page, storyId, accent }: { page: Page; storyId: string; accent?: string }) {
  const [mode, setMode] = useState<ReadingMode>("read-along");
  return <Reader page={page} storyId={storyId} accent={accent} mode={mode} onModeChange={setMode} />;
}
