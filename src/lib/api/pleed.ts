/**
 * Typed client for the Pleed Python API.
 *
 * Every function sends exactly the request the dashboard sent before this
 * client existed (same URL, method, headers and JSON body — see README.md) and
 * throws an `ApiError` on network failure, non-2xx status or an unexpected
 * response shape, so pages can render real error states.
 *
 * In development only, requests are answered by the dev mocks in
 * `src/lib/mock` (see `src/lib/dev/README.md`). Production builds never load them.
 */
import { LOCALHOSTRUN_API_BASE, LOCALTUNNEL_API_BASE, MOCK_GUILD_ID } from "./config";
import { ApiError, isAbortError } from "./errors";
import type {
  Automation,
  AutomodConfig,
  GuildSettings,
  JoinGatesConfig,
  NewAutomation,
  PleedRequest,
  PleedServer,
  PleedStats,
  RequestOptions,
  SecurityConfig,
} from "./types";

// ---------------------------------------------------------------------------
// Request core
// ---------------------------------------------------------------------------

function errorContext(req: PleedRequest) {
  return { endpoint: req.endpoint, method: req.method, url: req.url };
}

async function sendToApi(req: PleedRequest, expectBody: boolean, signal?: AbortSignal): Promise<unknown> {
  const init: RequestInit = {};
  if (req.method !== "GET") init.method = req.method;
  if (req.headers) init.headers = req.headers;
  if (req.body !== undefined) init.body = req.body;
  if (signal) init.signal = signal;

  let res: Response;
  try {
    res = await fetch(req.url, init);
  } catch (cause) {
    throw new ApiError({ kind: isAbortError(cause) ? "aborted" : "network", ...errorContext(req), cause });
  }

  if (!res.ok) {
    let body = "";
    try {
      body = (await res.text()).slice(0, 500);
    } catch {
      // ignore unreadable error bodies
    }
    throw new ApiError({ kind: "http", ...errorContext(req), status: res.status, statusText: res.statusText, body });
  }

  if (!expectBody) return undefined;
  try {
    return await res.json();
  } catch (cause) {
    throw new ApiError({ kind: isAbortError(cause) ? "aborted" : "parse", ...errorContext(req), status: res.status, cause });
  }
}

async function dispatch(req: PleedRequest, expectBody: boolean, options?: RequestOptions): Promise<unknown> {
  // Dev-only mock layer. The exact NODE_ENV comparison lets the bundler drop
  // this branch (and the mock chunk) from production builds.
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_PLEED_MOCK !== "0") {
    const { handleMockRequest } = await import("@/lib/mock/handler");
    const mocked = await handleMockRequest(req, options?.signal);
    if (mocked.handled) return mocked.data;
  }
  return sendToApi(req, expectBody, options?.signal);
}

function shapeError(req: PleedRequest, expected: string): ApiError {
  return new ApiError({
    kind: "parse",
    ...errorContext(req),
    message: `The Pleed API sent an unexpected response (expected ${expected}).`,
  });
}

async function getObject<T>(req: PleedRequest, options?: RequestOptions): Promise<T> {
  const data = await dispatch(req, true, options);
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw shapeError(req, "an object");
  return data as T;
}

async function getArray<T>(req: PleedRequest, options?: RequestOptions): Promise<T[]> {
  const data = await dispatch(req, true, options);
  if (!Array.isArray(data)) throw shapeError(req, "a list");
  return data as T[];
}

async function send(req: PleedRequest, options?: RequestOptions): Promise<void> {
  await dispatch(req, false, options);
}

// ---------------------------------------------------------------------------
// Request builders — kept identical to the original inline fetch calls.
// localtunnel requests carry Bypass-Tunnel-Reminder; localhost.run ones don't.
// ---------------------------------------------------------------------------

const LT = LOCALTUNNEL_API_BASE;
const LHR = LOCALHOSTRUN_API_BASE;

const ltGetHeaders = () => ({ "Bypass-Tunnel-Reminder": "true" });
const ltJsonHeaders = () => ({ "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" });
const lhrJsonHeaders = () => ({ "Content-Type": "application/json" });

/** Builds the exact request for each endpoint (exported for docs/tests; pages call the functions below). */
export const pleedRequests = {
  stats: (): PleedRequest => ({ endpoint: "stats", method: "GET", url: `${LT}/api/stats`, headers: ltGetHeaders() }),
  servers: (): PleedRequest => ({ endpoint: "servers", method: "GET", url: `${LT}/api/servers`, headers: ltGetHeaders() }),

  securityGet: (): PleedRequest => ({
    endpoint: "security.get",
    method: "GET",
    url: `${LT}/api/security/${MOCK_GUILD_ID}`,
    headers: ltGetHeaders(),
  }),
  securitySave: (config: SecurityConfig): PleedRequest => ({
    endpoint: "security.save",
    method: "POST",
    url: `${LT}/api/security/${MOCK_GUILD_ID}`,
    headers: ltJsonHeaders(),
    body: JSON.stringify(config),
  }),

  joinGatesGet: (): PleedRequest => ({
    endpoint: "joingates.get",
    method: "GET",
    url: `${LT}/api/joingates/${MOCK_GUILD_ID}`,
    headers: ltGetHeaders(),
  }),
  joinGatesSave: (config: JoinGatesConfig): PleedRequest => ({
    endpoint: "joingates.save",
    method: "POST",
    url: `${LT}/api/joingates/${MOCK_GUILD_ID}`,
    headers: ltJsonHeaders(),
    body: JSON.stringify(config),
  }),

  automodGet: (): PleedRequest => ({ endpoint: "automod.get", method: "GET", url: `${LHR}/api/automod/${MOCK_GUILD_ID}` }),
  automodSave: (config: AutomodConfig): PleedRequest => ({
    endpoint: "automod.save",
    method: "POST",
    url: `${LHR}/api/automod/${MOCK_GUILD_ID}`,
    headers: lhrJsonHeaders(),
    body: JSON.stringify(config),
  }),

  automationsList: (): PleedRequest => ({
    endpoint: "automations.list",
    method: "GET",
    url: `${LHR}/api/automations/${MOCK_GUILD_ID}`,
  }),
  automationsCreate: (automation: NewAutomation): PleedRequest => ({
    endpoint: "automations.create",
    method: "POST",
    url: `${LHR}/api/automations/${MOCK_GUILD_ID}`,
    headers: lhrJsonHeaders(),
    body: JSON.stringify(automation),
  }),
  automationsDelete: (id: Automation["id"]): PleedRequest => ({
    endpoint: "automations.delete",
    method: "DELETE",
    url: `${LHR}/api/automations/${MOCK_GUILD_ID}`,
    headers: lhrJsonHeaders(),
    body: JSON.stringify({ id }),
  }),

  settingsGet: (): PleedRequest => ({ endpoint: "settings.get", method: "GET", url: `${LHR}/api/settings/${MOCK_GUILD_ID}` }),
  settingsSave: (settings: GuildSettings): PleedRequest => ({
    endpoint: "settings.save",
    method: "POST",
    url: `${LHR}/api/settings/${MOCK_GUILD_ID}`,
    headers: lhrJsonHeaders(),
    body: JSON.stringify(settings),
  }),
};

// ---------------------------------------------------------------------------
// Public client functions
// ---------------------------------------------------------------------------

/** GET /api/stats — overview counters. */
export function getStats(options?: RequestOptions): Promise<PleedStats> {
  return getObject<PleedStats>(pleedRequests.stats(), options);
}

/** GET /api/servers — servers listed on the overview. */
export function getServers(options?: RequestOptions): Promise<PleedServer[]> {
  return getArray<PleedServer>(pleedRequests.servers(), options);
}

/** GET /api/security/{MOCK_GUILD_ID} — anti-nuke config. */
export function getSecurityConfig(options?: RequestOptions): Promise<SecurityConfig> {
  return getObject<SecurityConfig>(pleedRequests.securityGet(), options);
}

/** POST /api/security/{MOCK_GUILD_ID} — sends the whole config object as JSON. */
export function saveSecurityConfig(config: SecurityConfig, options?: RequestOptions): Promise<void> {
  return send(pleedRequests.securitySave(config), options);
}

/** GET /api/joingates/{MOCK_GUILD_ID} — verification gate config. */
export function getJoinGatesConfig(options?: RequestOptions): Promise<JoinGatesConfig> {
  return getObject<JoinGatesConfig>(pleedRequests.joinGatesGet(), options);
}

/** POST /api/joingates/{MOCK_GUILD_ID} — sends the whole config object as JSON. */
export function saveJoinGatesConfig(config: JoinGatesConfig, options?: RequestOptions): Promise<void> {
  return send(pleedRequests.joinGatesSave(config), options);
}

/** GET /api/automod/{MOCK_GUILD_ID} — auto-moderation config. */
export function getAutomodConfig(options?: RequestOptions): Promise<AutomodConfig> {
  return getObject<AutomodConfig>(pleedRequests.automodGet(), options);
}

/** POST /api/automod/{MOCK_GUILD_ID} — sends the whole config object as JSON. */
export function saveAutomodConfig(config: AutomodConfig, options?: RequestOptions): Promise<void> {
  return send(pleedRequests.automodSave(config), options);
}

/** GET /api/automations/{MOCK_GUILD_ID} — auto-responder list. */
export function getAutomations(options?: RequestOptions): Promise<Automation[]> {
  return getArray<Automation>(pleedRequests.automationsList(), options);
}

/**
 * POST /api/automations/{MOCK_GUILD_ID} — creates an auto-responder.
 * Body is `{ name, trigger, payload, match_type }` in that order; `name`
 * defaults to "" and `match_type` to "contains", as the UI sends today.
 */
export function createAutomation(
  input: Pick<NewAutomation, "trigger" | "payload"> & Partial<Pick<NewAutomation, "name" | "match_type">>,
  options?: RequestOptions,
): Promise<void> {
  const body: NewAutomation = {
    name: input.name ?? "",
    trigger: input.trigger,
    payload: input.payload,
    match_type: input.match_type ?? "contains",
  };
  return send(pleedRequests.automationsCreate(body), options);
}

/** DELETE /api/automations/{MOCK_GUILD_ID} with body `{ id }`. */
export function deleteAutomation(id: Automation["id"], options?: RequestOptions): Promise<void> {
  return send(pleedRequests.automationsDelete(id), options);
}

/** GET /api/settings/{MOCK_GUILD_ID} — prefix and welcome channel. */
export function getSettings(options?: RequestOptions): Promise<GuildSettings> {
  return getObject<GuildSettings>(pleedRequests.settingsGet(), options);
}

/** POST /api/settings/{MOCK_GUILD_ID} — sends the whole settings object as JSON. */
export function saveSettings(settings: GuildSettings, options?: RequestOptions): Promise<void> {
  return send(pleedRequests.settingsSave(settings), options);
}
