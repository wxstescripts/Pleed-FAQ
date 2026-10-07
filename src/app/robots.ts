import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * robots.txt — crawl the marketing site (home, commands, docs, status, legal);
 * keep crawlers out of the signed-in dashboard, the dev-only design-system
 * showcase and the auth/API routes.
 *
 * PLACEHOLDER: SITE_URL comes from NEXT_PUBLIC_SITE_URL (no production domain
 * in the repo yet), so the Sitemap line points at the right host once it is set.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/design-system", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
