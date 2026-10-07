"use client";

import { RefreshCw } from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState } from "@/components/ui/states";
import {
  getAutomations,
  getAutomodConfig,
  getJoinGatesConfig,
  getSecurityConfig,
  getSettings,
  getStats,
} from "@/lib/api";
import { usePleedQuery } from "@/lib/api/hooks";
import { usePleedSession } from "@/lib/dev/session";

import { useServersQuery } from "../shell/dashboard-data";
import { describeError } from "./format";
import { ModuleGrid, type ModuleQueries } from "./module-grid";
import { ServerGrid } from "./server-grid";
import { StatsGrid } from "./stats-grid";

/**
 * /dashboard: a greeting, live numbers from /api/stats, the status of every
 * module (read from each module's own settings endpoint) with a link into
 * it, and the servers Pleed is in. Loading → skeletons, failures → errors
 * with "Try again" (never zeros or an empty list), no servers → an invite.
 */
export function Overview() {
  const { data: session } = usePleedSession();
  const greeting = useGreeting();
  const name = session?.user?.name?.trim();

  const stats = usePleedQuery(getStats);
  const servers = useServersQuery();
  const modules: ModuleQueries = {
    security: usePleedQuery(getSecurityConfig),
    joingates: usePleedQuery(getJoinGatesConfig),
    automod: usePleedQuery(getAutomodConfig),
    automations: usePleedQuery(getAutomations),
    settings: usePleedQuery(getSettings),
  };

  const all = [stats, servers, ...Object.values(modules)];
  const refreshing = all.some((query) => query.status === "loading" && query.data !== undefined);
  const refresh = () => all.forEach((query) => query.reload());

  // Both overview endpoints failed with nothing to show: one calm page-level error
  // instead of a stack of them (the module cards below still link to every page).
  const unreachable = stats.status === "error" && !stats.data && servers.status === "error" && !servers.data;

  return (
    <Container size="wide" className="flex flex-1 flex-col py-page">
      <PageHeader
        title={name ? `${greeting}, ${name}` : greeting}
        description="Pleed at a glance: live numbers, how each module is set up and the servers it's in."
      />

      <div className="flex flex-col gap-10 lg:gap-12">
        {unreachable ? (
          <ErrorState
            headingAs="h2"
            title="Couldn't reach the Pleed API"
            description="Stats, module status and your servers didn't load. The API may be offline or restarting."
            detail={describeError(stats.error)}
            onRetry={refresh}
          />
        ) : (
          <OverviewSection
            id="at-a-glance"
            title="At a glance"
            description="Live from the Pleed API."
            action={
              <Button variant="ghost" size="sm" onClick={refresh} loading={refreshing}>
                <RefreshCw aria-hidden="true" />
                Refresh
              </Button>
            }
          >
            <StatsGrid stats={stats} servers={servers} />
          </OverviewSection>
        )}

        <OverviewSection
          id="modules"
          title="Modules"
          description="What each part of Pleed is doing on this server. Open one to change it."
        >
          <ModuleGrid queries={modules} />
        </OverviewSection>

        {unreachable ? null : (
          <OverviewSection id="servers" title="Servers" description="Servers Pleed is in, from the Pleed API.">
            <ServerGrid servers={servers} />
          </OverviewSection>
        )}
      </div>
    </Container>
  );
}

function OverviewSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={headingId} className="type-h4 text-fg">
            {title}
          </h2>
          {description ? <p className="type-small text-fg-secondary">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/* Time of day for the greeting (client-only: the shell renders after the session resolves). */
function periodOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}
const noSubscription = () => () => {};

function useGreeting(): string {
  const period = useSyncExternalStore(noSubscription, periodOfDay, () => null);
  return period ? `Good ${period}` : "Welcome back";
}
