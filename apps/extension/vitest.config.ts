import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const extensionRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(extensionRoot, "../..");

export default defineConfig({
  root: projectRoot,
  test: { include: ["apps/extension/messaging.test.ts"] },
});
