"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import type { DiscordFailure } from "./model";
import { useStatus } from "./status-provider";

const REASONS: Record<DiscordFailure, string> = {
  timeout: "discordstatus.com didn’t answer in time.",
  network: "discordstatus.com couldn’t be reached from our server.",
  http: "discordstatus.com answered with an error.",
  parse: "discordstatus.com sent something we couldn’t read.",
};

/** Discord's status couldn't be loaded: say so, offer a retry and the source itself. */
export function DiscordError({ reason, status, href }: { reason: DiscordFailure; status?: number; href: string }) {
  const { refresh, checking } = useStatus();
  return (
    <ErrorState
      variant="inline"
      title="Couldn’t load Discord’s status"
      description={`${REASONS[reason]} This page asks again every minute — or check Discord’s own status page.`}
      detail={status ? `GET discordstatus.com/api/v2/summary.json → HTTP ${status}` : undefined}
      onRetry={refresh}
      retrying={checking}
      actions={
        <Button variant="ghost" href={href}>
          Open discordstatus.com
        </Button>
      }
    />
  );
}
