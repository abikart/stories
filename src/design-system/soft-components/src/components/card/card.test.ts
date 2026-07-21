import { expect, test } from 'vitest';

import { mount, settle } from '../../testing/index.js';

import './index.js';
import type { JellyCard } from './index.js';

test('upgrades and renders its slotted content in a surface', async () => {
  const host = mount('<jelly-card><h3>Title</h3></jelly-card>');
  const el = host.querySelector('jelly-card') as JellyCard;

  await settle(3);
  expect(el.shadowRoot!.querySelector('.card')).toBeTruthy();
  expect(el.querySelector('h3')?.textContent).toBe('Title');

  host.remove();
});

test('squish cards become keyboard-activatable buttons', async () => {
  const host = mount('<jelly-card squish>Tap</jelly-card>');
  const el = host.querySelector('jelly-card') as JellyCard;

  await settle(3);
  const card = el.shadowRoot!.querySelector('.card') as HTMLElement;
  expect(card.getAttribute('role')).toBe('button');
  expect(card.getAttribute('tabindex')).toBe('0');

  let clicked = 0;
  el.addEventListener('click', () => { clicked += 1; });
  card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  card.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
  expect(clicked).toBe(1);

  host.remove();
});
