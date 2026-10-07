import type { ApiError } from "@/lib/api";

/** Thousands separators that don't change with the browser locale ("1,234" everywhere). */
export const formatNumber = new Intl.NumberFormat("en-US").format;

/** "GET /api/stats → HTTP 503" — the technical line under an error. */
export function describeError(error: ApiError | null): string | undefined {
  if (!error) return undefined;
  let path = error.url ?? "";
  try {
    if (error.url) path = new URL(error.url).pathname;
  } catch {
    // keep the raw URL
  }
  const outcome = error.status ? `HTTP ${error.status}` : error.kind;
  return error.method && path ? `${error.method} ${path} → ${outcome}` : error.message;
}
