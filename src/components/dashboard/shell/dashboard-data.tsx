"use client";

import { createContext, use, type ReactNode } from "react";

import { getServers, MOCK_GUILD_ID, type PleedServer } from "@/lib/api";
import { usePleedQuery, type QueryResult } from "@/lib/api/hooks";

/**
 * Data the shell and the overview share, loaded once per dashboard visit
 * (the layout persists across client navigations): the servers list feeds
 * both the sidebar's server indicator and the overview's server cards, so
 * the overview doesn't send a second GET /api/servers.
 */
const ServersContext = createContext<QueryResult<PleedServer[]> | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const servers = usePleedQuery(getServers);
  return <ServersContext value={servers}>{children}</ServersContext>;
}

export function useServersQuery(): QueryResult<PleedServer[]> {
  const servers = use(ServersContext);
  if (!servers) throw new Error("useServersQuery must be used inside <DashboardDataProvider>.");
  return servers;
}

/** True when a server from the API is the one every settings page edits. */
export function isManagedServer(server: Pick<PleedServer, "id">): boolean {
  return String(server.id) === MOCK_GUILD_ID;
}

/**
 * The server every dashboard page reads and writes. The API has no guild
 * selector: all settings endpoints use `MOCK_GUILD_ID`. Its name is only
 * known when /api/servers lists that ID.
 */
export function useManagedServer(): { id: string; name: string | null; status: QueryResult<PleedServer[]>["status"] } {
  const { data, status } = useServersQuery();
  const match = data?.find(isManagedServer);
  const name = typeof match?.name === "string" && match.name.trim() ? match.name.trim() : null;
  return { id: MOCK_GUILD_ID, name, status };
}
