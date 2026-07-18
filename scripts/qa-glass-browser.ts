import assert from "node:assert/strict";
import { chromium, webkit, type BrowserType } from "playwright";
import { PNG } from "pngjs";

const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";

async function inspectBrowser(name: string, browserType: BrowserType) {
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    (window as Window & { __glassContextCount?: number }).__glassContextCount = 0;
    const original = HTMLCanvasElement.prototype.getContext;
    const contexts = new WeakSet<object>();
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<HTMLCanvasElement["getContext"]>) {
      const context = original.apply(this, args as never) as object | null;
      if ((args[0] === "webgl" || args[0] === "webgl2") && context && !contexts.has(context)) {
        contexts.add(context);
        const scopedWindow = window as Window & { __glassContextCount?: number };
        scopedWindow.__glassContextCount = (scopedWindow.__glassContextCount ?? 0) + 1;
      }
      return context as never;
    };
  });

  try {
    await page.goto(`${baseUrl}/dev/glass`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-glass-renderer]");
    await page.waitForFunction(() => document.querySelector("[data-glass-renderer]")?.getAttribute("data-glass-renderer") === "webgl", undefined, { timeout: 5000 }).catch(() => undefined);
    const initialization = await page.evaluate(() => ({
      status: document.querySelector("[data-glass-renderer]")?.getAttribute("data-glass-renderer"),
      diagnostic: (window as Window & { __storiesGlassStage?: { lastError?: string; status: string } }).__storiesGlassStage,
      contextCount: (window as Window & { __glassContextCount?: number }).__glassContextCount,
    }));
    assert.equal(initialization.status, "webgl", `${name}: WebGL initialization failed: ${JSON.stringify(initialization)}`);
    await page.waitForTimeout(250);
    const proof = await page.evaluate(() => {
      const glassCanvas = document.querySelector<HTMLCanvasElement>("[data-glass-canvas] canvas");
      const source = document.querySelector<HTMLCanvasElement>(".transmission-fixture-grid");
      const lens = document.querySelector<HTMLElement>('[data-glass-surface="moving-pill"]');
      if (!glassCanvas || !source || !lens) throw new Error("glass proof elements are missing");
      const gl = glassCanvas.getContext("webgl2");
      if (!gl) throw new Error("WebGL2 proof context is unavailable");
      const outside = new Uint8Array(4);
      gl.readPixels(4, Math.max(0, glassCanvas.height - 4), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, outside);
      const diagnostic = (window as Window & {
        __storiesGlassStage?: { mapCache: { misses: number }; status: string; dpr: number };
        __glassContextCount?: number;
      }).__storiesGlassStage;
      return {
        renderer: document.querySelector("[data-glass-renderer]")?.getAttribute("data-glass-renderer"),
        canvasCount: document.querySelectorAll("[data-glass-canvas]").length,
        videoCount: document.querySelectorAll("video").length,
        surfaceCount: document.querySelectorAll("[data-glass-surface]").length,
        contextCount: (window as Window & { __glassContextCount?: number }).__glassContextCount,
        outsideAlpha: outside[3],
        diagnostic,
      };
    });
    const glassLayer = page.locator("[data-glass-canvas]");
    const stage = page.locator(".transmission-fixture-stage");
    const lens = page.locator('[data-glass-surface="moving-pill"]');
    const [stageBox, lensBox] = await Promise.all([stage.boundingBox(), lens.boundingBox()]);
    assert(stageBox && lensBox, `${name}: proof bounds are missing`);
    const withGlass = PNG.sync.read(await stage.screenshot());
    await glassLayer.evaluate((element) => { (element as HTMLElement).style.visibility = "hidden"; });
    const withoutGlass = PNG.sync.read(await stage.screenshot());
    await glassLayer.evaluate((element) => { (element as HTMLElement).style.visibility = ""; });
    let maxDelta = 0;
    let changedPixels = 0;
    let centerDeltaTotal = 0;
    let centerSamples = 0;
    const lensLeft = Math.round(lensBox.x - stageBox.x);
    const lensCenterY = Math.round(lensBox.y - stageBox.y + lensBox.height / 2);
    for (let y = lensCenterY - 10; y <= lensCenterY + 10; y += 2) {
      for (let x = lensLeft + 3; x <= lensLeft + 34; x += 2) {
        const offset = (y * withGlass.width + x) * 4;
        const delta = Math.abs(withGlass.data[offset] - withoutGlass.data[offset])
          + Math.abs(withGlass.data[offset + 1] - withoutGlass.data[offset + 1])
          + Math.abs(withGlass.data[offset + 2] - withoutGlass.data[offset + 2]);
        maxDelta = Math.max(maxDelta, delta);
        if (delta > 18) changedPixels += 1;
      }
    }
    const lensCenterX = Math.round(lensLeft + lensBox.width / 2);
    for (let y = lensCenterY - 8; y <= lensCenterY + 8; y += 4) {
      for (let x = lensCenterX - 16; x <= lensCenterX + 16; x += 4) {
        const offset = (y * withGlass.width + x) * 4;
        centerDeltaTotal += Math.abs(withGlass.data[offset] - withoutGlass.data[offset])
          + Math.abs(withGlass.data[offset + 1] - withoutGlass.data[offset + 1])
          + Math.abs(withGlass.data[offset + 2] - withoutGlass.data[offset + 2]);
        centerSamples += 1;
      }
    }
    const centerMeanDelta = centerDeltaTotal / centerSamples;
    assert.equal(proof.renderer, "webgl", `${name}: fixture did not use WebGL`);
    assert.equal(proof.canvasCount, 1, `${name}: fixture created multiple glass canvases`);
    assert.equal(proof.contextCount, 1, `${name}: fixture created multiple WebGL contexts`);
    assert.equal(proof.videoCount, 1, `${name}: fixture duplicated its video decoder`);
    assert.equal(proof.surfaceCount, 3, `${name}: fixture did not register all shapes`);
    assert.equal(proof.outsideAlpha, 0, `${name}: pixels outside lenses were not transparent`);
    assert(changedPixels > 12 && maxDelta > 24, `${name}: grid pixels were not optically displaced (${changedPixels} changed, max Δ ${maxDelta})`);
    assert(centerMeanDelta < 8, `${name}: lens center was tinted or opaque (mean Δ ${centerMeanDelta.toFixed(2)})`);
    assert(proof.diagnostic && proof.diagnostic.dpr <= 2, `${name}: diagnostics/DPR cap are missing`);

    const missesBefore = proof.diagnostic?.mapCache.misses ?? -1;
    await page.getByLabel("Move the same refractive lens").evaluate((element) => {
      const input = element as HTMLInputElement;
      input.value = "42";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.waitForTimeout(300);
    const missesAfter = await page.evaluate(() => (
      (window as Window & { __storiesGlassStage?: { mapCache: { misses: number } } }).__storiesGlassStage?.mapCache.misses
    ));
    assert.equal(missesAfter, missesBefore, `${name}: moving a lens regenerated its cached map`);

    const canLose = await page.evaluate(() => {
      const diagnostic = (window as Window & {
        __storiesGlassStage?: { simulateContextLoss(): void };
      }).__storiesGlassStage;
      diagnostic?.simulateContextLoss();
      return Boolean(diagnostic);
    });
    assert(canLose, `${name}: context diagnostics are unavailable`);
    await page.waitForSelector('[data-glass-renderer="css"]');
    await page.waitForTimeout(500);
    await page.evaluate(() => (
      (window as Window & { __storiesGlassStage?: { simulateContextRestore(): void } }).__storiesGlassStage?.simulateContextRestore()
    ));
    await page.waitForSelector('[data-glass-renderer="webgl"]');

    await page.goto(`${baseUrl}/experience/fern-and-the-silent-seed-bells`, { waitUntil: "networkidle" });
    await page.waitForSelector('.story-player-stage[data-glass-renderer="webgl"]');
    const fern = await page.evaluate(() => ({
      canvasCount: document.querySelectorAll(".story-player-stage [data-glass-canvas]").length,
      surfaceIds: [...document.querySelectorAll("[data-glass-surface]")].map((element) => element.getAttribute("data-glass-surface")),
      mediaVideos: document.querySelectorAll(".story-player-media video").length,
      totalVideos: document.querySelectorAll("video").length,
      labelsAreDom: document.querySelectorAll(".story-mode-switch button").length === 2
        && document.querySelectorAll(".story-overlay p").length === 1,
    }));
    assert.equal(fern.canvasCount, 1, `${name}: Fern created multiple glass canvases`);
    assert.deepEqual(fern.surfaceIds.sort(), ["dialogue", "mode-lens", "start-card", "story-title", "transport"], `${name}: Fern surface registration is incomplete`);
    assert(fern.mediaVideos <= fern.totalVideos, `${name}: Fern media accounting failed`);
    assert(fern.labelsAreDom, `${name}: semantic labels were rasterized`);
    assert.deepEqual(errors, [], `${name}: browser page errors: ${errors.join("; ")}`);
    console.log(`✓ ${name} — displaced pixels, one context, cache reuse, recovery, live Fern`);
  } finally {
    await browser.close();
  }
}

async function main() {
  await inspectBrowser("Chromium", chromium);
  await inspectBrowser("WebKit", webkit);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
