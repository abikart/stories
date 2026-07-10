import { Reader } from "@/components/reader/Reader";
import type { Page } from "@/engine/types";

/*
 * Dev harness: digraph/vowel-team sentence (sh, ai as single graphemes) —
 * the M1 acceptance check that multi-letter graphemes highlight as units.
 * Not linked from anywhere user-facing.
 */
const page: Page = {
  id: "dev-digraph",
  text: "The ship is in the rain.",
  tokens: [
    { w: "The", sight: true },
    { w: "ship", g: ["sh", "i", "p"] },
    { w: "is", sight: true },
    { w: "in", g: ["i", "n"] },
    { w: "the", sight: true },
    { w: "rain", g: ["r", "ai", "n"], punct: "." },
  ],
  scene: { backend: "coded", module: "none" },
};

export default function DevScrubber() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center px-6">
      <Reader page={page} />
    </main>
  );
}
