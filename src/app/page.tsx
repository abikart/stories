import Link from "next/link";
import { loadAllStories, loadStory } from "@/lib/stories";
import { LandingDemo } from "@/components/player/LandingDemo";
import { ReadingSettings } from "@/components/player/ReadingSettings";
import { ShelfStats } from "@/components/player/ShelfStats";
import { Sticker } from "@/components/player/stickers";

const LEVEL_CHIP: Record<number, string> = {
  1: "var(--color-candy-green)",
  2: "var(--color-candy-blue)",
};

export default async function Home() {
  const stories = await loadAllStories();
  const fox = await loadStory("fox-on-the-box").catch(() => null);
  const demoPage = fox?.pages[0];

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-16 px-6 py-16">
      {/* hero */}
      <section className="land-sec flex flex-col items-center gap-4 text-center">
        <h1 className="font-display text-6xl font-bold tracking-tight sm:text-7xl">stories.sh</h1>
        <p className="font-display text-xl text-ink-soft sm:text-2xl" style={{ textWrap: "balance" }}>
          Stories you can touch. Words that wake worlds.
        </p>
        <p className="max-w-2xl text-ink-soft" style={{ textWrap: "pretty" }}>
          Living storybooks for kids learning to read. Every page starts asleep — slide the Spark
          under the words to sound them out, and the world wakes up as you read. Real phonics,
          real decodable text, and illustrations that only move when your child does the reading.
        </p>
      </section>

      {/* live demo — the real reader, not a video */}
      {demoPage && fox && (
        <section className="land-sec">
          <div className="demo-card">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-lg font-semibold">
                Try it — slide the Spark under the words
              </h2>
              <ReadingSettings />
            </div>
            <LandingDemo page={demoPage} storyId={fox.id} accent={fox.accent} />
          </div>
        </section>
      )}

      {/* library */}
      <section className="land-sec flex flex-col gap-6">
        <h2 className="text-center font-display text-3xl font-bold" style={{ textWrap: "balance" }}>
          Three little worlds so far
        </h2>
        <ul className="grid gap-5 sm:grid-cols-3">
          {stories.map((s) => (
            <li key={s.id}>
              <Link href={`/read/${s.id}`} className="story-card">
                <Sticker storyId={s.id} size={104} />
                <span className="font-display text-xl font-semibold" style={{ textWrap: "balance" }}>
                  {s.title}
                </span>
                <span className="flex items-center gap-2 text-sm text-ink-soft">
                  <span
                    className="rounded-full px-2.5 py-0.5 font-semibold text-white"
                    style={{ background: LEVEL_CHIP[s.level] ?? "var(--color-candy-purple)" }}
                  >
                    level {s.level}
                  </span>
                  <span className="tabular-nums">{s.pages.length} pages</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <ShelfStats />
      </section>

      {/* modes */}
      <section className="land-sec flex flex-col gap-6">
        <h2 className="text-center font-display text-3xl font-bold" style={{ textWrap: "balance" }}>
          Three ways to read every story
        </h2>
        <ul className="grid gap-5 sm:grid-cols-3">
          {[
            ["Read it", "Your child drives. Letters light up under their finger; tap any word to sound it out."],
            ["Read along", "They slide, we speak — each word is spoken the moment the Spark reaches it."],
            ["Read to me", "A warm voice reads slowly while the words glow karaoke-style. Perfect for bedtime."],
          ].map(([title, body]) => (
            <li key={title} className="mode-card">
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="text-sm text-ink-soft" style={{ textWrap: "pretty" }}>
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="land-sec flex items-baseline justify-between border-t border-paper-edge pt-6 text-sm text-ink-soft">
        <span className="font-display font-semibold">stories.sh</span>
        <span>every story authored, linted &amp; narrated in the terminal</span>
      </footer>
    </main>
  );
}
