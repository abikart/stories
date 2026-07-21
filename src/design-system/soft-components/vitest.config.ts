import { defineConfig } from 'vitest/config';

/*
 * Component tests run in a real Chromium via Playwright, so canvas painting,
 * soft-body physics, layout and focus all execute for real - the same fidelity
 * as the manual browser smoke checks, but automated. Tests live next to their
 * component as `*.test.ts`.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      name: 'chromium',
    },
  },
});
