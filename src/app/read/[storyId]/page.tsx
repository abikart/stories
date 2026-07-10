import { notFound } from "next/navigation";
import { listStoryIds, loadStory } from "@/lib/stories";
import { StoryPlayer } from "@/components/player/StoryPlayer";

export async function generateStaticParams() {
  const ids = await listStoryIds();
  return ids.map((storyId) => ({ storyId }));
}

export default async function ReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ storyId: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { storyId } = await params;
  const { p } = await searchParams;
  const story = await loadStory(storyId).catch(() => null);
  if (!story) notFound();

  return <StoryPlayer story={story} initialPage={Math.max(Number(p ?? 0) || 0, 0)} />;
}
