import assert from "node:assert/strict";
import { chromium, webkit, type BrowserType, type Page } from "playwright";

type BrowserName = "chromium" | "webkit";

function argument(name: string, fallback: string) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

function diagnostic(page: Page, label: string) {
  return page.locator(".glass-fixture-diagnostics > div").filter({ hasText: label }).locator("strong").first();
}

async function displacementProof(page: Page) {
  return page.evaluate(() => {
    const fixtureWindow = window as typeof window & {
      __storiesGlassFixture?: {
        readPixelsForDiagnostics(x: number, y: number, width: number, height: number): {
          width: number;
          height: number;
          pixels: Uint8Array;
        } | null;
      };
    };
    const renderer = fixtureWindow.__storiesGlassFixture;
    const output = document.querySelector("canvas[data-glass-canvas]");
    const grid = document.querySelector(".glass-fixture-grid");
    const lens = document.querySelector(".glass-fixture-lens-preview");
    if (!renderer || !(output instanceof HTMLCanvasElement) || !(grid instanceof HTMLCanvasElement) || !(lens instanceof HTMLElement)) {
      throw new Error("Glass fixture diagnostics are unavailable");
    }
    const outputRect = output.getBoundingClientRect();
    const lensRect = lens.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const dpr = output.width / outputRect.width;
    const x = Math.floor((lensRect.left - outputRect.left) * dpr);
    const y = Math.floor((lensRect.top - outputRect.top) * dpr);
    const width = Math.floor(lensRect.width * dpr);
    const height = Math.floor(lensRect.height * dpr);
    const result = renderer.readPixelsForDiagnostics(x, y, width, height);
    const outside = renderer.readPixelsForDiagnostics(4, 4, 1, 1);
    const context = grid.getContext("2d");
    if (!result || !outside || !context) throw new Error("Unable to read glass proof pixels");

    let opaquePixels = 0;
    let displacedPixels = 0;
    for (let pixelY = 0; pixelY < result.height; pixelY += 2) {
      for (let pixelX = 0; pixelX < result.width; pixelX += 2) {
        const outputIndex = (pixelY * result.width + pixelX) * 4;
        if (result.pixels[outputIndex + 3] <= 180) continue;
        opaquePixels += 1;
        const cssX = lensRect.left - gridRect.left + pixelX / dpr;
        const cssY = lensRect.top - gridRect.top + (result.height - 1 - pixelY) / dpr;
        const sourceX = Math.max(0, Math.min(grid.width - 1, Math.floor(cssX / gridRect.width * grid.width)));
        const sourceY = Math.max(0, Math.min(grid.height - 1, Math.floor(cssY / gridRect.height * grid.height)));
        const source = context.getImageData(sourceX, sourceY, 1, 1).data;
        const delta = Math.abs(result.pixels[outputIndex] - source[0])
          + Math.abs(result.pixels[outputIndex + 1] - source[1])
          + Math.abs(result.pixels[outputIndex + 2] - source[2]);
        if (delta > 60) displacedPixels += 1;
      }
    }
    return { opaquePixels, displacedPixels, outside: [...outside.pixels] };
  });
}

async function runWebGLPath(browserType: BrowserType, browserName: BrowserName, baseUrl: string) {
  const browser = await browserType.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${baseUrl}/dev/glass`);
  await page.waitForFunction(() => document.querySelector(".glass-fixture-stage")?.getAttribute("data-glass-renderer") === "webgl");
  await page.waitForTimeout(500);

  assert.equal(await page.locator("canvas[data-glass-canvas]").count(), 1, "one stage glass canvas");
  assert.equal(await page.locator("video").count(), 1, "glass must not create a duplicate video");
  const proof = await displacementProof(page);
  assert.deepEqual(proof.outside, [0, 0, 0, 0], "pixels outside lenses stay transparent");
  assert.ok(proof.opaquePixels > 100, "lens must draw opaque replacement pixels");
  assert.ok(proof.displacedPixels > 40, "grid pixels inside the lens must objectively differ");
  const warmFrameTime = await page.evaluate(() => (window as typeof window & {
    __storiesGlassFixture?: { getDiagnostics(): { frameTimeMs: number } };
  }).__storiesGlassFixture?.getDiagnostics().frameTimeMs ?? Infinity);
  assert.ok(warmFrameTime < 16, `${browserName} warm fixture frame stays inside 16ms (${warmFrameTime.toFixed(2)}ms)`);

  const generationsBefore = Number(await diagnostic(page, "Map generations").textContent());
  await page.locator(".glass-fixture-travel input").fill("62");
  await page.waitForTimeout(120);
  const generationsAfter = Number(await diagnostic(page, "Map generations").textContent());
  assert.equal(generationsAfter, generationsBefore, "moving a same-shaped lens must reuse its map");

  await page.getByRole("button", { name: "Lose context" }).click();
  await page.waitForFunction(() => document.querySelector(".glass-fixture-stage")?.getAttribute("data-glass-renderer") === "css");
  await page.getByRole("button", { name: "Restore context" }).click();
  await page.waitForFunction(() => document.querySelector(".glass-fixture-stage")?.getAttribute("data-glass-renderer") === "webgl");

  await page.locator("video").evaluate((video: HTMLVideoElement) => video.pause());
  await page.waitForTimeout(300);
  assert.equal(await diagnostic(page, "Loop").textContent(), "sleeping", "static sources must let the renderer sleep");
  await page.locator("video").evaluate((video: HTMLVideoElement) => video.play());
  await page.waitForTimeout(300);
  assert.equal(await diagnostic(page, "Loop").textContent(), "rendering", "playing video must wake the renderer");
  assert.deepEqual(errors, [], `${browserName} fixture emitted browser errors`);
  await browser.close();
  return { ...proof, warmFrameTime };
}

async function runFallbackPath(browserType: BrowserType, baseUrl: string) {
  const browser = await browserType.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patched(this: HTMLCanvasElement, type: string, ...options: unknown[]) {
      if (type === "webgl2") return null;
      return getContext.call(this, type, ...options as []) as RenderingContext | null;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(`${baseUrl}/dev/glass`);
  await page.waitForFunction(() => document.querySelector(".glass-fixture-stage")?.getAttribute("data-glass-renderer") === "css");
  assert.equal(await page.locator(".glass-fixture-travel input").isEnabled(), true, "fallback preserves controls");
  await browser.close();
}

async function runFernTransportPath(browserType: BrowserType, browserName: BrowserName, baseUrl: string) {
  const storyPath = "/experience/fern-and-the-silent-seed-bells";
  const browser = await browserType.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${baseUrl}${storyPath}`);
  await page.waitForFunction(() => document.querySelector(".story-player-stage")?.getAttribute("data-glass-renderer") === "webgl");
  await page.waitForTimeout(500);
  assert.equal(await page.locator("canvas[data-glass-canvas]").count(), 1, "Fern uses one stage glass canvas");
  assert.deepEqual(
    (await page.locator("[data-glass-surface]").evaluateAll((elements) => elements.map((element) => element.getAttribute("data-glass-surface")).sort())),
    ["dialogue", "mode", "start", "title", "transport"],
    "Fern exposes every required semantic glass surface",
  );
  assert.equal(await page.locator(".story-player-stage").getAttribute("data-glass-lenses"), "4", "hidden dialogue lens does not ghost behind start");
  const webglVideoCount = await page.locator(".story-player-media video").count();

  const pixels = await page.evaluate(() => {
    const diagnosticWindow = window as typeof window & {
      __storiesGlassStage?: {
        readPixelsForDiagnostics(x: number, y: number, width: number, height: number): {
          pixels: Uint8Array;
        } | null;
      };
    };
    const renderer = diagnosticWindow.__storiesGlassStage;
    const canvas = document.querySelector("canvas[data-glass-canvas]");
    const surfaces = [...document.querySelectorAll<HTMLElement>("[data-glass-surface]")];
    if (!renderer || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Fern glass diagnostics unavailable");
    }
    const canvasRect = canvas.getBoundingClientRect();
    const dpr = canvas.width / canvasRect.width;
    const opaqueById: Record<string, number> = {};
    for (const surface of surfaces) {
      if (Number.parseFloat(getComputedStyle(surface).opacity) <= 0.01) continue;
      const surfaceRect = surface.getBoundingClientRect();
      const result = renderer.readPixelsForDiagnostics(
        (surfaceRect.left - canvasRect.left) * dpr,
        (surfaceRect.top - canvasRect.top) * dpr,
        surfaceRect.width * dpr,
        surfaceRect.height * dpr,
      );
      if (!result) throw new Error(`Missing ${surface.dataset.glassSurface} pixels`);
      let opaque = 0;
      for (let index = 3; index < result.pixels.length; index += 4) {
        if (result.pixels[index] > 180) opaque += 1;
      }
      opaqueById[surface.dataset.glassSurface ?? "unknown"] = opaque;
    }
    const outside = renderer.readPixelsForDiagnostics(4, 4, 1, 1);
    if (!outside) throw new Error("Fern glass pixels unavailable");
    return { opaqueById, outside: [...outside.pixels] };
  });
  for (const id of ["title", "mode", "start", "transport"]) {
    assert.ok(pixels.opaqueById[id] > 100, `live Fern ${id} lens draws refracted replacement pixels`);
  }
  assert.deepEqual(pixels.outside, [0, 0, 0, 0], "Fern canvas remains transparent outside lenses");

  const pressMapUploads = await page.evaluate(() => (window as typeof window & {
    __storiesGlassStage?: { getDiagnostics(): { mapUploads: number } };
  }).__storiesGlassStage?.getDiagnostics().mapUploads);
  await page.getByRole("button", { name: "Replay story" }).dispatchEvent("pointerdown", {
    pointerId: 7,
    pointerType: "touch",
    isPrimary: true,
  });
  await page.waitForTimeout(90);
  const pressedLens = await page.evaluate(() => (window as typeof window & {
    __storiesGlassStage?: { getLensDiagnostics(id: string): { lensScale: number; depthScale: number } | null };
  }).__storiesGlassStage?.getLensDiagnostics("transport"));
  assert.ok(pressedLens && pressedLens.lensScale <= 0.965 && pressedLens.depthScale <= 0.73, "touch press compresses optical scale and depth");
  await page.evaluate(() => window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 7, pointerType: "touch" })));
  await page.waitForTimeout(160);
  const releasedLens = await page.evaluate(() => (window as typeof window & {
    __storiesGlassStage?: { getLensDiagnostics(id: string): { lensScale: number; depthScale: number } | null };
  }).__storiesGlassStage?.getLensDiagnostics("transport"));
  const pressMapUploadsAfter = await page.evaluate(() => (window as typeof window & {
    __storiesGlassStage?: { getDiagnostics(): { mapUploads: number } };
  }).__storiesGlassStage?.getDiagnostics().mapUploads);
  assert.equal(releasedLens?.lensScale, 1, "released lens returns without bounce");
  assert.equal(pressMapUploadsAfter, pressMapUploads, "press deformation does not upload a new map");

  const modeBefore = await page.locator("[data-glass-surface=mode]").boundingBox();
  const mapUploadsBefore = await page.evaluate(() => (window as typeof window & {
    __storiesGlassStage?: { getDiagnostics(): { mapUploads: number } };
  }).__storiesGlassStage?.getDiagnostics().mapUploads);
  await page.getByRole("button", { name: "Read with me" }).click();
  await page.waitForTimeout(300);
  const modeAfter = await page.locator("[data-glass-surface=mode]").boundingBox();
  const mapUploadsAfter = await page.evaluate(() => (window as typeof window & {
    __storiesGlassStage?: { getDiagnostics(): { mapUploads: number } };
  }).__storiesGlassStage?.getDiagnostics().mapUploads);
  assert.ok(modeBefore && modeAfter && modeAfter.x > modeBefore.x + 30, "mode lens travels to selected option");
  assert.equal(mapUploadsAfter, mapUploadsBefore, "mode travel does not upload or rebuild its lens map");

  await page.getByRole("button", { name: "Begin story" }).click();
  await page.waitForTimeout(650);
  const storyFrameTime = await page.evaluate(() => (window as typeof window & {
    __storiesGlassStage?: { getDiagnostics(): { frameTimeMs: number } };
  }).__storiesGlassStage?.getDiagnostics().frameTimeMs ?? Infinity);
  assert.ok(storyFrameTime < 20, `${browserName} warm Fern frame stays inside 20ms (${storyFrameTime.toFixed(2)}ms)`);
  assert.equal(await page.locator(".story-start-card").count(), 0, "start lens retires after playback begins");
  assert.equal(await page.locator("[data-glass-surface=dialogue]").count(), 1, "dialogue lens replaces start lens");
  const selectedDialogue = await page.locator(".story-overlay p").evaluate((paragraph) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    selection?.removeAllRanges();
    selection?.addRange(range);
    return selection?.toString() ?? "";
  });
  assert.ok(selectedDialogue.includes("Lanternleaf Forest"), "dialogue remains selectable semantic DOM");
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.dataset.glassOffscreenProbe = "true";
    spacer.style.height = "1800px";
    document.body.prepend(spacer);
  });
  await page.waitForFunction(() => (window as typeof window & {
    __storiesGlassStage?: { getDiagnostics(): { sleeping: boolean } };
  }).__storiesGlassStage?.getDiagnostics().sleeping === true);
  assert.equal(
    await page.locator("audio[data-performance-audio]").evaluate((audio: HTMLAudioElement) => audio.paused),
    false,
    "offscreen suspension does not pause story narration",
  );
  await page.evaluate(() => document.querySelector("[data-glass-offscreen-probe]")?.remove());
  await page.waitForFunction(() => (window as typeof window & {
    __storiesGlassStage?: { getDiagnostics(): { sleeping: boolean } };
  }).__storiesGlassStage?.getDiagnostics().sleeping === false);
  const timeBefore = await page.locator("audio[data-performance-audio]").evaluate((audio: HTMLAudioElement) => audio.currentTime);
  await page.getByRole("button", { name: "Replay story" }).focus();
  await page.evaluate(() => (window as typeof window & { __storiesGlassStage?: { simulateContextLoss(): void } }).__storiesGlassStage?.simulateContextLoss());
  await page.waitForFunction(() => document.querySelector(".story-player-stage")?.getAttribute("data-glass-renderer") === "css");
  assert.equal(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.getAttribute("aria-label")), "Replay story", "context loss preserves focus");
  await page.evaluate(() => (window as typeof window & { __storiesGlassStage?: { simulateContextRestore(): void } }).__storiesGlassStage?.simulateContextRestore());
  await page.waitForFunction(() => document.querySelector(".story-player-stage")?.getAttribute("data-glass-renderer") === "webgl");
  await page.waitForTimeout(250);
  const timeAfter = await page.locator("audio[data-performance-audio]").evaluate((audio: HTMLAudioElement) => audio.currentTime);
  assert.ok(timeAfter >= timeBefore, "context recovery must not restart story time");
  await page.getByRole("button", { name: "Pause" }).click();
  await page.waitForFunction(() => (window as typeof window & {
    __storiesGlassStage?: { getDiagnostics(): { sleeping: boolean } };
  }).__storiesGlassStage?.getDiagnostics().sleeping === true);
  assert.equal(
    await page.evaluate(() => (window as typeof window & {
      __storiesGlassStage?: { getDiagnostics(): { sleeping: boolean } };
    }).__storiesGlassStage?.getDiagnostics().sleeping),
    true,
    "paused Fern settles the renderer to sleep",
  );

  const fallbackPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await fallbackPage.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patched(this: HTMLCanvasElement, type: string, ...options: unknown[]) {
      if (type === "webgl2") return null;
      return getContext.call(this, type, ...options as []) as RenderingContext | null;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await fallbackPage.goto(`${baseUrl}${storyPath}`);
  await fallbackPage.waitForFunction(() => document.querySelector(".story-player-stage")?.getAttribute("data-glass-renderer") === "css");
  const fallbackVideoCount = await fallbackPage.locator(".story-player-media video").count();
  assert.equal(webglVideoCount, fallbackVideoCount, "WebGL path must not add media decoders");
  assert.equal(await fallbackPage.getByRole("button", { name: "Begin story" }).isEnabled(), true, "Fern CSS fallback remains playable");

  const reducedPage = await browser.newPage({ viewport: { width: 900, height: 760 }, reducedMotion: "reduce" });
  await reducedPage.goto(`${baseUrl}${storyPath}`);
  await reducedPage.waitForFunction(() => document.querySelector(".story-player-stage")?.getAttribute("data-glass-renderer") === "webgl");
  const reducedModeBefore = await reducedPage.locator("[data-glass-surface=mode]").boundingBox();
  await reducedPage.getByRole("button", { name: "Read with me" }).click();
  await reducedPage.waitForTimeout(30);
  const reducedModeAfter = await reducedPage.locator("[data-glass-surface=mode]").boundingBox();
  assert.ok(reducedModeBefore && reducedModeAfter && reducedModeAfter.x > reducedModeBefore.x + 20, "reduced motion applies mode state immediately");
  assert.equal(
    await reducedPage.locator("[data-glass-surface=mode]").evaluate((element) => getComputedStyle(element).transitionDuration),
    "0s",
    "reduced motion removes mode travel transition",
  );
  await reducedPage.getByRole("button", { name: "Replay story" }).dispatchEvent("pointerdown", { pointerId: 9, pointerType: "touch" });
  await reducedPage.waitForTimeout(100);
  const reducedPress = await reducedPage.evaluate(() => (window as typeof window & {
    __storiesGlassStage?: { getLensDiagnostics(id: string): { lensScale: number; depthScale: number } | null };
  }).__storiesGlassStage?.getLensDiagnostics("transport"));
  assert.equal(reducedPress?.lensScale, 1, "reduced motion removes optical press deformation");
  assert.equal(reducedPress?.depthScale, 1, "reduced motion keeps static optical depth");
  assert.deepEqual(errors, [], `${browserName} Fern path emitted browser errors`);
  await browser.close();
  return { webglVideoCount, opaquePixels: pixels.opaqueById.transport, storyFrameTime };
}

async function runResponsiveMatrix(browserType: BrowserType, baseUrl: string) {
  const presets = [
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1440, 900],
    [1920, 1080],
  ] as const;
  const browser = await browserType.launch();
  const page = await browser.newPage();
  for (const [width, height] of presets) {
    await page.setViewportSize({ width, height });
    await page.goto(`${baseUrl}/experience/fern-and-the-silent-seed-bells`);
    await page.waitForFunction(() => document.querySelector(".story-player-stage")?.getAttribute("data-glass-renderer") === "webgl");
    await page.waitForTimeout(120);
    const layout = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>(".story-player-stage");
      const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-glass-canvas]");
      const visibleButtons = [...document.querySelectorAll<HTMLElement>(".story-player-stage button")]
        .filter((button) => button.getClientRects().length > 0 && getComputedStyle(button).visibility !== "hidden")
        .map((button) => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height }));
      if (!stage || !canvas) throw new Error("responsive glass stage missing");
      const stageRect = stage.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        stageRect: { x: stageRect.x, y: stageRect.y, width: stageRect.width, height: stageRect.height },
        canvasRect: { x: canvasRect.x, y: canvasRect.y, width: canvasRect.width, height: canvasRect.height },
        renderedDpr: canvas.width / canvasRect.width,
        visibleButtons,
        lenses: stage.dataset.glassLenses,
      };
    });
    assert.ok(layout.overflow <= 1, `${width}x${height} has no horizontal overflow`);
    assert.ok(Math.abs(layout.stageRect.width - layout.canvasRect.width) < 0.5, `${width}x${height} canvas width follows stage`);
    assert.ok(Math.abs(layout.stageRect.height - layout.canvasRect.height) < 0.5, `${width}x${height} canvas height follows stage`);
    assert.ok(layout.renderedDpr <= 2.01, `${width}x${height} renderer respects DPR cap`);
    assert.equal(layout.lenses, "4", `${width}x${height} keeps all visible start-state lenses`);
    for (const button of layout.visibleButtons) {
      assert.ok(button.width >= 43.5 && button.height >= 43.5, `${width}x${height} preserves 44px hit targets`);
    }
  }
  const highDprPage = await browser.newPage({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 3 });
  await highDprPage.goto(`${baseUrl}/experience/fern-and-the-silent-seed-bells`);
  await highDprPage.waitForFunction(() => document.querySelector(".story-player-stage")?.getAttribute("data-glass-renderer") === "webgl");
  const highDpr = await highDprPage.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-glass-canvas]");
    if (!canvas) return Infinity;
    return canvas.width / canvas.getBoundingClientRect().width;
  });
  assert.ok(highDpr <= 2.01, "deviceScaleFactor 3 is capped to renderer DPR 2");
  await browser.close();
}

async function main() {
  const browserName = argument("browser", "chromium") as BrowserName;
  assert.ok(browserName === "chromium" || browserName === "webkit", `Unsupported browser ${browserName}`);
  const baseUrl = argument("base-url", "http://localhost:3000");
  const browserType = browserName === "webkit" ? webkit : chromium;
  const proof = await runWebGLPath(browserType, browserName, baseUrl);
  await runFallbackPath(browserType, baseUrl);
  const fern = await runFernTransportPath(browserType, browserName, baseUrl);
  await runResponsiveMatrix(browserType, baseUrl);
  console.log(`glass QA passed (${browserName}): ${proof.displacedPixels} displaced grid samples at ${proof.warmFrameTime.toFixed(2)}ms; Fern ${fern.opaquePixels} transport pixels at ${fern.storyFrameTime.toFixed(2)}ms, ${fern.webglVideoCount} existing videos`);
}

void main();
