import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";
import { ExperienceProductionSchema } from "@/experience/schema";
import { flattenReadingUnits } from "@/experience/performance/timeline";

async function main() {
  const storyId = process.argv.slice(2).find((argument) => argument !== "--" && !argument.startsWith("-"))
    ?? "fern-and-the-silent-seed-bells";
  const browserName = process.argv.includes("--browser=webkit") ? "webkit" : "chromium";
  const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";
  const productionPath = path.join(process.cwd(), "content", storyId, "production.json");
  const production = ExperienceProductionSchema.parse(JSON.parse(await fs.readFile(productionPath, "utf8")));

  if (!production.performance) throw new Error(`${storyId}: performance metadata is required`);

  const units = flattenReadingUnits(production);
  const browser = await (browserName === "webkit" ? webkit : chromium).launch({ headless: true });
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
    const matteContract = await page.evaluate((declaredMatte) => {
      const probe = document.createElement("span");
      probe.style.color = declaredMatte;
      document.body.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();

      const player = document.querySelector<HTMLElement>(".story-player");
      const stage = document.querySelector<HTMLElement>(".story-player-stage");
      const media = document.querySelector<HTMLElement>(".experience-media");
      const layer = document.querySelector<HTMLElement>(".experience-media-layer[data-active]");
      return {
        expected,
        playerBackground: player ? getComputedStyle(player).backgroundColor : "missing",
        stageBackground: stage ? getComputedStyle(stage).backgroundColor : "missing",
        mediaBackground: media ? getComputedStyle(media).backgroundColor : "missing",
        layerBackground: layer ? getComputedStyle(layer).backgroundColor : "missing",
        playerBackgroundImage: player ? getComputedStyle(player).backgroundImage : "missing",
        playerFilter: player ? getComputedStyle(player).filter : "missing",
        playerOpacity: player ? getComputedStyle(player).opacity : "missing",
        atmosphereCount: document.querySelectorAll(".experience-atmosphere").length,
        afterDisplay: player ? getComputedStyle(player, "::after").display : "missing",
      };
    }, production.stage.backdrop.color);
    for (const [surface, color] of Object.entries({
      player: matteContract.playerBackground,
      stage: matteContract.stageBackground,
      media: matteContract.mediaBackground,
      layer: matteContract.layerBackground,
    })) {
      if (color !== matteContract.expected) {
        failures.push(`${surface} matte was ${color}; expected ${matteContract.expected}`);
      }
    }
    if (matteContract.playerBackgroundImage !== "none"
      || matteContract.playerFilter !== "none"
      || matteContract.playerOpacity !== "1"
      || matteContract.atmosphereCount !== 0
      || matteContract.afterDisplay !== "none") {
      failures.push(`solid matte shell was altered: ${JSON.stringify(matteContract)}`);
    }
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

    const openingOverlay = page.locator(".story-overlay");
    const glassSurfaces = page.locator(".ds-glass-light");
    if (await glassSurfaces.count() !== 2) failures.push("Light Glass must be limited to dialogue and the temporary start decision");
    const solidSurfaces = page.locator(".ds-surface-solid");
    if (await solidSurfaces.count() !== 3) failures.push("title, mode, and transport must use solid surfaces");
    if (await page.locator("button.ds-glass-light, .ds-glass-light .ds-glass-light").count()) {
      failures.push("glass was applied to a button or nested inside glass");
    }
    const glassContract = await page.evaluate(() => {
      const overlay = document.querySelector<HTMLElement>(".story-overlay");
      const indicator = document.querySelector<HTMLElement>(".story-mode-indicator");
      const persistent = [".story-player-title", ".story-mode-switch", ".story-transport"]
        .map((selector) => document.querySelector<HTMLElement>(selector))
        .filter((element): element is HTMLElement => Boolean(element));
      const overlayStyle = overlay ? getComputedStyle(overlay) : null;
      return {
        overlayBackdrop: overlayStyle?.backdropFilter ?? "missing",
        overlayBackground: overlayStyle?.backgroundColor ?? "missing",
        overlayBorder: overlayStyle?.borderTopColor ?? "missing",
        overlayShadow: overlayStyle?.boxShadow ?? "missing",
        selectionTransform: indicator ? getComputedStyle(indicator).transform : "missing",
        persistentBackdrops: persistent.map((element) => getComputedStyle(element).backdropFilter),
      };
    });
    if (glassContract.overlayBackdrop !== "blur(10px)"
      || glassContract.overlayBackground !== "rgba(255, 255, 255, 0.6)"
      || glassContract.overlayBorder !== "rgba(255, 255, 255, 0.6)"
      || !glassContract.overlayShadow.includes("24px 1px inset")) {
      failures.push(`Light Glass recipe drifted: ${JSON.stringify(glassContract)}`);
    }
    if (glassContract.persistentBackdrops.some((value) => value !== "none")) {
      failures.push(`persistent chrome still uses backdrop blur: ${JSON.stringify(glassContract.persistentBackdrops)}`);
    }
    if (await openingOverlay.getByText("Narrator", { exact: true }).count()) {
      failures.push("narration still exposes a Narrator label");
    }
    if (await openingOverlay.locator(".story-overlay-portrait").count()) {
      failures.push("narration incorrectly shows a character portrait");
    }
    const openingTailDisplay = await openingOverlay.evaluate((element) => getComputedStyle(element, "::after").display);
    if (openingTailDisplay !== "none") failures.push("dialogue bubble still renders a directional tail");
    const firstScenePlacement = production.scenes[0]?.overlayPlacement;
    if (await openingOverlay.getAttribute("data-placement") !== firstScenePlacement) {
      failures.push(`opening dialogue placement did not resolve to scene default ${firstScenePlacement}`);
    }
    await page.getByRole("button", { name: "Read with me", exact: true }).click();
    await page.waitForTimeout(260);
    const movedSelectionTransform = await page.locator(".story-mode-indicator").evaluate((element) => getComputedStyle(element).transform);
    if (movedSelectionTransform === glassContract.selectionTransform) failures.push("story mode selection did not move with selection");
    await page.getByRole("button", { name: "Watch", exact: true }).click();

    const firstDialogue = units.find((unit) => unit.overlay.kind === "dialogue");
    if (firstDialogue) {
      await seek(firstDialogue.start + 0.05);
      await page.waitForTimeout(80);
      const dialoguePortrait = openingOverlay.locator(".story-overlay-portrait");
      if (await dialoguePortrait.count() !== 1 || !await dialoguePortrait.isVisible()) {
        failures.push("character dialogue does not show exactly one visible portrait");
      }
      const expectedPortraitAlt = production.cast.find(
        (member) => member.name.toLocaleLowerCase() === firstDialogue.speaker.toLocaleLowerCase(),
      )?.portraitAlt;
      if (await dialoguePortrait.getAttribute("alt") !== expectedPortraitAlt) {
        failures.push(`dialogue portrait alt did not identify ${firstDialogue.speaker}`);
      }
      const dialogueScenePlacement = production.scenes[firstDialogue.sceneIndex]?.overlayPlacement;
      if (await openingOverlay.getAttribute("data-placement") !== dialogueScenePlacement) {
        failures.push(`dialogue placement did not resolve to scene default ${dialogueScenePlacement}`);
      }
      await page.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
    }

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
      if (await passage.getByText("Narrator", { exact: true }).count()) {
        failures.push("Read-with-me narration still exposes a Narrator label");
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

    const interactionScene = production.scenes.find((candidate) => candidate.interaction);
    const interaction = interactionScene?.interaction;
    const interactionTrigger = interaction
      ? production.scenes.flatMap((candidate) => candidate.phrases)
        .find((phrase) => phrase.id === interaction.triggerAfterPhrase)
      : null;
    if (interaction && interactionTrigger) {
      await page.getByRole("button", { name: "Read with me", exact: true }).click();
      await seek(Math.max(0, interactionTrigger.end - 0.3));
      await page.getByRole("button", { name: "Play", exact: true }).click();
      const token = page.locator(".drag-guide-token");
      await token.waitFor({ state: "visible", timeout: 5000 });
      const guideContract = await page.evaluate(() => {
        const target = document.querySelector<HTMLElement>(".drag-guide-target");
        const tokenElement = document.querySelector<HTMLElement>(".drag-guide-token");
        const container = document.querySelector<HTMLElement>(".drag-guide");
        const targetRect = target?.getBoundingClientRect();
        const tokenRect = tokenElement?.getBoundingClientRect();
        const spotlight = target ? getComputedStyle(target, "::before") : null;
        return {
          spotlightBackground: spotlight?.backgroundImage ?? "none",
          spotlightFilter: spotlight?.filter ?? "none",
          targetSize: targetRect ? [targetRect.width, targetRect.height] : [0, 0],
          tokenSize: tokenRect ? [tokenRect.width, tokenRect.height] : [0, 0],
          tokenTouchAction: tokenElement ? getComputedStyle(tokenElement).touchAction : "missing",
          containerTouchAction: container ? getComputedStyle(container).touchAction : "missing",
        };
      });
      if (guideContract.spotlightBackground === "none" || guideContract.spotlightFilter !== "blur(18px)") {
        failures.push(`${browserName} drag goal did not render the Spotlight Glow treatment: ${JSON.stringify(guideContract)}`);
      }
      if (guideContract.targetSize.some((size) => size < 43.5)
        || guideContract.tokenSize.some((size) => size < 51.5)
        || guideContract.tokenTouchAction !== "none"
        || guideContract.containerTouchAction !== "none") {
        failures.push(`${browserName} drag interaction lost touch-safe geometry: ${JSON.stringify(guideContract)}`);
      }
      await token.focus();
      await token.press("Enter");
      await page.waitForFunction((stateId) => (
        document.querySelector(".experience-media")?.getAttribute("data-media-state") === stateId
      ), interaction.completeMediaState);
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

    const viewportMatrix = [
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ];
    for (const viewport of viewportMatrix) {
      await page.setViewportSize(viewport);
      await page.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
      const layout = await page.evaluate(() => {
        const media = document.querySelector(".story-player-media .experience-media")?.getBoundingClientRect();
        const stage = document.querySelector(".story-player-stage")?.getBoundingClientRect();
        const overlay = document.querySelector(".story-overlay")?.getBoundingClientRect();
        const progress = document.querySelector(".story-progress")?.getBoundingClientRect();
        const shortControls = [...document.querySelectorAll<HTMLElement>(
          ".story-mode-switch button, .story-start-card button, .story-transport button",
        )].filter((element) => element.getBoundingClientRect().height < 43.5).map((element) => element.textContent?.trim());
        return {
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          mediaRatio: media ? media.width / media.height : 0,
          stageRatio: stage ? stage.width / stage.height : 0,
          stage: stage ? { left: stage.left, top: stage.top, right: stage.right, bottom: stage.bottom } : null,
          overlay: overlay ? { left: overlay.left, top: overlay.top, right: overlay.right, bottom: overlay.bottom } : null,
          progress: progress ? { width: progress.width, height: progress.height } : null,
          mediaRight: media?.right,
          mediaBottom: media?.bottom,
          shortControls,
        };
      });
      const label = `${viewport.width}x${viewport.height}`;
      if (layout.overflow > 1) failures.push(`${label}: horizontal overflow ${layout.overflow}px`);
      if (Math.abs(layout.mediaRatio - (4 / 3)) > 0.015) failures.push(`${label}: media ratio was ${layout.mediaRatio.toFixed(3)}, expected complete 4:3 art`);
      if (Math.abs(layout.stageRatio - (4 / 3)) > 0.015) failures.push(`${label}: story canvas ratio was ${layout.stageRatio.toFixed(3)}, expected 4:3`);
      if (layout.shortControls.length) failures.push(`${label}: controls under 44px: ${layout.shortControls.join(", ")}`);
      if (!layout.progress || layout.progress.width > 1.5 || layout.progress.height > 1.5) {
        failures.push(`${label}: seek control is visually exposed`);
      }
      if (!layout.stage || !layout.overlay
        || layout.overlay.left < layout.stage.left - 1
        || layout.overlay.right > layout.stage.right + 1
        || layout.overlay.top < layout.stage.top - 1
        || layout.overlay.bottom > layout.stage.bottom + 1) {
        failures.push(`${label}: dialogue bubble escaped the story canvas`);
      }
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Begin story", exact: true }).click();
    await page.waitForFunction(() => (
      document.querySelector<HTMLAudioElement>("[data-performance-audio]")?.paused === false
    ));
    const reducedMotion = await page.locator(".story-overlay-content").evaluate((element) => ({
      animationDuration: getComputedStyle(element).animationDuration,
      selectionTransitionDuration: getComputedStyle(document.querySelector<HTMLElement>(".story-mode-indicator")!).transitionDuration,
      activeVideosPaused: [...document.querySelectorAll<HTMLVideoElement>(
        ".experience-media-layer[data-active] video",
      )].every((video) => video.paused),
    }));
    if (reducedMotion.animationDuration !== "0s") failures.push("reduced motion did not remove phrase entry animation");
    if (reducedMotion.selectionTransitionDuration !== "0s") {
      failures.push("reduced motion did not remove mode-selection motion");
    }
    if (!reducedMotion.activeVideosPaused) failures.push("reduced motion did not pause decorative scene video");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForTimeout(250);
    const motionRestored = await page.evaluate(() => (
      [...document.querySelectorAll<HTMLVideoElement>(
        ".experience-media-layer[data-active] video",
      )].some((video) => !video.paused)
    ));
    if (!motionRestored) failures.push("scene motion did not recover after reduced motion was disabled");

    await page.route("**/*-alpha.webm", (route) => route.abort("failed"));
    await page.goto(`${baseUrl}/experience/${storyId}`, { waitUntil: "networkidle" });
    const fallbackDelivery = await page.evaluate(() => {
      const video = document.querySelector<HTMLVideoElement>(
        ".experience-media-layer[data-active] .layered-scene-motion video",
      );
      return { currentSrc: video?.currentSrc ?? "", readyState: video?.readyState ?? 0 };
    });
    if (!fallbackDelivery.currentSrc.endsWith(".mp4") || fallbackDelivery.readyState < 2) {
      failures.push(`native-alpha failure did not select the opaque fallback: ${JSON.stringify(fallbackDelivery)}`);
    }
    await page.unroute("**/*-alpha.webm");

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
    console.log(`✓ ${storyId} (${browserName}) — playback, reading pause, guide interaction, reverse scrub, ending, and responsive matrix`);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
