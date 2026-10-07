import { AtSign, Ban, BellRing, Gavel, Hash, LogOut, UserLock, UserMinus, type LucideIcon } from "lucide-react";

import type { SecurityConfig, SecurityPunishment } from "@/lib/api";

export type ThresholdKey = "ban_threshold" | "kick_threshold" | "channel_delete_threshold" | "role_delete_threshold";

export type ThresholdOption = {
  key: ThresholdKey;
  label: string;
  description: string;
  /** UI range (src/lib/api/README.md: 1–20 for bans and kicks, 1–10 for deletions). */
  min: number;
  max: number;
  /** Slider unit after the (mono) number: "3 bans per minute", "1 ban per minute". */
  unit: (value: number) => string;
  /** The trigger in the rule summary: "bans", value, "members". */
  verb: string;
  object: (value: number) => string;
  icon: LucideIcon;
};

const plural = (value: number, one: string, many: string) => (value === 1 ? one : many);

export const THRESHOLDS: readonly ThresholdOption[] = [
  {
    key: "ban_threshold",
    label: "Ban limit",
    description: "Pleed steps in when one account bans this many members within a minute.",
    min: 1,
    max: 20,
    unit: (v) => `${plural(v, "ban", "bans")} per minute`,
    verb: "bans",
    object: (v) => plural(v, "member", "members"),
    icon: Gavel,
  },
  {
    key: "kick_threshold",
    label: "Kick limit",
    description: "Pleed steps in when one account kicks this many members within a minute.",
    min: 1,
    max: 20,
    unit: (v) => `${plural(v, "kick", "kicks")} per minute`,
    verb: "kicks",
    object: (v) => plural(v, "member", "members"),
    icon: UserMinus,
  },
  {
    key: "channel_delete_threshold",
    label: "Channel deletion limit",
    description: "Pleed steps in when one account deletes this many channels within a minute.",
    min: 1,
    max: 10,
    unit: (v) => `${plural(v, "channel", "channels")} per minute`,
    verb: "deletes",
    object: (v) => plural(v, "channel", "channels"),
    icon: Hash,
  },
  {
    key: "role_delete_threshold",
    label: "Role deletion limit",
    description: "Pleed steps in when one account deletes this many roles within a minute.",
    min: 1,
    max: 10,
    unit: (v) => `${plural(v, "role", "roles")} per minute`,
    verb: "deletes",
    object: (v) => plural(v, "role", "roles"),
    icon: AtSign,
  },
];

export type PunishmentOption = {
  value: SecurityPunishment;
  label: string;
  /** Plain-language consequence for the account that crossed a limit. */
  description: string;
  /** The response in the rule summary: "Pleed … bans them". */
  outcome: string;
  icon: LucideIcon;
};

export const PUNISHMENTS: readonly PunishmentOption[] = [
  {
    value: "ban",
    label: "Ban",
    description: "Removed from the server and blocked from rejoining until someone unbans them.",
    outcome: "Bans them",
    icon: Ban,
  },
  {
    value: "kick",
    label: "Kick",
    description: "Removed from the server. They can come back with a new invite.",
    outcome: "Kicks them",
    icon: LogOut,
  },
  {
    value: "quarantine",
    label: "Quarantine",
    description: "Stays in the server with every role removed, so they lose their permissions while you investigate.",
    outcome: "Removes all their roles",
    icon: UserLock,
  },
  {
    value: "alert",
    label: "Alert only",
    description: "Nothing happens to them — Pleed only logs an alert. Useful while you tune your limits.",
    outcome: "Only logs an alert",
    icon: BellRing,
  },
];

export function findPunishment(value: string): PunishmentOption | undefined {
  return PUNISHMENTS.find((option) => option.value === value);
}

/** Same keys, same values (the API's 0/1 flags and numbers compare with ===). */
export function sameConfig(a: SecurityConfig, b: SecurityConfig): boolean {
  const left = a as unknown as Record<string, unknown>;
  const right = b as unknown as Record<string, unknown>;
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (left[key] !== right[key]) return false;
  }
  return true;
}
