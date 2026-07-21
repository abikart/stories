import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve("contracts/custom-elements.json");
const manifest = JSON.parse(readFileSync(path, "utf8"));

// The analyzer's glob traversal order varies by filesystem. Canonicalize only
// the independent module records so a verification run leaves a clean tree.
manifest.modules.sort((left, right) => left.path.localeCompare(right.path));

writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
