import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { ExperienceProductionSchema } from "../src/experience/schema";

const exec = promisify(execFile);
const CONTENT = path.resolve(process.cwd(), "content");
const DURATION = 77.6;

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

const MUSIC_PROMPT = `Instrumental bedtime picture-book underscore for an original story about a small moth child and a firefly finding their way home. 77.6 seconds. Sparse felt piano, celesta, soft viola harmonics, tiny hand chimes, and a warm breath of woodwind. No vocals, no choir, no percussion pulse, no trailer rise, no dramatic hits. Leave generous space for a spoken narrator. Emotional arc: moonlit wonder with a small worry; playful light at 20 seconds; tender uncertainty around 36 seconds; companionship and gentle forward motion around 47 seconds; a warm lantern bloom around 64 seconds; quiet belonging and a soft resolved final page. Intimate, organic, child-safe, never sugary, ending cleanly without a long fade.`;

const EFFECTS = [
  {
    id: "woodland-ambience-source",
    file: "woodland-ambience-source.mp3",
    prompt: "Seamless enchanted woodland night ambience for a gentle picture book: soft leaves, distant creek, tiny night insects, occasional far firefly-wing shimmer, calm and intimate, no birdsong melody, no footsteps, no voices, no music, no sudden sounds.",
    duration: 30,
    loop: true,
  },
  {
    id: "thread-release",
    file: "thread-release.mp3",
    prompt: "A tiny silver spider thread releases with one soft pluck and a delicate warm sparkle, whimsical and quiet, no cartoon boing, no voice, clean short tail.",
    duration: 3,
    loop: false,
  },
  {
    id: "glow-guide",
    file: "glow-guide.mp3",
    prompt: "A gentle trail of firefly light travels across sleepy mushrooms and a narrow creek: soft moving bell particles and a warm airy shimmer, intimate, magical but subtle, no harsh whoosh, no voice.",
    duration: 5,
    loop: false,
  },
  {
    id: "lantern-bloom",
    file: "lantern-bloom.mp3",
    prompt: "An acorn-shaped glass lantern awakens and blooms into warm golden light: delicate glass shimmer, one low soft chime, and a tender sparkling release, magical picture-book scale, no explosion, no voice.",
    duration: 5,
    loop: false,
  },
];

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

async function generateMusic(output: string) {
  const response = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      prompt: MUSIC_PROMPT,
      music_length_ms: Math.round(DURATION * 1000),
      model_id: "music_v1",
      force_instrumental: true,
      store_for_inpainting: false,
    }),
  });
  const record = recordFromResponse("music-source", "/v1/music", MUSIC_PROMPT, DURATION, false, "audio/sources/music-source.mp3", response);
  await writeResponse(response, output);
  return record;
}

async function generateEffect(effect: typeof EFFECTS[number], output: string) {
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
    const record = await generateMusic(musicSource);
    records.push({ ...record, generatedAt: await generatedAt(musicSource) });
  } else {
    records.push(previousRecords.get("music-source") ?? {
      id: "music-source", endpoint: "/v1/music", prompt: MUSIC_PROMPT,
      durationSeconds: DURATION, loop: false, file: "audio/sources/music-source.mp3",
      characterCost: null, requestId: null, songId: null, generatedAt: await generatedAt(musicSource),
    });
  }

  for (const effect of EFFECTS) {
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
    "-af", "loudnorm=I=-24:LRA=8:TP=-4", "-t", String(DURATION),
    "-ar", "44100", "-ac", "2", "-b:a", "192k", path.join(audioDir, "music.mp3"),
  ]);
  await exec("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-stream_loop", "-1",
    "-i", path.join(sourceDir, "woodland-ambience-source.mp3"),
    "-af", "loudnorm=I=-32:LRA=7:TP=-7", "-t", String(DURATION),
    "-ar", "44100", "-ac", "2", "-b:a", "192k", path.join(audioDir, "ambience.mp3"),
  ]);
  await exec("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
    "-i", path.join(sourceDir, "thread-release.mp3"),
    "-i", path.join(sourceDir, "glow-guide.mp3"),
    "-i", path.join(sourceDir, "lantern-bloom.mp3"),
    "-filter_complex",
    "[1:a]aformat=channel_layouts=stereo,volume=-9dB,adelay=25250|25250[thread];"
      + "[2:a]aformat=channel_layouts=stereo,volume=-11dB,adelay=47400|47400[guide];"
      + "[3:a]aformat=channel_layouts=stereo,volume=-8dB,adelay=64200|64200[bloom];"
      + "[0:a][thread][guide][bloom]amix=inputs=4:duration=first:normalize=0,alimiter=limit=0.82[out]",
    "-map", "[out]", "-t", String(DURATION), "-ar", "44100", "-ac", "2",
    "-b:a", "192k", path.join(audioDir, "effects.mp3"),
  ]);
  await exec("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", path.join(audioDir, "performance.mp3"),
    "-i", path.join(audioDir, "music.mp3"),
    "-i", path.join(audioDir, "ambience.mp3"),
    "-i", path.join(audioDir, "effects.mp3"),
    "-filter_complex", "[0:a]volume=1[n];[1:a]volume=0.24[m];[2:a]volume=0.3[a];[3:a]volume=0.7[e];[n][m][a][e]amix=inputs=4:duration=first:normalize=0,alimiter=limit=0.9[out]",
    "-map", "[out]", "-t", String(DURATION), "-ar", "44100", "-ac", "2",
    "-b:a", "192k", path.join(audioDir, "mix-preview.mp3"),
  ]);

  const manifest = {
    generatedAt: records.map((record) => record.generatedAt).sort().at(-1),
    provider: "ElevenLabs",
    durationSeconds: DURATION,
    knownCharacterCost: records.reduce((sum, record) => sum + (record.characterCost ?? 0), 0),
    records,
    cues: [
      { id: "thread-release", at: 25.25 },
      { id: "glow-guide", at: 47.4 },
      { id: "lantern-bloom", at: 64.2 },
    ],
    mix: {
      narration: 1,
      music: 0.24,
      ambience: 0.3,
      effects: 0.7,
      narrationTargetLufs: -16,
      musicTargetLufs: -24,
      ambienceTargetLufs: -32,
    },
  };
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  const productionPath = path.join(storyDir, "production.json");
  const production = ExperienceProductionSchema.parse(JSON.parse(await fs.readFile(productionPath, "utf8")));
  if (!production.performance) throw new Error("performance metadata is required");
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
