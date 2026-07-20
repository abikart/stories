import { chromium } from "playwright";

async function main() {
  const baseUrl = process.env.EXPERIENCE_BASE_URL ?? "http://localhost:3000";
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failures: string[] = [];

  page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));

  try {
    await page.goto(`${baseUrl}/dev/design-system`, { waitUntil: "networkidle" });
    const contract = await page.evaluate(() => {
      const glass = document.querySelector<HTMLElement>(".ds-glass-light");
      const sheen = document.querySelector<HTMLElement>(".ds-sheen--animated");
      const style = glass ? getComputedStyle(glass) : null;
      const sheenStyle = sheen ? getComputedStyle(sheen, "::before") : null;
      return {
        background: style?.backgroundColor,
        border: style?.borderTop,
        blur: style?.backdropFilter,
        shadow: style?.boxShadow,
        sheenAnimation: sheenStyle?.animationName,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    if (contract.background !== "rgba(255, 255, 255, 0.6)"
      || contract.border !== "1px solid rgba(255, 255, 255, 0.6)"
      || contract.blur !== "blur(10px)"
      || !contract.shadow?.includes("24px 1px inset")) {
      failures.push(`Light Glass fixture drifted: ${JSON.stringify(contract)}`);
    }
    if (contract.sheenAnimation !== "ds-sheen-travel") failures.push("animated sheen fixture is not active");
    if (contract.overflow > 1) failures.push(`desktop catalog overflowed by ${contract.overflow}px`);

    await page.setViewportSize({ width: 390, height: 844 });
    const phoneOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ));
    if (phoneOverflow > 1) failures.push(`phone catalog overflowed by ${phoneOverflow}px`);

    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedSheen = await page.locator(".ds-sheen--animated").evaluate((element) => (
      getComputedStyle(element, "::before").animationName
    ));
    if (reducedSheen !== "none") failures.push("reduced motion did not stop animated sheen");
  } finally {
    await browser.close();
  }

  if (failures.length) {
    for (const failure of failures) console.error(`✗ ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("✓ design system — Light Glass, glow/sheen fixtures, responsive layout, reduced motion");
}

void main();
