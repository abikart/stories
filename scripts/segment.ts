/**
 * Grapheme segmenter (docs/06 step 4): fills tokens[].g for any token
 * that has neither a segmentation nor sight:true, using the story's
 * phonics scope. Manual segmentations already in the file always win.
 *
 *   pnpm segment <story-id>
 */
import { promises as fs } from "fs";
import path from "path";
import { segmentWord } from "./lib/phonics";

async function main() {
  const storyId = process.argv[2];
  if (!storyId) {
    console.error("usage: pnpm segment <story-id>");
    process.exit(1);
  }
  const storyPath = path.join(process.cwd(), "content", storyId, "story.json");
  const story = JSON.parse(await fs.readFile(storyPath, "utf8"));
  let filled = 0;
  const failures: string[] = [];

  for (const page of story.pages) {
    for (const token of page.tokens) {
      if (token.sight || token.g) continue;
      const res = segmentWord(token.w, story.phonicsScope.graphemes);
      if (res.ok) {
        token.g = res.graphemes;
        filled++;
      } else {
        failures.push(
          `${page.id} "${token.w}": no scope grapheme matches "${res.remainder}" (position ${res.failedAt})`,
        );
      }
    }
  }

  await fs.writeFile(storyPath, JSON.stringify(story, null, 2) + "\n");
  console.log(`${storyId}: segmented ${filled} token(s)`);
  if (failures.length) {
    console.error(`\n${failures.length} word(s) not segmentable in scope:`);
    for (const f of failures) console.error(`  ✗ ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
