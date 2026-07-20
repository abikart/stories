import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";
import { ExperienceProductionSchema } from "@/experience/schema";

async function main() {
  const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";
  const storyId = "fern-and-the-silent-seed-bells";
  const evidenceDirectory = path.join(process.cwd(), "docs", "evidence", "design-system");
  await fs.mkdir(evidenceDirectory, { recursive: true });

  const production = ExperienceProductionSchema.parse(JSON.parse(await fs.readFile(
    path.join(process.cwd(), "content", storyId, "production.json"),
    "utf8",
  )));
  const interaction = production.scenes.find((scene) => scene.interaction)?.interaction;
  const trigger = interaction
    ? production.scenes.flatMap((scene) => scene.phrases)
      .find((phrase) => phrase.id === interaction.triggerAfterPhrase)
    : null;

  const chromiumBrowser = await chromium.launch({ headless: true });
  try {
    const catalog = await chromiumBrowser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await catalog.goto(`${baseUrl}/dev/design-system`, { waitUntil: "networkidle" });
    await catalog.screenshot({ path: path.join(evidenceDirectory, "after-catalog-chromium.png"), fullPage: true });

    const phone = await chromiumBrowser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await phone.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
    await phone.screenshot({ path: path.join(evidenceDirectory, "after-fern-phone-chromium.png"), fullPage: true });

    if (interaction && trigger) {
      const guide = await chromiumBrowser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
      await guide.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
      await guide.getByRole("button", { name: "Read with me", exact: true }).click();
      await guide.getByLabel("Story position").evaluate((element, value) => {
        const input = element as HTMLInputElement;
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        setValue?.call(input, String(value));
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }, Math.max(0, trigger.end - 0.3));
      await guide.getByRole("button", { name: "Play", exact: true }).click();
      await guide.locator(".drag-guide-target").waitFor({ state: "visible", timeout: 5000 });
      await guide.screenshot({ path: path.join(evidenceDirectory, "after-fern-guide-chromium.png"), fullPage: true });
    }
  } finally {
    await chromiumBrowser.close();
  }

  const webkitBrowser = await webkit.launch({ headless: true });
  try {
    const story = await webkitBrowser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await story.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
    await story.screenshot({ path: path.join(evidenceDirectory, "after-fern-webkit.png"), fullPage: true });
  } finally {
    await webkitBrowser.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
