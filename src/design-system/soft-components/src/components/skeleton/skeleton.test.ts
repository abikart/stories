import { expect, test, vi } from 'vitest';

import { mount, settle } from '../../testing/index.js';

import './index.js';
import type { JellySkeleton } from './index.js';

test('upgrades as a busy status placeholder with a canvas', async () => {
  const host = mount('<jelly-skeleton></jelly-skeleton>');
  const el = host.querySelector('jelly-skeleton') as JellySkeleton;

  await settle(3);
  expect(el.getAttribute('role')).toBe('status');
  expect(el.getAttribute('aria-busy')).toBe('true');
  expect(el.getAttribute('aria-label')).toBe('Loading');
  expect(el.shadowRoot!.querySelector('canvas')).toBeInstanceOf(HTMLCanvasElement);

  host.remove();
});

test('parks its continuous frame loop while outside the viewport', async () => {
  const host = mount('<jelly-skeleton></jelly-skeleton>');
  const el = host.querySelector('jelly-skeleton') as JellySkeleton;

  await settle(4);
  const frame = vi.spyOn(el, 'frame');

  el.setViewportVisibility(false);
  await settle(3);
  const parkedAt = frame.mock.calls.length;
  await settle(3);

  expect(frame.mock.calls.length).toBe(parkedAt);

  el.setViewportVisibility(true);
  await settle(3);
  expect(frame.mock.calls.length).toBeGreaterThan(parkedAt);

  host.remove();
});
