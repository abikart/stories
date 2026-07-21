import { expect, test, vi } from 'vitest';

import { mount, settle } from '../../testing/index.js';

import './index.js';
import type { JellyIconButton } from './index.js';

test('upgrades with a labelled inner button', async () => {
  const host = mount('<jelly-icon-button label="Search">🔍</jelly-icon-button>');
  const el = host.querySelector('jelly-icon-button') as JellyIconButton;

  await settle(3);
  const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
  expect(button).toBeInstanceOf(HTMLButtonElement);
  expect(button.getAttribute('aria-label')).toBe('Search');

  host.remove();
});

test('disabled reflects onto the inner button', async () => {
  const host = mount('<jelly-icon-button label="Close" disabled>✕</jelly-icon-button>');
  const el = host.querySelector('jelly-icon-button') as JellyIconButton;

  await settle(3);
  expect((el.shadowRoot!.querySelector('button') as HTMLButtonElement).disabled).toBe(true);

  host.remove();
});

test('does not activate when a pointer is released outside the button', async () => {
  const host = mount('<jelly-icon-button label="Close">✕</jelly-icon-button>');
  const el = host.querySelector('jelly-icon-button') as JellyIconButton;
  const onClick = vi.fn();

  el.addEventListener('click', onClick);
  await settle(3);

  const button = el.shadowRoot!.querySelector('button') as HTMLButtonElement;

  button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 }));
  button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: -100, clientY: -100 }));
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));

  expect(onClick).not.toHaveBeenCalled();

  host.remove();
});
