import { promises as fs } from "fs";
import path from "path";
import { StorySchema, type Story } from "@/engine/types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function listStoryIds(): Promise<string[]> {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const ids: string[] = [];
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith("_")) continue;
    try {
      await fs.access(path.join(CONTENT_DIR, e.name, "story.json"));
      ids.push(e.name);
    } catch {
      // not a story dir
    }
  }
  return ids.sort();
}

export async function loadStory(id: string): Promise<Story> {
  const file = path.join(CONTENT_DIR, id, "story.json");
  const raw = await fs.readFile(file, "utf8");
  return StorySchema.parse(JSON.parse(raw));
}

export async function loadAllStories(): Promise<Story[]> {
  const ids = await listStoryIds();
  return Promise.all(ids.map(loadStory));
}
