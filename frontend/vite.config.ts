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
      // 새 버전 배포 시 서비스 워커 자동 업데이트
      registerType: "autoUpdate",

      // service worker 자동 등록
      injectRegister: "auto",

      // manifest는 사용자용 / 관리자용으로 직접 관리
      manifest: false,

      // PWA 관련 정적 파일
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
