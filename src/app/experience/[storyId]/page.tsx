import { notFound } from "next/navigation";
import { ExperiencePlayer } from "@/experience/components/ExperiencePlayer";
import { loadExperience } from "@/experience/load";

type ExperiencePageProps = {
  params: Promise<{ storyId: string }>;
};

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { storyId } = await params;
  const production = await loadExperience(storyId).catch(() => null);
  if (!production?.performance) notFound();
  return <ExperiencePlayer production={production} />;
}
