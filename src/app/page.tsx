import Link from "next/link";

const STORY_ID = "fern-and-the-silent-seed-bells";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <section className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#708b62]">
          A Lanternleaf story
        </p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
          Fern and the Silent Seed Bells
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-soft text-pretty sm:text-xl">
          An expressive story performance that waits for the child, follows
          their pace, and lets them help the story happen.
        </p>
        <Link
          href={`/experience/${STORY_ID}`}
          className="mt-2 inline-flex min-h-12 items-center rounded-full bg-[#708b62] px-7 py-3 font-semibold text-white shadow-lg shadow-[#708b62]/20 transition-[transform,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#5f7953] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#708b62]"
        >
          Enter the story
        </Link>
      </section>
    </main>
  );
}
