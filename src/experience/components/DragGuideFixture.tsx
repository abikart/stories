"use client";

import { useState, type CSSProperties } from "react";
import type { InteractionBinding } from "@/experience/schema";
import { DragToGuide } from "@/experience/interactions/DragToGuide";

type FixtureStyle = CSSProperties & { "--drag-fixture-poster": string };

export function DragGuideFixture({
  binding,
  poster,
}: {
  binding: InteractionBinding;
  poster: string;
}) {
  const [completed, setCompleted] = useState(false);
  const style: FixtureStyle = { "--drag-fixture-poster": `url("${poster}")` };
  return (
    <main className="drag-guide-fixture" style={style}>
      <div className="drag-guide-fixture-stage">
        {!completed ? (
          <DragToGuide binding={binding} mode="interactive" onComplete={() => setCompleted(true)} />
        ) : (
          <div className="drag-guide-fixture-complete" role="status">
            Glow found Pip.
            <button type="button" onClick={() => setCompleted(false)}>Try again</button>
          </div>
        )}
      </div>
    </main>
  );
}
