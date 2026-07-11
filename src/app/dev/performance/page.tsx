import {
  PerformanceAudition,
  type PerformanceAuditionStory,
} from "@/experience/components/PerformanceAudition";
import { loadExperience } from "@/experience/load";
import { flattenPhrases } from "@/experience/performance/timeline";

export default async function PerformancePage() {
  const production = await loadExperience("pip-and-the-lantern-seed");
  if (!production.performance) throw new Error("Performance audition requires aligned performance metadata");
  const story: PerformanceAuditionStory = {
    id: production.id,
    title: production.title,
    accent: production.accent,
    poster: production.stage.backdrop.poster,
    performance: production.performance,
    phrases: flattenPhrases(production),
  };
  return <PerformanceAudition story={story} />;
}
