"use client";

import { Gavel, MessagesSquare, Server, Users } from "lucide-react";

import { LoadingRegion } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { ErrorState } from "@/components/ui/states";
import type { PleedServer, PleedStats } from "@/lib/api";
import type { QueryResult } from "@/lib/api/hooks";

import { describeError, formatNumber } from "./format";

/**
 * Four numbers. Three come straight from GET /api/stats; the API has no
 * member total, so "Members" is the sum of the listed servers' member
 * counts and says so ("Across listed servers").
 */
export function StatsGrid({
  stats,
  servers,
}: {
  stats: QueryResult<PleedStats>;
  servers: QueryResult<PleedServer[]>;
}) {
  if (stats.status === "error" && !stats.data) {
    return (
      <ErrorState
        variant="inline"
        title="Couldn't load the stats"
        description="Server, message and action counts didn't load. This is not the same as zero."
        detail={describeError(stats.error)}
        onRetry={stats.reload}
      />
    );
  }

  const loading = !stats.data;
  const data = stats.data;

  const members = servers.data
    ? servers.data.reduce((total, server) => total + (Number.isFinite(server.members) ? server.members : 0), 0)
    : null;
  const membersLoading = !servers.data && servers.status === "loading";
  const membersHint = servers.data
    ? "Across listed servers"
    : servers.status === "error"
      ? "Servers didn't load"
      : "Across listed servers";

  const grid = (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard
        label="Servers"
        icon={Server}
        loading={loading}
        value={data ? formatNumber(data.servers) : null}
        hint="With Pleed in them"
        className="max-sm:p-4"
      />
      <StatCard
        label="Messages today"
        icon={MessagesSquare}
        loading={loading}
        value={data ? formatNumber(data.messages_today) : null}
        hint="Processed by Pleed"
        className="max-sm:p-4"
      />
      <StatCard
        label="Actions taken"
        icon={Gavel}
        loading={loading}
        value={data ? formatNumber(data.actions_taken) : null}
        hint="Bans, kicks and mutes"
        className="max-sm:p-4"
      />
      <StatCard
        label="Members"
        icon={Users}
        loading={membersLoading}
        value={members === null ? null : formatNumber(members)}
        hint={membersHint}
        className="max-sm:p-4"
      />
    </div>
  );

  return loading ? <LoadingRegion label="Loading stats">{grid}</LoadingRegion> : grid;
}
