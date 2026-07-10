import { notFound } from "next/navigation";
import { listStoryIds, loadStory } from "@/lib/stories";
import type { Token } from "@/engine/types";

export async function generateStaticParams() {
  const ids = await listStoryIds();
  return ids.map((storyId) => ({ storyId }));
}

function Word({ token }: { token: Token }) {
  return (
    <span className="inline-flex items-baseline" data-sight={token.sight ? "" : undefined}>
      {token.sight ? (
        <span className="rounded-sm underline decoration-sight-word decoration-2 underline-offset-4">
          {token.w}
        </span>
      ) : (
        <span>
          {token.g!.map((grapheme, i) => (
            <span key={i} data-grapheme={grapheme}>
              {grapheme}
            </span>
          ))}
        </span>
      )}
      {token.punct}
    </span>
  );
}

/*
 * M0: renders tokenized prose from story.json — proves data → screen.
 * The interactive reader (Spark scrubber, scenes, modes) replaces this
 * from M1 onward.
 */
export default async function ReadPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const story = await loadStory(storyId).catch(() => null);
  if (!story) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold">{story.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Level {story.level} · sight words: {story.phonicsScope.sightWords.join(", ")}
        </p>
      </header>
      <ol className="flex flex-col gap-8">
        {story.pages.map((page) => (
          <li key={page.id} className="rounded-xl bg-paper-deep p-6 shadow-card">
            <p
              className="font-reading text-3xl font-medium leading-relaxed"
              style={{ letterSpacing: "0.01em" }}
            >
              {page.tokens.map((t, i) => (
                <span key={i}>
                  <Word token={t} />{" "}
                </span>
              ))}
            </p>
            <p className="mt-3 text-xs text-ink-soft">
              {page.id} · scene: {page.scene.backend}
              {page.scene.cues?.length ? ` · ${page.scene.cues.length} cues` : ""}
            </p>
          </li>
        ))}
      </ol>
    </main>
  );
}
