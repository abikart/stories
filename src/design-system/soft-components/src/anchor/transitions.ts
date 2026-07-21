/*
 * Entrance / exit motion for overlays and toasts: a soft jello grow-in and
 * fade-out, plus the inline-end toast slide (mirrored under RTL).
 */

import { isRTL }                from '../utilities/index.js';
import { prefersReducedMotion } from '../utilities/index.js';

/*
 * A soft grow-in: it eases up from near full size with a gentle settle,
 * rather than snapping from tiny with a hard bounce. `origin` sets
 * transform-origin so it grows out of the right spot (a menu from its
 * trigger, a tooltip from its anchor, …).
 */
export function springIn (el: HTMLElement, origin = 'center'): void {
  el.style.transformOrigin = origin;

  if (prefersReducedMotion() || !el.animate) {
    return;
  }

  el.animate(
    [
      { opacity: 0, transform: 'scale(0.92, 0.96)' },
      { opacity: 1, transform: 'scale(1.014, 0.997)', offset: 0.55 },
      { transform: 'scale(0.998, 1.002)', offset: 0.8 },
      { transform: 'scale(1)' },
    ],
    { duration: 420, easing: 'cubic-bezier(.16,.82,.28,1)' },
  );
}

// Fade / scale out, then run `done` (for removal)
export function springOut (el: HTMLElement, done: () => void): void {
  if (prefersReducedMotion() || !el.animate) {
    done();
    return;
  }

  const animation = el.animate(
    [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.92)' },
    ],
    { duration: 150, easing: 'ease-in' },
  );

  animation.onfinish = done;
  animation.oncancel = done;
}

/*
 * Toast entrance: eases in from the inline-end (the right in LTR, the left
 * in RTL) while fading and scaling up, settling gently - a soft arrival
 * rather than a hard slide.
 */
export function toastIn (el: HTMLElement): void {
  const rtl  = isRTL(el);
  const from = rtl ? '-35%' : '35%';
  const past = rtl ? '1.5%' : '-1.5%';

  el.style.transformOrigin = rtl ? 'left center' : 'right center';

  if (prefersReducedMotion() || !el.animate) {
    return;
  }

  el.animate(
    [
      { opacity: 0, transform: `translateX(${from}) scale(0.9)` },
      { opacity: 1, transform: `translateX(${past}) scale(1.015)`, offset: 0.62 },
      { transform: 'translateX(0) scale(1)' },
    ],
    { duration: 480, easing: 'cubic-bezier(.16,.82,.28,1)' },
  );
}

// Toast exit: fades and eases out toward the inline-end, then removes
export function toastOut (el: HTMLElement, done: () => void): void {
  const rtl = isRTL(el);
  const to  = rtl ? '-30%' : '30%';

  el.style.transformOrigin = rtl ? 'left center' : 'right center';

  if (prefersReducedMotion() || !el.animate) {
    done();
    return;
  }

  const animation = el.animate(
    [
      { opacity: 1, transform: 'translateX(0) scale(1)' },
      { opacity: 0, transform: `translateX(${to}) scale(0.92)` },
    ],
    { duration: 320, easing: 'cubic-bezier(.4,0,.5,1)' },
  );

  animation.onfinish = done;
  animation.oncancel = done;
}
