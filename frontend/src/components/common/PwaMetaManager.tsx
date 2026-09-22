import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PwaMetaManager() {
  const location = useLocation();

  useEffect(() => {
    const isAdmin = location.pathname.startsWith("/admin");

    const manifestHref = isAdmin
      ? "/admin-manifest.webmanifest"
      : "/manifest.webmanifest";

    const appleIconHref = isAdmin
      ? "/admin-pwa-192x192.png"
      : "/pwa-192x192.png";

    const appTitle = isAdmin ? "펜션 관리자" : "펜션 예약";

    /*
     * Manifest
     */
    let manifest = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    );

    if (!manifest) {
      manifest = document.createElement("link");

      manifest.rel = "manifest";

      document.head.appendChild(manifest);
    }

    manifest.href = manifestHref;

    /*
     * Apple 홈 화면 아이콘
     */
    let appleIcon = document.querySelector<HTMLLinkElement>(
      'link[rel="apple-touch-icon"]',
    );

    if (!appleIcon) {
      appleIcon = document.createElement("link");

      appleIcon.rel = "apple-touch-icon";

      document.head.appendChild(appleIcon);
    }

    appleIcon.href = appleIconHref;

    /*
     * Apple 홈 화면 앱 이름
     */
    let appleTitle = document.querySelector<HTMLMetaElement>(
      'meta[name="apple-mobile-web-app-title"]',
    );

    if (!appleTitle) {
      appleTitle = document.createElement("meta");

      appleTitle.name = "apple-mobile-web-app-title";

      document.head.appendChild(appleTitle);
    }

    appleTitle.content = appTitle;

    /*
     * 브라우저 제목
     */
    document.title = appTitle;
  }, [location.pathname]);

  return null;
}
