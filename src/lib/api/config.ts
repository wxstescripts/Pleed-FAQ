/**
 * API hosts and the guild ID used by the dashboard today.
 * These values are part of the API contract — do not change them here unless
 * the backend itself moves. See README.md for the full request inventory.
 */

/**
 * The one guild every dashboard page reads and writes. There is no guild
 * selector yet, so this is deliberately not a parameter of the client functions.
 */
export const MOCK_GUILD_ID = "1484703029243416757";

function baseUrl(override: string | undefined, fallback: string): string {
  return (override || fallback).replace(/\/+$/, "");
}

/**
 * localtunnel host — overview (stats, servers), security, join gates.
 * Every request to this host sends `Bypass-Tunnel-Reminder: true`.
 * Optional override: NEXT_PUBLIC_PLEED_API_LOCALTUNNEL_URL (unset = today's URL).
 */
export const LOCALTUNNEL_API_BASE = baseUrl(
  process.env.NEXT_PUBLIC_PLEED_API_URL,
  "https://purple-windows-report.loca.lt",
);

/**
 * localhost.run host — automod, automations, settings.
 * Requests to this host do NOT send `Bypass-Tunnel-Reminder`.
 * Optional override: NEXT_PUBLIC_PLEED_API_LHR_URL (unset = today's URL).
 */
export const LOCALHOSTRUN_API_BASE = baseUrl(
  process.env.NEXT_PUBLIC_PLEED_API_URL,
  "https://1b166fb77d23d0.lhr.life",
);

