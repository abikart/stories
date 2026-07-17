import path from "node:path";
import { chromium, type Page } from "playwright";

const baseUrl = process.env.STORIES_BASE_URL ?? "http://localhost:3000";
const evidenceDirectory = path.join(process.cwd(), "docs/evidence/liquid-glass");
const storyPath = "/experience/fern-and-the-silent-seed-bells";

async function waitForRenderer(page: Page, selector: string, status: "webgl" | "css") {
  await page.locator(`${selector}[data-glass-renderer="${status}"]`).waitFor({ state: "attached", timeout: 15_000 });
}

async function captureWebglFixture(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseUrl}/dev/glass`, { waitUntil: "networkidle" });
  await waitForRenderer(page, ".glass-fixture-stage", "webgl");
  await page.screenshot({
    path: path.join(evidenceDirectory, "final-glass-webgl.png"),
    animations: "disabled",
  });
}

async function captureFernWebgl(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseUrl}${storyPath}`, { waitUntil: "networkidle" });
  await waitForRenderer(page, ".story-player-stage", "webgl");
  await page.getByRole("button", { name: "Begin story" }).click();
  await page.waitForTimeout(3_000);
  await page.screenshot({
    path: path.join(evidenceDirectory, "final-fern-webgl.png"),
    animations: "disabled",
  });
}

async function captureFernCssFallback(page: Page) {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContextWithoutWebgl2(
      this: HTMLCanvasElement,
      contextId: string,
      ...options: unknown[]
    ) {
      if (contextId === "webgl2") return null;
      return getContext.call(this, contextId, ...options as []) as RenderingContext | null;
    } as typeof getContext;
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseUrl}${storyPath}`, { waitUntil: "networkidle" });
  await waitForRenderer(page, ".story-player-stage", "css");
  await page.screenshot({
    path: path.join(evidenceDirectory, "final-fern-css-fallback.png"),
    animations: "disabled",
  });
}

async function main() {
  const browser = await chromium.launch();
  try {
    const webglContext = await browser.newContext();
    const webglPage = await webglContext.newPage();
    await captureWebglFixture(webglPage);
    await captureFernWebgl(webglPage);
    await webglContext.close();
  } finally {
    await browser.close();
  }

  const fallbackBrowser = await chromium.launch({ args: ["--disable-webgl"] });
  try {
    const fallbackPage = await fallbackBrowser.newPage();
    await captureFernCssFallback(fallbackPage);
  } finally {
    await fallbackBrowser.close();
  }

  console.log(`Captured liquid-glass release evidence in ${evidenceDirectory}`);
}

void main();
