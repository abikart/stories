import { chromium, webkit, type BrowserType } from "playwright";
import { treatmentGuidelines } from "@/design-system/treatments";

const engines: Array<{ name: "chromium" | "webkit"; type: BrowserType }> = [
  { name: "chromium", type: chromium },
  { name: "webkit", type: webkit },
];

async function main() {
  const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";
  const failures: string[] = [];
  if (treatmentGuidelines.glassLight.status !== "stable"
    || treatmentGuidelines.glassLight.fidelity !== "exact-source") {
    failures.push("Light Glass must remain the exact-source stable recipe");
  }
  for (const name of ["glowAtmospheric", "glowSpotlight", "sheenStatic", "sheenAnimated"] as const) {
    if (treatmentGuidelines[name].status !== "provisional"
      || treatmentGuidelines[name].fidelity !== "source-guided") {
      failures.push(`${name} must remain explicitly provisional until its detailed recipe is audited`);
    }
  }
  if (treatmentGuidelines.surfaceSolid.fidelity !== "stories-native") {
    failures.push("Solid Surface must not claim exact Figma recipe fidelity");
  }

  for (const engine of engines) {
    const browser = await engine.type.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("pageerror", (error) => failures.push(`${engine.name} page error: ${error.message}`));

    try {
      await page.goto(`${baseUrl}/dev/design-system`, { waitUntil: "networkidle" });
      const contract = await page.evaluate(() => {
        const glass = document.querySelector<HTMLElement>(".ds-glass-light:not(.ds-glass-light--fallback)");
        const fallback = document.querySelector<HTMLElement>(".ds-glass-light--fallback");
        const sheen = document.querySelector<HTMLElement>(".ds-sheen--animated");
        const style = glass ? getComputedStyle(glass) : null;
        const fallbackStyle = fallback ? getComputedStyle(fallback) : null;
        const sheenStyle = sheen ? getComputedStyle(sheen, "::before") : null;
        return {
          background: style?.backgroundColor,
          border: style?.borderTop,
          blur: style?.backdropFilter || style?.getPropertyValue("-webkit-backdrop-filter"),
          shadow: style?.boxShadow,
          fallbackBackground: fallbackStyle?.backgroundColor,
          fallbackBlur: fallbackStyle?.backdropFilter || fallbackStyle?.getPropertyValue("-webkit-backdrop-filter"),
          sheenAnimation: sheenStyle?.animationName,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      if (contract.background !== "rgba(255, 255, 255, 0.6)"
        || contract.border !== "1px solid rgba(255, 255, 255, 0.6)"
        || contract.blur !== "blur(10px)"
        || !contract.shadow?.includes("24px 1px inset")) {
        failures.push(`${engine.name} Light Glass fixture drifted: ${JSON.stringify(contract)}`);
      }
      if (contract.fallbackBackground !== "rgba(255, 255, 255, 0.94)" || contract.fallbackBlur !== "none") {
        failures.push(`${engine.name} Light Glass fallback drifted: ${JSON.stringify(contract)}`);
      }
      if (contract.sheenAnimation !== "ds-sheen-travel") failures.push(`${engine.name} animated sheen fixture is not active`);
      if (contract.overflow > 1) failures.push(`${engine.name} desktop catalog overflowed by ${contract.overflow}px`);

      await page.setViewportSize({ width: 390, height: 844 });
      const phoneOverflow = await page.evaluate(() => (
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      ));
      if (phoneOverflow > 1) failures.push(`${engine.name} phone catalog overflowed by ${phoneOverflow}px`);

      await page.emulateMedia({ reducedMotion: "reduce" });
      const reducedSheen = await page.locator(".ds-sheen--animated").evaluate((element) => (
        getComputedStyle(element, "::before").animationName
      ));
      if (reducedSheen !== "none") failures.push(`${engine.name} reduced motion did not stop animated sheen`);
    } finally {
      await browser.close();
    }
  }

  if (failures.length) {
    for (const failure of failures) console.error(`✗ ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("✓ design system — Chromium/WebKit Light Glass, fallback, glow/sheen, responsive layout, reduced motion");
}

void main();
