/**
 * Video ingestion (docs/09): turn delivered AI-generated clips (Grok
 * Imagine, Veo, etc.) into scrub-able scene sequences.
 *
 *   1. Drop clips at content/<story-id>/video-drops/<pageId>.mp4 (mov/webm ok)
 *   2. pnpm ingest-video <story-id> [--force]
 *
 * Each clip is exploded to JPEG frames (12 samples/sec, 48–96 frames,
 * 1280x720 center-cropped) into scenes/<pageId>/, and the page's scene in
 * story.json is rewired to the frames backend — cues are preserved. The
 * existing FramesScene runtime, all three reading modes, dormancy, and
 * render-to-video then work unchanged: the slider scrubs the video.
 */
import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

const exec = promisify(execFile);
const CONTENT = path.join(process.cwd(), "content");
const EXTS = [".mp4", ".mov", ".webm", ".m4v"];

async function probeDuration(file: string): Promise<number> {
  const { stdout } = await exec("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    file,
  ]);
  return parseFloat(stdout.trim());
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const storyId = args.find((a) => !a.startsWith("--"));
  if (!storyId) {
    console.error("usage: pnpm ingest-video <story-id> [--force]");
    process.exit(1);
  }
  const dir = path.join(CONTENT, storyId);
  const dropDir = path.join(dir, "video-drops");
  const storyPath = path.join(dir, "story.json");
  const story = JSON.parse(await fs.readFile(storyPath, "utf8"));

  let drops: string[] = [];
  try {
    drops = await fs.readdir(dropDir);
  } catch {
    console.error(`no drops found — put clips at ${path.relative(process.cwd(), dropDir)}/<pageId>.mp4`);
    process.exit(1);
  }

  let ingested = 0;
  for (const page of story.pages) {
    const clip = drops
      .filter((f) => EXTS.includes(path.extname(f).toLowerCase()))
      .find((f) => path.parse(f).name === page.id);
    if (!clip) {
      console.log(`  ${page.id}: no clip, skipping`);
      continue;
    }
    const outDir = path.join(dir, "scenes", page.id);
    const exists = await fs.access(path.join(outDir, "frame_0001.jpg")).then(() => true, () => false);
    if (exists && !force) {
      console.log(`  ${page.id}: frames exist (use --force to redo)`);
      continue;
    }
    await fs.rm(outDir, { recursive: true, force: true });
    await fs.mkdir(outDir, { recursive: true });

    const src = path.join(dropDir, clip);
    const duration = await probeDuration(src);
    // scrub density beats playback fidelity: ~12 samples/sec, 48–96 frames
    const count = Math.max(48, Math.min(96, Math.round(duration * 12)));
    const fps = count / duration;
    await exec("ffmpeg", [
      "-y", "-loglevel", "error",
      "-i", src,
      "-vf", `fps=${fps.toFixed(4)},scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720`,
      "-frames:v", String(count),
      "-q:v", "3",
      path.join(outDir, "frame_%04d.jpg"),
    ]);
    const actual = (await fs.readdir(outDir)).filter((f) => f.endsWith(".jpg")).length;

    page.scene = {
      backend: "frames",
      frames: { dir: `scenes/${page.id}`, count: actual, ext: "jpg" },
      ...(page.scene?.cues?.length ? { cues: page.scene.cues } : {}),
    };
    ingested++;
    console.log(`  ${page.id}: ${clip} (${duration.toFixed(1)}s) → ${actual} frames`);
  }

  await fs.writeFile(storyPath, JSON.stringify(story, null, 2) + "\n");
  console.log(`${storyId}: ${ingested} page(s) ingested — run pnpm lint:stories ${storyId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
