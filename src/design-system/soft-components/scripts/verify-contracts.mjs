import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const expectedTags = [
  "jelly-accordion", "jelly-alert", "jelly-badge", "jelly-breadcrumbs", "jelly-button",
  "jelly-card", "jelly-checkbox", "jelly-chip", "jelly-collapsible", "jelly-dialog",
  "jelly-divider", "jelly-drawer", "jelly-icon-button", "jelly-input", "jelly-kbd",
  "jelly-label", "jelly-menu", "jelly-menu-item", "jelly-option", "jelly-otp",
  "jelly-pagination", "jelly-popover", "jelly-progress", "jelly-radio", "jelly-radio-group",
  "jelly-range", "jelly-resizable", "jelly-segment", "jelly-segmented", "jelly-select",
  "jelly-skeleton", "jelly-slider", "jelly-spinner", "jelly-switch", "jelly-tab-panel",
  "jelly-tabs", "jelly-textarea", "jelly-theme", "jelly-toaster", "jelly-tooltip",
].sort();

const expectedHashes = {
  "dist/jelly.js": "68af6000710c7b8bd22d3ed8e337308fb20d767511483d1458f27288d34950ef",
  "dist/jelly.js.map": "51c23050586f52fc55f1108b681c154a28e0355a11f8cba887b36f74ee64df7c",
  "dist/jelly.d.ts": "1004cad04d5548661ffb9ad1eb29e59bc7627e948281222cb48fa0904093a22a",
  "upstream/api-data.js": "c7a6e72a9c943465371045a1fb67d4ffe3dc19802d720c6be0aeb86729865e99",
  "upstream/custom-elements.json": "df1a8a133fd3e5f767c669d497c9f525cd187a5e8c4d97a1a35e7c54f07c8134",
  "upstream/jelly.d.ts": "1004cad04d5548661ffb9ad1eb29e59bc7627e948281222cb48fa0904093a22a",
};

function read(relativePath) {
  return readFileSync(join(root, relativePath));
}

function sha256(relativePath) {
  return createHash("sha256").update(read(relativePath)).digest("hex");
}

function equalFiles(left, right) {
  return read(left).equals(read(right));
}

function apiContract(relativePath) {
  const source = read(relativePath).toString("utf8");
  const groups = source.match(/export const GROUP_ORDER = (.+);/)?.[1];
  const components = source.slice(source.indexOf("export const COMPONENTS = ") + "export const COMPONENTS = ".length).replace(/;\s*$/, "");
  return { groups: JSON.parse(groups), components: JSON.parse(components) };
}

function manifestContract(relativePath) {
  const manifest = JSON.parse(read(relativePath).toString("utf8"));
  return manifest.modules.flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.customElement && declaration.tagName)
    .map((declaration) => ({
      tag: declaration.tagName,
      attributes: (declaration.attributes ?? []).map(({ name, type }) => ({ name, type: type?.text })).sort((a, b) => a.name.localeCompare(b.name)),
      events: (declaration.events ?? []).map(({ name, type }) => ({ name, type: type?.text })).sort((a, b) => a.name.localeCompare(b.name)),
      slots: (declaration.slots ?? []).map(({ name }) => name).sort(),
      parts: (declaration.cssParts ?? []).map(({ name }) => name).sort(),
      cssProperties: (declaration.cssProperties ?? []).map(({ name, default: defaultValue }) => ({ name, default: defaultValue })).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const [path, expected] of Object.entries(expectedHashes)) {
  const actual = sha256(path);
  assert(actual === expected, `${path} drifted: expected ${expected}, received ${actual}`);
}

assert(JSON.stringify(apiContract("contracts/api-data.js")) === JSON.stringify(apiContract("upstream/api-data.js")), "generated API data differs from the pinned v1.1 API");
assert(JSON.stringify(manifestContract("contracts/custom-elements.json")) === JSON.stringify(manifestContract("upstream/custom-elements.json")), "generated manifest public surface differs from the pinned v1.1 manifest");
assert(equalFiles("dist/jelly.d.ts", "upstream/jelly.d.ts"), "public TypeScript declarations differ from v1.1");

const manifest = JSON.parse(read("contracts/custom-elements.json").toString("utf8"));
const manifestTags = manifest.modules.flatMap((module) => module.declarations ?? [])
  .filter((declaration) => declaration.customElement && declaration.tagName)
  .map((declaration) => declaration.tagName)
  .sort();
assert(JSON.stringify(manifestTags) === JSON.stringify(expectedTags), `manifest inventory mismatch: ${manifestTags.join(", ")}`);

const sourceDefinitions = collectFiles(join(root, "src", "components"))
  .filter((path) => path.endsWith(".ts") && !path.endsWith(".test.ts"))
  .flatMap((path) => [...readFileSync(path, "utf8").matchAll(/customElements\.define\(['"]([^'"]+)['"]/g)].map((match) => match[1]))
  .sort();
assert(JSON.stringify(sourceDefinitions) === JSON.stringify(expectedTags), `source registration mismatch: ${sourceDefinitions.join(", ")}`);
assert(new Set(sourceDefinitions).size === sourceDefinitions.length, "a custom element is registered more than once in source");

const bundle = read("dist/jelly.js").toString("utf8");
const bundleDefinitions = [...bundle.matchAll(/customElements\.define\(["']([^"']+)["']/g)].map((match) => match[1]).sort();
assert(JSON.stringify(bundleDefinitions) === JSON.stringify(expectedTags), "built registration inventory differs from the 40-element contract");

for (const runtimePath of ["dist/jelly.js", "register.ts", "preset/stories.css"]) {
  assert(!read(runtimePath).toString("utf8").includes("jelly-ui.com"), `${runtimePath} contains a hosted Jelly UI runtime reference`);
}

console.log("✓ soft components — exact v1.1 artifacts, 40 unique registrations, API/manifest/type parity, no hosted runtime dependency");
