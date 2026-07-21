import { expect, test } from 'vitest';

import { mount, settle } from '../../testing/index.js';

import './index.js';
import type { JellyInput } from './index.js';

test('upgrades with a native input carrying value/type/placeholder', async () => {
  const host = mount('<jelly-input value="hi" type="email" placeholder="you@x.com"></jelly-input>');
  const el = host.querySelector('jelly-input') as JellyInput;

  await settle(3);
  const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
  expect(input.value).toBe('hi');
  expect(input.type).toBe('email');
  expect(input.placeholder).toBe('you@x.com');

  host.remove();
});

test('the value property round-trips through the inner input', async () => {
  const host = mount('<jelly-input></jelly-input>');
  const el = host.querySelector('jelly-input') as JellyInput;

  await settle(3);
  el.value = 'typed';
  expect((el.shadowRoot!.querySelector('input') as HTMLInputElement).value).toBe('typed');
  expect(el.value).toBe('typed');

  host.remove();
});

test('participates in a form under its name', async () => {
  const host = mount('<form><jelly-input name="q" value="typed"></jelly-input></form>');
  await settle(3);

  const data = new FormData(host.querySelector('form') as HTMLFormElement);
  expect(data.get('q')).toBe('typed');

  host.remove();
});

test('no-autofill opts the inner input out of autocomplete', async () => {
  const host = mount('<jelly-input no-autofill></jelly-input>');
  const el = host.querySelector('jelly-input') as JellyInput;

  await settle(3);
  const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
  expect(input.autocomplete).toBe('off');
  expect(input.hasAttribute('data-1p-ignore')).toBe(true);

  host.remove();
});
