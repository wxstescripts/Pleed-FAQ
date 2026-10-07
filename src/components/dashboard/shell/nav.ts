import {
  BookOpen,
  Filter,
  House,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareReply,
  Settings,
  ShieldAlert,
  SquareTerminal,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { SUPPORT_URL } from "@/lib/site";

/**
 * The dashboard's pages — the single source for the sidebar, the phone
 * drawer, the app-bar title, the search palette, the login gate's heading
 * and the overview's module links. Server- and client-safe (no hooks).
 */
export type DashboardPage = {
  href: string;
  /** Sidebar / drawer label. */
  label: string;
  /** Compact label for the phone app bar and tight spots. */
  shortLabel: string;
  /** One sentence: what the page configures (palette, overview cards). */
  description: string;
  icon: LucideIcon;
  /**
   * Settings on the page (taken from the API fields it edits), so the search
   * palette can answer "where is the prefix?" with the right page.
   */
  keywords: readonly string[];
};

export type DashboardNavGroup = {
  id: string;
  /** Visible group label; `null` = the ungrouped first item (Overview). */
  label: string | null;
  items: readonly DashboardPage[];
};

export const OVERVIEW_PAGE: DashboardPage = {
  href: "/dashboard",
  label: "Overview",
  shortLabel: "Overview",
  description: "Live numbers, module status and the servers Pleed is in.",
  icon: LayoutDashboard,
  keywords: ["home", "stats", "statistics", "servers", "members", "messages today", "actions taken", "invite"],
};

export const SECURITY_PAGE: DashboardPage = {
  href: "/dashboard/security",
  label: "Security & Anti-Nuke",
  shortLabel: "Security",
  description: "Stop mass bans, kicks and channel or role deletions before they wreck the server.",
  icon: ShieldAlert,
  keywords: [
    "anti-nuke",
    "antinuke",
    "nuke",
    "raid",
    "ban threshold",
    "kick threshold",
    "channel deletions",
    "role deletions",
    "punishment",
    "quarantine",
    "alert",
    "rogue admin",
  ],
};

export const JOIN_GATES_PAGE: DashboardPage = {
  href: "/dashboard/joingates",
  label: "Join Gates",
  shortLabel: "Join Gates",
  description: "Verify new members, hold young accounts and auto-kick anyone who never verifies.",
  icon: UserCheck,
  keywords: [
    "verification",
    "verify channel",
    "verified role",
    "unverified role",
    "account age",
    "alt accounts",
    "auto-kick",
    "dm on join",
    "log channel",
    "bypass role",
  ],
};

export const AUTOMOD_PAGE: DashboardPage = {
  href: "/dashboard/automod",
  label: "Auto-Mod",
  shortLabel: "Auto-Mod",
  description: "Filter links, spam, invites, caps and bad words, with the punishment you pick.",
  icon: Filter,
  keywords: [
    "automod",
    "filters",
    "anti-links",
    "links",
    "spam",
    "caps",
    "invites",
    "bad words",
    "timeout",
    "punishment",
  ],
};

export const AUTOMATIONS_PAGE: DashboardPage = {
  href: "/dashboard/automations",
  label: "Auto-Responders",
  shortLabel: "Auto-Responders",
  description: "Reply automatically when a message contains a trigger word.",
  icon: MessageSquareReply,
  keywords: ["automations", "auto-reply", "autoresponder", "trigger", "reply", "custom response", "keyword"],
};

export const SETTINGS_PAGE: DashboardPage = {
  href: "/dashboard/settings",
  label: "Settings",
  shortLabel: "Settings",
  description: "Command prefix and the welcome channel.",
  icon: Settings,
  keywords: ["prefix", "command prefix", "welcome channel", "welcome card", "general"],
};

export const DASHBOARD_NAV: readonly DashboardNavGroup[] = [
  { id: "overview", label: null, items: [OVERVIEW_PAGE] },
  { id: "protection", label: "Protection", items: [SECURITY_PAGE, JOIN_GATES_PAGE, AUTOMOD_PAGE] },
  { id: "engagement", label: "Engagement", items: [AUTOMATIONS_PAGE] },
  { id: "server", label: "Server", items: [SETTINGS_PAGE] },
];

export const DASHBOARD_PAGES: readonly DashboardPage[] = DASHBOARD_NAV.flatMap((group) => group.items);

/** Every page except Overview — the modules the overview links to. */
export const MODULE_PAGES: readonly DashboardPage[] = DASHBOARD_PAGES.filter((page) => page !== OVERVIEW_PAGE);

/** Help links shown under the navigation (real destinations only). */
export type HelpLink = { href: string; label: string; icon: LucideIcon; description: string };

export const HELP_LINKS: readonly HelpLink[] = [
  { href: "/docs", label: "Documentation", icon: BookOpen, description: "Guides and the command reference" },
  { href: SUPPORT_URL, label: "Support server", icon: LifeBuoy, description: "Ask the Pleed team on Discord" },
];

/** Extra destinations for the search palette. */
export const SITE_LINKS: readonly HelpLink[] = [
  { href: "/commands", label: "Commands", icon: SquareTerminal, description: "Search every public command" },
  { href: "/", label: "Pleed home", icon: House, description: "Back to the website" },
];

function normalise(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Active state for a dashboard link: Overview only on /dashboard itself, modules on their subtree. */
export function isActivePage(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const path = normalise(pathname);
  if (href === OVERVIEW_PAGE.href) return path === OVERVIEW_PAGE.href;
  return path === href || path.startsWith(`${href}/`);
}

/** The page a pathname belongs to (longest match), or undefined outside the known pages. */
export function getPageForPath(pathname: string | null): DashboardPage | undefined {
  if (!pathname) return undefined;
  return DASHBOARD_PAGES.filter((page) => isActivePage(pathname, page.href)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}
