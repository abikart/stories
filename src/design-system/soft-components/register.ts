let registration: Promise<typeof import("./dist/jelly.js")> | undefined;

const browserBundlePath = "/design-system/jelly.js";

/**
 * Register the local Jelly-compatible custom elements in a browser.
 *
 * Keeping this behind a function prevents the bundle's HTMLElement and
 * customElements side effects from running during SSR or static analysis.
 */
export function registerSoftComponents(): Promise<typeof import("./dist/jelly.js") | undefined> {
  if (typeof window === "undefined" || typeof customElements === "undefined") {
    return Promise.resolve(undefined);
  }

  // webpackIgnore keeps this as a browser-native import. Next's development
  // chunk loader cannot reliably name a prebuilt ESM file with its own source
  // map, while the same exact bytes work normally when served as a local
  // static module.
  registration ??= import(/* webpackIgnore: true */ browserBundlePath) as Promise<typeof import("./dist/jelly.js")>;
  return registration;
}
