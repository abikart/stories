import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "src", "design-system", "soft-components", "dist", "jelly.js");
const destinationDirectory = path.join(root, "public", "design-system");
const destination = path.join(destinationDirectory, "jelly.js");

await mkdir(destinationDirectory, { recursive: true });
await copyFile(source, destination);

console.log(`✓ synced ${path.relative(root, source)} → ${path.relative(root, destination)}`);
