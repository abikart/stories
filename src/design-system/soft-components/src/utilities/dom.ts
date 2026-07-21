/*
 * DOM helpers shared by every component: unique ARIA ids, composed event
 * dispatch, numeric attribute parsing, HTML escaping and reading direction.
 */

// Global counter so every generated id on the page is unique
let uid = 0;

// Mint a unique id for ARIA relationships (aria-labelledby, aria-controls, …)
export function uniqueId (prefix = 'jelly'): string {
  return `${prefix}-${++uid}`;
}

/*
 * Dispatch a composed, bubbling CustomEvent from a component so consumers
 * can listen on the host element like any native event. Returns false when
 * a cancelable event was prevented.
 *
 *   emit(this, 'change', { value: this.value });
 */
export function emit (
  element: Element,
  type: string,
  detail: unknown = null,
  options: CustomEventInit = {},
): boolean {
  const event = new CustomEvent(type, {
    bubbles:  true,
    composed: true,
    detail,
    ...options,
  });

  return element.dispatchEvent(event);
}

// Read a numeric attribute, falling back when missing or unparseable
export function numberAttribute (element: Element, name: string, fallback = 0): number {
  const raw = element.getAttribute(name);

  if (raw === null || raw.trim() === '') {
    return fallback;
  }

  const value = Number(raw);

  return Number.isFinite(value) ? value : fallback;
}

// Escape text for safe interpolation into shadow-DOM innerHTML
export function escapeHTML (text: unknown): string {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// True when the element currently renders right-to-left
export function isRTL (element: Element): boolean {
  return getComputedStyle(element).direction === 'rtl';
}
