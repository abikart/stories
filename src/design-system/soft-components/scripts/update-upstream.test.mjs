import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { compareManifests, mergeStoriesSource } from "./update-upstream.mjs";

function manifest(declarations) {
  return { schemaVersion: "1.0.0", modules: [{ kind: "javascript-module", path: "src/example.ts", declarations }] };
}

function element(tagName, extra = {}) {
  return { kind: "class", name: "Example", customElement: true, tagName, ...extra };
}

function compare(previous, next) {
  const directory = mkdtempSync(join(tmpdir(), "jelly-updater-test-"));
  const previousPath = join(directory, "previous.json");
  const nextPath = join(directory, "next.json");
  try {
    writeFileSync(previousPath, JSON.stringify(manifest(previous)));
    writeFileSync(nextPath, JSON.stringify(manifest(next)));
    return compareManifests(previousPath, nextPath);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("manifest comparison ignores declaration and token ordering", () => {
  const attributes = [
    { name: "disabled", type: { text: "boolean" } },
    { name: "variant", type: { text: "string" } },
  ];
  const result = compare(
    [element("jelly-button", { attributes })],
    [element("jelly-button", { attributes: [...attributes].reverse() })],
  );
  assert.equal(result.hasChanges, false);
});

test("manifest comparison reports tags and detailed public API changes", () => {
  const result = compare(
    [element("jelly-button", {
      attributes: [{ name: "variant", type: { text: "string" } }],
      members: [{ kind: "method", name: "focus", return: { type: { text: "void" } } }],
    })],
    [
      element("jelly-button", {
        attributes: [{ name: "tone", type: { text: "string" } }],
        members: [{ kind: "method", name: "focus", return: { type: { text: "boolean" } } }],
      }),
      element("jelly-avatar"),
    ],
  );

  assert.equal(result.hasChanges, true);
  assert.deepEqual(result.addedTags, ["jelly-avatar"]);
  assert.deepEqual(result.removedTags, []);
  assert.equal(result.changed[0].tag, "jelly-button");
  assert(result.changed[0].added.includes("attribute:tone:string"));
  assert(result.changed[0].removed.includes("attribute:variant:string"));
  assert(result.changed[0].added.includes("method:focus:boolean:"));
  assert(result.changed[0].removed.includes("method:focus:void:"));
});

test("manifest comparison reports removed elements", () => {
  const result = compare([element("jelly-card")], []);
  assert.deepEqual(result.removedTags, ["jelly-card"]);
  assert.equal(result.hasChanges, true);
});

test("Stories source extensions three-way merge over a newer upstream", () => {
  const root = mkdtempSync(join(tmpdir(), "jelly-source-merge-test-"));
  const checkout = join(root, "checkout");
  const current = join(root, "current");
  const candidate = join(root, "candidate");
  const path = join("src", "example.ts");
  const run = (...args) => {
    const result = spawnSync("git", args, { cwd: checkout, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };

  try {
    mkdirSync(join(checkout, "src"), { recursive: true });
    mkdirSync(join(current, "src"), { recursive: true });
    mkdirSync(join(candidate, "src"), { recursive: true });
    run("init", "--quiet");
    run("config", "user.email", "test@example.com");
    run("config", "user.name", "Test");

    const baselineSource = "export const material = 'flat';\n\n// upstream tuning\nexport const samples = 240;\n";
    writeFileSync(join(checkout, path), baselineSource);
    run("add", path);
    run("commit", "--quiet", "-m", "baseline");
    const baselineCommit = run("rev-parse", "HEAD");

    writeFileSync(join(checkout, path), "export const material = 'flat';\n\n// upstream tuning\nexport const samples = 180;\n");
    run("add", path);
    run("commit", "--quiet", "-m", "upstream update");

    writeFileSync(join(current, path), "export const material = 'stories';\n\n// upstream tuning\nexport const samples = 240;\n");
    writeFileSync(join(candidate, path), readFileSync(join(checkout, path)));

    const applied = mergeStoriesSource({
      candidate,
      checkout,
      currentRoot: current,
      baseline: { commit: baselineCommit, repository: "fixture" },
      temporaryRoot: root,
    });

    assert.deepEqual(applied, [path]);
    assert.equal(
      readFileSync(join(candidate, path), "utf8"),
      "export const material = 'stories';\n\n// upstream tuning\nexport const samples = 180;\n",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
