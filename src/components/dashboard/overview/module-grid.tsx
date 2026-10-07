"use client";

import { ArrowRight, CircleAlert } from "lucide-react";
import { useId } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Skeleton } from "@/components/ui/skeleton";
import type { Automation, AutomodConfig, GuildSettings, JoinGatesConfig, SecurityConfig } from "@/lib/api";
import type { QueryResult } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";

import {
  AUTOMATIONS_PAGE,
  AUTOMOD_PAGE,
  JOIN_GATES_PAGE,
  SECURITY_PAGE,
  SETTINGS_PAGE,
  type DashboardPage,
} from "../shell/nav";
import {
  summarizeAutomations,
  summarizeAutomod,
  summarizeJoinGates,
  summarizeSecurity,
  summarizeSettings,
  type ModuleSummary,
} from "./module-status";

export type ModuleQueries = {
  security: QueryResult<SecurityConfig>;
  joingates: QueryResult<JoinGatesConfig>;
  automod: QueryResult<AutomodConfig>;
  automations: QueryResult<Automation[]>;
  settings: QueryResult<GuildSettings>;
};

type CardState = { status: "loading" } | { status: "error" } | { status: "ready"; summary: ModuleSummary };

function toState<T>(query: QueryResult<T>, summarize: (data: T) => ModuleSummary): CardState {
  if (query.data !== undefined) return { status: "ready", summary: summarize(query.data) };
  return query.status === "error" ? { status: "error" } : { status: "loading" };
}

/**
 * One card per module, each a link into its page with the module's real
 * status. Grid: 1 column on phones, 2 from 768 px (the fifth card spans
 * both), 3 + 2 from 1280 px — no orphan gaps.
 */
export function ModuleGrid({ queries }: { queries: ModuleQueries }) {
  const cards: { page: DashboardPage; state: CardState }[] = [
    { page: SECURITY_PAGE, state: toState(queries.security, summarizeSecurity) },
    { page: JOIN_GATES_PAGE, state: toState(queries.joingates, summarizeJoinGates) },
    { page: AUTOMOD_PAGE, state: toState(queries.automod, summarizeAutomod) },
    { page: AUTOMATIONS_PAGE, state: toState(queries.automations, summarizeAutomations) },
    { page: SETTINGS_PAGE, state: toState(queries.settings, summarizeSettings) },
  ];

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map(({ page, state }, index) => (
        <li
          key={page.href}
          className={cn("flex min-w-0", index < 3 ? "xl:col-span-2" : "xl:col-span-3", index === 4 && "md:col-span-2")}
        >
          <ModuleCard page={page} state={state} />
        </li>
      ))}
    </ul>
  );
}

function ModuleCard({ page, state }: { page: DashboardPage; state: CardState }) {
  const id = useId();
  const titleId = `${id}-title`;
  const statusId = `${id}-status`;
  const detailId = `${id}-detail`;

  return (
    <Card
      href={page.href}
      aria-labelledby={titleId}
      aria-describedby={`${statusId} ${detailId}`}
      className="group/module w-full gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <IconTile icon={page.icon} />
        <span id={statusId} className="flex min-h-6 items-center">
          <StatusBadge state={state} />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 id={titleId} className="type-h4 text-fg">
          {page.label}
        </h3>
        <p className="type-small text-fg-secondary">{page.description}</p>
      </div>
      <div className="mt-auto flex min-h-6 items-center gap-3 border-t border-line-subtle pt-3">
        <span id={detailId} className="min-w-0 flex-1 truncate type-caption text-fg-tertiary">
          {state.status === "ready" ? (
            state.summary.detail
          ) : state.status === "error" ? (
            "Couldn't load this module's status"
          ) : (
            <>
              <span className="sr-only">Loading status</span>
              <Skeleton aria-hidden="true" className="h-3.5 w-44 max-w-full" />
            </>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 type-caption font-medium text-fg-secondary transition-colors duration-150 group-hover/module:text-fg">
          Open
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 ease-standard group-hover/module:translate-x-0.5"
          />
        </span>
      </div>
    </Card>
  );
}

function StatusBadge({ state }: { state: CardState }) {
  if (state.status === "loading") return <Skeleton aria-hidden="true" className="h-6 w-12 rounded-md" />;
  if (state.status === "error") {
    return (
      <Badge tone="outline">
        <CircleAlert aria-hidden="true" />
        Unavailable
      </Badge>
    );
  }
  const { badge, state: tone } = state.summary;
  return (
    <Badge tone={tone === "on" ? "success" : "neutral"} dot={tone !== "info"}>
      {badge}
    </Badge>
  );
}
