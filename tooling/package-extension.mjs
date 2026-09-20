import { mkdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "dist", "extension");
const archive = path.join(root, "dist", "sfyta3-h-v-a-extension.zip");
const legacyArchive = path.join(
  root,
  "dist",
  "sfyta3-h-v-a-extension-starter.zip"
);
await mkdir(path.join(root, "dist"), { recursive: true });
await rm(archive, { force: true });
await rm(legacyArchive, { force: true });
await exec("zip", ["-qr", archive, "."], { cwd: outputDir });
console.log(`Extension archive created at ${archive}`);
