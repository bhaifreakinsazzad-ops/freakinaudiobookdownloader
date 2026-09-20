import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "apps", "extension");
const output = path.join(root, "dist", "extension");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await mkdir(path.join(output, "icons"), { recursive: true });
for (const file of [
  "manifest.json",
  "background.js",
  "README.md",
  "popup.html",
  "popup.js",
])
  await cp(path.join(source, file), path.join(output, file));
await cp(
  path.join(source, "icon-128.svg"),
  path.join(output, "icons", "icon-128.svg")
);
console.log(`Extension companion packaged at ${output}`);
