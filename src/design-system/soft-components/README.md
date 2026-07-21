# Stories soft components

This portable Web Components package preserves the complete Jelly UI v1.1.0
API and its `jelly-*` namespace. Stories-specific visual decisions live in an
optional preset rather than component forks.

The package has no runtime dependencies and does not require React, Next.js,
Tailwind, or a network connection. `src/` is the maintainable TypeScript and
CSS source. `dist/jelly.js` is the browser registration entry point and named
export barrel; importing it registers all 40 elements. Individual component
modules remain smaller explicit registration entry points for custom builds.

## Browser use

```html
<script type="module" src="./soft-components/dist/jelly.js"></script>

<jelly-theme mode="auto">
  <jelly-button variant="mint">Continue</jelly-button>
</jelly-theme>
```

Load `preset/stories.css` and place components under a
`data-jelly-preset="stories"` scope to opt into the child-focused preset. The
default presentation remains the upstream-compatible baseline.

## Development

```sh
npm ci
npm run verify
```

Vite only inlines authored CSS and SVG files into one ESM bundle. Consumers do
not need Vite. Tests execute in a real browser through Vitest and Playwright.
The manifest and API data in `contracts/` are generated compatibility checks.

## Porting

Copy this whole directory. Keep `LICENSE`, `THIRD_PARTY_NOTICES.md`, and
`PROVENANCE.md`. Either serve the checked-in `dist/jelly.js` or rebuild it with
`npm ci && npm run build`, then load that module from a browser-only entry
point. The optional React integration remains outside this directory so the
core stays framework independent.

The namespace intentionally remains `jelly-*` for API compatibility. Do not
load this local build and another Jelly UI build in the same document. See
[PROVENANCE.md](./PROVENANCE.md) for the pinned source and artifact hashes.

## Registration and JavaScript API

The browser bundle is both the all-components registration entry point and the
named export barrel:

```ts
const jelly = await import("./dist/jelly.js");

jelly.setThemeMode("dark");
jelly.jellyToast("Saved", { tone: "success" });
```

It exposes the upstream physics, anchor, motion, token, icon, theme, and utility
exports as well as `JellyElement` and `jellyToast`. The complete generated type
contract is `dist/jelly.d.ts`. Registration is a browser side effect, so SSR
applications should call `registerSoftComponents()` from `register.ts` after
mount rather than importing the bundle during server evaluation.

## Theming and the Stories preset

The upstream-compatible default supports `<jelly-theme mode="auto|light|dark">`,
document-wide `setThemeMode()`, `accent`, variants, and the full
`--jelly-color-*` / per-component custom-property API.

The optional Stories preset is a pure CSS layer:

```html
<link rel="stylesheet" href="./preset/stories.css" />

<section data-jelly-preset="stories">
  <jelly-button variant="mint">Read with me</jelly-button>
</section>
```

It supplies the Stories font stacks, warm-paper surfaces, contrast-safe candy
colors, quieter shadows, and 44px small targets. It does not alter component
classes or remove upstream states. For reading-heavy contexts, set
`data-jelly-motion="reduce"` on `<html>`; the same reduction happens
automatically for the operating-system `prefers-reduced-motion` preference.

## Forms and events

Form-associated controls participate in `FormData` through `ElementInternals`.
Buttons with `type="submit"` and `type="reset"` drive their closest light-DOM
form. Custom interaction events are composed and bubble, so framework-neutral
consumers use ordinary listeners:

```ts
const select = document.querySelector("jelly-select");
select?.addEventListener("change", (event) => {
  console.log((event.currentTarget as HTMLElement & { value: string }).value);
});
```

The generated `contracts/api-data.js` inventory documents every attribute,
property, method, event, slot, shadow part, CSS property, keyboard map, and
example. `contracts/custom-elements.json` is the machine-readable Custom
Elements Manifest.

## React and Next.js

React 19 passes scalar attributes and properties to custom elements directly.
Stories keeps its JSX augmentation in `../soft-components-elements.d.ts` and
loads the browser bundle through `../soft-components-react.tsx`:

```tsx
<SoftComponentsLoader>
  <jelly-button variant="mint">Continue</jelly-button>
</SoftComponentsLoader>
```

Use `addEventListener` in an effect or ref for component-specific custom events
instead of assuming React synthetic-event names. Wrappers are intentionally
not required. Stories serves the exact local bundle at
`/design-system/jelly.js`; `npm run sync:soft-components` copies it from this
package into `public/`, and the root `predev`/`prebuild` hooks keep those bytes
synchronized. This browser-native import avoids SSR evaluation and Next's
development chunk loader without adding a remote dependency.

## Accessibility and browser support

The package targets current Chromium, Safari/WebKit, and Firefox releases with
Custom Elements, open Shadow DOM, Canvas 2D, ResizeObserver, Web Animations,
CSS custom properties, and `ElementInternals`. It preserves native focus and
form controls, keyboard maps, visible focus rings, forced-colors fallbacks,
RTL interaction, modal focus restoration/background inerting, live regions,
and reduced soft-body/overlay motion.

The co-located browser tests cover every component. Run `npm run verify` to
execute 114 real-browser tests, rebuild the distribution, regenerate both API
contracts, and compare the public surface with the pinned v1.1 baseline.
