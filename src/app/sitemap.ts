import type { MetadataRoute } from "next";

import { DOCS_HOME, docsHref, docsPages } from "@/content/docs";
import { SITE_URL } from "@/lib/site";

type Entry = MetadataRoute.Sitemap[number];

/** Absolute URL for a site path ("/" → the origin itself, no trailing slash). */
function absolute(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

function entry(path: string, changeFrequency: Entry["changeFrequency"], priority: number): Entry {
  return { url: absolute(path), changeFrequency, priority };
}

/**
 * sitemap.xml — every public, indexable route. The docs pages come from the
 * docs table of contents (src/content/docs), so a new guide appears here
 * without touching this file. The dashboard, the design-system showcase and
 * /api are private (see robots.ts) and never listed.
 *
 * No `lastModified`: the repo has no trustworthy per-page dates, and a build
 * timestamp on every URL would only teach crawlers to ignore the field.
 * PLACEHOLDER: SITE_URL comes from NEXT_PUBLIC_SITE_URL (no production domain yet).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("/", "weekly", 1),
    entry("/commands", "weekly", 0.9),
    entry(DOCS_HOME.href, "weekly", 0.8),
    ...docsPages.map((page) => entry(docsHref(page.slug), "monthly", 0.7)),
    entry("/status", "daily", 0.5),
    entry("/privacy", "yearly", 0.3),
    entry("/terms", "yearly", 0.3),
  ];
}
