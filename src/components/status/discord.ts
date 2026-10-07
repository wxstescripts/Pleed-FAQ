/**
 * Discord's platform status, read server-side from the public Statuspage API
 * (https://discordstatus.com/api/v2/summary.json — CORS-open, no key).
 *
 * Caching (Next 16, previous caching model — `cacheComponents` is off): the
 * fetch is cached in the Data Cache for 60 s (`next.revalidate`), which also
 * makes /status an ISR page that regenerates at most once a minute. The
 * response's `Date` header is stored with the cached entry, so `checkedAt`
 * is when discordstatus.com actually answered, not when the page rendered.
 *
 * Never throws: a timeout, network error, non-2xx or unexpected JSON becomes
 * `{ ok: false }` and the page renders an honest "couldn't load" state.
 * Import from Server Components only.
 */
import {
  worstOf,
  type DiscordComponent,
  type DiscordComponentStatus,
  type DiscordFailure,
  type DiscordIncident,
  type DiscordIndicator,
  type DiscordMaintenance,
  type DiscordSnapshot,
} from "./model";

export const DISCORD_STATUS_URL = "https://discordstatus.com";
const SUMMARY_URL = `${DISCORD_STATUS_URL}/api/v2/summary.json`;

/** Seconds a Discord answer is reused (Data Cache + ISR window). */
export const DISCORD_REVALIDATE_SECONDS = 60;
/** Give up on discordstatus.com after this long; the page shows "couldn't load". */
const TIMEOUT_MS = 6000;

/** The components a Discord bot actually depends on, in display order. */
const KEY_COMPONENTS = ["Gateway", "API"] as const;

export async function getDiscordStatus(): Promise<DiscordSnapshot> {
  let res: Response;
  try {
    res = await fetch(SUMMARY_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: DISCORD_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return failure(timedOut ? "timeout" : "network");
  }

  if (!res.ok) return failure("http", res.status);

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return failure("parse");
  }

  return parseSummary(json, checkedAtFrom(res)) ?? failure("parse");
}

function failure(reason: DiscordFailure, status?: number): DiscordSnapshot {
  return { ok: false, checkedAt: new Date().toISOString(), reason, ...(status ? { status } : {}) };
}

function checkedAtFrom(res: Response): string {
  const header = res.headers.get("date");
  const date = header ? new Date(header) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

/* ------------------------------------------------------------------ */
/* Defensive parsing — this is third-party JSON.                       */
/* ------------------------------------------------------------------ */

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function records(value: unknown): Json[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

/** Only https links from the feed are rendered (never javascript:, data: …). */
function safeUrl(value: unknown): string | null {
  const url = str(value);
  if (!url) return null;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function isoOrNull(value: unknown): string | null {
  const raw = str(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const INDICATORS: readonly DiscordIndicator[] = ["none", "minor", "major", "critical", "maintenance"];
const COMPONENT_STATUSES: readonly DiscordComponentStatus[] = [
  "operational",
  "degraded_performance",
  "partial_outage",
  "major_outage",
  "under_maintenance",
];
const IMPACTS: readonly DiscordIncident["impact"][] = ["none", "minor", "major", "critical", "maintenance"];

function indicatorOf(value: unknown): DiscordIndicator {
  return INDICATORS.find((i) => i === value) ?? "unknown";
}

function componentStatusOf(value: unknown): DiscordComponentStatus {
  return COMPONENT_STATUSES.find((s) => s === value) ?? "unknown";
}

function parseSummary(json: unknown, checkedAt: string): DiscordSnapshot | null {
  if (!isRecord(json) || !isRecord(json.status) || !Array.isArray(json.components)) return null;

  const all = records(json.components);
  const byId = new Map(all.map((c) => [str(c.id), c]));

  // Top-level entries only: standalone components and groups (a group is
  // summarised by its worst member, e.g. one degraded voice region).
  const topLevel: DiscordComponent[] = all
    .filter((c) => !str(c.group_id))
    .map((c) => {
      const name = str(c.name) ?? "Unnamed component";
      const own = componentStatusOf(c.status);
      const children = Array.isArray(c.components)
        ? c.components.map((id) => componentStatusOf(byId.get(str(id))?.status))
        : [];
      return { id: str(c.id) ?? name, name, status: c.group === true ? worstOf([own, ...children]) : own };
    });

  const key = KEY_COMPONENTS.map((name) => topLevel.find((c) => c.name === name)).filter(
    (c): c is DiscordComponent => Boolean(c),
  );
  const keyIds = new Set(key.map((c) => c.id));
  const others = topLevel.filter((c) => !keyIds.has(c.id));

  const pageUrl = (isRecord(json.page) && safeUrl(json.page.url)) || DISCORD_STATUS_URL;

  const incidents: DiscordIncident[] = records(json.incidents)
    .map((incident) => {
      const id = str(incident.id) ?? "";
      const updates = records(incident.incident_updates);
      const latest = updates[0];
      return {
        id,
        name: str(incident.name) ?? "Unnamed incident",
        status: str(incident.status) ?? "investigating",
        impact: IMPACTS.find((i) => i === incident.impact) ?? "none",
        url: safeUrl(incident.shortlink) ?? (id ? `${pageUrl}/incidents/${encodeURIComponent(id)}` : pageUrl),
        updatedAt: isoOrNull(latest?.display_at ?? latest?.created_at ?? incident.updated_at),
        latestUpdate: str(latest?.body),
        components: records(incident.components)
          .map((c) => str(c.name))
          .filter((n): n is string => Boolean(n)),
      };
    })
    .slice(0, 4);

  const maintenances: DiscordMaintenance[] = records(json.scheduled_maintenances)
    .map((m) => {
      const id = str(m.id) ?? "";
      return {
        id,
        name: str(m.name) ?? "Scheduled maintenance",
        status: str(m.status) ?? "scheduled",
        url: safeUrl(m.shortlink) ?? (id ? `${pageUrl}/incidents/${encodeURIComponent(id)}` : pageUrl),
        scheduledFor: isoOrNull(m.scheduled_for),
        scheduledUntil: isoOrNull(m.scheduled_until),
      };
    })
    .filter((m) => m.status !== "completed")
    .slice(0, 3);

  return {
    ok: true,
    checkedAt,
    indicator: indicatorOf(json.status.indicator),
    description: str(json.status.description) ?? "",
    key,
    others,
    incidents,
    maintenances,
  };
}
