import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      injectRegister: "auto",

      // manifest는 사용자용 / 관리자용으로 직접 관리
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

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
