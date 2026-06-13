/**
 * Generate service worker for TanStack Start (vite-plugin-pwa skips SW on SSR client builds).
 * Run automatically after `vite build`.
 */
import { generateSW } from "workbox-build";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { PWA_CACHE_PREFIX, cacheName } from "./pwa-cache-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const clientDir = join(root, "dist", "client");

if (!existsSync(clientDir)) {
  console.error("dist/client not found — run vite build first");
  process.exit(1);
}

/** Cache cleanup + SKIP_WAITING for UpdateAvailableSheet refresh flow */
const cleanupScript = `
self.addEventListener("message",function(e){if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("activate",function(e){var p="${PWA_CACHE_PREFIX}";e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(c){return c.startsWith("hinakko-")&&!c.startsWith(p)}).map(function(c){return caches.delete(c)}))}))});
`.trim();

writeFileSync(join(clientDir, "sw-cleanup.js"), cleanupScript);

const expiration = (maxEntries, maxAgeDays) => ({
  expiration: {
    maxEntries,
    maxAgeSeconds: maxAgeDays * 24 * 60 * 60,
  },
});

const { count, size, warnings } = await generateSW({
  globDirectory: clientDir,
  globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,webmanifest}"],
  globIgnores: ["**/sw-cleanup.js", "**/sw.js", "**/sw.js.map", "**/workbox-*.js", "**/workbox-*.js.map", "**/icon-source.png"],
  swDest: join(clientDir, "sw.js"),
  importScripts: ["sw-cleanup.js"],
  cacheId: PWA_CACHE_PREFIX,
  cleanupOutdatedCaches: true,
  navigateFallback: "/offline.html",
  navigateFallbackDenylist: [/^\/api\//, /^\/__/, /\.(?:json|txt|xml)$/],
  skipWaiting: false,
  clientsClaim: true,
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: cacheName("google-fonts-stylesheets"),
        ...expiration(10, 365),
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: cacheName("google-fonts-webfonts"),
        ...expiration(30, 365),
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: cacheName("images"),
        ...expiration(60, 30),
      },
    },
    {
      urlPattern: /\.(?:js|css|woff|woff2)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: cacheName("static"),
        ...expiration(80, 14),
      },
    },
    {
      urlPattern: ({ request, url }) => {
        if (request.mode !== "navigate") return false;
        const paths = ["/", "/calendar", "/categories", "/settings", "/offline"];
        return paths.some((p) => url.pathname === p);
      },
      handler: "NetworkFirst",
      options: {
        cacheName: cacheName("app-shell"),
        networkTimeoutSeconds: 3,
        ...expiration(10, 7),
      },
    },
  ],
});

console.log(`✓ sw.js — cache prefix: ${PWA_CACHE_PREFIX}`);
console.log(`  precache: ${count} files, ${(size / 1024).toFixed(1)} KiB`);
if (warnings.length) warnings.forEach((w) => console.warn(w));
