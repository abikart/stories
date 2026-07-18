import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const viewport = { width: 1440, height: 1000 };

async function captureFixture(baseUrl: string, output: string) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/dev/glass`, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-glass-renderer="webgl"]');
    await page.waitForTimeout(300);
    await page.locator(".transmission-fixture-stage").screenshot({
      path: path.join(output, "after-fixture.png"),
    });
  } finally {
    await browser.close();
  }
}

async function captureFern(baseUrl: string, output: string) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/experience/fern-and-the-silent-seed-bells`, { waitUntil: "networkidle" });
    await page.waitForSelector('.story-player-stage[data-glass-renderer="webgl"]');
    await page.getByRole("button", { name: "Begin story", exact: true }).click();
    await page.waitForTimeout(900);
    await page.locator(".story-player-composition").screenshot({
      path: path.join(output, "after-fern-live.png"),
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";
  const output = path.join(process.cwd(), "docs", "evidence", "liquid-glass");
  await fs.mkdir(output, { recursive: true });
  if (process.env.GLASS_BEFORE) {
    await fs.copyFile(process.env.GLASS_BEFORE, path.join(output, "before-rejected-physical.png"));
  }
  await captureFixture(baseUrl, output);
  await captureFern(baseUrl, output);
  console.log(`✓ glass evidence — ${output}`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
