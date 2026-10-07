/**
 * Small React hooks around the client functions, for client components only.
 * Import from "@/lib/api/hooks" (not re-exported from "@/lib/api" so Server
 * Components can import types and constants from the barrel).
 */
import { useCallback, useEffect, useEffectEvent, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { type ApiError, toApiError } from "./errors";
import type { RequestOptions } from "./types";

export type QueryStatus = "loading" | "success" | "error";

export interface QueryResult<T> {
  /** "loading" on first load and while `reload()` runs (data is kept during a reload). */
  status: QueryStatus;
  /** Last successfully loaded data; `undefined` until the first success. */
  data: T | undefined;
  error: ApiError | null;
  /** Re-run the request (e.g. a "Try again" button). */
  reload: () => void;
  /** Replace the local copy, e.g. with the edited config after a successful save. */
  setData: Dispatch<SetStateAction<T | undefined>>;
}

/**
 * Loads data once on mount and aborts on unmount.
 *
 * @example
 * const { status, data, error, reload } = usePleedQuery(getSecurityConfig);
 */
export function usePleedQuery<T>(fetcher: (options: RequestOptions) => Promise<T>): QueryResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [status, setStatus] = useState<QueryStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const load = useEffectEvent((signal: AbortSignal) => fetcher({ signal }));

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setError(null);
        setStatus("success");
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        setError(toApiError(err));
        setStatus("error");
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { status, data, error, reload, setData };
}

export type MutationStatus = "idle" | "pending" | "success" | "error";

export type MutationOutcome<R> = { ok: true; data: R } | { ok: false; error: ApiError };

export interface MutationResult<A extends unknown[], R> {
  /** Runs the request. Never throws: resolves to `{ ok: true, data }` or `{ ok: false, error }`. */
  mutate: (...args: A) => Promise<MutationOutcome<R>>;
  status: MutationStatus;
  error: ApiError | null;
  /** Back to "idle" (e.g. after a success message has been shown). */
  reset: () => void;
}

/**
 * Wraps a write (save / create / delete) with pending + error state.
 *
 * @example
 * const save = usePleedMutation(saveSecurityConfig);
 * const result = await save.mutate(config);
 * if (!result.ok) showError(result.error.message);
 */
export function usePleedMutation<A extends unknown[], R>(fn: (...args: A) => Promise<R>): MutationResult<A, R> {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [error, setError] = useState<ApiError | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const mutate = useCallback(async (...args: A): Promise<MutationOutcome<R>> => {
    setStatus("pending");
    setError(null);
    try {
      const data = await fnRef.current(...args);
      setStatus("success");
      return { ok: true, data };
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      setStatus("error");
      return { ok: false, error: apiError };
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { mutate, status, error, reset };
}
