import { notFound } from "next/navigation";
import { listStoryIds, loadStory } from "@/lib/stories";
import { RenderStage } from "@/components/player/RenderStage";

export async function generateStaticParams() {
  const ids = await listStoryIds();
  return ids.map((storyId) => ({ storyId }));
}

/* Chrome-free capture target for scripts/render-video.ts (M7). */
export default async function RenderPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const story = await loadStory(storyId).catch(() => null);
  if (!story) notFound();
  return <RenderStage story={story} />;
}
