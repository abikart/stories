import { afterEach, expect, test } from 'vitest';

import { prefersReducedMotion } from './motion.js';

afterEach(() => {
  document.documentElement.removeAttribute('data-jelly-motion');
});

test('an in-page override can force reduced motion', () => {
  document.documentElement.setAttribute('data-jelly-motion', 'reduce');

  expect(prefersReducedMotion()).toBe(true);
});

test('an in-page override can force motion on', () => {
  document.documentElement.setAttribute('data-jelly-motion', 'no-preference');

  expect(prefersReducedMotion()).toBe(false);
});
