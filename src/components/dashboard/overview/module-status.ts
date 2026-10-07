import { flagOn } from "@/lib/api";
import type {
  Automation,
  AutomodConfig,
  AutomodPunishment,
  GuildSettings,
  JoinGatesConfig,
  SecurityConfig,
  SecurityPunishment,
} from "@/lib/api";

/**
 * Plain-language status lines for the overview's module cards, derived only
 * from what the settings endpoints return (never assumed).
 */
export type ModuleSummary = {
  /** Badge text. */
  badge: string;
  /** "on" → success badge, "off" → neutral, "info" → neutral without a dot. */
  state: "on" | "off" | "info";
  /** One short line under the card. */
  detail: string;
};

const SECURITY_PUNISHMENT: Record<SecurityPunishment, string> = {
  ban: "Ban",
  kick: "Kick",
  quarantine: "Quarantine",
  alert: "Alert only",
};

const AUTOMOD_PUNISHMENT: Record<AutomodPunishment, string> = {
  delete: "Delete message",
  timeout: "Timeout",
  kick: "Kick",
  ban: "Ban",
};

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export function summarizeSecurity(config: SecurityConfig): ModuleSummary {
  if (!flagOn(config.enabled)) {
    return { badge: "Off", state: "off", detail: "Mass bans, kicks and deletions aren't watched" };
  }
  const punishment = SECURITY_PUNISHMENT[config.punishment] ?? config.punishment;
  return {
    badge: "On",
    state: "on",
    detail: `${punishment} at ${plural(config.ban_threshold, "ban")} or ${plural(config.kick_threshold, "kick")} a minute`,
  };
}

export function summarizeJoinGates(config: JoinGatesConfig): ModuleSummary {
  if (!flagOn(config.enabled)) {
    return { badge: "Off", state: "off", detail: "New members join without verification" };
  }
  const age =
    config.min_account_age_days > 0
      ? `${config.min_account_age_days}-day minimum account age`
      : "No minimum account age";
  const kick = config.auto_kick_minutes > 0 ? `auto-kick after ${config.auto_kick_minutes} min` : "no auto-kick";
  return { badge: "On", state: "on", detail: `${age} · ${kick}` };
}

const AUTOMOD_FILTERS = [
  "anti_links",
  "anti_spam",
  "anti_caps",
  "anti_invites",
  "anti_mentions",
  "bad_words_enabled",
] as const satisfies readonly (keyof AutomodConfig)[];

export function summarizeAutomod(config: AutomodConfig): ModuleSummary {
  const on = AUTOMOD_FILTERS.filter((key) => flagOn(config[key])).length;
  if (on === 0) return { badge: "Off", state: "off", detail: "No filters on" };
  const punishment = AUTOMOD_PUNISHMENT[config.punishment] ?? config.punishment;
  const withDuration =
    config.punishment === "timeout" && config.timeout_minutes > 0
      ? `${punishment}, ${config.timeout_minutes} min`
      : punishment;
  return { badge: `${on} on`, state: "on", detail: `${plural(on, "filter")} on · ${withDuration}` };
}

export function summarizeAutomations(list: Automation[]): ModuleSummary {
  if (list.length === 0) return { badge: "None", state: "off", detail: "No auto-responders yet" };
  const triggers = list
    .map((item) => item.trigger?.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((trigger) => `“${trigger}”`);
  const more = list.length - triggers.length;
  return {
    badge: plural(list.length, "responder"),
    state: "info",
    detail: `Replies to ${triggers.join(", ")}${more > 0 ? ` +${more} more` : ""}`,
  };
}

export function summarizeSettings(settings: GuildSettings): ModuleSummary {
  const prefix = settings.prefix?.trim();
  return {
    badge: prefix ? `Prefix ${prefix}` : "No prefix",
    state: "info",
    detail: settings.welcome_channel ? "Welcome channel set" : "No welcome channel",
  };
}
