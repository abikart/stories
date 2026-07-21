/*
 * Keyboard math for list-like controls: horizontal-arrow direction that
 * respects reading direction, and full roving-list navigation with
 * Home / End jumps and wrap-around.
 */

import { clamp } from './motion.js';

/*
 * Map a horizontal arrow key onto a logical step that respects reading
 * direction: +1 advances (toward the inline end), -1 goes back, 0 means
 * the key was not a horizontal arrow. In RTL the arrows swap, matching
 * how native controls behave.
 */
export function horizontalStep (key: string, rtl = false): number {
  if (key === 'ArrowRight') {
    return rtl ? -1 : +1;
  }

  if (key === 'ArrowLeft') {
    return rtl ? +1 : -1;
  }

  return 0;
}

// Options accepted by listNavigate
export interface ListNavigateOptions {
  rtl?: boolean;
  wrap?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
}

/*
 * Move through a list of items from a keyboard event, with Home / End
 * jumps and wrap-around. Returns the next index, or -1 when the key does
 * not navigate. Vertical arrows always mean previous / next; horizontal
 * arrows respect reading direction.
 */
export function listNavigate (
  key: string,
  index: number,
  count: number,
  { rtl = false, wrap = true, horizontal = true, vertical = true }: ListNavigateOptions = {},
): number {
  let delta = 0;

  if (horizontal) delta = horizontalStep(key, rtl);

  if (vertical && delta === 0) {
    if (key === 'ArrowDown') delta = +1;
    if (key === 'ArrowUp')   delta = -1;
  }

  if (key === 'Home') {
    return 0;
  }

  if (key === 'End') {
    return count - 1;
  }

  if (delta === 0 || count === 0) {
    return -1;
  }

  const next = index + delta;

  if (wrap) {
    return (next + count) % count;
  }

  return clamp(next, 0, count - 1);
}
