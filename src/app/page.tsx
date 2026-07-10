import Link from "next/link";
import { loadAllStories } from "@/lib/stories";
import { ShelfStats } from "@/components/player/ShelfStats";

/* Placeholder landing — the real one is milestone M8. */
export default async function Home() {
  const stories = await loadAllStories();
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <h1 className="font-display text-6xl font-bold tracking-tight">stories.sh</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Stories you can touch. Words that wake worlds.
        </p>
      </div>
      <ShelfStats />
      <ul className="flex w-full flex-col gap-4">
        {stories.map((s) => (
          <li key={s.id}>
            <Link
              href={`/read/${s.id}`}
              className="block rounded-xl bg-paper-deep px-6 py-5 text-left shadow-card transition-transform hover:scale-[1.01]"
            >
              <span className="font-display text-2xl font-semibold">{s.title}</span>
              <span className="mt-1 block text-sm text-ink-soft">
                Level {s.level} · {s.pages.length} pages
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
