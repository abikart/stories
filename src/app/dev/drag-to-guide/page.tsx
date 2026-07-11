import { DragGuideFixture } from "@/experience/components/DragGuideFixture";
import { loadExperience } from "@/experience/load";

export default async function DragToGuidePage() {
  const production = await loadExperience("pip-and-the-lantern-seed");
  const scene = production.scenes.find((candidate) => candidate.interaction?.recipe === "drag-to-guide");
  if (!scene?.interaction) throw new Error("drag-to-guide fixture requires a production binding");
  return (
    <DragGuideFixture
      binding={scene.interaction}
      poster={`/content/${production.id}/${production.stage.backdrop.poster}`}
    />
  );
}
