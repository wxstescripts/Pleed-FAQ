import {
  AudioLines,
  Coins,
  Gavel,
  History,
  Info,
  LayoutGrid,
  Server,
  Shapes,
  ShieldAlert,
  ShieldCheck,
  SquareTerminal,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { docsHref } from "@/content/docs";

/*
 * Presentation for the 11 categories in commands.json: an icon, a one-line
 * summary written from the commands each category actually contains, and the
 * docs guide that covers it. Client-safe (no command data in here).
 */

export type CategoryMeta = {
  icon: LucideIcon;
  /** What the module covers — derived from its command names, never a promise. */
  summary: string;
  /** /docs/<slug> guide for this module. */
  docs: string;
};

const META: Record<string, CategoryMeta> = {
  antinuke: {
    icon: ShieldAlert,
    summary: "Limits on mass bans, kicks, channel, role, emoji and webhook changes, bot adds and vanity edits.",
    docs: "security",
  },
  automation: {
    icon: Workflow,
    summary: "Trigger → response automations, auto-reactions, auto-responders and custom commands.",
    docs: "automation",
  },
  core: {
    icon: SquareTerminal,
    summary: "Help menus, the AI assistant, your server's prefix and the welcome channel.",
    docs: "getting-started",
  },
  economy: {
    icon: Coins,
    summary: "Wallets, businesses, stocks, the shop, games of chance, giveaways, XP and levels.",
    docs: "economy",
  },
  information: {
    icon: Info,
    summary: "Server, user and channel lookups, avatars and banners, AFK, image tools and profile lookups.",
    docs: "utility",
  },
  miscellaneous: {
    icon: Shapes,
    summary: "Games, music and Spotify, server counters, webhooks and bot customization.",
    docs: "fun",
  },
  moderation: {
    icon: Gavel,
    summary: "Bans, kicks, mutes, warnings, the jail system, lockdowns, logging, roles, tickets and bump reminders.",
    docs: "moderation",
  },
  security: {
    icon: ShieldCheck,
    summary: "The join gate and verification, account-age checks, kick traps, quarantine and rate limits.",
    docs: "security",
  },
  server: {
    icon: Server,
    summary: "Setup wizards, welcome and goodbye messages, jail and mute setup, and the update logger.",
    docs: "server-setup",
  },
  snipe: {
    icon: History,
    summary: "Bring back deleted and edited messages, removed reactions and ghost pings.",
    docs: "utility",
  },
  voice: {
    icon: AudioLines,
    summary: "VoiceMaster temporary voice channels and the controls their owners use.",
    docs: "voice",
  },
};

const FALLBACK: CategoryMeta = { icon: LayoutGrid, summary: "", docs: "getting-started" };

/** Icon for "All commands". */
export const ALL_ICON = LayoutGrid;

export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function categoryMeta(slug: string): CategoryMeta {
  return META[slug] ?? FALLBACK;
}

export function categoryDocsHref(slug: string): string {
  return docsHref(categoryMeta(slug).docs);
}
