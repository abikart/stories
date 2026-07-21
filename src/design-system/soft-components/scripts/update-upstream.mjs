#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(packageRoot, "../../..");
const packageRelative = relative(repoRoot, packageRoot);
const defaultRepository = "https://github.com/jelly-org/ui.git";
const baselinePath = join(packageRoot, "upstream", "baseline.json");

const packageManagedEntries = [
  "src",
  "dist",
  "contracts",
  "upstream",
  "LICENSE",
  "PROVENANCE.md",
  "THIRD_PARTY_NOTICES.md",
  "UPSTREAM_README.md",
  "package.json",
  "package-lock.json",
  "package.upstream.json",
  "package-lock.upstream.json",
  "tsconfig.json",
  "vite.config.ts",
  "vitest.config.ts",
  "custom-elements-manifest.config.mjs",
];

const repoManagedEntries = [
  ...packageManagedEntries.map((entry) => join(packageRelative, entry)),
  "src/design-system/soft-components-elements.d.ts",
  "public/design-system/jelly.js",
];

function usage() {
  console.log(`Update the local Jelly UI baseline from a verified Git ref.

Usage:
  npm run update:soft-components -- --ref <tag|branch|commit> [options]

Options:
  --ref <value>                Required upstream Git ref
  --repo <url>                 Override ${defaultRepository}
  --dry-run, --check           Fetch, build, test, and report without writing
  --accept-api-changes         Apply additions, removals, or public API changes
  --force                      Rebuild even when the ref resolves to the pinned commit
  --help                       Show this help

The updater never commits changes. Review the generated upstream/UPDATE_REPORT.md
and the Git diff before committing.`);
}

function parseArguments(argv) {
  const options = {
    repository: defaultRepository,
    ref: "",
    dryRun: false,
    acceptApiChanges: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { ...options, help: true };
    if (argument === "--dry-run" || argument === "--check") options.dryRun = true;
    else if (argument === "--accept-api-changes") options.acceptApiChanges = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--ref" || argument === "--repo") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      if (argument === "--ref") options.ref = value;
      else options.repository = value;
      index += 1;
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }

  if (!options.ref) throw new Error("--ref is required; pin updates to an explicit tag, branch, or commit");
  return options;
}

function run(command, args, { cwd, capture = false, quiet = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: process.env,
    stdio: capture ? ["ignore", "pipe", "pipe"] : quiet ? "ignore" : "inherit",
  });
  if (result.status !== 0) {
    const details = capture ? `\n${result.stderr || result.stdout}` : "";
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}${details}`);
  }
  return capture ? result.stdout.trim() : "";
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function assertInside(parent, target) {
  const path = resolve(target);
  if (path !== parent && !path.startsWith(`${parent}${sep}`)) {
    throw new Error(`refusing to modify a path outside ${parent}: ${path}`);
  }
}

function replacePath(source, destination, allowedRoot) {
  assertInside(allowedRoot, destination);
  if (existsSync(destination)) rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
}

function filesBelow(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

function gitObjectExists(checkout, object) {
  return spawnSync("git", ["cat-file", "-e", object], { cwd: checkout, stdio: "ignore" }).status === 0;
}

function gitBlob(checkout, commit, path) {
  const result = spawnSync("git", ["show", `${commit}:${path}`], { cwd: checkout, encoding: null });
  if (result.status !== 0) throw new Error(`could not read ${path} from upstream baseline ${commit}`);
  return result.stdout;
}

function ensureUpstreamCommit(checkout, repository, commit) {
  if (gitObjectExists(checkout, `${commit}^{commit}`)) return;
  run("git", ["fetch", "--quiet", "--depth=1", "origin", commit], { cwd: checkout });
  if (!gitObjectExists(checkout, `${commit}^{commit}`)) {
    throw new Error(`could not fetch pinned upstream baseline ${commit} from ${repository}`);
  }
}

/*
 * Carry Stories source extensions across an upstream refresh with a real
 * three-way merge:
 *   base    = source at the previously pinned upstream commit
 *   current = the checked-in Stories source
 *   next    = source at the requested upstream commit
 *
 * Clean changes apply automatically. A conflicting upstream edit stops the
 * candidate before the worktree is touched, which is safer than either
 * silently dropping the gel/performance layer or freezing whole source files.
 */
export function mergeStoriesSource({ candidate, checkout, baseline, temporaryRoot, currentRoot = packageRoot }) {
  ensureUpstreamCommit(checkout, baseline.repository, baseline.commit);

  const sourceRoot = join(currentRoot, "src");
  const currentFiles = filesBelow(sourceRoot).map((path) => relative(currentRoot, path));
  const baselineFiles = run(
    "git",
    ["ls-tree", "-r", "--name-only", baseline.commit, "--", "src"],
    { cwd: checkout, capture: true },
  ).split("\n").filter(Boolean);
  const paths = [...new Set([...baselineFiles, ...currentFiles])].sort();
  const applied = [];

  for (const path of paths) {
    const currentPath = join(currentRoot, path);
    const nextPath = join(candidate, path);
    const baseExists = baselineFiles.includes(path);
    const currentExists = existsSync(currentPath);
    const nextExists = existsSync(nextPath);

    if (!baseExists && currentExists) {
      if (nextExists && !readFileSync(currentPath).equals(readFileSync(nextPath))) {
        throw new Error(`Stories-added source now collides with upstream: ${path}`);
      }
      if (!nextExists) {
        mkdirSync(resolve(nextPath, ".."), { recursive: true });
        cpSync(currentPath, nextPath);
        applied.push(path);
      }
      continue;
    }

    if (!baseExists) continue;
    const base = gitBlob(checkout, baseline.commit, path);

    if (!currentExists) {
      if (nextExists && !base.equals(readFileSync(nextPath))) {
        throw new Error(`Stories deleted ${path}, but upstream changed it; manual merge required`);
      }
      if (nextExists) rmSync(nextPath);
      applied.push(path);
      continue;
    }

    const current = readFileSync(currentPath);
    if (current.equals(base)) continue;
    if (!nextExists) throw new Error(`Upstream deleted Stories-modified source: ${path}`);

    const next = readFileSync(nextPath);
    if (next.equals(base)) {
      cpSync(currentPath, nextPath);
      applied.push(path);
      continue;
    }

    const mergeRoot = mkdtempSync(join(temporaryRoot, "source-merge-"));
    const ours = join(mergeRoot, "current");
    const ancestor = join(mergeRoot, "baseline");
    const theirs = join(mergeRoot, "upstream");
    writeFileSync(ours, current);
    writeFileSync(ancestor, base);
    writeFileSync(theirs, next);

    const merge = spawnSync("git", ["merge-file", "-p", ours, ancestor, theirs], { encoding: null });
    if (merge.status !== 0) {
      throw new Error(`upstream source conflicts with Stories changes: ${path}`);
    }

    writeFileSync(nextPath, merge.stdout);
    applied.push(path);
  }

  console.log(`✓ reapplied ${applied.length} Stories source extension${applied.length === 1 ? "" : "s"} with three-way merge`);
  return applied;
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function artifact(path) {
  return { bytes: statSync(path).size, sha256: sha256(path) };
}

function pacificDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((entry) => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function manifestDeclarations(path) {
  const manifest = readJson(path);
  return manifest.modules.flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.customElement && declaration.tagName);
}

function stabilizeManifestOrder(path, previousPath) {
  const manifest = readJson(path);
  const previous = readJson(previousPath);
  const previousOrder = new Map(previous.modules.map((module, index) => [module.path, index]));
  manifest.modules.sort((left, right) => {
    const leftIndex = previousOrder.get(left.path);
    const rightIndex = previousOrder.get(right.path);
    if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
    if (leftIndex !== undefined) return -1;
    if (rightIndex !== undefined) return 1;
    return left.path.localeCompare(right.path);
  });
  writeJson(path, manifest);
}

export function publicTokens(declaration) {
  const tokens = [];
  for (const attribute of declaration.attributes ?? []) {
    tokens.push(`attribute:${attribute.name}:${attribute.type?.text ?? ""}`);
  }
  for (const event of declaration.events ?? []) {
    tokens.push(`event:${event.name}:${event.type?.text ?? ""}`);
  }
  for (const slot of declaration.slots ?? []) tokens.push(`slot:${slot.name ?? "default"}`);
  for (const part of declaration.cssParts ?? []) tokens.push(`part:${part.name}`);
  for (const property of declaration.cssProperties ?? []) {
    tokens.push(`css-property:${property.name}:${property.default ?? ""}`);
  }
  for (const member of declaration.members ?? []) {
    const parameters = (member.parameters ?? []).map((parameter) => (
      `${parameter.name}${parameter.optional ? "?" : ""}:${parameter.type?.text ?? ""}`
    )).join(",");
    const memberType = member.type?.text ?? member.return?.type?.text ?? "";
    tokens.push(`${member.kind ?? "member"}:${member.name}:${memberType}:${parameters}`);
  }
  for (const state of declaration.cssStates ?? []) tokens.push(`css-state:${state.name}`);
  return [...new Set(tokens)].sort();
}

export function compareManifests(previousPath, nextPath) {
  const previous = new Map(manifestDeclarations(previousPath).map((declaration) => [declaration.tagName, publicTokens(declaration)]));
  const next = new Map(manifestDeclarations(nextPath).map((declaration) => [declaration.tagName, publicTokens(declaration)]));
  const addedTags = [...next.keys()].filter((tag) => !previous.has(tag)).sort();
  const removedTags = [...previous.keys()].filter((tag) => !next.has(tag)).sort();
  const changed = [];

  for (const tag of [...next.keys()].filter((name) => previous.has(name)).sort()) {
    const before = previous.get(tag);
    const after = next.get(tag);
    const added = after.filter((token) => !before.includes(token));
    const removed = before.filter((token) => !after.includes(token));
    if (added.length || removed.length) changed.push({ tag, added, removed });
  }

  return {
    previousCount: previous.size,
    nextCount: next.size,
    addedTags,
    removedTags,
    changed,
    hasChanges: Boolean(addedTags.length || removedTags.length || changed.length),
    declarationsChanged: false,
    packageExportsChanged: false,
  };
}

function reportMarkdown({ previousBaseline, nextBaseline, apiDiff }) {
  const lines = [
    "# Jelly UI upstream update report",
    "",
    `Generated: ${nextBaseline.retrievedAt} (America/Los_Angeles)`,
    "",
    `- Repository: <${nextBaseline.repository.replace(/\.git$/, "")}>`,
    `- Previous: \`${previousBaseline.version}\` at \`${previousBaseline.commit}\``,
    `- Candidate: \`${nextBaseline.version}\` at \`${nextBaseline.commit}\``,
    `- Requested ref: \`${nextBaseline.requestedRef}\``,
    `- Custom elements: ${apiDiff.previousCount} → ${apiDiff.nextCount}`,
    "",
    "## Public API changes",
    "",
  ];

  if (!apiDiff.hasChanges) {
    lines.push("No public API changes detected.", "");
  } else {
    if (apiDiff.declarationsChanged) lines.push("- Generated TypeScript declarations changed.");
    if (apiDiff.packageExportsChanged) lines.push("- Package export map changed.");
    if (apiDiff.addedTags.length) lines.push(`- Added elements: ${apiDiff.addedTags.map((tag) => `\`${tag}\``).join(", ")}`);
    if (apiDiff.removedTags.length) lines.push(`- Removed elements: ${apiDiff.removedTags.map((tag) => `\`${tag}\``).join(", ")}`);
    for (const change of apiDiff.changed) {
      lines.push(`- \`${change.tag}\``);
      if (change.added.length) lines.push(`  - Added: ${change.added.map((token) => `\`${token}\``).join(", ")}`);
      if (change.removed.length) lines.push(`  - Removed: ${change.removed.map((token) => `\`${token}\``).join(", ")}`);
    }
    lines.push("");
  }

  lines.push(
    "## Verification performed",
    "",
    "- Clean, detached checkout of the requested ref",
    "- Upstream dependency install, typecheck, browser tests, build, and docs generation",
    "- Three-way merge of Stories source extensions over the requested upstream source",
    "- Stories candidate dependency install, typecheck, browser tests, build, and contract generation",
    "- Upstream manifest, API-data, declaration, and registration compatibility",
    "- No hosted Jelly UI runtime dependency",
    "",
    "Stories-owned presets and integration modules were preserved; source extensions merged cleanly.",
    "",
  );
  return lines.join("\n");
}

function provenanceMarkdown({ baseline, upstreamPackage, licenseCopyright }) {
  const repository = baseline.repository.replace(/\.git$/, "");
  const rows = Object.entries(baseline.artifacts).map(([path, details]) => (
    `| \`${path}\` | ${details.bytes} | \`${details.sha256}\` |`
  ));
  return `# Soft components provenance

This directory contains a local, maintainable copy of Jelly UI ${baseline.version}
for the Stories design system. The compatibility namespace remains \`jelly-*\` so
the published API and examples stay mechanically portable. Applications must
load either this local implementation or the hosted implementation, never both.

## Authoritative upstream

- Repository: <${repository}>
- Requested ref: \`${baseline.requestedRef}\`
- Pinned commit: \`${baseline.commit}\`
- Package version: \`${baseline.version}\`
- Retrieved: ${baseline.retrievedAt} (America/Los_Angeles)
- Author metadata: \`${upstreamPackage.author ?? "Not specified"}\`
- License: ${upstreamPackage.license}${licenseCopyright ? `, \`${licenseCopyright}\`` : ""}

The updater verified a clean detached checkout with the upstream typecheck,
browser tests, build, and documentation generation. Stories source extensions
were then three-way merged over that checkout and the candidate was rebuilt and
verified before any project files were replaced.

## Pinned artifact snapshot

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
${rows.join("\n")}

Machine-readable metadata is in [upstream/baseline.json](./upstream/baseline.json).
The most recent public-surface comparison is in
[upstream/UPDATE_REPORT.md](./upstream/UPDATE_REPORT.md).

## Update policy

Run \`npm run update:soft-components -- --ref <tag-or-commit>\`. Public API
changes require \`--accept-api-changes\`; the updater otherwise stops without
touching the worktree. Stories-authored source changes are reapplied with a
three-way merge. A conflict stops the update for manual review instead of
discarding either side. Presets and integration modules remain separate and
are never replaced. Review and commit the resulting Git diff.

Do not remove the upstream MIT notice when copying or extracting this package.
`;
}

function noticesMarkdown({ baseline, licenseCopyright }) {
  const repository = baseline.repository.replace(/\.git$/, "");
  return `# Third-party notices

## Jelly UI ${baseline.version}

This package incorporates and adapts Jelly UI from
<${repository}> at commit
\`${baseline.commit}\`.

${licenseCopyright || "Copyright retained in LICENSE"}

Jelly UI is licensed under the MIT License. The complete authoritative notice
is preserved in [LICENSE](./LICENSE).

The rabbit icons included by Jelly UI originate from Microsoft Fluent UI
System Icons. Their SVG source comments identify Microsoft Corporation and the
MIT License; those comments remain preserved in the checked-in SVG files.
`;
}

function reactTypes(tags) {
  const entries = tags.map((tag) => `      "${tag}": JellyElementProps;`).join("\n");
  return `// Generated by soft-components/scripts/update-upstream.mjs. Do not edit by hand.
import type * as React from "react";

type JellyElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  [attribute: string]: unknown;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
${entries}
    }
  }
}
`;
}

function requirePaths(root, paths, label) {
  const missing = paths.filter((path) => !existsSync(join(root, path)));
  if (missing.length) throw new Error(`${label} is missing required paths: ${missing.join(", ")}`);
}

function checkManagedWorktreeClean() {
  const status = run("git", ["status", "--porcelain", "--", ...repoManagedEntries], { cwd: repoRoot, capture: true });
  if (status) {
    throw new Error(`managed soft-component paths have uncommitted changes:\n${status}\nCommit or stash them before applying an update; --dry-run remains available.`);
  }
}

function prepareUpstream(checkout, options) {
  console.log(`\n→ Fetching Jelly UI ${options.ref}`);
  run("git", ["init", "--quiet"], { cwd: checkout });
  run("git", ["remote", "add", "origin", options.repository], { cwd: checkout });
  run("git", ["fetch", "--quiet", "--depth=1", "origin", options.ref], { cwd: checkout });
  run("git", ["checkout", "--quiet", "--detach", "FETCH_HEAD"], { cwd: checkout });
  const commit = run("git", ["rev-parse", "HEAD"], { cwd: checkout, capture: true });
  const upstreamPackage = readJson(join(checkout, "package.json"));
  if (upstreamPackage.license !== "MIT") throw new Error(`upstream license changed to ${upstreamPackage.license ?? "unspecified"}; manual review required`);
  requirePaths(checkout, [
    "LICENSE", "README.md", "package.json", "package-lock.json", "package.js", "src",
    "tsconfig.json", "vite.config.ts", "vitest.config.ts", "custom-elements-manifest.config.mjs",
  ], "upstream checkout");
  return { commit, upstreamPackage };
}

function verifyUpstream(checkout, upstreamPackage) {
  console.log("\n→ Verifying untouched upstream checkout");
  run("npm", ["ci"], { cwd: checkout });
  for (const script of ["typecheck", "test", "build", "docs"]) {
    if (upstreamPackage.scripts?.[script]) run("npm", ["run", script], { cwd: checkout });
    else if (script === "docs") {
      if (upstreamPackage.scripts?.["docs:manifest"]) run("npm", ["run", "docs:manifest"], { cwd: checkout });
      if (upstreamPackage.scripts?.["docs:data"]) run("npm", ["run", "docs:data"], { cwd: checkout });
    } else if (script === "build") {
      throw new Error("upstream package no longer exposes a build script");
    }
  }
  requirePaths(checkout, [
    "dist/jelly.js", "dist/jelly.js.map", "dist/jelly.d.ts",
    "custom-elements.json", "docs/content/data.js",
  ], "verified upstream build");
}

function prepareCandidate({ candidate, checkout, upstreamPackage, commit, options, previousBaseline, temporaryRoot }) {
  console.log("\n→ Preparing isolated Stories candidate");
  cpSync(packageRoot, candidate, {
    recursive: true,
    filter: (source) => basename(source) !== "node_modules",
  });

  for (const entry of ["src", "tsconfig.json", "vite.config.ts", "vitest.config.ts"]) {
    replacePath(join(checkout, entry), join(candidate, entry), temporaryRoot);
  }

  mergeStoriesSource({ candidate, checkout, baseline: previousBaseline, temporaryRoot });

  const manifestConfigSource = readFileSync(join(checkout, "custom-elements-manifest.config.mjs"), "utf8");
  const manifestConfig = manifestConfigSource.replace(/outdir:\s*['"]\.['"]/, "outdir: 'contracts'");
  if (manifestConfig === manifestConfigSource) throw new Error("could not adapt upstream manifest output directory; manual updater maintenance required");
  writeFileSync(join(candidate, "custom-elements-manifest.config.mjs"), manifestConfig);

  cpSync(join(checkout, "LICENSE"), join(candidate, "LICENSE"));
  cpSync(join(checkout, "README.md"), join(candidate, "UPSTREAM_README.md"));
  cpSync(join(checkout, "package.json"), join(candidate, "package.upstream.json"));
  cpSync(join(checkout, "package-lock.json"), join(candidate, "package-lock.upstream.json"));
  cpSync(join(checkout, "package-lock.json"), join(candidate, "package-lock.json"));
  cpSync(join(checkout, "package.js"), join(candidate, "upstream", "package.js"));
  cpSync(join(checkout, "custom-elements.json"), join(candidate, "upstream", "custom-elements.json"));
  // CEM glob traversal order varies by filesystem. Retain the prior order for
  // existing modules and append genuinely new modules deterministically, so a
  // forced re-audit of the same commit stays byte-for-byte idempotent.
  stabilizeManifestOrder(
    join(candidate, "upstream", "custom-elements.json"),
    join(packageRoot, "upstream", "custom-elements.json"),
  );
  cpSync(join(checkout, "docs", "content", "data.js"), join(candidate, "upstream", "api-data.js"));
  cpSync(join(checkout, "dist", "jelly.d.ts"), join(candidate, "upstream", "jelly.d.ts"));

  const activePackage = readJson(join(candidate, "package.json"));
  activePackage.version = `${upstreamPackage.version}-stories.0`;
  activePackage.license = upstreamPackage.license;
  activePackage.author = upstreamPackage.author;
  for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    if (upstreamPackage[field]) activePackage[field] = upstreamPackage[field];
    else delete activePackage[field];
  }
  activePackage.devDependencies = {
    ...activePackage.devDependencies,
    ...upstreamPackage.devDependencies,
  };
  if (upstreamPackage.engines) activePackage.engines = upstreamPackage.engines;
  else delete activePackage.engines;
  writeJson(join(candidate, "package.json"), activePackage);

  run("npm", ["install", "--package-lock-only", "--ignore-scripts"], { cwd: candidate });
  run("npm", ["ci"], { cwd: candidate });
  for (const script of ["typecheck", "test", "build", "contracts"]) {
    run("npm", ["run", script], { cwd: candidate });
  }

  const retrievedAt = pacificDate();
  const artifactSources = {
    "upstream/api-data.js": join(candidate, "upstream", "api-data.js"),
    "upstream/custom-elements.json": join(candidate, "upstream", "custom-elements.json"),
    "upstream/jelly.d.ts": join(candidate, "upstream", "jelly.d.ts"),
    "upstream/package.js": join(candidate, "upstream", "package.js"),
  };
  const baseline = {
    schemaVersion: 1,
    repository: options.repository,
    requestedRef: options.ref,
    commit,
    version: upstreamPackage.version,
    retrievedAt,
    license: upstreamPackage.license,
    artifacts: Object.fromEntries(Object.entries(artifactSources).map(([path, source]) => [path, artifact(source)])),
  };
  writeJson(join(candidate, "upstream", "baseline.json"), baseline);

  const licenseCopyright = readFileSync(join(checkout, "LICENSE"), "utf8")
    .split(/\r?\n/)
    .find((line) => /^Copyright\b/i.test(line.trim()))?.trim();
  writeFileSync(join(candidate, "PROVENANCE.md"), provenanceMarkdown({ baseline, upstreamPackage, licenseCopyright }));
  writeFileSync(join(candidate, "THIRD_PARTY_NOTICES.md"), noticesMarkdown({ baseline, licenseCopyright }));
  return baseline;
}

function applyCandidate({ candidate, temporaryRoot, reactDeclaration }) {
  const backup = join(temporaryRoot, "backup");
  const backupPackage = join(backup, "package");
  const backupReact = join(backup, "soft-components-elements.d.ts");
  const backupPublic = join(backup, "jelly.js");
  const reactPath = join(repoRoot, "src", "design-system", "soft-components-elements.d.ts");
  const publicPath = join(repoRoot, "public", "design-system", "jelly.js");
  cpSync(packageRoot, backupPackage, { recursive: true, filter: (source) => basename(source) !== "node_modules" });
  cpSync(reactPath, backupReact);
  cpSync(publicPath, backupPublic);

  try {
    for (const entry of packageManagedEntries) {
      replacePath(join(candidate, entry), join(packageRoot, entry), packageRoot);
    }
    writeFileSync(reactPath, reactDeclaration);
    cpSync(join(candidate, "dist", "jelly.js"), publicPath);
    run("npm", ["--prefix", packageRoot, "run", "verify:contracts"], { cwd: repoRoot });
    run("npm", ["run", "typecheck"], { cwd: repoRoot });
  } catch (error) {
    console.error("\n✗ Applied candidate failed project verification; restoring the previous package");
    for (const entry of packageManagedEntries) {
      replacePath(join(backupPackage, entry), join(packageRoot, entry), packageRoot);
    }
    cpSync(backupReact, reactPath);
    cpSync(backupPublic, publicPath);
    throw error;
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }
  if (!options.dryRun) checkManagedWorktreeClean();

  const previousBaseline = readJson(baselinePath);
  const temporaryRoot = mkdtempSync(join(tmpdir(), "stories-jelly-update-"));
  const checkout = join(temporaryRoot, "upstream-checkout");
  const candidate = join(temporaryRoot, "candidate");

  try {
    mkdirSync(checkout);
    const { commit, upstreamPackage } = prepareUpstream(checkout, options);
    console.log(`✓ Resolved ${options.ref} to ${commit} (${upstreamPackage.version})`);
    if (commit === previousBaseline.commit && !options.force) {
      console.log("✓ Already pinned to this commit; use --force to rebuild and re-audit it");
      return;
    }

    verifyUpstream(checkout, upstreamPackage);
    const nextBaseline = prepareCandidate({ candidate, checkout, upstreamPackage, commit, options, previousBaseline, temporaryRoot });
    const apiDiff = compareManifests(
      join(packageRoot, "upstream", "custom-elements.json"),
      join(candidate, "upstream", "custom-elements.json"),
    );
    apiDiff.declarationsChanged = sha256(join(packageRoot, "upstream", "jelly.d.ts"))
      !== sha256(join(candidate, "upstream", "jelly.d.ts"));
    apiDiff.packageExportsChanged = JSON.stringify(readJson(join(packageRoot, "package.upstream.json")).exports ?? null)
      !== JSON.stringify(upstreamPackage.exports ?? null);
    apiDiff.hasChanges ||= apiDiff.declarationsChanged || apiDiff.packageExportsChanged;
    const report = reportMarkdown({ previousBaseline, nextBaseline, apiDiff });
    writeFileSync(join(candidate, "upstream", "UPDATE_REPORT.md"), report);
    run("npm", ["run", "verify:contracts"], { cwd: candidate });

    console.log("\n" + report);
    if (options.dryRun) {
      console.log("✓ Dry run complete; the worktree was not changed");
      return;
    }
    if (apiDiff.hasChanges && !options.acceptApiChanges) {
      throw new Error("public API changes detected; review the report, then rerun with --accept-api-changes to apply them");
    }

    const tags = manifestDeclarations(join(candidate, "upstream", "custom-elements.json"))
      .map((declaration) => declaration.tagName)
      .sort();
    applyCandidate({ candidate, temporaryRoot, reactDeclaration: reactTypes(tags) });

    console.log("\n✓ Jelly UI update applied and project contracts pass");
    if (apiDiff.addedTags.length) {
      console.log(`! Add catalog examples and browser QA for: ${apiDiff.addedTags.join(", ")}`);
    }
    console.log("Review the Git diff and upstream/UPDATE_REPORT.md before committing.");
    run("git", ["diff", "--stat", "--", ...repoManagedEntries], { cwd: repoRoot });
  } finally {
    assertInside(tmpdir(), temporaryRoot);
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
