/*
 * A single-line text field resting on a soft jelly surface. A real <input>
 * is overlaid on the canvas; focusing it lifts the fill onto the elevated
 * surface color, pops the membrane and paints a colored ring and every
 * keystroke sends a small ripple through the surface at the caret - RTL-
 * aware, so the ripple lands under the caret in either direction. Form-
 * associated, so it submits with a `name` like any native field
 */

import { JellyElement }     from '../../element/index.js';
import type { Shape }       from '../../element/index.js';
import type { Border }      from '../../element/index.js';

import { canonicalizeSize } from '../../utilities/index.js';
import { clamp }            from '../../utilities/index.js';
import { emit }             from '../../utilities/index.js';
import { isRTL }            from '../../utilities/index.js';

import { PALETTE }          from '../../theme/index.js';

import inputStyles          from './input.css?inline';

/**
 * A single-line text field on a soft jelly surface.
 *
 * @element jelly-input
 *
 * @attr {string} value - The field value.
 * @attr {string} placeholder - Placeholder text.
 * @attr {string} type - Native input type (text, email, password, …).
 * @attr {string} label - Accessible name for the field.
 * @attr {string} name - Form field name submitted with the value.
 * @attr {boolean} disabled - Disable the field and remove it from the tab order.
 * @attr {boolean} readonly - Make the field read-only.
 * @attr {string} autocomplete - Native autocomplete hint.
 * @attr {boolean} no-autofill - Opt out of browser and password-manager autofill.
 * @attr {"small"|"medium"|"large"} size - Control size.
 *
 * @fires change - When the value is committed (native change).
 * @fires input - On every keystroke (native input, bubbles composed).
 *
 * @csspart input - The native input element.
 * @csspart ring - The forced-colors focus-ring fallback.
 *
 * @cssprop [--jelly-fill] - Resting surface fill.
 * @cssprop [--jelly-accent] - Focused-border accent color.
 * @cssprop [--jelly-input-radius=16px] - Corner radius of the painted surface.
 */
export class JellyInput extends JellyElement implements EventListenerObject {

  // Participate in native form submission through ElementInternals
  static formAssociated = true;

  internals: ElementInternals;
  focused = false;

  // Populated in onBuilt() / lazily
  input!: HTMLInputElement;
  measure: CanvasRenderingContext2D | null = null;

  // Tells the browser to trigger attributeChangedCallback when these attributes change
  static get observedAttributes (): string[] {
    return ['value', 'placeholder', 'type', 'label', 'disabled', 'readonly', 'autocomplete', 'no-autofill', 'size'];
  }

  constructor () {
    super();

    this.internals = this.attachInternals();
  }

  // Component styles layered over the shared jelly base styles
  override styles (): string {
    return inputStyles;
  }

  // The interactive markup that sits above the canvas
  override content (): string {
    return `<input part="input" /><div class="ring" part="ring" aria-hidden="true"></div>`;
  }

  // The rounded rectangle the physics body takes, inset so the wobble stays inside the host
  override shape (width: number, height: number): Shape {
    const w = width - 8;
    const h = height - 8;

    const declared = parseFloat(getComputedStyle(this).getPropertyValue('--jelly-input-radius'));
    const radius   = Number.isFinite(declared) ? Math.min(declared, h / 2) : Math.min(16, h / 2);

    return { width: w, height: h, radius };
  }

  // Resolve the surface color the canvas paints: neutral when disabled,
  // the elevated surface while focused, the resting field fill otherwise
  override fill (): string {
    if (this.hasAttribute('disabled')) {
      return this.resolveColor(`var(--jelly-color-background-neutral, ${PALETTE['background-neutral']})`);
    }

    if (this.focused) {
      return this.resolveColor(`var(--jelly-color-background-surface, ${PALETTE['background-surface']})`);
    }

    const custom = getComputedStyle(this).getPropertyValue('--jelly-fill').trim();

    return custom || this.resolveColor(`var(--jelly-color-background-muted, ${PALETTE['background-muted']})`);
  }

  // Hairline border on the jelly surface: accent while focused, neutral at rest
  override surfaceBorder (): Border {
    const color = this.focused
      ? this.resolveColor(`var(--jelly-accent, var(--jelly-color-background-accent, ${PALETTE['background-accent']}))`)
      : this.resolveColor(`var(--jelly-color-background-neutral, ${PALETTE['background-neutral']})`);

    return { color, width: 1 };
  }

  // Called once after the shadow DOM and canvas exist. Wire events here.
  override onBuilt (): void {
    this.input = this.shadowRoot!.querySelector('input')!;

    this.sync('type');
    this.sync('value');
    this.sync('placeholder');
    this.sync('label');
    this.sync('readonly');
    this.sync('disabled');
    this.syncAutofill();

    this.useHostFocusTarget(this.input);

    this.input.addEventListener('focus',  this);
    this.input.addEventListener('blur',   this);
    this.input.addEventListener('input',  this);
    this.input.addEventListener('change', this);
  }

  // Route the inner input's events (registered with `this` as the listener)
  handleEvent (event: Event): void {
    switch (event.type) {
      case 'focus':  this.handleFocus();   break;
      case 'blur':   this.handleBlur();    break;
      case 'input':  this.handleInput();   break;
      case 'change': emit(this, 'change'); break;
    }
  }

  // Focus lifts the surface: elevated fill, a soft center pop, a visible ring
  handleFocus (): void {
    this.focused      = true;
    this.focusVisible = true;

    this.centerPop(0.7);
    this.requestFrame();
  }

  // Blur settles the surface back to its resting fill
  handleBlur (): void {
    this.focused      = false;
    this.focusVisible = false;

    this.requestFrame();
  }

  // Mirror the value into the form and ripple the membrane at the caret
  handleInput (): void {
    this.internals.setFormValue(this.input.value);

    if (!this.reducedMotion && this.body) {
      const x = this.caretLocalX();
      const h = this.body.height / 2;

      this.body.pulseAt(x, -h, 0.34);
      this.body.pulseAt(x, h, 0.34);
      this.requestFrame();
    }

    // The native <input>'s own input event is composed, so it already crosses
    // the shadow boundary and reaches host listeners - re-emitting would make
    // consumers see two 'input' events per keystroke.
  }

  /*
   * Apply the autofill posture: no-autofill turns off autocomplete,
   * autocorrect, autocapitalize and spellcheck and sets the opt-out
   * attributes the common password managers respect
   */
  syncAutofill (): void {
    const off          = this.hasAttribute('no-autofill');
    const autocomplete = this.getAttribute('autocomplete');

    this.input.autocomplete = (off ? 'off' : autocomplete || '') as AutoFill;
    this.input.toggleAttribute('data-lpignore', off);
    this.input.toggleAttribute('data-1p-ignore', off);
    this.input.toggleAttribute('data-bwignore', off);

    if (off) {
      this.input.setAttribute('data-form-type', 'other');
      this.input.setAttribute('autocorrect', 'off');
      this.input.setAttribute('autocapitalize', 'none');
      this.input.spellcheck = false;
    } else {
      this.input.removeAttribute('data-form-type');
      this.input.removeAttribute('autocorrect');
      this.input.removeAttribute('autocapitalize');
      this.input.removeAttribute('spellcheck');
    }
  }

  /*
   * The caret's x in the body's local frame (0 = shape center, +x = right).
   * Measures the text advance up to the caret in the input's own font,
   * offsets it by the inline-start padding and the direction-aware scroll,
   * then mirrors the result in RTL - where the inline start is the right
   * edge - so the ripple lands under the caret in either direction.
   */
  caretLocalX (): number {
    const input = this.input;
    let caret: number | null;

    try {
      caret = input.selectionStart;
    } catch {
      caret = null; // some input types (e.g. number/email in older engines) throw
    }

    if (caret == null) {
      caret = input.value.length;
    }

    const cs = getComputedStyle(input);

    if (!this.measure) {
      this.measure = document.createElement('canvas').getContext('2d');
    }
    const measure = this.measure!;

    measure.font = cs.font || `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

    // Password fields render bullets, not the raw characters
    const shown = input.type === 'password'
      ? '•'.repeat(caret)
      : input.value.slice(0, caret);
    const textWidth = measure.measureText(shown).width;

    // Distance from the inline-start edge: padding plus text advance, minus
    // how far the field has scrolled away from its start. In RTL the scroll
    // origin is the inline start (right edge) and scrollLeft runs negative.
    const rtl            = isRTL(this);
    const paddingStart   = parseFloat(cs.paddingInlineStart || (rtl ? cs.paddingRight : cs.paddingLeft)) || 0;
    const scrolled       = rtl ? -input.scrollLeft : input.scrollLeft;
    const caretFromStart = paddingStart + textWidth - scrolled;

    // Convert into the physical, center-origin frame the physics use
    const localX = rtl
      ? input.clientWidth / 2 - caretFromStart
      : caretFromStart - input.clientWidth / 2;

    const half = this.body!.width / 2;

    return clamp(localX, -half + 6, half - 6);
  }

  // Lifecycle method: Fires when observed HTML attributes change dynamically
  attributeChangedCallback (name: string): void {
    if (this.input) {
      this.sync(name);
    }
  }

  // Push one observed attribute into the inner native input
  sync (name: string): void {
    switch (name) {
      case 'value':
        this.input.value = this.getAttribute('value') ?? '';
        this.internals.setFormValue(this.input.value);
        break;

      case 'placeholder':
        this.input.placeholder = this.getAttribute('placeholder') ?? '';
        break;

      case 'type':
        this.input.type = this.getAttribute('type') || 'text';
        break;

      case 'label': {
        const label = this.getAttribute('label');

        if (label) {
          this.input.setAttribute('aria-label', label);
        } else {
          this.input.removeAttribute('aria-label');
        }
        break;
      }

      case 'disabled':
        this.input.disabled = this.hasAttribute('disabled');
        this.syncHostFocusTarget();
        this.requestFrame();
        break;

      case 'readonly':
        this.input.readOnly = this.hasAttribute('readonly');
        break;

      case 'autocomplete':
      case 'no-autofill':
        this.syncAutofill();
        break;

      case 'size':
        canonicalizeSize(this);
        break;
    }
  }

  // The current text value (read live from the inner control once built)
  get value (): string {
    return this.input ? this.input.value : this.getAttribute('value') || '';
  }

  // Set the text value and mirror it into the form
  set value (v: string) {
    if (this.input) {
      this.input.value = v;
      this.internals.setFormValue(v);
    }
  }

  // Route programmatic host focus into the inner native input
  override focus (options?: FocusOptions): void {
    this.input?.focus(options);
  }

}

// Register the custom element
customElements.define('jelly-input', JellyInput);

declare global {
  interface HTMLElementTagNameMap {
    'jelly-input': JellyInput;
  }
}
