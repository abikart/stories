import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium, firefox, webkit, type BrowserType } from "playwright";

const manifest = JSON.parse(readFileSync(path.join(
  process.cwd(),
  "src", "design-system", "soft-components", "contracts", "custom-elements.json",
), "utf8")) as {
  modules: Array<{ declarations?: Array<{ customElement?: boolean; tagName?: string }> }>;
};
const tags = manifest.modules.flatMap((module) => module.declarations ?? [])
  .filter((declaration) => declaration.customElement && declaration.tagName)
  .map((declaration) => declaration.tagName as string)
  .sort();

const engines: Array<{ name: string; type: BrowserType }> = [
  { name: "chromium", type: chromium },
  { name: "webkit", type: webkit },
  { name: "firefox", type: firefox },
];

async function main() {
  const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";
  const failures: string[] = [];
  const digest = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");
  const sourceBundle = path.join(process.cwd(), "src", "design-system", "soft-components", "dist", "jelly.js");
  const publicBundle = path.join(process.cwd(), "public", "design-system", "jelly.js");

  if (digest(sourceBundle) !== digest(publicBundle)) failures.push("public browser bundle is not synchronized with the portable package dist");

  for (const engine of engines) {
    const browser = await engine.type.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
    const runtimeErrors: string[] = [];

    page.on("pageerror", (error) => runtimeErrors.push(`page error: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(`console error: ${message.text()}`);
    });
    page.on("requestfailed", (request) => runtimeErrors.push(`request failed: ${request.url()} ${request.failure()?.errorText ?? ""}`));

    try {
      await page.goto(`${baseUrl}/dev/design-system`, { waitUntil: "load" });
      await page.waitForFunction(
        () => document.querySelector("[data-soft-components-ready]")?.getAttribute("data-soft-components-ready") === "true",
        undefined,
        { timeout: 15_000 },
      );

      const contract = await page.evaluate((expectedTags) => {
        const scope = document.querySelector<HTMLElement>("[data-testid='soft-components-catalog']");
        return {
          missingDefinitions: expectedTags.filter((tag) => !customElements.get(tag)),
          missingCatalogCards: expectedTags.filter((tag) => !document.querySelector(`[data-component='${tag}']`)),
          duplicateDefinitions: expectedTags.filter((tag) => document.querySelectorAll(`[data-component='${tag}']`).length !== 1),
          upgradedCount: scope ? [...scope.querySelectorAll("*")].filter((element) => element.shadowRoot).length : 0,
          desktopOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          storiesAccent: scope ? getComputedStyle(scope).getPropertyValue("--jelly-color-background-accent").trim() : "",
        };
      }, tags);

      if (contract.missingDefinitions.length) failures.push(`${engine.name}: missing definitions ${contract.missingDefinitions.join(", ")}`);
      if (contract.missingCatalogCards.length) failures.push(`${engine.name}: missing catalog cards ${contract.missingCatalogCards.join(", ")}`);
      if (contract.duplicateDefinitions.length) failures.push(`${engine.name}: duplicate/missing catalog cards ${contract.duplicateDefinitions.join(", ")}`);
      if (contract.upgradedCount < tags.length) failures.push(`${engine.name}: only ${contract.upgradedCount} upgraded elements found`);
      if (contract.desktopOverflow > 1) failures.push(`${engine.name}: desktop overflow ${contract.desktopOverflow}px`);
      if (contract.storiesAccent !== "#681fd1" && contract.storiesAccent !== "rgb(104, 31, 209)") {
        failures.push(`${engine.name}: Stories preset accent did not apply (${contract.storiesAccent})`);
      }

      await page.getByRole("button", { name: "Upstream", exact: true }).click();
      const upstreamAccent = await page.locator("[data-testid='soft-components-catalog']").evaluate((element) => (
        getComputedStyle(element).getPropertyValue("--jelly-color-background-accent").trim()
      ));
      if (upstreamAccent === contract.storiesAccent || upstreamAccent === "#681fd1") {
        failures.push(`${engine.name}: upstream preset did not restore the compatibility tokens`);
      }
      await page.getByRole("button", { name: "Stories preset", exact: true }).click();

      await page.getByLabel("Reduce motion", { exact: true }).check();
      const motion = await page.evaluate(() => {
        const firstButton = document.querySelector("jelly-button") as (HTMLElement & { reducedMotion?: boolean }) | null;
        const nativeButton = firstButton?.shadowRoot?.querySelector("button");
        return {
          override: document.documentElement.getAttribute("data-jelly-motion"),
          physicsReduced: firstButton?.reducedMotion === true,
          transitionDuration: nativeButton ? getComputedStyle(nativeButton).transitionDuration : "missing",
        };
      });
      // The portable behavior contract is the physics/overlay reduction. The
      // upstream :host-context CSS additionally suppresses size transitions in
      // Chromium; WebKit/Firefox do not currently implement that selector.
      if (motion.override !== "reduce" || !motion.physicsReduced || (engine.name === "chromium" && motion.transitionDuration !== "0s")) {
        failures.push(`${engine.name}: reduced motion contract failed ${JSON.stringify(motion)}`);
      }

      const dialogTrigger = page.locator("[data-component='jelly-dialog'] jelly-button").first();
      await dialogTrigger.evaluate((element) => (element.shadowRoot?.querySelector("button") as HTMLButtonElement | null)?.click());
      await page.locator("#catalog-dialog[open]").waitFor();
      const dialogContract = await page.locator("#catalog-dialog").evaluate((element) => ({
        role: element.shadowRoot?.querySelector("[role='dialog']")?.getAttribute("role"),
        modal: element.shadowRoot?.querySelector("[role='dialog']")?.getAttribute("aria-modal"),
      }));
      if (dialogContract.role !== "dialog" || dialogContract.modal !== "true") {
        failures.push(`${engine.name}: dialog semantics failed ${JSON.stringify(dialogContract)}`);
      }

      const nestedPopover = page.locator("#catalog-dialog jelly-popover");
      await nestedPopover.locator("jelly-button").evaluate((element) => (element.shadowRoot?.querySelector("button") as HTMLButtonElement | null)?.click());
      const nestedOpen = await nestedPopover.evaluate((element: HTMLElement & { isOpen?: boolean }) => element.isOpen === true);
      if (!nestedOpen) failures.push(`${engine.name}: nested popover did not open inside the modal dialog`);
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
      if (await page.locator("#catalog-dialog").getAttribute("open") !== null) failures.push(`${engine.name}: Escape did not close dialog`);

      const drawerTrigger = page.locator("[data-component='jelly-drawer'] jelly-button").first();
      await drawerTrigger.evaluate((element) => (element.shadowRoot?.querySelector("button") as HTMLButtonElement | null)?.click());
      await page.locator("#catalog-drawer[open]").waitFor();
      await page.keyboard.press("Escape");
      if (await page.locator("#catalog-drawer").getAttribute("open") !== null) failures.push(`${engine.name}: Escape did not close drawer`);

      const rtlStep = await page.locator(".soft-catalog__rtl jelly-slider").evaluate((element: HTMLElement & { value?: string }) => {
        const input = element.shadowRoot?.querySelector("input") as HTMLInputElement | null;
        const before = input?.value;
        input?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        return { before, after: input?.value };
      });
      if (rtlStep.before !== "64" || rtlStep.after !== "63") failures.push(`${engine.name}: RTL ArrowRight stepping failed ${JSON.stringify(rtlStep)}`);

      if (engine.name === "chromium") {
        await page.emulateMedia({ forcedColors: "active" });
        const forcedColorRing = await page.locator("jelly-input").first().evaluate((element) => {
          const ring = element.shadowRoot?.querySelector(".ring");
          const style = ring ? getComputedStyle(ring) : null;
          return { style: style?.borderTopStyle, color: style?.borderTopColor };
        });
        if (forcedColorRing.style !== "solid" || forcedColorRing.color === "rgba(0, 0, 0, 0)" || !forcedColorRing.color) {
          failures.push(`${engine.name}: forced-colors input ring failed ${JSON.stringify(forcedColorRing)}`);
        }
        await page.emulateMedia({ forcedColors: "none" });
      }

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(200);
      const phoneOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (phoneOverflow > 1) failures.push(`${engine.name}: phone overflow ${phoneOverflow}px`);

      if (runtimeErrors.length) failures.push(...runtimeErrors.map((error) => `${engine.name}: ${error}`));
    } finally {
      await browser.close();
    }
  }

  if (failures.length) {
    for (const failure of failures) console.error(`✗ ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(`✓ soft components — ${tags.length} definitions/catalog cards, Stories/upstream presets, reduced motion, nested overlays, responsive layout, clean consoles in Chromium/WebKit/Firefox`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
