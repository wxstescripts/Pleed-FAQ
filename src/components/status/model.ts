/**
 * Status vocabulary shared by the server parts (Discord snapshot) and the
 * client islands (dashboard API check, overall banner). No runtime APIs in
 * here, so it is safe to import from both sides.
 *
 * Honesty rules for this page: every status comes from a real signal —
 * the website rendered, the dashboard API answered (or didn't) from the
 * visitor's browser, discordstatus.com said so. Nothing is invented: there is
 * no uptime percentage, no response-time history and no incident archive.
 */

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

/** Every state a row's status pill can show. */
export type ServiceStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "checking"
  | "unreachable"
  | "error"
  | "not_monitored"
  | "unknown";

export const STATUS_META: Record<ServiceStatus, { label: string; tone: Tone }> = {
  operational: { label: "Operational", tone: "success" },
  degraded: { label: "Degraded", tone: "warning" },
  partial_outage: { label: "Partial outage", tone: "warning" },
  major_outage: { label: "Major outage", tone: "danger" },
  maintenance: { label: "Maintenance", tone: "info" },
  checking: { label: "Checking…", tone: "neutral" },
  unreachable: { label: "Unreachable", tone: "danger" },
  error: { label: "Error", tone: "danger" },
  not_monitored: { label: "Not monitored", tone: "neutral" },
  unknown: { label: "Unknown", tone: "neutral" },
};

/* ------------------------------------------------------------------ */
/* Discord (Atlassian Statuspage summary)                              */
/* ------------------------------------------------------------------ */

/** Statuspage's page-wide indicator. */
export type DiscordIndicator = "none" | "minor" | "major" | "critical" | "maintenance" | "unknown";

/** Statuspage's per-component status. */
export type DiscordComponentStatus =
  | "operational"
  | "degraded_performance"
  | "partial_outage"
  | "major_outage"
  | "under_maintenance"
  | "unknown";

export function fromDiscordComponent(status: DiscordComponentStatus): ServiceStatus {
  switch (status) {
    case "operational":
      return "operational";
    case "degraded_performance":
      return "degraded";
    case "partial_outage":
      return "partial_outage";
    case "major_outage":
      return "major_outage";
    case "under_maintenance":
      return "maintenance";
    default:
      return "unknown";
  }
}

/** Pill for Discord as a whole. Statuspage words, mapped onto our tones. */
export const INDICATOR_META: Record<DiscordIndicator, { label: string; tone: Tone }> = {
  none: { label: "Operational", tone: "success" },
  minor: { label: "Minor issues", tone: "warning" },
  major: { label: "Major outage", tone: "danger" },
  critical: { label: "Critical outage", tone: "danger" },
  maintenance: { label: "Maintenance", tone: "info" },
  unknown: { label: "Unknown", tone: "neutral" },
};

/** Worse statuses sort first — used to summarise a group of components. */
const SEVERITY: Record<DiscordComponentStatus, number> = {
  major_outage: 5,
  partial_outage: 4,
  degraded_performance: 3,
  under_maintenance: 2,
  unknown: 1,
  operational: 0,
};

export function worstOf(statuses: readonly DiscordComponentStatus[]): DiscordComponentStatus {
  return statuses.reduce<DiscordComponentStatus>(
    (worst, status) => (SEVERITY[status] > SEVERITY[worst] ? status : worst),
    "operational",
  );
}

export function severityOf(status: DiscordComponentStatus): number {
  return SEVERITY[status];
}

export type DiscordComponent = { id: string; name: string; status: DiscordComponentStatus };

export type DiscordIncident = {
  id: string;
  name: string;
  /** investigating · identified · monitoring · resolved · postmortem */
  status: string;
  impact: "none" | "minor" | "major" | "critical" | "maintenance";
  url: string;
  updatedAt: string | null;
  latestUpdate: string | null;
  components: string[];
};

export type DiscordMaintenance = {
  id: string;
  name: string;
  /** scheduled · in_progress · verifying · completed */
  status: string;
  url: string;
  scheduledFor: string | null;
  scheduledUntil: string | null;
};

export type DiscordFailure = "timeout" | "network" | "http" | "parse";

export type DiscordSnapshot =
  | {
      ok: true;
      /** When discordstatus.com answered (the response's Date header). ISO string. */
      checkedAt: string;
      indicator: DiscordIndicator;
      /** Discord's own words, e.g. "All Systems Operational". */
      description: string;
      /** The components a bot depends on (Gateway, API), in that order. */
      key: DiscordComponent[];
      /** Every other top-level component (groups summarised by their worst member). */
      others: DiscordComponent[];
      incidents: DiscordIncident[];
      maintenances: DiscordMaintenance[];
    }
  | {
      ok: false;
      /** When we gave up. ISO string. */
      checkedAt: string;
      reason: DiscordFailure;
      status?: number;
    };

/** The slice of the snapshot the client banner needs (keeps the island's props tiny). */
export type DiscordOverall = { ok: true; indicator: DiscordIndicator } | { ok: false };

/* ------------------------------------------------------------------ */
/* Dashboard API check (client)                                        */
/* ------------------------------------------------------------------ */

export type ApiFailure = "network" | "http" | "parse" | "timeout" | "unknown";

export type ApiResult =
  | { kind: "up"; at: number; ms: number }
  | { kind: "down"; at: number; reason: ApiFailure; status: number | null; statusText: string };

export function apiStatus(result: ApiResult | null): ServiceStatus {
  if (!result) return "checking";
  if (result.kind === "up") return "operational";
  return result.reason === "network" || result.reason === "timeout" ? "unreachable" : "error";
}

/* ------------------------------------------------------------------ */
/* Overall verdict                                                     */
/* ------------------------------------------------------------------ */

export type Overall = {
  tone: Tone;
  /** Drives the banner icon. */
  icon: "checking" | "ok" | "warning" | "danger" | "maintenance";
  title: string;
  description: string;
};

/**
 * One sentence for the whole page, derived only from what we actually
 * checked. The bot itself has no health check, so the all-clear says
 * "everything we can check" — never "all systems operational".
 */
export function deriveOverall(discord: DiscordOverall, api: ApiResult | null): Overall {
  const discordBad = discord.ok && (discord.indicator === "major" || discord.indicator === "critical");
  const discordMinor = discord.ok && discord.indicator === "minor";
  const discordMaintenance = discord.ok && discord.indicator === "maintenance";

  if (!api) {
    return {
      tone: "neutral",
      icon: "checking",
      title: "Checking Pleed’s services…",
      description: "The website is up. Now asking the dashboard API whether it answers from your browser.",
    };
  }

  if (api.kind === "down" && discordBad) {
    return {
      tone: "danger",
      icon: "danger",
      title: "Discord and the Pleed API are both having problems",
      description:
        "Discord is reporting an outage and the dashboard API isn’t answering, so commands and the dashboard may not work until both recover.",
    };
  }

  if (api.kind === "down") {
    return {
      tone: "danger",
      icon: "danger",
      title: "The dashboard API isn’t responding",
      description: discordMinor
        ? "The dashboard can’t load or save settings right now, and Discord reports minor issues too. The bot may still be working in your server."
        : "The dashboard can’t load or save settings right now. The bot may still be working in your server — commands don’t go through this API.",
    };
  }

  if (discordBad) {
    return {
      tone: "danger",
      icon: "danger",
      title: "Discord is having a major outage",
      description:
        "Pleed’s own services are up, but Pleed runs on Discord: commands, auto-mod and logs may be slow or fail until Discord recovers. Nothing to fix on your side.",
    };
  }

  if (discordMinor) {
    return {
      tone: "warning",
      icon: "warning",
      title: "Discord reports minor issues",
      description: "Pleed’s own services are up. If commands feel slow or a reply goes missing, Discord’s issue is the likely cause.",
    };
  }

  if (discordMaintenance) {
    return {
      tone: "info",
      icon: "maintenance",
      title: "Discord is under maintenance",
      description: "Pleed’s own services are up. Some Discord features may be briefly unavailable while the maintenance runs.",
    };
  }

  if (!discord.ok) {
    return {
      tone: "success",
      icon: "ok",
      title: "Pleed’s services are up",
      description:
        "The website and the dashboard API answer normally. Discord’s own status couldn’t be loaded just now — check discordstatus.com if something feels off.",
    };
  }

  return {
    tone: "success",
    icon: "ok",
    title: "Everything we can check is working",
    description: "The website, the dashboard API and Discord all look healthy right now.",
  };
}
