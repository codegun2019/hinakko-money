import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve("./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: "recharts", test: /node_modules[\\/]recharts|node_modules[\\/]d3-/ },
            { name: "date-fns", test: /node_modules[\\/]date-fns/ },
          ],
        },
      },
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "offline.html",
        "icons/icon-16.png",
        "icons/icon-32.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
      ],
      // SW is generated post-build via scripts/generate-sw.mjs (TanStack Start SSR quirk)
      selfDestroying: false,
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});
