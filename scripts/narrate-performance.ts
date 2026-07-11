import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { ExperienceProductionSchema } from "../src/experience/schema";

const exec = promisify(execFile);
const CONTENT = path.resolve(process.cwd(), "content");
const MODEL = "eleven_v3";

type DirectionSource = {
  cleanText: string;
  directedText: string;
  targetDurationSeconds: number;
  candidates: Array<{
    id: string;
    voiceId: string;
    voiceName: string;
    stability: number;
    preference: number;
  }>;
};

type CandidateResult = DirectionSource["candidates"][number] & {
  file: string;
  duration: number;
  bytes: number;
  generatedAt: string;
  model: string;
  charactersCharged: number;
};

type AlignmentWord = { text: string; start: number; end: number; loss?: number };

async function loadDotEnv() {
  try {
    const text = await fs.readFile(path.join(process.cwd(), ".env"), "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !(match[1] in process.env)) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // The caller receives a focused missing-key error below.
  }
}

async function duration(file: string) {
  const { stdout } = await exec("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
  ]);
  return Number.parseFloat(stdout.trim());
}

async function normalizePerformance(input: string, output: string) {
  await exec("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", input,
    "-af", "loudnorm=I=-16:LRA=11:TP=-1.5",
    "-ar", "44100", "-ac", "1", "-b:a", "128k",
    output,
  ]);
}

async function generateCandidate(
  source: DirectionSource,
  candidate: DirectionSource["candidates"][number],
  output: string,
) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${candidate.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: source.directedText,
        model_id: MODEL,
        voice_settings: {
          stability: candidate.stability,
          similarity_boost: 0.75,
        },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`ElevenLabs TTS ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }
  await fs.writeFile(output, Buffer.from(await response.arrayBuffer()));
}

function selectCandidate(results: CandidateResult[], target: number) {
  return [...results].sort((a, b) => {
    const aScore = a.preference - Math.abs(a.duration - target) / target;
    const bScore = b.preference - Math.abs(b.duration - target) / target;
    return bScore - aScore;
  })[0];
}

async function forceAlign(audioPath: string, text: string) {
  const form = new FormData();
  form.append("file", new Blob([await fs.readFile(audioPath)], { type: "audio/mpeg" }), "performance.mp3");
  form.append("text", text);
  const response = await fetch("https://api.elevenlabs.io/v1/forced-alignment", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
    body: form,
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs alignment ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }
  return await response.json() as {
    characters: Array<{ text: string; start: number; end: number }>;
    words: AlignmentWord[];
    loss: number;
  };
}

function spokenWords(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
}

function updatePhraseTimings(
  production: ReturnType<typeof ExperienceProductionSchema.parse>,
  alignedWords: AlignmentWord[],
) {
  const spokenAlignedWords = alignedWords.filter((word) => spokenWords(word.text).length > 0);
  const phrases = production.scenes.flatMap((scene) => scene.phrases);
  const expected = phrases.flatMap((phrase) => spokenWords(phrase.text));
  if (spokenAlignedWords.length !== expected.length) {
    throw new Error(
      `forced alignment returned ${spokenAlignedWords.length} spoken words for ${expected.length} manuscript words`,
    );
  }

  let cursor = 0;
  for (const phrase of phrases) {
    const count = spokenWords(phrase.text).length;
    const words = spokenAlignedWords.slice(cursor, cursor + count);
    if (words.length === 0) throw new Error(`phrase ${phrase.id} has no aligned words`);
    phrase.start = Math.round(words[0].start * 1000) / 1000;
    phrase.end = Math.round(words[words.length - 1].end * 1000) / 1000;
    phrase.words = words.map((word) => ({
      text: word.text,
      start: Math.round(word.start * 1000) / 1000,
      end: Math.round(word.end * 1000) / 1000,
    }));
    cursor += count;
  }
}

async function main() {
  const storyId = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!storyId) throw new Error("usage: pnpm narrate:performance <story-id> [--force]");
  const force = process.argv.includes("--force");
  await loadDotEnv();
  if (!process.env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is required");

  const dir = path.join(CONTENT, storyId);
  const source = JSON.parse(await fs.readFile(path.join(dir, "performance-source.json"), "utf8")) as DirectionSource;
  const productionPath = path.join(dir, "production.json");
  const production = ExperienceProductionSchema.parse(JSON.parse(await fs.readFile(productionPath, "utf8")));
  const productionText = production.scenes.flatMap((scene) => scene.phrases).map((phrase) => phrase.text).join(" ");
  if (productionText !== source.cleanText) {
    throw new Error("performance-source cleanText must exactly match production phrase text");
  }

  const candidateDir = path.join(dir, "audio", "candidates");
  await fs.mkdir(candidateDir, { recursive: true });
  const results: CandidateResult[] = [];
  for (const candidate of source.candidates) {
    const file = path.join(candidateDir, `${candidate.id}.mp3`);
    const cached = await fs.access(file).then(() => true, () => false);
    if (!cached || force) {
      console.log(`generating ${candidate.id} — ${candidate.voiceName}`);
      await generateCandidate(source, candidate, file);
    } else {
      console.log(`cached ${candidate.id}`);
    }
    const stats = await fs.stat(file);
    results.push({
      ...candidate,
      file: `audio/candidates/${candidate.id}.mp3`,
      duration: await duration(file),
      bytes: stats.size,
      generatedAt: new Date(stats.mtimeMs).toISOString(),
      model: MODEL,
      charactersCharged: source.directedText.length,
    });
  }

  const selected = selectCandidate(results, source.targetDurationSeconds);
  const finalAudio = path.join(dir, "audio", "performance.mp3");
  await normalizePerformance(path.join(dir, selected.file), finalAudio);
  const finalDuration = await duration(finalAudio);
  console.log(`selected ${selected.id} (${selected.duration.toFixed(2)}s)`);

  const alignmentPath = path.join(dir, "audio", "alignment.json");
  const alignmentCached = !force && await fs.access(alignmentPath).then(() => true, () => false);
  const alignment = alignmentCached
    ? JSON.parse(await fs.readFile(alignmentPath, "utf8")) as Awaited<ReturnType<typeof forceAlign>>
    : await forceAlign(finalAudio, source.cleanText);
  if (!alignmentCached) {
    await fs.writeFile(alignmentPath, JSON.stringify(alignment, null, 2) + "\n");
  }
  updatePhraseTimings(production, alignment.words);

  const manifest = {
    generatedAt: new Date(Math.max(...results.map((result) => Date.parse(result.generatedAt)))).toISOString(),
    model: MODEL,
    directedCharactersPerCandidate: source.directedText.length,
    totalCharactersCharged: results.reduce((sum, result) => sum + result.charactersCharged, 0),
    selectionMethod: "editorial voice-profile preference plus target-duration fit",
    targetDurationSeconds: source.targetDurationSeconds,
    selected: selected.id,
    alignmentLoss: alignment.loss,
    normalization: { integratedLufs: -16, loudnessRange: 11, truePeakDb: -1.5 },
    candidates: results,
  };
  await fs.writeFile(path.join(candidateDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  production.performance = {
    audio: "audio/performance.mp3",
    alignment: "audio/alignment.json",
    duration: finalDuration,
    model: MODEL,
    selectedCandidate: selected.id,
    candidatesManifest: "audio/candidates/manifest.json",
  };
  await fs.writeFile(productionPath, JSON.stringify(production, null, 2) + "\n");
  console.log(
    `aligned ${alignment.words.filter((word) => spokenWords(word.text).length > 0).length} words `
      + `across ${production.scenes.length} scenes; loss ${alignment.loss}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
