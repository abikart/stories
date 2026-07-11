import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { ExperienceProductionSchema } from "@/experience/schema";
import { flattenReadingUnits } from "@/experience/performance/timeline";

async function main() {
  const storyId = process.argv.slice(2).find((argument) => argument !== "--" && !argument.startsWith("-"))
    ?? "pip-and-the-lantern-seed";
  const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";
  const productionPath = path.join(process.cwd(), "content", storyId, "production.json");
  const production = ExperienceProductionSchema.parse(JSON.parse(await fs.readFile(productionPath, "utf8")));

  if (!production.performance) throw new Error(`${storyId}: performance metadata is required`);

  const units = flattenReadingUnits(production);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failures: string[] = [];

  page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));
  await page.addInitScript(() => {
    const observed: string[] = [];
    Object.defineProperty(window, "__experienceUnhandled", { value: observed });
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason as { message?: string } | undefined;
      observed.push(String(reason?.message ?? event.reason));
    });
    window.addEventListener("error", (event) => observed.push(event.message));
  });

  try {
    await page.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
    const slider = page.getByLabel("Story position");

    const firstSafeStop = production.scenes.flatMap((scene) => scene.phrases)
      .find((phrase) => phrase.safeStopAfter);
    if (firstSafeStop) {
      const expectedLines = units.filter((unit) => unit.end <= firstSafeStop.end + 0.04);
      const beforeStop = Math.max(0, Math.floor((firstSafeStop.end - 0.3) * 20) / 20);
      await page.getByRole("button", { name: "Read with me", exact: true }).click();
      await slider.fill(String(beforeStop));
      await page.getByRole("button", { name: "Play", exact: true }).click();
      await page.waitForTimeout(1500);

      const passage = page.locator(".story-reading-passage");
      const lines = passage.locator("[data-reading-line] > p");
      const lineTexts = await lines.allTextContents();
      const expectedTexts = expectedLines.map((unit) => unit.text);
      if (JSON.stringify(lineTexts) !== JSON.stringify(expectedTexts)) {
        failures.push(`reading passage was ${JSON.stringify(lineTexts)}; expected ${JSON.stringify(expectedTexts)}`);
      }
      if (await page.getByLabel("Previous sentence").count()) failures.push("reading passage still has a Previous sentence control");
      if (await page.getByLabel("Next sentence").count()) failures.push("reading passage still has a Next sentence control");
      const continueActions = page.getByRole("button", { name: "Continue", exact: true });
      if (await continueActions.count() !== 1 || !await continueActions.isVisible()) {
        failures.push("reading wait does not have exactly one visible Continue action");
      }

      await page.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
    }

    for (const unit of [...units].reverse()) {
      const seekTime = Math.round(Math.min(production.performance.duration, unit.start) * 20) / 20;
      await slider.fill(String(seekTime));
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(1000);

    const first = units[0];
    const scrubState = await page.locator(".experience-media").getAttribute("data-media-state");
    if (scrubState !== first.mediaState) {
      failures.push(`reverse scrub ended at ${scrubState}; expected ${first.mediaState}`);
    }

    const endingStart = Math.max(0, production.performance.duration - 8.6);
    await slider.fill(String(endingStart));
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await page.waitForTimeout((production.performance.duration - endingStart + 1.5) * 1000);

    const endButton = await page.locator(".story-play-button").textContent();
    if (endButton !== "Play again") failures.push(`ending control was ${endButton}; expected Play again`);
    const endState = await page.locator(".experience-media").getAttribute("data-media-state");
    const last = units.at(-1);
    if (last && endState !== last.mediaState) {
      failures.push(`ending media state was ${endState}; expected ${last.mediaState}`);
    }

    const unhandled = await page.evaluate(() => (
      (window as Window & { __experienceUnhandled?: string[] }).__experienceUnhandled ?? []
    ));
    failures.push(...unhandled.map((error) => `unhandled browser error: ${error}`));
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    failures.forEach((failure) => console.error(`✗ ${failure}`));
    process.exitCode = 1;
  } else {
    console.log(`✓ ${storyId} — passage list, reverse scrub, and ending playback`);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
