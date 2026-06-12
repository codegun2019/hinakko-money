# Hinakko Expense — PWA Build Pipeline

## Overview

Hinakko Expense is a **Progressive Web App** built with TanStack Start + Vite. The PWA layer consists of:

| Piece | Source | Purpose |
|-------|--------|---------|
| Web manifest | `public/manifest.webmanifest` | Install prompt, theme, icons |
| Service worker | `dist/client/sw.js` | Offline shell, asset caching |
| SW registration | `dist/client/registerSW.js` | Auto-injected by `vite-plugin-pwa` |
| Offline fallback | `public/offline.html` + React `OfflineFallback` | Shown when navigation/data fails offline |

## Why `sw.js` is generated post-build

TanStack Start runs **two Vite builds** (client + SSR) and marks the client build with `ssr: true`. Because of this, `vite-plugin-pwa` **skips service worker generation** during `vite build` ([upstream issue #902](https://github.com/vite-pwa/vite-plugin-pwa/issues/902)).

Our workaround:

```
npm run build
  ├─ vite build          → client + SSR bundles in dist/
  └─ node scripts/generate-sw.mjs  → workbox-build writes dist/client/sw.js
```

`vite-plugin-pwa` is still used for:

- `registerSW.js` injection (`injectRegister: "auto"`)
- Dev-mode service worker (`devOptions.enabled`)
- **Not** for manifest (we use `manifest: false` + static `public/manifest.webmanifest`)

## Commands

```bash
# Development (SW in dev via vite-plugin-pwa)
npm run dev

# Regenerate PNG icons from source (after changing icon-source.png)
npm run generate:icons

# Production build (includes SW generation)
npm run build

# Preview production build locally
npm run preview

# TypeScript check
npm run typecheck
```

## Icon pipeline

1. Place master artwork at `assets/icon-source.png` (512×512 or larger).
2. Run `npm run generate:icons` — produces **independently resized** outputs:
   - `icon-16.png`, `icon-32.png`, `icon-192.png`, `icon-512.png`
   - `apple-touch-icon.png` (180×180)
3. Each size is compressed with `sharp` (palette mode for 16/32).
4. Re-run `npm run build` so SW precache hashes update.

**Never** copy `icon-512.png` to smaller sizes manually.

## Cache versioning

Cache names are prefixed with the app version from `package.json`:

```
hinakko-v0-1-0-app-shell
hinakko-v0-1-0-static
…
```

When you bump `package.json` version and deploy:

1. New SW uses new cache prefix.
2. `cleanupOutdatedCaches` removes old precache entries.
3. `sw-cleanup.js` deletes orphaned runtime caches from previous prefixes.

## Testing PWA locally

1. `npm run build && npm run preview`
2. Open DevTools → **Application** → Service Workers — confirm `/sw.js` active.
3. DevTools → **Application** → Manifest — confirm installable.
4. Enable **Offline** in Network tab, reload — app shell + offline fallback should work.
5. See [pwa-checklist.md](./pwa-checklist.md) for full smoke test steps.

## File reference

| File | Role |
|------|------|
| `vite.config.ts` | VitePWA plugin (registration + dev SW) |
| `scripts/generate-sw.mjs` | Post-build Workbox SW |
| `scripts/pwa-cache-config.mjs` | Versioned cache name helpers |
| `scripts/generate-pwa-icons.mjs` | Icon resize/compress |
| `src/components/pwa/` | Online/offline UI, update sheet |
| `public/offline.html` | Workbox navigateFallback document |

## Out of scope (future sprints)

- Offline transaction queue / sync
- Push notifications
