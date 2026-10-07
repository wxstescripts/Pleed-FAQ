import { AppWindow, Bot } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { DEFAULT_PREFIX } from "@/lib/site";
import { ApiRow, PleedSummaryPill } from "./api-row";
import { ComponentList, ComponentRow } from "./component-row";
import { StatusPill } from "./status-pill";

/** Pleed's own services: the website (rendered ⇒ up), the dashboard API (live check), the bot (not monitored). */
export function PleedCard() {
  return (
    <Card as="section" padding="none" aria-labelledby="status-pleed-title">
      <StatusCardHeader
        titleId="status-pleed-title"
        title="Pleed"
        caption="Checked live from your browser"
        status={<PleedSummaryPill />}
      />
      <div className="flex-1 px-5 py-5 md:px-6">
        <ComponentList label="Pleed services">
          <ComponentRow
            icon={AppWindow}
            name="Website"
            description="This site: features, commands, docs and the dashboard’s pages."
            status={<StatusPill status="operational" />}
            meta="It just served you this page, so it’s up."
          />
          <ApiRow />
          <ComponentRow
            icon={Bot}
            name="Pleed bot"
            description="Runs commands, auto-moderation and anti-nuke inside your server."
            // PLACEHOLDER: replace with real data — the bot has no public health check (heartbeat) yet.
            status={<StatusPill status="not_monitored" />}
            meta={
              <>
                No public health check yet. Run{" "}
                <code className="rounded-xs border border-line bg-inset px-1 type-code text-fg">{DEFAULT_PREFIX}ping</code> in
                your server: a reply means Pleed is online for you.
              </>
            }
          />
        </ComponentList>
      </div>
    </Card>
  );
}

export function StatusCardHeader({
  titleId,
  title,
  caption,
  status,
}: {
  titleId: string;
  title: string;
  caption: React.ReactNode;
  status: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-subtle px-5 py-4 md:px-6">
      <div className="flex min-w-0 flex-col gap-0.5">
        <CardTitle as="h2" id={titleId}>
          {title}
        </CardTitle>
        <p className="type-caption text-fg-tertiary">{caption}</p>
      </div>
      <div className="flex shrink-0 pt-0.5">{status}</div>
    </div>
  );
}
