import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),

    tailwindcss(),

    VitePWA({
      // service worker 자동 등록
      injectRegister: "auto",

      // favicon 등 정적 파일 포함
      includeAssets: ["favicon.svg", "pwa-192x192.png", "pwa-512x512.png"],

      manifest: {
        name: "펜션 예약",
        short_name: "펜션 예약",

        description: "방과 평상을 간편하게 예약할 수 있는 펜션 예약 서비스",

        start_url: "/",
        scope: "/",

        display: "standalone",

        background_color: "#ffffff",
        theme_color: "#ffffff",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
