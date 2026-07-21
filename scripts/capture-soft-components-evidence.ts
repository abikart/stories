import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";

async function ready(page: import("playwright").Page, baseUrl: string) {
  await page.goto(`${baseUrl}/dev/design-system`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.querySelector("[data-soft-components-ready]")?.getAttribute("data-soft-components-ready") === "true",
    undefined,
    { timeout: 15_000 },
  );
}

async function main() {
  const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";
  const evidenceDirectory = path.join(process.cwd(), "docs", "evidence", "design-system", "soft-components");
  await fs.mkdir(evidenceDirectory, { recursive: true });

  const chromiumBrowser = await chromium.launch({ headless: true });
  try {
    const desktop = await chromiumBrowser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
    await desktop.emulateMedia({ reducedMotion: "reduce" });
    await ready(desktop, baseUrl);
    await desktop.locator(".soft-catalog").screenshot({ path: path.join(evidenceDirectory, "stories-desktop-chromium.png") });

    await desktop.getByRole("button", { name: "Upstream", exact: true }).click();
    await desktop.locator(".soft-catalog").screenshot({ path: path.join(evidenceDirectory, "upstream-desktop-chromium.png") });

    const phone = await chromiumBrowser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
    await phone.emulateMedia({ reducedMotion: "reduce" });
    await ready(phone, baseUrl);
    await phone.locator(".soft-catalog").screenshot({ path: path.join(evidenceDirectory, "stories-phone-chromium.png") });
  } finally {
    await chromiumBrowser.close();
  }

  const webkitBrowser = await webkit.launch({ headless: true });
  try {
    const desktop = await webkitBrowser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
    await desktop.emulateMedia({ reducedMotion: "reduce" });
    await ready(desktop, baseUrl);
    await desktop.locator(".soft-catalog").screenshot({ path: path.join(evidenceDirectory, "stories-desktop-webkit.png") });
  } finally {
    await webkitBrowser.close();
  }

  console.log(`✓ soft component evidence written to ${evidenceDirectory}`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
