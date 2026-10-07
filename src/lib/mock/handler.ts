/**
 * Dev-only mock API. `src/lib/api/pleed.ts` loads this module with a dynamic
 * import inside a `process.env.NODE_ENV === "development"` branch, so it is
 * never part of a production bundle.
 *
 * Answers the exact requests the client builds, with simulated latency and an
 * in-memory store (saves, creates and deletes persist until a full reload).
 */
import { ApiError } from "@/lib/api/errors";
import type { Automation, NewAutomation, PleedRequest } from "@/lib/api/types";
import { createMockDb, type MockDb, type MockDbVariant } from "./fixtures";
import { announceMockSettings, getMockSettings, MOCK_LATENCY_MS, type MockSettings } from "./settings";

export type MockOutcome = { handled: false } | { handled: true; data: unknown };

const dbs = new Map<MockDbVariant, MockDb>();

function dbFor(variant: MockDbVariant): MockDb {
  let db = dbs.get(variant);
  if (!db) {
    db = createMockDb(variant);
    dbs.set(variant, db);
  }
  return db;
}

/** Throw away in-memory edits (fixtures are recreated on next request). */
export function resetMockDb(): void {
  dbs.clear();
}

function context(req: PleedRequest) {
  return { endpoint: req.endpoint, method: req.method, url: req.url };
}

function wait(settings: MockSettings, req: PleedRequest, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer: { id?: ReturnType<typeof setTimeout> } = {};
    const onAbort = () => {
      clearTimeout(timer.id);
      reject(new ApiError({ kind: "aborted", ...context(req) }));
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
    if (settings.latency === "loading") return; // never resolves; only an abort ends it
    const [min, max] = MOCK_LATENCY_MS[settings.latency];
    timer.id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, min + Math.random() * (max - min));
  });
}

function parseBody<T>(req: PleedRequest): T {
  return JSON.parse(req.body ?? "null") as T;
}

export async function handleMockRequest(req: PleedRequest, signal?: AbortSignal): Promise<MockOutcome> {
  const settings = getMockSettings();
  announceMockSettings(settings);
  if (!settings.enabled) return { handled: false };

  await wait(settings, req, signal);

  const isWrite = req.method !== "GET";
  if (settings.data === "error") {
    throw new ApiError({
      kind: "http",
      ...context(req),
      status: 503,
      statusText: "Service Unavailable",
      body: '{"error":"Simulated outage (?mock=error)"}',
    });
  }
  if (settings.data === "savefail" && isWrite) {
    throw new ApiError({
      kind: "http",
      ...context(req),
      status: 500,
      statusText: "Internal Server Error",
      body: '{"error":"Simulated save failure (?mock=savefail)"}',
    });
  }

  const db = dbFor(settings.data === "empty" ? "empty" : "populated");
  const reply = (data: unknown): MockOutcome => ({ handled: true, data: structuredClone(data) });

  switch (req.endpoint) {
    case "stats":
      return reply(db.stats);
    case "servers":
      return reply(db.servers);
    case "security.get":
      return reply(db.security);
    case "security.save":
      db.security = parseBody(req);
      return reply(undefined);
    case "joingates.get":
      return reply(db.joingates);
    case "joingates.save":
      db.joingates = parseBody(req);
      return reply(undefined);
    case "automod.get":
      return reply(db.automod);
    case "automod.save":
      db.automod = parseBody(req);
      return reply(undefined);
    case "automations.list":
      return reply(db.automations);
    case "automations.create": {
      const input = parseBody<NewAutomation>(req);
      const id = db.automations.reduce((max, a) => Math.max(max, a.id), 0) + 1;
      const created: Automation = { id, ...input };
      db.automations = [...db.automations, created];
      return reply(undefined);
    }
    case "automations.delete": {
      const { id } = parseBody<{ id: Automation["id"] }>(req);
      db.automations = db.automations.filter((a) => a.id !== id);
      return reply(undefined);
    }
    case "settings.get":
      return reply(db.settings);
    case "settings.save":
      db.settings = parseBody(req);
      return reply(undefined);
  }
}
