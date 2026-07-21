import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { compareManifests } from "./update-upstream.mjs";

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
