/**
 * Narration pipeline (docs/06): page text → audio + word timestamps.
 *
 *   pnpm narrate <story-id> [--force]
 *
 * Adapter order: ElevenLabs with-timestamps (if ELEVENLABS_API_KEY) else
 * macOS `say` + duration-proportional estimation. Existing audio is never
 * regenerated unless --force (quota is spent once, reruns are free).
 * Writes content/<id>/audio/<page>.mp3 + .words.json and fills each
 * page's narration field in story.json.
 */
import { execFile } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";

const exec = promisify(execFile);
const CONTENT = path.join(process.cwd(), "content");

interface WordStamp {
  i: number;
  start: number;
  end: number;
}

interface CharAlignment {
  characters: string[];
  starts: number[];
  ends: number[];
}

async function loadDotEnv() {
  try {
    const txt = await fs.readFile(path.join(process.cwd(), ".env"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // no .env — adapters fall back
  }
}

/** Group character timestamps into per-token word stamps (runs split on whitespace). */
function wordsFromChars(align: CharAlignment, tokenCount: number, pageId: string): WordStamp[] {
  const runs: Array<{ first: number; last: number }> = [];
  let open = false;
  align.characters.forEach((ch, idx) => {
    if (/\s/.test(ch)) {
      open = false;
      return;
    }
    if (!open) {
      runs.push({ first: idx, last: idx });
      open = true;
    } else {
      runs[runs.length - 1].last = idx;
    }
  });
  if (runs.length !== tokenCount) {
    throw new Error(
      `${pageId}: ${runs.length} spoken words vs ${tokenCount} tokens — text/tokens out of sync`,
    );
  }
  return runs.map((r, i) => ({
    i,
    start: round3(align.starts[r.first]),
    end: round3(align.ends[r.last]),
  }));
}

/** No timestamps available: distribute duration proportionally across characters. */
function wordsFromDuration(text: string, duration: number, tokenCount: number, pageId: string): WordStamp[] {
  const dt = duration / text.length;
  const runs: Array<{ first: number; last: number }> = [];
  let open = false;
  [...text].forEach((ch, idx) => {
    if (/\s/.test(ch)) {
      open = false;
      return;
    }
    if (!open) {
      runs.push({ first: idx, last: idx });
      open = true;
    } else {
      runs[runs.length - 1].last = idx;
    }
  });
  if (runs.length !== tokenCount) {
    throw new Error(`${pageId}: ${runs.length} words vs ${tokenCount} tokens`);
  }
  return runs.map((r, i) => ({
    i,
    start: round3(r.first * dt),
    end: round3((r.last + 1) * dt),
  }));
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

async function elevenlabsTts(text: string): Promise<{ mp3: Buffer; align: CharAlignment }> {
  const key = process.env.ELEVENLABS_API_KEY!;
  const voice = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"; // Rachel
  const call = async (withSpeed: boolean) =>
    fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "content-type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            ...(withSpeed ? { speed: 0.87 } : {}), // slow, storyteller pace
          },
        }),
      },
    );
  let res = await call(true);
  if (res.status === 400 || res.status === 422) res = await call(false);
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as {
    audio_base64: string;
    alignment: {
      characters: string[];
      character_start_times_seconds: number[];
      character_end_times_seconds: number[];
    };
  };
  return {
    mp3: Buffer.from(json.audio_base64, "base64"),
    align: {
      characters: json.alignment.characters,
      starts: json.alignment.character_start_times_seconds,
      ends: json.alignment.character_end_times_seconds,
    },
  };
}

async function sayTts(text: string, mp3Path: string): Promise<number> {
  const aiff = path.join(os.tmpdir(), `narrate-${Date.now()}.aiff`);
  await exec("say", ["-v", "Samantha", "-r", "150", "-o", aiff, text]);
  await exec("ffmpeg", ["-y", "-i", aiff, "-codec:a", "libmp3lame", "-qscale:a", "4", mp3Path]);
  await fs.rm(aiff, { force: true });
  const { stdout } = await exec("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    mp3Path,
  ]);
  return parseFloat(stdout.trim());
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const storyId = args.find((a) => !a.startsWith("--"));
  if (!storyId) {
    console.error("usage: pnpm narrate <story-id> [--force]");
    process.exit(1);
  }
  await loadDotEnv();
  const useEleven = Boolean(process.env.ELEVENLABS_API_KEY);
  console.log(`narrating ${storyId} via ${useEleven ? "elevenlabs" : "macos-say"}`);

  const storyPath = path.join(CONTENT, storyId, "story.json");
  const story = JSON.parse(await fs.readFile(storyPath, "utf8"));
  const audioDir = path.join(CONTENT, storyId, "audio");
  await fs.mkdir(audioDir, { recursive: true });

  for (const page of story.pages) {
    const mp3Rel = `audio/${page.id}.mp3`;
    const wordsRel = `audio/${page.id}.words.json`;
    const mp3Path = path.join(CONTENT, storyId, mp3Rel);
    const exists = await fs.access(mp3Path).then(() => true, () => false);
    if (exists && !force) {
      page.narration = { audio: mp3Rel, words: wordsRel };
      console.log(`  ${page.id}: cached, skipping`);
      continue;
    }

    let words: WordStamp[];
    if (useEleven) {
      const { mp3, align } = await elevenlabsTts(page.text);
      await fs.writeFile(mp3Path, mp3);
      words = wordsFromChars(align, page.tokens.length, page.id);
    } else {
      const duration = await sayTts(page.text, mp3Path);
      words = wordsFromDuration(page.text, duration, page.tokens.length, page.id);
    }
    await fs.writeFile(path.join(CONTENT, storyId, wordsRel), JSON.stringify(words));
    page.narration = { audio: mp3Rel, words: wordsRel };
    const dur = words[words.length - 1].end;
    console.log(`  ${page.id}: ${words.length} words, ~${dur.toFixed(2)}s`);
  }

  await fs.writeFile(storyPath, JSON.stringify(story, null, 2) + "\n");
  console.log("story.json updated with narration entries");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
