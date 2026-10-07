import { ArrowUpRight, CalendarClock, LayoutGrid, RadioTower, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Callout, type CalloutTone } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { DISCORD_STATUS_URL } from "./discord";
import { DiscordError } from "./discord-error";
import { ComponentList, ComponentRow } from "./component-row";
import { LocalTime } from "./local-time";
import {
  INDICATOR_META,
  STATUS_META,
  fromDiscordComponent,
  severityOf,
  worstOf,
  type DiscordComponent,
  type DiscordIncident,
  type DiscordMaintenance,
  type DiscordSnapshot,
} from "./model";
import { StatusCardHeader } from "./pleed-card";
import { StatusPill, TonePill } from "./status-pill";

/** What each component Pleed relies on does, in plain language. */
const KEY_COPY: Record<string, { icon: typeof RadioTower; description: string }> = {
  Gateway: {
    icon: RadioTower,
    description: "Pleed’s live connection to Discord. If it’s down, Pleed can’t see new messages, joins or commands.",
  },
  API: {
    icon: Send,
    description: "How Pleed replies, assigns roles and applies timeouts, kicks and bans.",
  },
};

const INCIDENT_STATUS: Record<string, string> = {
  investigating: "Investigating",
  identified: "Cause identified",
  monitoring: "Monitoring a fix",
  resolved: "Resolved",
  postmortem: "Postmortem",
};

const MAINTENANCE_STATUS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  verifying: "Verifying",
};

function impactTone(impact: DiscordIncident["impact"]): CalloutTone {
  if (impact === "critical" || impact === "major") return "danger";
  if (impact === "minor") return "warning";
  return "info";
}

/** Discord's platform status, as reported by discordstatus.com (fetched server-side, ≤ 60 s old). */
export function DiscordCard({ discord }: { discord: DiscordSnapshot }) {
  const indicator = discord.ok ? INDICATOR_META[discord.indicator] : null;
  return (
    <Card as="section" padding="none" aria-labelledby="status-discord-title">
      <StatusCardHeader
        titleId="status-discord-title"
        title="Discord"
        caption="From Discord’s official status page"
        status={indicator ? <TonePill tone={indicator.tone} label={indicator.label} /> : <StatusPill status="unknown" />}
      />
      <div className="flex flex-1 flex-col gap-6 px-5 py-5 md:px-6">
        {discord.ok ? (
          <>
            <ComponentList label="Discord services Pleed relies on">
              {discord.key.map((component) => (
                <KeyRow key={component.id} component={component} />
              ))}
              {discord.others.length > 0 ? <OthersRow others={discord.others} /> : null}
            </ComponentList>
            {discord.incidents.length > 0 || discord.maintenances.length > 0 ? (
              <Notices incidents={discord.incidents} maintenances={discord.maintenances} />
            ) : null}
          </>
        ) : (
          <DiscordError reason={discord.reason} status={discord.status} href={DISCORD_STATUS_URL} />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line-subtle px-5 py-2 md:px-6">
        <p className="type-caption text-fg-tertiary">
          {discord.ok ? "Checked" : "Tried"} <LocalTime value={discord.checkedAt} className="text-fg-secondary" /> ·
          refreshed here every minute
        </p>
        <Button variant="link" size="sm" href={DISCORD_STATUS_URL} className="gap-1">
          discordstatus.com
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Button>
      </div>
    </Card>
  );
}

function KeyRow({ component }: { component: DiscordComponent }) {
  const copy = KEY_COPY[component.name];
  return (
    <ComponentRow
      icon={copy?.icon ?? LayoutGrid}
      name={component.name}
      description={copy?.description ?? "A Discord service Pleed relies on."}
      status={<StatusPill status={fromDiscordComponent(component.status)} />}
    />
  );
}

function OthersRow({ others }: { others: DiscordComponent[] }) {
  const affected = others
    .filter((c) => c.status !== "operational")
    .sort((a, b) => severityOf(b.status) - severityOf(a.status));
  return (
    <ComponentRow
      icon={LayoutGrid}
      name="Everything else"
      description="Voice, media, push notifications, the Discord apps and more. These rarely affect Pleed."
      status={<StatusPill status={fromDiscordComponent(worstOf(others.map((c) => c.status)))} />}
      meta={
        affected.length === 0
          ? `All ${others.length} other services operational`
          : affected
              .map((c) => `${c.name}: ${STATUS_META[fromDiscordComponent(c.status)].label.toLowerCase()}`)
              .join(" · ")
      }
    />
  );
}

function Notices({ incidents, maintenances }: { incidents: DiscordIncident[]; maintenances: DiscordMaintenance[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="type-eyebrow text-fg-tertiary">Reported by Discord</h3>
      {incidents.map((incident) => (
        <Callout
          key={incident.id || incident.name}
          tone={impactTone(incident.impact)}
          title={incident.name}
          actions={
            <Button variant="secondary" size="sm" href={incident.url}>
              Details<span className="sr-only"> about {incident.name}</span>
            </Button>
          }
        >
          <p>
            {INCIDENT_STATUS[incident.status] ?? "Ongoing"}
            {incident.updatedAt ? (
              <>
                {" "}
                · updated <LocalTime value={incident.updatedAt} />
              </>
            ) : null}
            {incident.components.length ? <> · affects {incident.components.join(", ")}</> : null}
          </p>
          {incident.latestUpdate ? <p className="line-clamp-4">{incident.latestUpdate}</p> : null}
        </Callout>
      ))}
      {maintenances.map((maintenance) => (
        <Callout
          key={maintenance.id || maintenance.name}
          tone="info"
          icon={CalendarClock}
          title={maintenance.name}
          actions={
            <Button variant="secondary" size="sm" href={maintenance.url}>
              Details<span className="sr-only"> about {maintenance.name}</span>
            </Button>
          }
        >
          <p>
            {MAINTENANCE_STATUS[maintenance.status] ?? "Scheduled"}
            {maintenance.scheduledFor ? (
              <>
                {" "}
                · <LocalTime value={maintenance.scheduledFor} />
              </>
            ) : null}
            {maintenance.scheduledUntil ? (
              <>
                {" "}
                to <LocalTime value={maintenance.scheduledUntil} />
              </>
            ) : null}
          </p>
        </Callout>
      ))}
    </div>
  );
}
