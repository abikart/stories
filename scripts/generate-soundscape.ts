import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { ExperienceProductionSchema } from "../src/experience/schema";

const exec = promisify(execFile);
const CONTENT = path.resolve(process.cwd(), "content");

type EffectConfig = {
  id: string;
  file: string;
  prompt: string;
  duration: number;
  loop: boolean;
  at: number;
  gainDb: number;
};

type SoundscapeConfig = {
  musicPrompt: string;
  ambience: Omit<EffectConfig, "at" | "gainDb">;
  effects: EffectConfig[];
  mix: {
    narration: number;
    music: number;
    ambience: number;
    effects: number;
    narrationTargetLufs: number;
    musicTargetLufs: number;
    ambienceTargetLufs: number;
  };
};

type GenerationRecord = {
  id: string;
  endpoint: string;
  prompt: string;
  durationSeconds: number;
  loop: boolean;
  file: string;
  characterCost: number | null;
  requestId: string | null;
  songId: string | null;
  generatedAt: string;
};

async function loadDotEnv() {
  const text = await fs.readFile(path.join(process.cwd(), ".env"), "utf8");
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !(match[1] in process.env)) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

async function exists(file: string) {
  return fs.access(file).then(() => true, () => false);
}

async function writeResponse(response: Response, output: string) {
  if (!response.ok) throw new Error(`${response.status}: ${(await response.text()).slice(0, 600)}`);
  await fs.writeFile(output, Buffer.from(await response.arrayBuffer()));
}

function recordFromResponse(
  id: string,
  endpoint: string,
  prompt: string,
  durationSeconds: number,
  loop: boolean,
  file: string,
  response: Response,
): Omit<GenerationRecord, "generatedAt"> {
  const cost = response.headers.get("character-cost");
  return {
    id,
    endpoint,
    prompt,
    durationSeconds,
    loop,
    file,
    characterCost: cost ? Number(cost) : null,
    requestId: response.headers.get("request-id"),
    songId: response.headers.get("song-id"),
  };
}

async function generateMusic(prompt: string, duration: number, output: string) {
  const response = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      music_length_ms: Math.round(duration * 1000),
      model_id: "music_v1",
      force_instrumental: true,
      store_for_inpainting: false,
    }),
  });
  const record = recordFromResponse("music-source", "/v1/music", prompt, duration, false, "audio/sources/music-source.mp3", response);
  await writeResponse(response, output);
  return record;
}

async function generateEffect(effect: Omit<EffectConfig, "at" | "gainDb">, output: string) {
  const response = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      text: effect.prompt,
      loop: effect.loop,
      duration_seconds: effect.duration,
      prompt_influence: 0.45,
      model_id: "eleven_text_to_sound_v2",
    }),
  });
  const record = recordFromResponse(effect.id, "/v1/sound-generation", effect.prompt, effect.duration, effect.loop, `audio/sources/${effect.file}`, response);
  await writeResponse(response, output);
  return record;
}

async function generatedAt(file: string) {
  return new Date((await fs.stat(file)).mtimeMs).toISOString();
}

async function main() {
  const storyId = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!storyId) throw new Error("usage: pnpm soundscape <story-id> [--force]");
  const force = process.argv.includes("--force");
  await loadDotEnv();
  if (!process.env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is required");

  const storyDir = path.join(CONTENT, storyId);
  const productionPath = path.join(storyDir, "production.json");
  const production = ExperienceProductionSchema.parse(JSON.parse(await fs.readFile(productionPath, "utf8")));
  if (!production.performance) throw new Error("performance metadata is required");
  const duration = production.performance.duration;
  const configPath = path.join(storyDir, "soundscape-source.json");
  const config = JSON.parse(await fs.readFile(configPath, "utf8")) as SoundscapeConfig;
  const effects = [config.ambience, ...config.effects];
  const audioDir = path.join(storyDir, "audio");
  const sourceDir = path.join(audioDir, "sources");
  await fs.mkdir(sourceDir, { recursive: true });
  const manifestPath = path.join(audioDir, "soundscape-manifest.json");
  const previousRecords = await exists(manifestPath)
    ? new Map((JSON.parse(await fs.readFile(manifestPath, "utf8")).records as GenerationRecord[])
      .map((record) => [record.id, record]))
    : new Map<string, GenerationRecord>();
  const records: GenerationRecord[] = [];

  const musicSource = path.join(sourceDir, "music-source.mp3");
  if (force || !(await exists(musicSource))) {
    console.log("generating instrumental score");
    const record = await generateMusic(config.musicPrompt, duration, musicSource);
    records.push({ ...record, generatedAt: await generatedAt(musicSource) });
  } else {
    records.push(previousRecords.get("music-source") ?? {
      id: "music-source", endpoint: "/v1/music", prompt: config.musicPrompt,
      durationSeconds: duration, loop: false, file: "audio/sources/music-source.mp3",
      characterCost: null, requestId: null, songId: null, generatedAt: await generatedAt(musicSource),
    });
  }

  for (const effect of effects) {
    const output = path.join(sourceDir, effect.file);
    if (force || !(await exists(output))) {
      console.log(`generating ${effect.id}`);
      const record = await generateEffect(effect, output);
      records.push({ ...record, generatedAt: await generatedAt(output) });
    } else {
      records.push(previousRecords.get(effect.id) ?? {
        id: effect.id, endpoint: "/v1/sound-generation", prompt: effect.prompt,
        durationSeconds: effect.duration, loop: effect.loop, file: `audio/sources/${effect.file}`,
        characterCost: null, requestId: null, songId: null, generatedAt: await generatedAt(output),
      });
    }
  }

  await exec("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-i", musicSource,
    "-af", `loudnorm=I=${config.mix.musicTargetLufs}:LRA=8:TP=-4`, "-t", String(duration),
    "-ar", "44100", "-ac", "2", "-b:a", "192k", path.join(audioDir, "music.mp3"),
  ]);
  await exec("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-stream_loop", "-1",
    "-i", path.join(sourceDir, config.ambience.file),
    "-af", `loudnorm=I=${config.mix.ambienceTargetLufs}:LRA=7:TP=-7`, "-t", String(duration),
    "-ar", "44100", "-ac", "2", "-b:a", "192k", path.join(audioDir, "ambience.mp3"),
  ]);
  const effectInputs = config.effects.flatMap((effect) => ["-i", path.join(sourceDir, effect.file)]);
  const effectFilters = config.effects.map((effect, index) => {
    const delay = Math.round(effect.at * 1000);
    return `[${index + 1}:a]aformat=channel_layouts=stereo,volume=${effect.gainDb}dB,adelay=${delay}|${delay}[effect${index}]`;
  }).join(";");
  const effectLabels = config.effects.map((_, index) => `[effect${index}]`).join("");
  await exec("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
    ...effectInputs,
    "-filter_complex", `${effectFilters};[0:a]${effectLabels}amix=inputs=${config.effects.length + 1}:duration=first:normalize=0,alimiter=limit=0.82[out]`,
    "-map", "[out]", "-t", String(duration), "-ar", "44100", "-ac", "2",
    "-b:a", "192k", path.join(audioDir, "effects.mp3"),
  ]);
  await exec("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", path.join(audioDir, "performance.mp3"),
    "-i", path.join(audioDir, "music.mp3"),
    "-i", path.join(audioDir, "ambience.mp3"),
    "-i", path.join(audioDir, "effects.mp3"),
    "-filter_complex", `[0:a]volume=${config.mix.narration}[n];[1:a]volume=${config.mix.music}[m];[2:a]volume=${config.mix.ambience}[a];[3:a]volume=${config.mix.effects}[e];[n][m][a][e]amix=inputs=4:duration=first:normalize=0,alimiter=limit=0.9[out]`,
    "-map", "[out]", "-t", String(duration), "-ar", "44100", "-ac", "2",
    "-b:a", "192k", path.join(audioDir, "mix-preview.mp3"),
  ]);

  const manifest = {
    generatedAt: records.map((record) => record.generatedAt).sort().at(-1),
    provider: "ElevenLabs",
    durationSeconds: duration,
    knownCharacterCost: records.reduce((sum, record) => sum + (record.characterCost ?? 0), 0),
    records,
    cues: config.effects.map(({ id, at }) => ({ id, at })),
    mix: config.mix,
  };
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  production.performance.stems = {
    music: "audio/music.mp3",
    ambience: "audio/ambience.mp3",
    effects: "audio/effects.mp3",
  };
  await fs.writeFile(productionPath, JSON.stringify(production, null, 2) + "\n");
  console.log(`soundscape ready; known billed character cost ${manifest.knownCharacterCost}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
