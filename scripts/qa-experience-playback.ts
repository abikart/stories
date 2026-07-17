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
    const seek = async (seconds: number) => {
      await slider.evaluate((element, value) => {
        const input = element as HTMLInputElement;
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        setValue?.call(input, String(value));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, seconds);
    };

    const firstSafeStop = production.scenes.flatMap((scene) => scene.phrases)
      .find((phrase) => phrase.safeStopAfter);
    if (firstSafeStop) {
      const expectedLines = units.filter((unit) => unit.end <= firstSafeStop.end + 0.04);
      const beforeStop = Math.max(0, Math.floor((firstSafeStop.end - 0.3) * 20) / 20);
      await page.getByRole("button", { name: "Read with me", exact: true }).click();
      await seek(beforeStop);
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

      if (production.performance.stems) {
        const waitingMedia = await page.evaluate(() => {
          const performanceAudio = document.querySelector<HTMLAudioElement>("[data-performance-audio]");
          const music = document.querySelector<HTMLAudioElement>("[data-soundscape-stem=music]");
          const ambience = document.querySelector<HTMLAudioElement>("[data-soundscape-stem=ambience]");
          const effects = document.querySelector<HTMLAudioElement>("[data-soundscape-stem=effects]");
          const video = document.querySelector<HTMLVideoElement>(".experience-media-layer[data-active] video");
          return {
            phase: document.querySelector(".story-player")?.getAttribute("data-reading-phase"),
            performancePaused: performanceAudio?.paused,
            musicPaused: music?.paused,
            musicVolume: music?.volume,
            ambiencePaused: ambience?.paused,
            ambienceTime: ambience?.currentTime,
            effectsPaused: effects?.paused,
            videoPaused: video?.paused,
            videoTime: video?.currentTime,
          };
        });
        await page.waitForTimeout(300);
        const livingTimes = await page.evaluate(() => ({
          ambience: document.querySelector<HTMLAudioElement>("[data-soundscape-stem=ambience]")?.currentTime,
          video: document.querySelector<HTMLVideoElement>(".experience-media-layer[data-active] video")?.currentTime,
        }));
        if (waitingMedia.phase !== "reading" || !waitingMedia.performancePaused) failures.push("reading pause did not settle with narration paused");
        if (production.performance.stems.music
          && (!waitingMedia.musicPaused || (waitingMedia.musicVolume ?? 1) > 0.01)) failures.push("score did not fade out during reading pause");
        if (production.performance.stems.ambience
          && (waitingMedia.ambiencePaused || (livingTimes.ambience ?? 0) <= (waitingMedia.ambienceTime ?? 0) + 0.15)) failures.push("ambience did not continue through reading pause");
        if (production.performance.stems.effects && !waitingMedia.effectsPaused) failures.push("effects did not pause with narration");
        if (waitingMedia.videoPaused || (livingTimes.video ?? 0) <= (waitingMedia.videoTime ?? 0) + 0.15) failures.push("living video did not continue through reading pause");

        const continueStartedAt = Date.now();
        await continueActions.click();
        await page.waitForTimeout(100);
        const earlyResume = await page.evaluate(() => ({
          phase: document.querySelector(".story-player")?.getAttribute("data-reading-phase"),
          performancePaused: document.querySelector<HTMLAudioElement>("[data-performance-audio]")?.paused,
        }));
        if (earlyResume.phase !== "resuming" || !earlyResume.performancePaused) failures.push("Continue did not preserve the resume lead-in");
        await page.waitForFunction(() => (
          document.querySelector<HTMLAudioElement>("[data-performance-audio]")?.paused === false
        ));
        const continueLeadMs = Date.now() - continueStartedAt;
        if (continueLeadMs < 150 || continueLeadMs > 700) {
          failures.push(`Continue lead-in was ${continueLeadMs}ms; expected a calm 150–700ms handoff`);
        }
        await page.waitForTimeout(100);
        const resumedMedia = await page.evaluate(() => ({
          phase: document.querySelector(".story-player")?.getAttribute("data-reading-phase"),
          performancePaused: document.querySelector<HTMLAudioElement>("[data-performance-audio]")?.paused,
          musicPaused: document.querySelector<HTMLAudioElement>("[data-soundscape-stem=music]")?.paused,
          musicVolume: document.querySelector<HTMLAudioElement>("[data-soundscape-stem=music]")?.volume,
          ambiencePaused: document.querySelector<HTMLAudioElement>("[data-soundscape-stem=ambience]")?.paused,
          effectsPaused: document.querySelector<HTMLAudioElement>("[data-soundscape-stem=effects]")?.paused,
        }));
        if (resumedMedia.phase !== "idle" || resumedMedia.performancePaused) failures.push("narration did not resume after the lead-in");
        if (production.performance.stems.music
          && (resumedMedia.musicPaused || (resumedMedia.musicVolume ?? 0) <= 0)) failures.push("score did not fade back in with narration");
        if ((production.performance.stems.ambience && resumedMedia.ambiencePaused)
          || (production.performance.stems.effects && resumedMedia.effectsPaused)) failures.push("soundscape did not rejoin narration after Continue");
      }

      await page.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Read with me", exact: true }).click();
      await seek(beforeStop);
      await page.getByRole("button", { name: "Play", exact: true }).click();
      await page.waitForFunction(() => (
        document.querySelector(".story-player")?.getAttribute("data-reading-phase") === "settling"
      ));
      await page.getByRole("button", { name: "Watch", exact: true }).click();
      await page.waitForTimeout(500);
      const interruptedWait = await page.evaluate(() => ({
        mode: document.querySelector(".story-player")?.getAttribute("data-mode"),
        waiting: document.querySelector(".story-player")?.getAttribute("data-waiting"),
        performancePaused: document.querySelector<HTMLAudioElement>("[data-performance-audio]")?.paused,
        musicPaused: document.querySelector<HTMLAudioElement>("[data-soundscape-stem=music]")?.paused,
        ambiencePaused: document.querySelector<HTMLAudioElement>("[data-soundscape-stem=ambience]")?.paused,
      }));
      if (interruptedWait.mode !== "watch" || interruptedWait.waiting || interruptedWait.performancePaused) {
        failures.push("switching to Watch did not interrupt the reading transition cleanly");
      }
      if ((production.performance.stems?.music && interruptedWait.musicPaused)
        || (production.performance.stems?.ambience && interruptedWait.ambiencePaused)) {
        failures.push("soundscape did not survive an interrupted reading transition");
      }

      await page.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
    }

    for (const unit of [...units].reverse()) {
      const seekTime = Math.round(Math.min(production.performance.duration, unit.start) * 20) / 20;
      await seek(seekTime);
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(1000);

    const first = units[0];
    const scrubState = await page.locator(".experience-media").getAttribute("data-media-state");
    if (scrubState !== first.mediaState) {
      failures.push(`reverse scrub ended at ${scrubState}; expected ${first.mediaState}`);
    }

    const endingStart = Math.max(0, production.performance.duration - 8.6);
    await seek(endingStart);
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
    console.log(`✓ ${storyId} — soft reading pause, passage list, reverse scrub, and ending playback`);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
