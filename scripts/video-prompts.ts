/**
 * Prompt-pack generator (docs/09): produce copy-paste video-generation
 * prompts (Grok Imagine, Veo, Runway…) for every page of a story.
 *
 *   pnpm video-prompts <story-id> [--style "watercolor"]
 *
 * Writes content/<story-id>/VIDEO-PROMPTS.md. Shot descriptions come from
 * story.json's videoBrief (style/world/characters/shots); pages without a
 * brief get a derived draft marked TODO. The motion rules are the load-
 * bearing part: clips get scrubbed by the reading slider, so they must be
 * single, slow, strictly-forward takes.
 */
import { promises as fs } from "fs";
import path from "path";

const STYLES: Record<string, string> = {
  watercolor:
    "soft watercolor on textured cold-press paper, gentle pastel palette, hand-painted edges that bloom slightly, dreamy Studio Ghibli-inspired warmth, painterly light",
  ghibli:
    "Studio Ghibli-inspired 2D animation look, painterly backgrounds, soft rim light, gentle wind in everything, nostalgic pastel palette",
  claymation:
    "handmade claymation stop-motion look, soft studio lighting, visible fingerprints in clay, miniature diorama depth of field",
  "paper-cutout":
    "layered paper-cutout collage, visible paper grain and drop shadows between layers, storybook diorama",
};

const MOTION_RULES = `**Motion rules (required — the clip is scrubbed by a reading slider):**
- ONE single continuous shot. No cuts, no transitions, no loops.
- Slow, calm, CONSTANT-SPEED motion that only moves forward (a child drags a slider through it — reversing or cyclic motion feels broken).
- Start nearly still, end settled on a resting composition (the final frame is held on screen).
- Locked or very slowly drifting camera. No shake, no whip pans, no zoom bursts.
- No on-screen text, captions, logos, or watermarks.
- 16:9 landscape, 5–8 seconds, 24fps+, 720p or better.`;

async function main() {
  const args = process.argv.slice(2);
  const storyId = args.find((a) => !a.startsWith("--"));
  const styleFlag = args.indexOf("--style");
  const styleArg = styleFlag === -1 ? undefined : args[styleFlag + 1];
  if (!storyId) {
    console.error('usage: pnpm video-prompts <story-id> [--style "watercolor"]');
    process.exit(1);
  }
  const dir = path.join(process.cwd(), "content", storyId);
  const story = JSON.parse(await fs.readFile(path.join(dir, "story.json"), "utf8"));
  const brief = story.videoBrief ?? {};
  const style: string =
    (styleArg && (STYLES[styleArg] ?? styleArg)) || brief.style || STYLES.watercolor;
  const world: string = brief.world ?? `the world of "${story.title}"`;
  const characters: string[] = brief.characters ?? [];

  const lines: string[] = [
    `# Video prompts — ${story.title}`,
    "",
    `Generate one clip per page, then save each as \`content/${storyId}/video-drops/<pageId>.mp4\``,
    `and run \`pnpm ingest-video ${storyId}\`.`,
    "",
    `**Global style (repeat in every prompt):** ${style}`,
    "",
    `**World (keep identical in every shot):** ${world}`,
    "",
    characters.length
      ? `**Characters (describe verbatim every time for continuity):**\n${characters.map((c) => `- ${c}`).join("\n")}`
      : "**Characters:** _none declared — add videoBrief.characters to story.json_",
    "",
    MOTION_RULES,
    "",
    "---",
    "",
  ];

  for (const page of story.pages) {
    const shot: string | undefined = brief.shots?.[page.id];
    const derived = `A quiet scene illustrating the sentence "${page.text}" — TODO: replace with an authored shot description (videoBrief.shots["${page.id}"]).`;
    lines.push(
      `## ${page.id} — “${page.text}”`,
      "",
      "```",
      `${style}. ${world}. ${characters.join(" ")}`,
      "",
      `Shot: ${shot ?? derived}`,
      "",
      "Single continuous shot, slow constant forward motion, locked camera with a gentle drift, start nearly still, end settled and calm. No cuts, no loops, no text, no watermark. 16:9, 6 seconds.",
      "```",
      "",
      `Deliver as: \`video-drops/${page.id}.mp4\``,
      "",
    );
  }

  const outPath = path.join(dir, "VIDEO-PROMPTS.md");
  await fs.writeFile(outPath, lines.join("\n"));
  console.log(`wrote ${path.relative(process.cwd(), outPath)} (${story.pages.length} prompts)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
