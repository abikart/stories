/**
 * Story scaffolder (docs/06 step 1).
 *
 *   pnpm new-story <story-id> --title "The ..." --level 1
 *
 * Creates content/<id>/story.json with the level's phonics scope preset
 * and one example page. Flow after this: write pages (w/punct/sight only)
 * → pnpm segment → pnpm lint:stories → pnpm narrate → scene work.
 */
import { promises as fs } from "fs";
import path from "path";

const LEVEL_SCOPES: Record<number, { graphemes: string[]; sightWords: string[] }> = {
  1: {
    graphemes: ["s", "a", "t", "p", "i", "n", "m", "d", "g", "o", "c", "k", "e", "u", "r", "h", "b", "f", "l", "x", "j"],
    sightWords: ["the", "is", "a"],
  },
  2: {
    graphemes: ["s", "a", "t", "p", "i", "n", "m", "d", "g", "o", "c", "k", "e", "u", "r", "h", "b", "f", "l", "x", "j", "w", "v", "y", "z", "ck", "sh", "ch", "th", "ng", "ai", "ee"],
    sightWords: ["the", "is", "a", "no", "go"],
  },
};

async function main() {
  const args = process.argv.slice(2);
  const id = args.find((a) => !a.startsWith("--"));
  const title = args[args.indexOf("--title") + 1];
  const level = Number(args[args.indexOf("--level") + 1] || 1);
  if (!id || !/^[a-z0-9-]+$/.test(id) || args.indexOf("--title") === -1) {
    console.error('usage: pnpm new-story <kebab-id> --title "The ..." [--level 1]');
    process.exit(1);
  }
  const dir = path.join(process.cwd(), "content", id);
  await fs.mkdir(dir, { recursive: true });
  const storyPath = path.join(dir, "story.json");
  try {
    await fs.access(storyPath);
    console.error(`${storyPath} already exists — refusing to overwrite`);
    process.exit(1);
  } catch {}

  const story = {
    id,
    title,
    level,
    accent: "purple",
    phonicsScope: LEVEL_SCOPES[level] ?? LEVEL_SCOPES[1],
    pages: [
      {
        id: "p1",
        text: "The cat sat.",
        tokens: [
          { w: "The", sight: true },
          { w: "cat" },
          { w: "sat", punct: "." },
        ],
        scene: { backend: "coded", module: "none" },
      },
    ],
  };
  await fs.writeFile(storyPath, JSON.stringify(story, null, 2) + "\n");
  console.log(`scaffolded ${storyPath}`);
  console.log(`next: edit pages → pnpm segment ${id} → pnpm lint:stories ${id} → pnpm narrate ${id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
