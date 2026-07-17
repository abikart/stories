/**
 * Ingest one native motion state into a schema-v2 interactive experience.
 *
 * Example:
 *   pnpm ingest:experience-video fern-and-the-silent-seed-bells bell-tree-dawn \
 *     --source ~/Downloads/grok-<provider-id>.mp4 --role living-loop
 *
 * The source is preserved, a muted browser-safe H.264 delivery is encoded
 * without cropping, a state-specific poster is extracted, production.json is
 * updated in place, and technical provenance is merged into
 * motion-production.json.
 */
import { execFile } from "child_process";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

const exec = promisify(execFile);
const CONTENT = path.join(process.cwd(), "content");
const SOURCE_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".m4v"]);

type MotionRole = "living-loop" | "one-shot";
type PosterFrame = "first" | "last";

type Probe = {
  width: number;
  height: number;
  duration: number;
  frameRate: string;
  codec: string;
  pixelFormat: string;
  audioStreams: number;
};

type MediaState = {
  id: string;
  kind: "poster" | "video" | "living-illustration";
  src: string;
  poster?: string;
  loop?: boolean;
  focalPoint?: { x: number; y: number };
  transitionsTo?: string[];
};

type Production = {
  schemaVersion: number;
  id: string;
  scenes: Array<{ id: string; media: MediaState[] }>;
};

type MotionState = {
  sceneId: string;
  mediaState: string;
  role: MotionRole;
  provider: string;
  providerId?: string;
  providerUrl?: string;
  promptRef?: string;
  source: string;
  sourceSha256: string;
  sourceProbe: Probe;
  deliveryTransform: string;
  delivery: string;
  deliverySha256: string;
  deliveryProbe: Probe;
  poster: string;
  posterSha256: string;
  posterFrame: PosterFrame;
  acceptedAt: string;
};

type MotionManifest = {
  schemaVersion: 1;
  storyId: string;
  status: "in-progress" | "complete";
  expectedStates: number;
  acceptedStates: number;
  format: {
    creativeAspectRatio: "4:3";
    deliveryCodec: "h264";
    pixelFormat: "yuv420p";
    audio: "muted";
    responsiveCrop: "none";
  };
  states: MotionState[];
  candidates?: Array<{
    mediaState: string;
    providerId: string;
    source: string;
    sourceSha256: string;
    decision: "rejected";
    reason: string;
  }>;
};

function valueAfter(args: string[], flag: string) {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function usage(): never {
  console.error(
    "usage: pnpm ingest:experience-video <story-id> <media-state> "
    + "--source <clip> [--role living-loop|one-shot] "
    + "[--poster-frame first|last] [--provider grok-imagine] "
    + "[--provider-url <url>] [--prompt-ref <ref>] [--force]",
  );
  process.exit(1);
}

async function sha256(file: string) {
  const hash = createHash("sha256");
  const handle = await fs.open(file, "r");
  try {
    for await (const chunk of handle.readableWebStream()) hash.update(Buffer.from(chunk));
  } finally {
    await handle.close();
  }
  return hash.digest("hex");
}

async function probe(file: string): Promise<Probe> {
  const { stdout } = await exec("ffprobe", [
    "-v", "error",
    "-show_streams",
    "-show_format",
    "-of", "json",
    file,
  ]);
  const raw = JSON.parse(stdout) as {
    streams?: Array<Record<string, string | number>>;
    format?: Record<string, string>;
  };
  const streams = raw.streams ?? [];
  const video = streams.find((stream) => stream.codec_type === "video");
  if (!video) throw new Error(`${file}: no video stream`);
  const duration = Number(video.duration ?? raw.format?.duration);
  const width = Number(video.width);
  const height = Number(video.height);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`${file}: invalid duration`);
  if (!Number.isInteger(width) || !Number.isInteger(height)) throw new Error(`${file}: invalid dimensions`);
  return {
    width,
    height,
    duration,
    frameRate: String(video.avg_frame_rate ?? video.r_frame_rate ?? "unknown"),
    codec: String(video.codec_name ?? "unknown"),
    pixelFormat: String(video.pix_fmt ?? "unknown"),
    audioStreams: streams.filter((stream) => stream.codec_type === "audio").length,
  };
}

function assertFourByThree(file: string, metadata: Probe, tolerance = 0.001) {
  const ratio = metadata.width / metadata.height;
  if (Math.abs(ratio - 4 / 3) > tolerance) {
    throw new Error(
      `${file}: expected native 4:3, got ${metadata.width}x${metadata.height} (${ratio.toFixed(4)}); refusing to crop`,
    );
  }
}

function deliveryGeometry(metadata: Probe) {
  const width = metadata.width - (metadata.width % 2);
  const height = metadata.height - (metadata.height % 2);
  const ratio = width / height;
  if (ratio >= 4 / 3) {
    const targetHeight = Math.ceil((width * 3 / 4) / 2) * 2;
    return {
      width,
      height: targetHeight,
      filter: `scale=${width}:${height},pad=${width}:${targetHeight}:0:(oh-ih)/2:color=white,format=yuv420p`,
      description: targetHeight === height
        ? `even-dimension normalization to ${width}x${height}; no crop`
        : `pure-white vertical pad from ${width}x${height} to ${width}x${targetHeight}; no crop`,
    };
  }
  const targetWidth = Math.ceil((height * 4 / 3) / 2) * 2;
  return {
    width: targetWidth,
    height,
    filter: `scale=${width}:${height},pad=${targetWidth}:${height}:(ow-iw)/2:0:color=white,format=yuv420p`,
    description: targetWidth === width
      ? `even-dimension normalization to ${width}x${height}; no crop`
      : `pure-white horizontal pad from ${width}x${height} to ${targetWidth}x${height}; no crop`,
  };
}

async function writeJson(file: string, value: unknown) {
  const temporary = `${file}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await fs.rename(temporary, file);
}

function inferProviderId(file: string) {
  return path.basename(file).match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  )?.[1];
}

async function main() {
  const args = process.argv.slice(2);
  const positional = args.filter((value, index) => {
    if (value.startsWith("--")) return false;
    return index === 0 || !args[index - 1]?.startsWith("--");
  });
  const [storyId, mediaStateId] = positional;
  const sourceArgument = valueAfter(args, "--source");
  if (!storyId || !mediaStateId || !sourceArgument) usage();

  const force = args.includes("--force");
  const storyDir = path.join(CONTENT, storyId);
  const productionPath = path.join(storyDir, "production.json");
  const manifestPath = path.join(storyDir, "motion-production.json");
  const production = JSON.parse(await fs.readFile(productionPath, "utf8")) as Production;
  if (production.schemaVersion !== 2) {
    throw new Error(`${storyId}: production.json is not schema v2`);
  }

  const matches = production.scenes.flatMap((scene) => scene.media
    .filter((state) => state.id === mediaStateId)
    .map((state) => ({ scene, state })));
  if (matches.length !== 1) {
    throw new Error(`${storyId}: expected one media state named ${mediaStateId}, found ${matches.length}`);
  }
  const [{ scene, state }] = matches;

  const explicitRole = valueAfter(args, "--role");
  if (explicitRole && explicitRole !== "living-loop" && explicitRole !== "one-shot") {
    throw new Error(`invalid --role ${explicitRole}`);
  }
  const beatBoard = JSON.parse(
    await fs.readFile(path.join(storyDir, "beat-board.json"), "utf8"),
  ) as { beats: Array<{ mediaState: string; tier: string }> };
  const associatedBeats = beatBoard.beats.filter((beat) => beat.mediaState === mediaStateId);
  const inferredRole: MotionRole = associatedBeats.some((beat) => beat.tier === "motion-shot")
    ? "one-shot"
    : "living-loop";
  const role = (explicitRole ?? inferredRole) as MotionRole;
  const explicitPosterFrame = valueAfter(args, "--poster-frame");
  if (explicitPosterFrame && explicitPosterFrame !== "first" && explicitPosterFrame !== "last") {
    throw new Error(`invalid --poster-frame ${explicitPosterFrame}`);
  }
  const posterFrame = (explicitPosterFrame ?? (role === "one-shot" ? "last" : "first")) as PosterFrame;

  const sourceInput = path.resolve(sourceArgument.replace(/^~(?=\/)/, process.env.HOME ?? ""));
  const extension = path.extname(sourceInput).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(extension)) throw new Error(`${sourceInput}: unsupported video extension`);
  await fs.access(sourceInput);
  const sourceProbe = await probe(sourceInput);
  // Grok's "720p 4:3" export is currently 1104x816 (about 1.47% wide).
  // Accept only this narrow provider variance and restore exact 4:3 by adding
  // white matte pixels. Wider mismatches are rejected; content is never cropped.
  assertFourByThree(sourceInput, sourceProbe, 0.03);
  const geometry = deliveryGeometry(sourceProbe);

  let existingManifest: MotionManifest | undefined;
  try {
    existingManifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as MotionManifest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const existingState = existingManifest?.states.find((item) => item.mediaState === mediaStateId);
  if (existingState && !force) {
    throw new Error(`${mediaStateId}: already ingested; pass --force to replace it`);
  }

  const provider = valueAfter(args, "--provider") ?? "grok-imagine";
  const providerId = inferProviderId(sourceInput);
  const sourceName = `${mediaStateId}-${providerId ?? (await sha256(sourceInput)).slice(0, 8)}${extension}`;
  const preservedSourceRelative = path.posix.join(
    "scenes", scene.id, "provider-originals", "motion", sourceName,
  );
  const deliveryRelative = path.posix.join("scenes", scene.id, `${mediaStateId}.mp4`);
  const posterRelative = path.posix.join("scenes", scene.id, `${mediaStateId}-motion-poster.png`);
  const preservedSource = path.join(storyDir, preservedSourceRelative);
  const delivery = path.join(storyDir, deliveryRelative);
  const poster = path.join(storyDir, posterRelative);
  await fs.mkdir(path.dirname(preservedSource), { recursive: true });
  await fs.mkdir(path.dirname(delivery), { recursive: true });
  if (path.resolve(sourceInput) !== path.resolve(preservedSource)) await fs.copyFile(sourceInput, preservedSource);

  await exec("ffmpeg", [
    "-y", "-loglevel", "error",
    "-i", preservedSource,
    "-map", "0:v:0",
    "-an",
    "-vf", geometry.filter,
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-movflags", "+faststart",
    delivery,
  ]);
  const deliveryProbe = await probe(delivery);
  assertFourByThree(delivery, deliveryProbe);
  if (deliveryProbe.codec !== "h264" || deliveryProbe.pixelFormat !== "yuv420p") {
    throw new Error(`${delivery}: expected h264/yuv420p, got ${deliveryProbe.codec}/${deliveryProbe.pixelFormat}`);
  }
  if (deliveryProbe.audioStreams !== 0) throw new Error(`${delivery}: delivery must be muted`);

  const seekArgs = posterFrame === "last"
    ? ["-sseof", "-0.05", "-i", delivery]
    : ["-ss", "0.04", "-i", delivery];
  await exec("ffmpeg", [
    "-y", "-loglevel", "error",
    ...seekArgs,
    "-frames:v", "1",
    "-vf", "format=rgb24",
    poster,
  ]);

  const stateRecord: MotionState = {
    sceneId: scene.id,
    mediaState: mediaStateId,
    role,
    provider,
    ...(providerId ? { providerId } : {}),
    ...(valueAfter(args, "--provider-url") ? { providerUrl: valueAfter(args, "--provider-url") } : {}),
    ...(valueAfter(args, "--prompt-ref") ? { promptRef: valueAfter(args, "--prompt-ref") } : {}),
    source: preservedSourceRelative,
    sourceSha256: await sha256(preservedSource),
    sourceProbe,
    deliveryTransform: geometry.description,
    delivery: deliveryRelative,
    deliverySha256: await sha256(delivery),
    deliveryProbe,
    poster: posterRelative,
    posterSha256: await sha256(poster),
    posterFrame,
    acceptedAt: new Date().toISOString(),
  };

  const otherStates = existingManifest?.states.filter((item) => item.mediaState !== mediaStateId) ?? [];
  const states = [...otherStates, stateRecord].sort((a, b) => {
    const sceneOrder = production.scenes.findIndex((candidate) => candidate.id === a.sceneId)
      - production.scenes.findIndex((candidate) => candidate.id === b.sceneId);
    if (sceneOrder !== 0) return sceneOrder;
    const media = production.scenes.find((candidate) => candidate.id === a.sceneId)?.media ?? [];
    return media.findIndex((candidate) => candidate.id === a.mediaState)
      - media.findIndex((candidate) => candidate.id === b.mediaState);
  });
  const expectedStates = production.scenes.reduce((count, candidate) => count + candidate.media.length, 0);
  const manifest: MotionManifest = {
    schemaVersion: 1,
    storyId,
    status: states.length === expectedStates ? "complete" : "in-progress",
    expectedStates,
    acceptedStates: states.length,
    format: {
      creativeAspectRatio: "4:3",
      deliveryCodec: "h264",
      pixelFormat: "yuv420p",
      audio: "muted",
      responsiveCrop: "none",
    },
    states,
    ...(existingManifest?.candidates ? { candidates: existingManifest.candidates } : {}),
  };

  Object.assign(state, {
    kind: "video",
    src: deliveryRelative,
    poster: posterRelative,
    loop: role === "living-loop",
  });
  await writeJson(productionPath, production);
  await writeJson(manifestPath, manifest);
  console.log(
    `${storyId}/${scene.id}/${mediaStateId}: ${sourceProbe.width}x${sourceProbe.height} `
    + `${sourceProbe.duration.toFixed(3)}s -> muted ${deliveryProbe.codec}/${deliveryProbe.pixelFormat}; `
    + `${posterFrame}-frame poster; ${states.length}/${expectedStates} accepted`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
