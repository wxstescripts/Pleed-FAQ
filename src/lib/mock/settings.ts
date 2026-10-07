/**
 * Dev-mock review switches, read from `?mock=` and remembered for the tab in
 * sessionStorage so client-side navigation keeps them. Development only —
 * nothing in here is reachable from production code paths.
 *
 *   ?mock=empty            API returns a fresh server: no servers/automations, everything off
 *   ?mock=error            every API call fails (HTTP 503)
 *   ?mock=savefail         reads work, every save/create/delete fails (HTTP 500)
 *   ?mock=slow             API calls take ~5s, the session ~1.5s
 *   ?mock=loading          API calls never resolve (loading skeletons)
 *   ?mock=signedout        mock session is signed out (login gate)
 *   ?mock=sessionloading   mock session never resolves ("checking session" state)
 *   ?mock=off              no mocks: real Pleed API and real NextAuth session
 *   ?mock=reset            back to the defaults (also ?mock=on or ?mock=)
 *
 * Switches combine with commas: ?mock=empty,slow
 */

export type MockDataMode = "default" | "empty" | "error" | "savefail";
export type MockLatency = "normal" | "slow" | "loading";
export type MockSessionMode = "authenticated" | "signedout" | "loading";

export interface MockSettings {
  /** false = `?mock=off`: real API and real session. */
  readonly enabled: boolean;
  readonly data: MockDataMode;
  readonly latency: MockLatency;
  readonly session: MockSessionMode;
  /** Normalised switch string, e.g. "empty,slow" ("" = defaults, "off" = disabled). */
  readonly key: string;
}

export const MOCK_QUERY_PARAM = "mock";
export const MOCK_STORAGE_KEY = "pleed:mock";

/** Latency ranges in ms. */
export const MOCK_LATENCY_MS = {
  normal: [400, 700],
  slow: [4500, 5500],
} as const;
export const MOCK_SLOW_SESSION_MS = 1500;

const warned = new Set<string>();

export function parseMockSwitches(raw: string): MockSettings {
  let enabled = true;
  let data: MockDataMode = "default";
  let latency: MockLatency = "normal";
  let session: MockSessionMode = "authenticated";

  for (const token of raw.toLowerCase().split(/[\s,+|]+/).filter(Boolean)) {
    switch (token) {
      case "off":
        enabled = false;
        break;
      case "on":
      case "default":
      case "reset":
      case "clear":
        break;
      case "empty":
      case "error":
      case "savefail":
        data = token;
        break;
      case "slow":
      case "loading":
        latency = token;
        break;
      case "signedout":
      case "signed-out":
      case "loggedout":
        session = "signedout";
        break;
      case "sessionloading":
        session = "loading";
        break;
      default:
        if (!warned.has(token)) {
          warned.add(token);
          console.warn(`[pleed mock] Unknown ?mock switch "${token}" ignored. See src/lib/dev/README.md.`);
        }
    }
  }

  if (!enabled) return { enabled, data: "default", latency: "normal", session: "authenticated", key: "off" };

  const parts: string[] = [];
  if (data !== "default") parts.push(data);
  if (latency !== "normal") parts.push(latency);
  if (session === "signedout") parts.push("signedout");
  if (session === "loading") parts.push("sessionloading");
  return { enabled, data, latency, session, key: parts.join(",") };
}

const cache = new Map<string, MockSettings>();

function settingsFor(raw: string): MockSettings {
  let settings = cache.get(raw);
  if (!settings) {
    settings = parseMockSwitches(raw);
    cache.set(raw, settings);
  }
  return settings;
}

function readStored(): string {
  try {
    return window.sessionStorage.getItem(MOCK_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function persist(key: string): void {
  try {
    if (readStored() === key) return;
    if (key) window.sessionStorage.setItem(MOCK_STORAGE_KEY, key);
    else window.sessionStorage.removeItem(MOCK_STORAGE_KEY);
  } catch {
    // storage unavailable (private mode etc.) — the URL switch still applies to this page
  }
}

/**
 * Current switches: `?mock=` in the URL wins (and is remembered for the tab),
 * otherwise the remembered value, otherwise defaults. Returns a cached object,
 * so it is safe to use as a useSyncExternalStore snapshot.
 */
export function getMockSettings(): MockSettings {
  if (typeof window === "undefined") return settingsFor("");
  const fromUrl = new URLSearchParams(window.location.search).get(MOCK_QUERY_PARAM);
  if (fromUrl !== null) {
    const settings = settingsFor(fromUrl);
    persist(settings.key);
    return settings;
  }
  return settingsFor(readStored());
}

let announced: string | null = null;

/** Logs (once per mode) that mocks are active, so nobody mistakes mock data for real data. */
export function announceMockSettings(settings: MockSettings): void {
  if (announced === settings.key) return;
  announced = settings.key;
  if (!settings.enabled) {
    console.info("[pleed mock] Mocks are OFF for this tab (?mock=off): using the real Pleed API and NextAuth session.");
    return;
  }
  console.info(
    `[pleed mock] Dev mock API + session active (mode: ${settings.key || "default"}). ` +
      "Switch with ?mock=empty|error|savefail|slow|loading|signedout|sessionloading|off|reset — see src/lib/dev/README.md.",
  );
}
