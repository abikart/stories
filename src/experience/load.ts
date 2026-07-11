import { promises as fs } from "fs";
import path from "path";
import {
  ExperienceProductionSchema,
  type ExperienceProduction,
} from "@/experience/schema";

const CONTENT = path.resolve(process.cwd(), "content");

export async function loadExperience(id: string): Promise<ExperienceProduction> {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid experience id: ${id}`);
  const file = path.join(CONTENT, id, "production.json");
  const raw = await fs.readFile(file, "utf8");
  return ExperienceProductionSchema.parse(JSON.parse(raw));
}
