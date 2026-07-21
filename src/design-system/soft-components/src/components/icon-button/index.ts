/*
 * A compact square or round jelly button sized for a single icon. A real
 * <button> lives in the shadow DOM for keyboard and assistive-technology
 * support, the label attribute gives the icon an accessible name and the
 * shape attribute picks the silhouette: "square" (the default, a rounded
 * square - the same word jelly-button and jelly-badge use) or "circle".
 */

import { JellyElement }  from '../../element/index.js';
import type { Shape }    from '../../element/index.js';

import iconButtonStyles  from './icon-button.css?inline';
import variantStyles     from '../../styles/variants.css?inline';

/**
 * A compact square or round button sized for a single icon.
 *
 * @element jelly-icon-button
 *
 * @slot - The icon (an SVG or emoji).
 *
 * @attr {string} label - Accessible name for the icon (required for a11y).
 * @attr {boolean} disabled - Disable the button and remove it from the tab order.
 * @attr {"square"|"circle"} shape - Rounded square (default) or circle.
 * @attr {"small"|"medium"|"large"} size - Control size.
 * @attr {"white"|"rose"|"amber"|"azure"|"mint"|"platinum"|"graphite"} variant - Fill hue.
 *
 * @fires click - When the button is activated (native event, bubbles composed).
 *
 * @csspart button - The inner native <button>.
 *
 * @cssprop [--jelly-icon-button-size=48px] - Button diameter / side.
 * @cssprop [--jelly-icon-button-radius=16px] - Corner radius for the square shape.
 */
export class JellyIconButton extends JellyElement {

  // Populated in onBuilt()
  button!: HTMLButtonElement;
  activationPointerId: number | null = null;
  cancelPointerClick = false;

  // Tells the browser to trigger attributeChangedCallback when these attributes change
  static get observedAttributes (): string[] {
    return ['disabled', 'label', 'shape'];
  }

  // Component styles layered over the shared jelly base styles
  override styles (): string {
    return variantStyles + iconButtonStyles;
  }

  // The interactive markup that sits above the canvas
  override content (): string {
    return `<button part="button"><slot></slot></button>`;
  }

  // The rounded square (default / shape="square") or circle (shape="circle")
  // the physics body takes, inset so the wobble stays inside
  override shape (width: number, height: number): Shape {
    const size   = Math.min(width, height) - 6;
    const circle = this.getAttribute('shape') === 'circle';

    // The square shape honors a --jelly-icon-button-radius override on the
    // painted surface; circle always draws a full round
    const declared = parseFloat(getComputedStyle(this).getPropertyValue('--jelly-icon-button-radius'));
    const radius   = circle ? size / 2 : (Number.isFinite(declared) ? Math.min(declared, size / 2) : size * 0.32);

    return { width: size, height: size, radius };
  }

  // Called once after the shadow DOM and canvas exist. Wire events here.
  override onBuilt (): void {
    this.button = this.shadowRoot!.querySelector('button')!;

    this.sync('disabled');
    this.sync('label');

    this.useHostFocusTarget(this.button);
    this.trackFocus(this.button);
    this.preventReleaseOutsideActivation();
    this.wirePress(this.button);
  }

  // Pointer capture keeps a drag routed to the button after the pointer leaves
  // it. Cancel the resulting native click unless the release is back inside
  // the button; keyboard-originated clicks are unaffected.
  preventReleaseOutsideActivation (): void {
    this.button.addEventListener('pointerdown', (event) => {
      this.activationPointerId = event.pointerId;
      this.cancelPointerClick = false;
    });

    this.button.addEventListener('pointerup', (event) => {
      if (event.pointerId !== this.activationPointerId) {
        return;
      }

      const rect = this.button.getBoundingClientRect();

      this.cancelPointerClick =
        event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom;
      this.activationPointerId = null;
    });

    this.button.addEventListener('pointercancel', () => {
      this.activationPointerId = null;
      this.cancelPointerClick = false;
    });

    const cancelOutsideRelease = (event: Event): void => {
      if (!this.cancelPointerClick) {
        return;
      }

      this.cancelPointerClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    // Native clicks from a shadow button are composed. Guard on both the
    // source button and the host boundary so an outside release cannot leak
    // through to a consumer's host-level click listener.
    this.button.addEventListener('click', cancelOutsideRelease);
    this.addEventListener('click', cancelOutsideRelease, { capture: true });
  }

  // Lifecycle method: Fires when observed HTML attributes change dynamically
  attributeChangedCallback (name: string): void {
    if (this.button) {
      this.sync(name);
    }
  }

  // Push one observed attribute into the inner native button or the membrane
  sync (name: string): void {
    switch (name) {
      case 'disabled':
        this.button.disabled = this.hasAttribute('disabled');
        this.syncHostFocusTarget();
        break;

      case 'label': {
        const label = this.getAttribute('label');

        if (label) {
          this.button.setAttribute('aria-label', label);
        } else {
          this.button.removeAttribute('aria-label');
        }
        break;
      }

      case 'shape':
        this.reshapeMembrane();
        break;
    }
  }

  // Route programmatic host focus into the inner native button
  override focus (options?: FocusOptions): void {
    this.button?.focus(options);
  }

}

// Register the custom element
customElements.define('jelly-icon-button', JellyIconButton);

declare global {
  interface HTMLElementTagNameMap {
    'jelly-icon-button': JellyIconButton;
  }
}
