import type { HttpMethod, PleedEndpoint } from "./types";

/**
 * - `network`: the request never got a response (tunnel offline, DNS, CORS, ...)
 * - `http`:    the API answered with a non-2xx status (see `status`)
 * - `parse`:   the response was not the JSON shape the dashboard expects
 * - `aborted`: the caller's AbortSignal cancelled the request
 * - `unknown`: anything else (should not happen; wraps the original error)
 */
export type ApiErrorKind = "network" | "http" | "parse" | "aborted" | "unknown";

export interface ApiErrorInit {
  kind: ApiErrorKind;
  endpoint?: PleedEndpoint | null;
  method?: HttpMethod | null;
  url?: string | null;
  status?: number | null;
  statusText?: string;
  /** First 500 characters of the error response body, for debugging. */
  body?: string;
  message?: string;
  cause?: unknown;
}

function defaultMessage(init: ApiErrorInit): string {
  switch (init.kind) {
    case "network":
      return "Couldn't reach the Pleed API. It may be offline or restarting.";
    case "http":
      return `The Pleed API returned an error${init.status ? ` (HTTP ${init.status})` : ""}.`;
    case "parse":
      return "The Pleed API sent a response the dashboard couldn't read.";
    case "aborted":
      return "The request was cancelled.";
    default:
      return "Something went wrong while talking to the Pleed API.";
  }
}

/** Thrown by every client function in `@/lib/api` (real API and dev mocks alike). */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly endpoint: PleedEndpoint | null;
  readonly method: HttpMethod | null;
  readonly url: string | null;
  readonly status: number | null;
  readonly statusText: string;
  readonly body: string;

  constructor(init: ApiErrorInit) {
    super(init.message ?? defaultMessage(init), init.cause === undefined ? undefined : { cause: init.cause });
    this.name = "ApiError";
    this.kind = init.kind;
    this.endpoint = init.endpoint ?? null;
    this.method = init.method ?? null;
    this.url = init.url ?? null;
    this.status = init.status ?? null;
    this.statusText = init.statusText ?? "";
    this.body = init.body ?? "";
  }

  /** True for failures where "Try again" makes sense (offline, 5xx, 408, 429). */
  get retryable(): boolean {
    if (this.kind === "network") return true;
    if (this.kind !== "http" || this.status === null) return false;
    return this.status >= 500 || this.status === 408 || this.status === 429;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** True for an ApiError of kind "aborted" or a raw DOM AbortError. */
export function isAbortError(error: unknown): boolean {
  if (error instanceof ApiError) return error.kind === "aborted";
  return error instanceof Error && error.name === "AbortError";
}

/** Normalise anything thrown into an ApiError (ApiErrors are returned as-is). */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAbortError(error)) return new ApiError({ kind: "aborted", cause: error });
  return new ApiError({
    kind: "unknown",
    message: error instanceof Error ? error.message : undefined,
    cause: error,
  });
}
