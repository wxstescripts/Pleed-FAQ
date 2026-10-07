import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

/**
 * Web app manifest (served at /manifest.webmanifest, linked from every page).
 *
 * Colours are the canvas token (--color-canvas, #0b0c10) so the splash screen
 * and title bar match the site. Icons live in public/icons and are rendered
 * from the Logo geometry (LOGO_P_PATH / LOGO_GRADIENT in components/ui/logo):
 * "any" = the rounded tile, "maskable" = a full-bleed square whose P sits
 * inside the 80 % safe zone, so Android's circle/squircle masks never clip it.
 *
 * An installed Pleed opens on the dashboard — that is the app; the marketing
 * pages stay in scope, so links between them don't bounce out to the browser.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0b0c10",
    theme_color: "#0b0c10",
    lang: "en",
    dir: "ltr",
    categories: ["utilities", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Commands", description: "Search every public command", url: "/commands" },
      { name: "Docs", description: "Guides and command reference", url: "/docs" },
      { name: "Status", description: "Service status", url: "/status" },
    ],
  };
}
