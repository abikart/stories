import Link from "next/link";
import { notFound } from "next/navigation";
import { listStoryIds, loadStory } from "@/lib/stories";
import { Reader } from "@/components/reader/Reader";

export async function generateStaticParams() {
  const ids = await listStoryIds();
  return ids.map((storyId) => ({ storyId }));
}

/*
 * M1: one page at a time with the Spark scrubber. The ?p= param and the
 * bare prev/next links are dev navigation — the real page-turn flow,
 * celebrations, and modes arrive at M3/M4.
 */
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

  const pageIndex = Math.min(Math.max(Number(p ?? 0) || 0, 0), story.pages.length - 1);
  const page = story.pages[pageIndex];

  return (
    <main
      className="mx-auto flex min-h-dvh flex-col justify-center gap-4 px-6 py-6"
      style={{ maxWidth: "min(58rem, calc((100dvh - 330px) * 16 / 9))" }}
    >
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-semibold">{story.title}</h1>
        <span className="text-sm text-ink-soft">
          page {pageIndex + 1} / {story.pages.length}
        </span>
      </header>
      <Reader key={page.id} page={page} storyId={storyId} accent={story.accent} />
      <nav className="flex justify-between text-sm text-ink-soft">
        {pageIndex > 0 ? (
          <Link href={`/read/${storyId}?p=${pageIndex - 1}`}>← previous</Link>
        ) : (
          <Link href="/">← library</Link>
        )}
        {pageIndex < story.pages.length - 1 && (
          <Link href={`/read/${storyId}?p=${pageIndex + 1}`}>next →</Link>
        )}
      </nav>
    </main>
  );
}
