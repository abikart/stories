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
  return proof;
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
  assert.equal(await page.locator("[data-glass-surface=transport]").count(), 1, "Fern registers one transport lens at checkpoint 4");
  assert.equal(await page.locator(".story-player-stage").getAttribute("data-glass-lenses"), "1");
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
    const surface = document.querySelector("[data-glass-surface=transport]");
    if (!renderer || !(canvas instanceof HTMLCanvasElement) || !(surface instanceof HTMLElement)) {
      throw new Error("Fern glass diagnostics unavailable");
    }
    const canvasRect = canvas.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const dpr = canvas.width / canvasRect.width;
    const result = renderer.readPixelsForDiagnostics(
      (surfaceRect.left - canvasRect.left) * dpr,
      (surfaceRect.top - canvasRect.top) * dpr,
      surfaceRect.width * dpr,
      surfaceRect.height * dpr,
    );
    const outside = renderer.readPixelsForDiagnostics(4, 4, 1, 1);
    if (!result || !outside) throw new Error("Fern glass pixels unavailable");
    let opaque = 0;
    for (let index = 3; index < result.pixels.length; index += 4) {
      if (result.pixels[index] > 180) opaque += 1;
    }
    return { opaque, outside: [...outside.pixels] };
  });
  assert.ok(pixels.opaque > 100, "live Fern transport lens draws refracted replacement pixels");
  assert.deepEqual(pixels.outside, [0, 0, 0, 0], "Fern canvas remains transparent outside lenses");

  await page.getByRole("button", { name: "Begin story" }).click();
  await page.waitForTimeout(650);
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
  assert.deepEqual(errors, [], `${browserName} Fern path emitted browser errors`);
  await browser.close();
  return { webglVideoCount, opaquePixels: pixels.opaque };
}

async function main() {
  const browserName = argument("browser", "chromium") as BrowserName;
  assert.ok(browserName === "chromium" || browserName === "webkit", `Unsupported browser ${browserName}`);
  const baseUrl = argument("base-url", "http://localhost:3000");
  const browserType = browserName === "webkit" ? webkit : chromium;
  const proof = await runWebGLPath(browserType, browserName, baseUrl);
  await runFallbackPath(browserType, baseUrl);
  const fern = await runFernTransportPath(browserType, browserName, baseUrl);
  console.log(`glass QA passed (${browserName}): ${proof.displacedPixels} displaced grid samples; Fern ${fern.opaquePixels} transport pixels, ${fern.webglVideoCount} existing videos`);
}

void main();
