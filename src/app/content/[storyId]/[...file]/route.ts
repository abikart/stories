import { promises as fs } from "fs";
import path from "path";

/**
 * Serves story assets (narration audio, timestamp JSON, frames) straight
 * from content/ — single source of truth, no mirroring into public/.
 */
const CONTENT = path.resolve(process.cwd(), "content");

const TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storyId: string; file: string[] }> },
) {
  const { storyId, file } = await params;
  if (!/^[a-z0-9-]+$/.test(storyId)) return new Response("bad story id", { status: 400 });
  const resolved = path.resolve(CONTENT, storyId, ...file);
  if (!resolved.startsWith(CONTENT + path.sep)) return new Response("forbidden", { status: 403 });
  try {
    const { size } = await fs.stat(resolved);
    const type = TYPES[path.extname(resolved)] ?? "application/octet-stream";
    const range = req.headers.get("range");
    const commonHeaders = {
      "accept-ranges": "bytes",
      "cache-control": "public, max-age=3600",
      "content-type": type,
    };

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) {
        return new Response(null, {
          status: 416,
          headers: { ...commonHeaders, "content-range": `bytes */${size}` },
        });
      }

      const suffixLength = match[1] ? null : Number(match[2]);
      const start = suffixLength === null
        ? Number(match[1])
        : Math.max(0, size - suffixLength);
      const requestedEnd = match[2] && suffixLength === null ? Number(match[2]) : size - 1;
      const end = Math.min(requestedEnd, size - 1);

      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= size) {
        return new Response(null, {
          status: 416,
          headers: { ...commonHeaders, "content-range": `bytes */${size}` },
        });
      }

      const handle = await fs.open(resolved, "r");
      try {
        const length = end - start + 1;
        const data = Buffer.allocUnsafe(length);
        await handle.read(data, 0, length, start);
        return new Response(new Uint8Array(data), {
          status: 206,
          headers: {
            ...commonHeaders,
            "content-length": String(length),
            "content-range": `bytes ${start}-${end}/${size}`,
          },
        });
      } finally {
        await handle.close();
      }
    }

    const data = await fs.readFile(resolved);
    return new Response(new Uint8Array(data), {
      headers: {
        ...commonHeaders,
        "content-length": String(size),
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
