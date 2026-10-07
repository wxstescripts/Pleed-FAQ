/**
 * The docs table of contents — a tiny, dependency-free module.
 *
 * Imported by the docs routes (sidebar, pager, metadata) and by the sitemap
 * (brand-seo), so it must stay light: titles, descriptions and sections
 * only. The page bodies live in ./pages/<slug>.ts.
 *
 * `docsPages` lists every /docs/<slug> route in reading order (the prev/next
 * pager follows it). The docs home, /docs, is not in the list — see
 * DOCS_HOME.
 */

export type DocsSection = "Get started" | "Security & moderation" | "Community" | "Utilities & fun";

export type DocsPageMeta = {
  /** URL segment: /docs/<slug>. */
  slug: string;
  title: string;
  /** One sentence; also the page's meta description. */
  description: string;
  /** Sidebar group. */
  section: DocsSection;
};

/** Sidebar groups, in order. */
export const DOCS_SECTIONS: readonly DocsSection[] = [
  "Get started",
  "Security & moderation",
  "Community",
  "Utilities & fun",
];

export const DOCS_HOME = {
  href: "/docs",
  title: "Documentation",
  description:
    "Guides and the full command reference for Pleed: set it up, protect your server with anti-nuke and join gates, and configure every module.",
} as const;

export const docsPages: { slug: string; title: string; description: string; section: DocsSection }[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    description: "Invite Pleed, check your prefix, run the setup wizards and understand the permissions it needs.",
    section: "Get started",
  },
  {
    slug: "server-setup",
    title: "Server setup",
    description: "The setup center, welcome and goodbye messages, the update logger and invite panels.",
    section: "Get started",
  },
  {
    slug: "security",
    title: "Security & anti-nuke",
    description: "Anti-nuke protection, the join gate, kick traps, fake permissions and rate limiting.",
    section: "Security & moderation",
  },
  {
    slug: "moderation",
    title: "Moderation",
    description: "Kicks, bans, the jail system, warnings, lockdowns, logging and role tools.",
    section: "Security & moderation",
  },
  {
    slug: "automation",
    title: "Automation",
    description: "Trigger → response automations, auto-reacts, auto-responses, custom commands and AutoMod.",
    section: "Security & moderation",
  },
  {
    slug: "tickets",
    title: "Tickets",
    description: "Support ticket panels, claiming, transcripts and blacklists.",
    section: "Community",
  },
  {
    slug: "voice",
    title: "Voice",
    description: "VoiceMaster temporary voice channels and the controls members use to manage them.",
    section: "Community",
  },
  {
    slug: "economy",
    title: "Economy & leveling",
    description: "Wallets, businesses, the stock market, games, poker, XP, levels and giveaways.",
    section: "Community",
  },
  {
    slug: "utility",
    title: "Information & utility",
    description: "Server and user lookups, snipe, highlights, image tools, emoji and stickers.",
    section: "Utilities & fun",
  },
  {
    slug: "fun",
    title: "Fun & miscellaneous",
    description: "Games, music, Spotify, server counters, webhooks and bot customization.",
    section: "Utilities & fun",
  },
];

export function docsHref(slug: string): string {
  return `/docs/${slug}`;
}

export function getDocsPageMeta(slug: string): DocsPageMeta | undefined {
  return docsPages.find((page) => page.slug === slug);
}
