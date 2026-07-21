/*
 * A jelly keyboard key. Poke it with the pointer, or give it `key="k"`
 * and it depresses and squishes for real whenever that key is held
 * anywhere on the page
 */

import { JellyElement } from '../../element/index.js';
import type { Shape }   from '../../element/index.js';

import kbdStyles         from './kbd.css?inline';

/**
 * A tactile keyboard key. With `key="…"` it mirrors that physical key
 * document-wide, depressing whenever the key is held.
 *
 * @element jelly-kbd
 *
 * @slot - The key label (a letter, symbol or icon).
 *
 * @attr {string} key - A `KeyboardEvent.key` value to mirror document-wide.
 * @attr {"small"|"medium"|"large"} size - Keycap size.
 *
 * @csspart cap - The keycap surface.
 */
export class JellyKbd extends JellyElement implements EventListenerObject {

  onDocumentKeyDown: ((event: KeyboardEvent) => void) | null = null;
  onDocumentKeyUp: ((event: KeyboardEvent) => void) | null = null;

  // Tells the browser to trigger attributeChangedCallback when these attributes change
  static get observedAttributes (): string[] {
    return ['key'];
  }

  // Component styles layered over the shared jelly base styles
  override styles (): string {
    return kbdStyles;
  }

  // The interactive markup that sits above the canvas
  override content (): string {
    return `<span class="cap" part="cap"><slot></slot></span>`;
  }

  // The keycap the physics body takes, with gently squared corners
  override shape (width: number, height: number): Shape {
    return {
      width:  width - 2,
      height: height - 2,
      radius: Math.min(10, (height - 2) * 0.34),
    };
  }

  // Called once after the shadow DOM and canvas exist. Wire events here.
  override onBuilt (): void {
    this.tabIndex = 0;
    this.setAttribute('role', 'button');
    this.trackFocus(this);

    this.addEventListener('pointerdown', this);
    this.addEventListener('pointerup', this);
    this.addEventListener('pointercancel', this);
    this.addEventListener('pointerleave', this);
    this.addEventListener('keydown', this);
    this.addEventListener('keyup', this);
    this.addEventListener('blur', this);

    this.armKeyMirror();
  }

  // Lifecycle method: Fires when observed HTML attributes change dynamically
  attributeChangedCallback (): void {
    if (this.built) {
      this.armKeyMirror();
    }
  }

  // Lifecycle method: Called automatically when the element is appended to the
  // DOM. Re-arm the document-wide key mirror - disconnectedCallback dropped it,
  // and a kbd that is detached and re-appended should keep mirroring its key.
  override connectedCallback (): void {
    super.connectedCallback();

    if (this.built) {
      this.armKeyMirror();
    }
  }

  /*
   * With key="…" the cap mirrors that physical key document-wide. Idempotent:
   * the old listener pair is always dropped first, so connect / re-connect /
   * key changes never stack listeners.
   */
  armKeyMirror (): void {
    this.disarmKeyMirror();

    const key = this.getAttribute('key');

    if (!key) {
      return;
    }

    this.onDocumentKeyDown = (event) => {
      if (event.key.toLowerCase() === key.toLowerCase() && !event.repeat) {
        this.press();
      }
    };

    this.onDocumentKeyUp = (event) => {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        this.release();
      }
    };

    document.addEventListener('keydown', this.onDocumentKeyDown);
    document.addEventListener('keyup', this.onDocumentKeyUp);
  }

  // Drop the document-wide key mirror listeners, if any are wired
  disarmKeyMirror (): void {
    if (this.onDocumentKeyDown && this.onDocumentKeyUp) {
      document.removeEventListener('keydown', this.onDocumentKeyDown);
      document.removeEventListener('keyup', this.onDocumentKeyUp);
      this.onDocumentKeyDown = null;
      this.onDocumentKeyUp = null;
    }
  }

  // Handle callback events
  handleEvent (event: Event): void {
    switch (event.type) {
      case 'pointerdown': {
        const pointer = event as PointerEvent;
        try {
          this.setPointerCapture(pointer.pointerId);
        } catch {
          // Capture can fail if the pointer is already gone; the press still works
        }
        this.press(pointer.clientX, pointer.clientY);
        break;
      }

      case 'pointerup':
      case 'pointercancel':
      case 'pointerleave':
        this.release();
        break;

      case 'keydown': {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') {
          return;
        }

        if (this.keyboardActive || keyEvent.repeat) {
          return;
        }
        keyEvent.preventDefault();
        this.keyboardActive = true;
        this.press();
        break;
      }

      case 'keyup': {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') {
          return;
        }
        keyEvent.preventDefault();
        this.keyboardActive = false;
        this.release();
        break;
      }

      case 'blur':
        this.keyboardActive = false;
        this.release();
        break;
    }
  }

  // Depress the cap: bulge from the pointer, or squish from the center
  press (clientX?: number, clientY?: number): void {
    this.classList.add('pressed');

    if (clientX != null && clientY != null) {
      this.pressAt(clientX, clientY, 1);
    } else {
      this.centerPulse(0.9);
    }
  }

  // Let the cap travel back up and the jelly settle
  release (): void {
    if (!this.classList.contains('pressed')) {
      return;
    }

    this.classList.remove('pressed');
    this.releaseBody();
  }

  // Lifecycle method: Called automatically when the element leaves the DOM
  override disconnectedCallback (): void {
    super.disconnectedCallback();
    this.disarmKeyMirror();
  }

}

// Register the custom element
customElements.define('jelly-kbd', JellyKbd);

declare global {
  interface HTMLElementTagNameMap {
    'jelly-kbd': JellyKbd;
  }
}
