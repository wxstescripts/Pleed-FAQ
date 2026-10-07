"use client";

import { Server } from "lucide-react";

import { ComponentRow } from "./component-row";
import { LocalTime } from "./local-time";
import { apiStatus, type ApiResult } from "./model";
import { useStatus } from "./status-provider";
import { StatusPill } from "./status-pill";

function outcome(result: ApiResult): string {
  if (result.kind === "up") return `Answered your browser in ${result.ms.toLocaleString()} ms`;
  switch (result.reason) {
    case "timeout":
      return "No answer within 10 seconds";
    case "network":
      return "No answer — it may be offline or restarting";
    case "http":
      return `Answered with HTTP ${result.status ?? "error"}${result.statusText ? ` ${result.statusText}` : ""}`;
    case "parse":
      return "Answered with something the dashboard can’t read";
    default:
      return "The check failed unexpectedly";
  }
}

/** The dashboard API, checked live from the visitor's browser (GET /api/stats). */
export function ApiRow() {
  const { api } = useStatus();
  return (
    <ComponentRow
      icon={Server}
      name="Dashboard API"
      description="Loads and saves your server’s settings in the web dashboard."
      status={<StatusPill status={apiStatus(api)} />}
      meta={
        api ? (
          <>
            {outcome(api)} · checked <LocalTime value={api.at} />
          </>
        ) : (
          "Asking it for its public stats from your browser…"
        )
      }
    />
  );
}

/** Pleed as a whole: the website is up (you're reading it), so it hinges on the API. */
export function PleedSummaryPill() {
  const { api } = useStatus();
  const status = apiStatus(api);
  return <StatusPill status={status === "operational" || status === "checking" ? status : "partial_outage"} />;
}
