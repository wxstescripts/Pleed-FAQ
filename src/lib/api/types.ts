/**
 * Types for the Pleed Python API as the dashboard consumes it today.
 *
 * The backend source for these endpoints is not in this repo, so the shapes
 * below are taken from what the dashboard pages read and send (see README.md).
 * Fields the pages never touch are not listed; the client passes them through
 * untouched (save functions JSON.stringify the object they are given).
 */

/** Discord ID as a string (e.g. a channel or role ID). An empty string means "not set". */
export type Snowflake = string;

/** SQLite-style boolean the API uses for on/off fields: 1 = on, 0 = off. */
export type Flag = 0 | 1;

export type HttpMethod = "GET" | "POST" | "DELETE";

/** One key per API call the dashboard makes (used for errors, mocks and docs). */
export type PleedEndpoint =
  | "stats"
  | "servers"
  | "security.get"
  | "security.save"
  | "joingates.get"
  | "joingates.save"
  | "automod.get"
  | "automod.save"
  | "automations.list"
  | "automations.create"
  | "automations.delete"
  | "settings.get"
  | "settings.save";

/** Options every client function accepts. Does not change the HTTP request. */
export interface RequestOptions {
  /** Abort the request (e.g. on unmount). Rejects with ApiError kind "aborted". */
  signal?: AbortSignal;
}

/** The exact request a client function sends (also what the dev mocks receive). */
export interface PleedRequest {
  endpoint: PleedEndpoint;
  method: HttpMethod;
  url: string;
  /** Omitted entirely when today's code sends no headers. */
  headers?: Record<string, string>;
  /** Already JSON-encoded, exactly as sent. */
  body?: string;
}

// ---------------------------------------------------------------------------
// GET /api/stats  (overview)
// ---------------------------------------------------------------------------
export interface PleedStats {
  servers: number;
  messages_today: number;
  actions_taken: number;
}

// ---------------------------------------------------------------------------
// GET /api/servers  (overview)
// ---------------------------------------------------------------------------
export interface PleedServer {
  /** Snowflake; the backend may serialise it as a JSON number. */
  id: Snowflake | number;
  name: string;
  /** Free-text role label shown under the name (e.g. "Owner"). */
  role: string;
  members: number;
}

// ---------------------------------------------------------------------------
// GET/POST /api/security/{guild}
// ---------------------------------------------------------------------------
export type SecurityPunishment = "ban" | "kick" | "quarantine" | "alert";

export interface SecurityConfig {
  enabled: Flag;
  punishment: SecurityPunishment;
  /** Max bans per minute before the punishment fires (UI range 1–20). */
  ban_threshold: number;
  /** Max kicks per minute (UI range 1–20). */
  kick_threshold: number;
  /** Max channel deletions per minute (UI range 1–10). */
  channel_delete_threshold: number;
  /** Max role deletions per minute (UI range 1–10). */
  role_delete_threshold: number;
}

// ---------------------------------------------------------------------------
// GET/POST /api/joingates/{guild}
// ---------------------------------------------------------------------------
export interface JoinGatesConfig {
  enabled: Flag;
  verify_channel_id: Snowflake;
  verified_role_id: Snowflake;
  unverified_role_id: Snowflake;
  min_account_age_days: number;
  /** 0 disables auto-kick. */
  auto_kick_minutes: number;
  dm_on_join: Flag;
  log_channel_id: Snowflake;
  /** Sent and saved, but the current UI has no field for it. */
  bypass_role_id: Snowflake;
}

// ---------------------------------------------------------------------------
// GET/POST /api/automod/{guild}
// ---------------------------------------------------------------------------
export type AutomodPunishment = "delete" | "timeout" | "kick" | "ban";

export interface AutomodConfig {
  anti_links: Flag;
  anti_spam: Flag;
  anti_caps: Flag;
  anti_invites: Flag;
  /** Sent and saved, but the current UI has no toggle for it. */
  anti_mentions: Flag;
  bad_words_enabled: Flag;
  punishment: AutomodPunishment;
  /** Only used when punishment is "timeout". */
  timeout_minutes: number;
}

// ---------------------------------------------------------------------------
// GET/POST/DELETE /api/automations/{guild}
// ---------------------------------------------------------------------------
export interface Automation {
  id: number;
  trigger: string;
  payload: string;
  name?: string;
  match_type?: string;
}

/** Body of POST /api/automations/{guild}. Today the UI always sends name "" and match_type "contains". */
export interface NewAutomation {
  name: string;
  trigger: string;
  payload: string;
  match_type: string;
}

// ---------------------------------------------------------------------------
// GET/POST /api/settings/{guild}
// ---------------------------------------------------------------------------
export interface GuildSettings {
  /** Command prefix; the UI limits it to 3 characters. */
  prefix: string;
  /** Channel ID for welcome cards; may be null/empty when unset. */
  welcome_channel: Snowflake | null;
}
