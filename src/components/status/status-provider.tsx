"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { getStats, toApiError } from "@/lib/api";
import type { ApiFailure, ApiResult } from "./model";

/** Re-check while the page is open and visible. */
const AUTO_REFRESH_MS = 60_000;
/** A dashboard API that hasn't answered after this long counts as unreachable. */
const API_TIMEOUT_MS = 10_000;
/** A refresh the visitor asked for stays visibly "Checking…" at least this long (no flicker). */
const MIN_MANUAL_MS = 600;

type RefreshMode = "initial" | "auto" | "manual";

type StatusContextValue = {
  /** Latest dashboard API result; `null` until the first check finishes. */
  api: ApiResult | null;
  /** A check is running (the API request or the server refresh of Discord's status). */
  checking: boolean;
  /** Re-check everything now: the dashboard API from this browser, Discord via the server. */
  refresh: () => void;
  /** Counts finished refreshes the visitor asked for (drives the live announcement). */
  manualCompletions: number;
};

const StatusContext = createContext<StatusContextValue | null>(null);

export function useStatus(): StatusContextValue {
  const value = use(StatusContext);
  if (!value) throw new Error("useStatus() must be used inside <StatusProvider>.");
  return value;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function failureOf(kind: string): ApiFailure {
  return kind === "network" || kind === "http" || kind === "parse" ? kind : "unknown";
}

/**
 * One GET /api/stats through the shared client (dev mocks and `?mock=` apply).
 * Resolves to the result, or `null` when the controller was aborted by
 * someone else (a newer check, unmount). Never rejects.
 */
function checkDashboardApi(controller: AbortController): Promise<ApiResult | null> {
  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, API_TIMEOUT_MS);
  const started = performance.now();

  return getStats({ signal: controller.signal })
    .then(
      (): ApiResult => ({ kind: "up", at: Date.now(), ms: Math.round(performance.now() - started) }),
      (error: unknown): ApiResult | null => {
        if (timedOut) return { kind: "down", at: Date.now(), reason: "timeout", status: null, statusText: "" };
        if (controller.signal.aborted) return null;
        const apiError = toApiError(error);
        return {
          kind: "down",
          at: Date.now(),
          reason: failureOf(apiError.kind),
          status: apiError.status,
          statusText: apiError.statusText,
        };
      },
    )
    .finally(() => window.clearTimeout(timer));
}

/**
 * Owns the live checks for /status:
 * - asks the Pleed dashboard API for `/api/stats` from the visitor's browser
 *   (through the shared client, so dev mocks and `?mock=error|slow|loading`
 *   apply) — on load, every minute while visible, and on "Refresh";
 * - re-renders the server part (Discord's status, cached ≤ 60 s) with
 *   `router.refresh()` at the same moments.
 * The previous result stays on screen while a re-check runs.
 */
export function StatusProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [api, setApi] = useState<ApiResult | null>(null);
  const [apiChecking, setApiChecking] = useState(true);
  const [manualCompletions, setManualCompletions] = useState(0);
  const [serverPending, startTransition] = useTransition();

  const controllerRef = useRef<AbortController | null>(null);
  const lastRunRef = useRef(0);

  /** Starts a check (aborting any running one) and returns its controller plus the pending result. */
  const startCheck = useCallback((mode: RefreshMode) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    lastRunRef.current = Date.now();
    const result = Promise.all([checkDashboardApi(controller), mode === "manual" ? wait(MIN_MANUAL_MS) : null]).then(
      ([value]) => (controllerRef.current === controller ? value : null),
    );
    return result;
  }, []);

  const commit = useCallback((result: ApiResult | null, mode: RefreshMode) => {
    if (!result) return;
    setApi(result);
    setApiChecking(false);
    if (mode === "manual") setManualCompletions((n) => n + 1);
  }, []);

  const refreshAll = useCallback(
    (mode: RefreshMode) => {
      if (mode !== "initial") {
        setApiChecking(true);
        startTransition(() => router.refresh());
      }
      void startCheck(mode).then((result) => commit(result, mode));
    },
    [startCheck, commit, router],
  );

  // First check on mount (state starts as "checking", so nothing to set here).
  useEffect(() => {
    void startCheck("initial").then((result) => commit(result, "initial"));
    return () => controllerRef.current?.abort();
  }, [startCheck, commit]);

  // Every minute while the tab is visible; straight away when it comes back after a while.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") refreshAll("auto");
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRunRef.current >= AUTO_REFRESH_MS) {
        refreshAll("auto");
      }
    };
    const id = window.setInterval(tick, AUTO_REFRESH_MS);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshAll]);

  const refresh = useCallback(() => refreshAll("manual"), [refreshAll]);

  const value = useMemo<StatusContextValue>(
    () => ({ api, checking: apiChecking || serverPending, refresh, manualCompletions }),
    [api, apiChecking, serverPending, refresh, manualCompletions],
  );

  return <StatusContext value={value}>{children}</StatusContext>;
}
