"use client";

import { createContext, use, type ReactNode } from "react";

import { getAutomodConfig, type AutomodConfig } from "@/lib/api";
import { usePleedQuery, type QueryResult } from "@/lib/api/hooks";

const AutomodQueryContext = createContext<QueryResult<AutomodConfig> | null>(null);

/**
 * Loads the automod config once for the page, so the server-rendered page
 * header (its status badge) and the editor share one request. Renders no DOM:
 * the editor's SaveBar stays the last child of the page Container.
 */
export function AutomodProvider({ children }: { children: ReactNode }) {
  const query = usePleedQuery(getAutomodConfig);
  return <AutomodQueryContext value={query}>{children}</AutomodQueryContext>;
}

export function useAutomodQuery(): QueryResult<AutomodConfig> {
  const query = use(AutomodQueryContext);
  if (!query) throw new Error("useAutomodQuery must be used inside <AutomodProvider>.");
  return query;
}
