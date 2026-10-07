"use client";

import { ArrowUpRight, BookOpen, Plus, ServerOff } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { IconTile } from "@/components/ui/icon-tile";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import type { PleedServer } from "@/lib/api";
import type { QueryResult } from "@/lib/api/hooks";
import { INVITE_URL } from "@/lib/site";

import { isManagedServer } from "../shell/dashboard-data";
import { describeError, formatNumber } from "./format";

const GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4";

/**
 * The servers Pleed is in (GET /api/servers). Cards are information, not
 * links — the API edits one fixed server, so a card can't open "its"
 * settings. The server the dashboard edits is marked when the API lists it.
 */
export function ServerGrid({ servers }: { servers: QueryResult<PleedServer[]> }) {
  if (servers.status === "error" && !servers.data) {
    return (
      <ErrorState
        headingAs="h3"
        title="Couldn't load your servers"
        description="The server list didn't load. That doesn't mean Pleed has left them."
        detail={describeError(servers.error)}
        onRetry={servers.reload}
      />
    );
  }

  if (!servers.data) {
    return (
      <LoadingRegion label="Loading servers">
        <div aria-hidden="true" className={GRID}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-4 rounded-xl border border-line bg-surface-1 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </LoadingRegion>
    );
  }

  if (servers.data.length === 0) {
    return (
      <EmptyState
        icon={ServerOff}
        title="Pleed isn't in any servers yet"
        description="Add Pleed to a server you manage. It shows up here once it has joined, and the modules above start working there."
        actions={
          <>
            <Button variant="discord" href={INVITE_URL}>
              <DiscordIcon className="size-4" />
              Add to Discord
            </Button>
            <Button variant="ghost" href="/docs">
              <BookOpen aria-hidden="true" />
              Read the setup guide
            </Button>
          </>
        }
      />
    );
  }

  return (
    <ul className={GRID}>
      {servers.data.map((server, index) => (
        <li key={`${String(server.id)}-${index}`} className="flex min-w-0">
          <ServerCard server={server} />
        </li>
      ))}
      <li className="flex min-w-0">
        <Card
          href={INVITE_URL}
          variant="outline"
          className="group/invite w-full flex-row items-center gap-4 border-dashed border-line-strong"
        >
          <IconTile icon={Plus} />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="type-label text-fg">Add Pleed to another server</span>
            <span className="type-caption text-fg-tertiary">Opens Discord to pick a server you manage.</span>
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 shrink-0 text-fg-tertiary transition-transform duration-200 ease-standard group-hover/invite:translate-x-0.5 group-hover/invite:-translate-y-0.5"
          />
        </Card>
      </li>
    </ul>
  );
}

function ServerCard({ server }: { server: PleedServer }) {
  const name = typeof server.name === "string" && server.name.trim() ? server.name.trim() : "Unnamed server";
  const role = typeof server.role === "string" ? server.role.trim() : "";
  const members = Number.isFinite(server.members) ? server.members : null;
  const managed = isManagedServer(server);

  return (
    <Card className="w-full gap-4">
      <div className="flex items-start gap-3">
        <Avatar name={name} size="lg" shape="rounded" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="line-clamp-2 type-label wrap-anywhere text-fg" title={name}>
            {name}
          </h3>
          {role ? <p className="type-caption text-fg-tertiary">{role}</p> : null}
        </div>
      </div>
      <dl className="mt-auto grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-t border-line-subtle pt-3">
        <dt className="type-caption text-fg-tertiary">Members</dt>
        <dd className="type-label text-fg tabular-nums">{members === null ? "—" : formatNumber(members)}</dd>
        <dt className="type-caption text-fg-tertiary">Server ID</dt>
        <dd className="truncate type-code-xs text-fg-secondary">{String(server.id)}</dd>
      </dl>
      {managed ? (
        <Badge tone="brand" className="self-start">
          Edited by this dashboard
        </Badge>
      ) : null}
    </Card>
  );
}
