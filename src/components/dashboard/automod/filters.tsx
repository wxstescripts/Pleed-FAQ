import { AtSign, CaseUpper, Link, MessageSquareX, MessagesSquare, UserPlus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { AutomodConfig, AutomodPunishment, Flag } from "@/lib/api";
import { DEFAULT_PREFIX } from "@/lib/site";

/** The 0/1 fields of the automod config, i.e. one per filter. */
export type FilterKey = {
  [K in keyof AutomodConfig]-?: AutomodConfig[K] extends Flag ? K : never;
}[keyof AutomodConfig];

export type AutomodFilter = {
  key: FilterKey;
  label: string;
  description: ReactNode;
  icon: LucideIcon;
  /** Noun phrase for the plain-language summary ("Pleed deletes spam, links…"). */
  summary: string;
};

/** Inline command / code inside a caption or description. */
export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-xs border border-line bg-inset px-1 type-code text-fg-secondary box-decoration-clone">
      {children}
    </code>
  );
}

/**
 * Every automod filter the API stores, in the order they are shown. The keys
 * are the API's own field names; `anti_mentions` was round-tripped but had no
 * toggle before — the bot's "mentions" category (`!automod punishment`).
 */
export const FILTERS: readonly AutomodFilter[] = [
  {
    key: "anti_spam",
    label: "Spam",
    description: "Catches members who send messages too fast.",
    icon: MessagesSquare,
    summary: "spam",
  },
  {
    key: "anti_links",
    label: "Links",
    description: "Catches messages that contain website links.",
    icon: Link,
    summary: "links",
  },
  {
    key: "anti_invites",
    label: "Server invites",
    description: "Catches invite links to other Discord servers.",
    icon: UserPlus,
    summary: "invites to other servers",
  },
  {
    key: "anti_mentions",
    label: "Mass mentions",
    description: "Catches messages that mention lots of members or roles at once.",
    icon: AtSign,
    summary: "mass mentions",
  },
  {
    key: "anti_caps",
    label: "All caps",
    description: "Catches messages written mostly in capital letters.",
    icon: CaseUpper,
    summary: "all-caps messages",
  },
  {
    key: "bad_words_enabled",
    label: "Blocked words",
    description: (
      <>
        Catches messages with a word from your block list. Add words in Discord with{" "}
        <InlineCode>{DEFAULT_PREFIX}words add</InlineCode>.
      </>
    ),
    icon: MessageSquareX,
    summary: "messages with blocked words",
  },
];

export type PunishmentOption = { value: AutomodPunishment; label: string; description: string };

/** The default action, mildest first, each with what it means for the member. */
export const PUNISHMENTS: readonly PunishmentOption[] = [
  {
    value: "delete",
    label: "Delete message",
    description: "The message is removed. The sender can keep chatting.",
  },
  {
    value: "timeout",
    label: "Time out",
    description: "The message is removed, and the sender can't chat, react or join voice until the timeout ends.",
  },
  {
    value: "kick",
    label: "Kick",
    description: "The message is removed and the sender is kicked. They can rejoin with an invite.",
  },
  {
    value: "ban",
    label: "Ban",
    description: "The message is removed and the sender is banned. They can't rejoin unless a moderator unbans them.",
  },
];

/** Discord's longest timeout: 28 days. */
export const TIMEOUT_MAX_MINUTES = 28 * 24 * 60;
export const TIMEOUT_MIN_MINUTES = 1;

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`;
const andList = (items: string[]) => new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(items);

/** 90 → "1 hour and 30 minutes", 1440 → "1 day". */
export function formatMinutes(total: number): string {
  const minutes = Math.max(0, Math.round(total));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  const parts = [
    days ? plural(days, "day") : null,
    hours ? plural(hours, "hour") : null,
    rest || minutes === 0 ? plural(rest, "minute") : null,
  ].filter((part): part is string => part !== null);
  return andList(parts);
}

export function activeFilters(config: AutomodConfig): AutomodFilter[] {
  return FILTERS.filter((filter) => config[filter.key] === 1);
}

/** One sentence that says what Pleed does with this config. */
export function describeConfig(config: AutomodConfig): string {
  const active = activeFilters(config);
  if (active.length === 0) return "Pleed isn't checking messages right now. Turn on a filter below to start.";
  const caught = andList(active.map((filter) => filter.summary));
  switch (config.punishment) {
    case "timeout":
      return `Pleed deletes ${caught}, then times the sender out for ${formatMinutes(config.timeout_minutes)}.`;
    case "kick":
      return `Pleed deletes ${caught}, then kicks the sender from the server.`;
    case "ban":
      return `Pleed deletes ${caught}, then bans the sender from the server.`;
    default:
      return `Pleed deletes ${caught}.`;
  }
}

/** Same keys, same values (the save body is the whole object, so compare every key). */
export function sameConfig(a: AutomodConfig, b: AutomodConfig): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof AutomodConfig>;
  for (const key of keys) if (a[key] !== b[key]) return false;
  return true;
}
