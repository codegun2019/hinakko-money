import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

/** Bump package.json version to invalidate all PWA caches on deploy */
export const PWA_CACHE_VERSION = pkg.version.replace(/\./g, "-");
export const PWA_CACHE_PREFIX = `hinakko-v${PWA_CACHE_VERSION}`;

/** Versioned runtime cache bucket name */
export function cacheName(key) {
  return `${PWA_CACHE_PREFIX}-${key}`;
}
