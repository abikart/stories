/*
 * Theme runtime: build the document-level token sheet, install it once, switch
 * or read the document mode, and notify live canvases to repaint on a change.
 * Importing this (via the theme barrel) installs the token sheet as a side effect.
 */

import type { ThemeMode }  from './tokens.js';
import type { TokenMap }   from './tokens.js';
import { FONT_STACK }      from './tokens.js';
import { BODY_FONT_STACK } from './tokens.js';
import { MONO_FONT_STACK } from './tokens.js';
import { FOCUS_RING }      from './tokens.js';
import { LIGHT_TOKENS }    from './tokens.js';
import { DARK_TOKENS }     from './tokens.js';

// Serialize a token map into CSS declarations, one aligned line per token
function tokenDeclarations (tokens: TokenMap): string {
  return Object.entries(tokens)
    .map(([name, value]) => `  --jelly-color-${name}: ${value};`)
    .join('\n');
}

/*
 * Build the document-level token sheet:
 *   - light tokens on :root
 *   - dark tokens when the OS prefers dark (unless mode is forced light)
 *   - dark tokens when the consumer forces data-jelly-mode="dark"
 *
 * Everything lives in @layer jelly, so an un-layered consumer rule such as
 * `:root { --jelly-color-background-accent: #4F46E5 }` always wins the cascade
 * whatever its specificity or load order. Inside the layer the dark selectors
 * still out-specify the base :root, so the mode switch keeps working.
 */
export function themeTokenCSS (): string {
  return `
@layer jelly {
  :root {
    color-scheme: light dark;
    --jelly-font-display: ${FONT_STACK};
    --jelly-font-text:    ${BODY_FONT_STACK};
    --jelly-font-mono:    ${MONO_FONT_STACK};
    --jelly-ring-width:     ${FOCUS_RING.width}px;
    --jelly-ring-gap:       ${FOCUS_RING.gap}px;
    --jelly-ring-color:     color-mix(in srgb, var(--jelly-ring, var(--jelly-color-border-focus)) ${FOCUS_RING.alpha * 100}%, transparent);
    --jelly-shadow-raised:  0 16px 42px -20px rgba(var(--jelly-color-shadow), 0.34);
    --jelly-shadow-overlay: 0 14px 34px -16px rgba(var(--jelly-color-shadow), 0.42), 0 4px 12px -8px rgba(var(--jelly-color-shadow), 0.28);
${tokenDeclarations(LIGHT_TOKENS)}
  }

  :root[data-jelly-mode="light"] {
    color-scheme: light;
  }

  :root[data-jelly-mode="dark"] {
    color-scheme: dark;
${tokenDeclarations(DARK_TOKENS)}
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-jelly-mode="light"]) {
      color-scheme: dark;
${tokenDeclarations(DARK_TOKENS)}
    }
  }
}
`;
}

/*
 * Install the token sheet into the document exactly once. This module installs
 * it on import (see the bottom of the file), and JellyElement subclasses plus
 * the HTMLElement-based components re-ensure it in connectedCallback, so
 * importing any single component is enough to get a themed page.
 */
export function ensureThemeTokens (): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.querySelector('style[data-jelly-tokens]')) {
    return;
  }

  const sheet = document.createElement('style');

  sheet.setAttribute('data-jelly-tokens', '');
  sheet.textContent = themeTokenCSS();

  document.head.appendChild(sheet);
}

/*
 * Force the document-wide theme mode: 'light', 'dark', or 'auto' (follow
 * the operating system). Fires jelly-theme-change so canvas-painted
 * components repaint with the new computed colors.
 */
export function setThemeMode (mode: ThemeMode = 'auto'): void {
  ensureThemeTokens();

  if (mode === 'light' || mode === 'dark') {
    document.documentElement.setAttribute('data-jelly-mode', mode);
  } else {
    document.documentElement.removeAttribute('data-jelly-mode');
  }

  notifyThemeChange();
}

// Read the mode most recently set with setThemeMode (or 'auto')
export function getThemeMode (): ThemeMode {
  const mode = document.documentElement.getAttribute('data-jelly-mode');

  return mode === 'light' || mode === 'dark' ? mode : 'auto';
}

// True when dark tokens are currently in effect for the document
export function isDarkMode (): boolean {
  const forced = document.documentElement.getAttribute('data-jelly-mode');

  if (forced === 'dark') {
    return true;
  }

  if (forced === 'light') {
    return false;
  }

  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

// Announce that theme colors changed so live canvases repaint themselves
export function notifyThemeChange (): void {
  window.dispatchEvent(new CustomEvent('jelly-theme-change'));
}

// Run a callback on every theme change; returns an unsubscribe function
export function onThemeChange (callback: () => void): () => void {
  window.addEventListener('jelly-theme-change', callback);

  return () => window.removeEventListener('jelly-theme-change', callback);
}

// The OS-level color scheme also changes the computed tokens in auto mode,
// so mirror those flips into jelly-theme-change for canvas repaints
if (typeof matchMedia === 'function') {
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => notifyThemeChange());
}

// Importing the library is enough to theme the page - no element needed first
ensureThemeTokens();
