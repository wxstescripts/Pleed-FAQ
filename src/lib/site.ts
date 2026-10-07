/**
 * Single source of truth for site-wide copy, links and honest facts.
 * Import from anywhere (server or client): this module is tiny and has no
 * side effects. Command facts are loaded lazily (see getCommandFacts) so the
 * 128 KB commands.json never lands in a client bundle by accident.
 */

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export const SITE_NAME = "Pleed";
export const SITE_TAGLINE = "Security, moderation and automation for Discord servers";
export const SITE_DESCRIPTION =
  "Pleed is a Discord bot that protects your server with anti-nuke and join gates, keeps it clean with auto-moderation, and automates the busywork — configured from commands or the web dashboard.";

/**
 * Canonical origin used for metadataBase, canonical URLs, sitemap and OG.
 * PLACEHOLDER: no production domain exists in the repo yet. Set
 * NEXT_PUBLIC_SITE_URL (e.g. https://pleed.example) in the deployment
 * environment. Falls back to Vercel's production URL, then localhost.
 */
export const SITE_URL: string = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000"; // PLACEHOLDER: replace with the real domain
})();

/** Copyright holder used in the footer and legal pages (from legacy site). */
export const COPYRIGHT_HOLDER = "Pleed Development";

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

/** Bot invite — keep EXACTLY this URL (same as legacy site and docs). */
export const INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1484703029243416757";

/** Official support server (linked from 11 docs pages + legacy site). */
export const SUPPORT_URL = "https://discord.gg/AfCCQt2VHP";

export const DISCORD_TERMS_URL = "https://discord.com/terms";
export const DISCORD_GUIDELINES_URL = "https://discord.com/guidelines";

/** Default command prefix (core/config.py). Slash commands also work. */
export const DEFAULT_PREFIX = "!";

export type NavLink = {
  label: string;
  href: string;
  /** Opens in a new tab with rel="noopener noreferrer" and an external affordance. */
  external?: boolean;
  description?: string;
};

/** Primary navigation (header + mobile sheet). Use absolute paths only. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: "Features", href: "/#features", description: "What Pleed does for your server" },
  { label: "Commands", href: "/commands", description: "Search every public command" },
  { label: "Docs", href: "/docs", description: "Guides and command reference" },
  { label: "Status", href: "/status", description: "Service status" },
  { label: "Dashboard", href: "/dashboard", description: "Configure Pleed on the web" },
];

export type FooterGroup = { title: string; links: readonly NavLink[] };

export const FOOTER_GROUPS: readonly FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Commands", href: "/commands" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Getting started", href: "/docs/getting-started" },
      { label: "Support server", href: SUPPORT_URL, external: true },
      { label: "Add to Discord", href: INVITE_URL, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

/**
 * Social / community links. Only real destinations — the repo contains no
 * Twitter/X, GitHub org, email or other accounts, so only Discord is listed.
 */
export const SOCIAL_LINKS: readonly (NavLink & { icon: "discord" })[] = [
  { label: "Pleed support server on Discord", href: SUPPORT_URL, external: true, icon: "discord" },
];

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

/**
 * Live usage stats. There is no real data source today (the legacy
 * pleed-api.onrender.com/stats endpoint is gone), so every value is null and
 * must be rendered as a clearly labelled placeholder (<PlaceholderBadge/>).
 * Never invent numbers.
 */
export const SITE_STATS: {
  servers: number | null;
  users: number | null;
  uptime: string | null;
} = {
  servers: null, // PLACEHOLDER: replace with real data
  users: null, // PLACEHOLDER: replace with real data
  uptime: null, // PLACEHOLDER: replace with real data
};

/* ------------------------------------------------------------------ */
/* Honest facts derived from src/data/commands.json                    */
/* ------------------------------------------------------------------ */

export type CommandEntry = {
  name: string;
  description: string;
  category: string;
  usage: string;
};

/**
 * The "Core" category is almost entirely owner/developer tooling (eval, shell,
 * git*, pip*, dashboardtoken, deletefile, restart …) that the bot's own docs
 * exclude. Only these Core commands are public.
 */
export const PUBLIC_CORE_COMMANDS: ReadonlySet<string> = new Set([
  "ai",
  "prefix",
  "setwelcome",
  "help",
  "helpsetup",
]);

/** True for commands that may be shown on the public site. */
export function isPublicCommand(cmd: Pick<CommandEntry, "name" | "category">): boolean {
  return cmd.category !== "Core" || PUBLIC_CORE_COMMANDS.has(cmd.name);
}

export type CommandFacts = {
  /** Public entries after the owner-only filter (may include same-name subcommands). */
  publicEntries: number;
  /** Unique public command names — the honest "N commands" number (403 today). */
  uniqueCommands: number;
  /** Number of categories/modules shown publicly (11 today). */
  categories: number;
  categoryNames: string[];
  /** Rounded-down marketing figure, e.g. "400+" — derived, never typed by hand. */
  uniqueCommandsLabel: string;
};

/**
 * Derive honest numbers from the command data. Server-side use:
 *   const facts = await getCommandFacts();  // { uniqueCommands: 403, categories: 11, … }
 * Loaded with a dynamic import so client bundles never include the JSON.
 */
export async function getCommandFacts(): Promise<CommandFacts> {
  const data = (await import("@/data/commands.json")).default as CommandEntry[];
  return deriveCommandFacts(data);
}

export function deriveCommandFacts(data: readonly CommandEntry[]): CommandFacts {
  const publicCommands = data.filter(isPublicCommand);
  const uniqueCommands = new Set(publicCommands.map((c) => c.name)).size;
  const categoryNames = Array.from(new Set(publicCommands.map((c) => c.category))).sort();
  return {
    publicEntries: publicCommands.length,
    uniqueCommands,
    categories: categoryNames.length,
    categoryNames,
    uniqueCommandsLabel: `${Math.floor(uniqueCommands / 50) * 50}+`,
  };
}
