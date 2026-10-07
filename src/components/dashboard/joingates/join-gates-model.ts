import { flagOn, type JoinGatesConfig } from "@/lib/api";
import { isSnowflake } from "@/components/ui/snowflake-input";

/**
 * The editable copy of the join gate config. Same object (and key order) as
 * the API's, except that a number field may be `null` while someone has
 * cleared it to type a new value. `toSaveBody` turns it back into exactly
 * the shape the API sent.
 */
export type JoinGatesDraft = Omit<JoinGatesConfig, "min_account_age_days" | "auto_kick_minutes"> & {
  min_account_age_days: number | null;
  auto_kick_minutes: number | null;
};

export type IdField = "verify_channel_id" | "unverified_role_id" | "verified_role_id" | "bypass_role_id" | "log_channel_id";

/** Every Discord ID on the page, in the order the fields appear. */
export const ID_FIELDS: readonly IdField[] = [
  "verify_channel_id",
  "unverified_role_id",
  "verified_role_id",
  "bypass_role_id",
  "log_channel_id",
];

/** What the gate can't work without: somewhere to verify, a role to hold members back, a role to let them in. */
export const REQUIRED_FIELDS = ["verify_channel_id", "unverified_role_id", "verified_role_id"] as const satisfies readonly IdField[];

export const FIELD_NAMES: Record<IdField, string> = {
  verify_channel_id: "verification channel",
  unverified_role_id: "unverified role",
  verified_role_id: "verified role",
  bypass_role_id: "bypass role",
  log_channel_id: "log channel",
};

/** A cleared number field means "off" (0) for both settings. Decimals round to whole days / minutes. */
export function wholeNumber(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

/** The POST body: the whole loaded object with the edits — same keys, same order, 0/1 flags. */
export function toSaveBody(draft: JoinGatesDraft): JoinGatesConfig {
  return {
    ...draft,
    min_account_age_days: wholeNumber(draft.min_account_age_days),
    auto_kick_minutes: wholeNumber(draft.auto_kick_minutes),
  };
}

/** True when saving `draft` would change nothing on the server. */
export function sameConfig(draft: JoinGatesDraft, saved: JoinGatesConfig): boolean {
  return (
    draft.enabled === saved.enabled &&
    draft.dm_on_join === saved.dm_on_join &&
    wholeNumber(draft.min_account_age_days) === saved.min_account_age_days &&
    wholeNumber(draft.auto_kick_minutes) === saved.auto_kick_minutes &&
    ID_FIELDS.every((field) => draft[field] === saved[field])
  );
}

/** IDs that are filled in but aren't a 17–20 digit snowflake (they would be rejected by Discord). */
export function invalidIdFields(config: Pick<JoinGatesConfig, IdField>): IdField[] {
  return ID_FIELDS.filter((field) => config[field] !== "" && !isSnowflake(config[field]));
}

/** Required IDs that are still empty. */
export function missingRequired(config: Pick<JoinGatesConfig, IdField>): IdField[] {
  return REQUIRED_FIELDS.filter((field) => config[field] === "");
}

/** A server where nothing about the join gate has been set up yet (what `?mock=empty` returns). */
export function isUnconfigured(config: JoinGatesConfig): boolean {
  return (
    !flagOn(config.enabled) &&
    !flagOn(config.dm_on_join) &&
    config.min_account_age_days === 0 &&
    config.auto_kick_minutes === 0 &&
    ID_FIELDS.every((field) => config[field] === "")
  );
}

export type GateStatus = "on" | "incomplete" | "off";

export function gateStatus(config: JoinGatesConfig): GateStatus {
  if (!flagOn(config.enabled)) return "off";
  return missingRequired(config).length > 0 ? "incomplete" : "on";
}

/** "verification channel, unverified role and verified role" */
export function listFields(fields: readonly IdField[]): string {
  const names = fields.map((field) => FIELD_NAMES[field]);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const UNITS = [
  { minutes: 60 * 24, one: "day", many: "days" },
  { minutes: 60, one: "hour", many: "hours" },
  { minutes: 1, one: "minute", many: "minutes" },
] as const;

/**
 * Minutes in words, at most two units: 90 → "1 hour 30 minutes",
 * 1440 → "1 day", 1530 → "about 1 day 1 hour" (when a remainder is dropped).
 */
export function describeMinutes(total: number): string {
  let rest = Math.round(total);
  const parts: string[] = [];
  for (const unit of UNITS) {
    const count = Math.floor(rest / unit.minutes);
    if (count > 0 && parts.length < 2) {
      parts.push(`${count.toLocaleString("en-US")} ${count === 1 ? unit.one : unit.many}`);
      rest -= count * unit.minutes;
    }
  }
  return `${rest > 0 ? "about " : ""}${parts.join(" ")}`;
}
