import { expect, test } from 'vitest';

import { mount, settle } from '../../testing/index.js';

import './index.js';
import type { JellyKbd } from './index.js';

test('upgrades as a role=button keycap', async () => {
  const host = mount('<jelly-kbd>K</jelly-kbd>');
  const el = host.querySelector('jelly-kbd') as JellyKbd;

  await settle(3);
  expect(el.getAttribute('role')).toBe('button');
  expect(el.shadowRoot!.querySelector('.cap')).toBeTruthy();

  host.remove();
});

test('key="a" mirrors the physical key document-wide', async () => {
  const host = mount('<jelly-kbd key="a">A</jelly-kbd>');
  const el = host.querySelector('jelly-kbd') as JellyKbd;

  await settle(3);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
  expect(el.classList.contains('pressed')).toBe(true);

  document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
  expect(el.classList.contains('pressed')).toBe(false);

  host.remove();
});
