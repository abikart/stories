import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const baseline = JSON.parse(readFileSync(join(root, "upstream", "baseline.json"), "utf8"));

function read(relativePath) {
  return readFileSync(join(root, relativePath));
}

function sha256(relativePath) {
  return createHash("sha256").update(read(relativePath)).digest("hex");
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

assert(baseline.schemaVersion === 1, `unsupported upstream baseline schema: ${baseline.schemaVersion}`);
assert(/^[0-9a-f]{40}$/.test(baseline.commit), `invalid pinned upstream commit: ${baseline.commit}`);
const upstreamPackage = JSON.parse(read("package.upstream.json").toString("utf8"));
assert(upstreamPackage.version === baseline.version, `package snapshot version ${upstreamPackage.version} differs from baseline ${baseline.version}`);
assert(upstreamPackage.license === baseline.license, `package snapshot license ${upstreamPackage.license} differs from baseline ${baseline.license}`);

for (const [path, expected] of Object.entries(baseline.artifacts)) {
  assert(!path.startsWith("/") && !path.split(/[\\/]/).includes(".."), `invalid artifact path in baseline: ${path}`);
  const actual = sha256(path);
  assert(actual === expected.sha256, `${path} drifted: expected ${expected.sha256}, received ${actual}`);
  assert(statSync(join(root, path)).size === expected.bytes, `${path} byte length drifted from the pinned baseline`);
}

assert(JSON.stringify(apiContract("contracts/api-data.js")) === JSON.stringify(apiContract("upstream/api-data.js")), `generated API data differs from the pinned ${baseline.version} API`);
assert(JSON.stringify(manifestContract("contracts/custom-elements.json")) === JSON.stringify(manifestContract("upstream/custom-elements.json")), `generated manifest public surface differs from the pinned ${baseline.version} manifest`);
// The active bundle and declarations may contain Stories extensions.
// Compatibility is enforced at the custom-element manifest/API level while
// untouched upstream declarations remain pinned for update comparison.

const manifest = JSON.parse(read("contracts/custom-elements.json").toString("utf8"));
const manifestTags = manifest.modules.flatMap((module) => module.declarations ?? [])
  .filter((declaration) => declaration.customElement && declaration.tagName)
  .map((declaration) => declaration.tagName)
  .sort();
const expectedTags = JSON.parse(read("upstream/custom-elements.json").toString("utf8")).modules
  .flatMap((module) => module.declarations ?? [])
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

console.log(`✓ soft components — pinned ${baseline.version} upstream artifacts, ${expectedTags.length} unique registrations, component API/manifest compatibility, no hosted runtime dependency`);
