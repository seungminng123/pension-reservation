import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import path from "path";

export default defineConfig({
  plugins: [
    react(),

    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      injectRegister: "auto",

      // 사용자/관리자 manifest 직접 관리
      manifest: false,

      includeAssets: [
        "favicon.svg",

        "pwa-192x192.png",
        "pwa-512x512.png",

        "admin-pwa-192x192.png",
        "admin-pwa-512x512.png",

        "manifest.webmanifest",
        "admin-manifest.webmanifest",
      ],
    }),
  ],

  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin.html", import.meta.url)),
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
