/*
 * Custom Elements Manifest analyzer config. Reads the component TypeScript
 * sources + their JSDoc and emits custom-elements.json (attributes, properties,
 * methods, events, slots, CSS parts and CSS custom properties). That manifest
 * is the single source of truth the docs site is generated from.
 */
export default {
  globs: ['src/components/**/*.ts'],
  exclude: ['src/**/*.test.ts'],
  outdir: '.',
  litelement: false,
  dev: false,
};
