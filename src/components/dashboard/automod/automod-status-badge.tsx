"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useAutomodQuery } from "./automod-context";
import { activeFilters } from "./filters";

/**
 * The page header's status: what is live in the server (the saved config,
 * not the unsaved draft — the summary card previews that).
 */
export function AutomodStatusBadge() {
  const { data, status } = useAutomodQuery();
  if (!data) {
    return status === "loading" ? <Skeleton className="h-6 w-16 rounded-md" /> : null;
  }
  const on = activeFilters(data).length > 0;
  return (
    <Badge tone={on ? "success" : "neutral"} dot>
      {on ? "Active" : "Off"}
    </Badge>
  );
}
