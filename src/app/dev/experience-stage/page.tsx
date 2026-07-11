import { ResponsiveStage } from "@/experience/components/ResponsiveStage";
import { loadExperience } from "@/experience/load";

export default async function ExperienceStagePage() {
  const production = await loadExperience("the-boat-in-the-mist");
  return <ResponsiveStage production={production} />;
}
