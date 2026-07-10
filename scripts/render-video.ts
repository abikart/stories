/**
 * Render a story's Read-to-me playthrough to MP4 (docs/03 M7, docs/06).
 *
 *   pnpm render <story-id> [--fps 30]
 *
 * Deterministic: Playwright drives /render/<id> one frame at a time via
 * window.__render.seek(T) under CDP virtual time (CSS/WAAPI beats advance
 * exactly one frame per frame), screenshots pipe into ffmpeg, and the
 * narration mp3s + a synthesized ambient bed are mixed by filtergraph at
 * the offsets from the SAME plan the visuals used. Output: out/<id>.mp4.
 */
import { spawn, type ChildProcess } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { chromium } from "playwright";

const PORT = 4599;
const W = 1920;
const H = 1080;

interface PagePlan {
  id: string;
  start: number;
  enter: number;
  audio: number;
  hold: number;
}

async function waitForServer(url: string, tries = 90): Promise<void> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`server at ${url} never became ready`);
}

async function main() {
  const storyId = process.argv[2];
  const fps = Number(process.argv[process.argv.indexOf("--fps") + 1]) || 30;
  if (!storyId) {
    console.error("usage: pnpm render <story-id> [--fps 30]");
    process.exit(1);
  }
  await fs.mkdir("out", { recursive: true });

  console.log(`starting next dev on :${PORT}…`);
  const server: ChildProcess = spawn("pnpm", ["exec", "next", "dev", "-p", String(PORT)], {
    stdio: "ignore",
    detached: false,
  });
  const cleanup = () => {
    try {
      server.kill();
    } catch {}
  };
  process.on("exit", cleanup);

  try {
    await waitForServer(`http://localhost:${PORT}/`);
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: W, height: H },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.on("console", (m) => {
      if (m.type() === "error") console.error("  [page]", m.text());
    });
    await page.goto(`http://localhost:${PORT}/render/${storyId}`, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => (window as unknown as { __render?: { ready: boolean } }).__render?.ready === true,
      undefined,
      { timeout: 60_000 },
    );
    const plan = (await page.evaluate(
      () => (window as unknown as { __render: { plan: { pages: PagePlan[]; total: number } } }).__render.plan,
    )) as { pages: PagePlan[]; total: number };
    const frames = Math.ceil(plan.total * fps);
    console.log(`plan: ${plan.pages.length} pages, ${plan.total.toFixed(1)}s → ${frames} frames @ ${fps}fps`);
    // NOTE: no CDP virtual time — pausing the clock deadlocks screenshot()
    // (compositor waits on BeginFrame). Capture runs near-realtime (~35fps
    // ≥ 30fps playback), so wall-clock CSS/WAAPI beats land ≈ correctly.

    // ffmpeg: screenshots on stdin + narration inputs + synthesized ambient
    const audioInputs: string[] = [];
    const delays: string[] = [];
    plan.pages.forEach((p, i) => {
      audioInputs.push("-i", path.join("content", storyId, "audio", `${p.id}.mp3`));
      const ms = Math.round((p.start + p.enter) * 1000);
      delays.push(`[${i + 1}:a]adelay=${ms}:all=1[a${i}]`);
    });
    const ambIdx = plan.pages.length + 1;
    const mixIn = plan.pages.map((_, i) => `[a${i}]`).join("") + `[amb]`;
    const filter = [
      ...delays,
      `[${ambIdx}:a]lowpass=f=300,volume=0.05[amb]`,
      `${mixIn}amix=inputs=${plan.pages.length + 1}:normalize=0[aout]`,
    ].join(";");

    const outPath = path.join("out", `${storyId}.mp4`);
    const ff = spawn("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(fps), "-i", "pipe:0",
      ...audioInputs,
      "-f", "lavfi", "-t", String(plan.total), "-i", "anoisesrc=color=brown:sample_rate=44100:amplitude=0.35",
      "-filter_complex", filter,
      "-map", "0:v", "-map", "[aout]",
      "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
      "-r", String(fps), "-t", String(plan.total),
      "-c:a", "aac", "-b:a", "192k",
      "-movflags", "+faststart",
      outPath,
    ]);
    ff.stderr.on("data", (d) => process.stderr.write(d));

    const t0 = Date.now();
    for (let f = 0; f < frames; f++) {
      const T = f / fps;
      await page.evaluate(
        (t) => (window as unknown as { __render: { seek: (t: number) => Promise<unknown> } }).__render.seek(t),
        T,
      );
      const shot = await page.screenshot({ type: "jpeg", quality: 92 });
      if (!ff.stdin.write(shot)) await new Promise((r) => ff.stdin.once("drain", r));
      if (f % 60 === 0) {
        const rate = (f + 1) / ((Date.now() - t0) / 1000);
        console.log(`  frame ${f}/${frames} (${rate.toFixed(1)} fps capture)`);
      }
    }
    ff.stdin.end();
    await new Promise<void>((resolve, reject) =>
      ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))),
    );
    await browser.close();
    const stat = await fs.stat(outPath);
    console.log(`✓ ${outPath} (${(stat.size / 1e6).toFixed(1)} MB, ${plan.total.toFixed(1)}s)`);
  } finally {
    cleanup();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
