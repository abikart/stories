import { promises as fs } from "fs";
import path from "path";

/**
 * Serves story assets (narration audio, timestamp JSON, frames) straight
 * from content/ — single source of truth, no mirroring into public/.
 */
const CONTENT = path.resolve(process.cwd(), "content");

const TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ storyId: string; file: string[] }> },
) {
  const { storyId, file } = await params;
  if (!/^[a-z0-9-]+$/.test(storyId)) return new Response("bad story id", { status: 400 });
  const resolved = path.resolve(CONTENT, storyId, ...file);
  if (!resolved.startsWith(CONTENT + path.sep)) return new Response("forbidden", { status: 403 });
  try {
    const data = await fs.readFile(resolved);
    return new Response(new Uint8Array(data), {
      headers: {
        "content-type": TYPES[path.extname(resolved)] ?? "application/octet-stream",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
