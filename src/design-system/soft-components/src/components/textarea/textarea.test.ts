import { expect, test } from 'vitest';

import { mount, settle } from '../../testing/index.js';

import './index.js';
import type { JellyTextarea } from './index.js';

test('upgrades with a native textarea', async () => {
  const host = mount('<jelly-textarea value="hi" placeholder="Notes"></jelly-textarea>');
  const el = host.querySelector('jelly-textarea') as JellyTextarea;

  await settle(3);
  const ta = el.shadowRoot!.querySelector('textarea') as HTMLTextAreaElement;
  expect(ta).toBeInstanceOf(HTMLTextAreaElement);
  expect(ta.value).toBe('hi');
  expect(ta.placeholder).toBe('Notes');

  host.remove();
});

test('the value property round-trips through the inner textarea', async () => {
  const host = mount('<jelly-textarea></jelly-textarea>');
  const el = host.querySelector('jelly-textarea') as JellyTextarea;

  await settle(3);
  el.value = 'line one\nline two';
  expect((el.shadowRoot!.querySelector('textarea') as HTMLTextAreaElement).value).toBe('line one\nline two');
  expect(el.value).toBe('line one\nline two');

  host.remove();
});

test('participates in a form under its name', async () => {
  const host = mount('<form><jelly-textarea name="notes" value="body"></jelly-textarea></form>');
  await settle(3);

  const data = new FormData(host.querySelector('form') as HTMLFormElement);
  expect(data.get('notes')).toBe('body');

  host.remove();
});
