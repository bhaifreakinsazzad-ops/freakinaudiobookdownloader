import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archive = path.join(root, "dist", "sfyta3-h-v-a-extension.zip");
const publicDownloads = path.join(root, "dist", "public", "downloads");
const destination = path.join(publicDownloads, "sfyta3-h-v-a-extension.zip");

await mkdir(publicDownloads, { recursive: true });
await copyFile(archive, destination);
console.log(`Public extension download prepared at ${destination}`);
