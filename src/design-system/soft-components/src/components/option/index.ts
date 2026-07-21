/*
 * Declarative option data for <jelly-select>: the parent select reads each
 * option's value, label and disabled state and renders its own listbox
 * rows, so this element hides itself and never takes part in layout
 */

// The minimal surface of a parent that re-reads its options
interface OptionParent extends HTMLElement {
  syncOptions?: () => void;
}

/**
 * Declarative option data for `<jelly-select>`. Hidden from layout.
 *
 * @element jelly-option
 *
 * @slot - The option's visible label.
 *
 * @attr {string} value - Submitted value (defaults to the trimmed text).
 * @attr {boolean} selected - Whether this option is initially selected.
 * @attr {boolean} disabled - Whether this option cannot be selected.
 */
export class JellyOption extends HTMLElement {

  // Tells the browser to trigger attributeChangedCallback when these attributes change
  static get observedAttributes (): string[] {
    return ['value', 'selected', 'disabled'];
  }

  // The submitted value: the value attribute, else the trimmed text content
  get value (): string {
    return this.hasAttribute('value')
      ? this.getAttribute('value') ?? ''
      : (this.textContent ?? '').trim();
  }

  // The human-readable label shown in the trigger and its listbox row
  get label (): string {
    return (this.textContent ?? '').trim();
  }

  // True when the option cannot be selected
  get disabled (): boolean {
    return this.hasAttribute('disabled');
  }

  // Lifecycle method: Fires when observed HTML attributes change dynamically
  attributeChangedCallback (): void {
    (this.closest('jelly-select') as OptionParent | null)?.syncOptions?.();
  }

  // Lifecycle method: Called automatically when the element is appended to the DOM
  connectedCallback (): void {
    this.style.display = 'none';
    (this.closest('jelly-select') as OptionParent | null)?.syncOptions?.();
  }

}

// Register the custom element
customElements.define('jelly-option', JellyOption);

declare global {
  interface HTMLElementTagNameMap {
    'jelly-option': JellyOption;
  }
}
