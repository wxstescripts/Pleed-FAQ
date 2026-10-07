import { ScrollText } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { PlaceholderBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { SUPPORT_URL } from "@/lib/site";
import { DISCORD_STATUS_URL } from "./discord";

// PLACEHOLDER: replace with real data — Pleed records no uptime history yet.
// Every bar below is an empty "no data" slot; none of it is a measurement.
const HISTORY_ROWS = ["Website", "Dashboard API", "Pleed bot"] as const;
const DAYS = 90;

/** 30 slots on phones, 60 on tablets, 90 from 1024 px — so each slot stays a readable width. */
function slotVisibility(index: number) {
  if (index < DAYS - 60) return "max-lg:hidden";
  if (index < DAYS - 30) return "max-md:hidden";
  return "";
}

function EmptyBars() {
  return (
    <div aria-hidden="true" className="flex h-8 gap-0.5">
      {Array.from({ length: DAYS }, (_, index) => (
        <span key={index} className={cn("min-w-0 flex-1 rounded-xs bg-surface-3", slotVisibility(index))} />
      ))}
    </div>
  );
}

/**
 * Where uptime bars and incident reports would go — clearly labelled as a
 * placeholder, with no invented percentages or incidents.
 */
export function HistoryPlaceholder() {
  return (
    <Section
      id="history"
      eyebrow="History"
      title="Uptime and incidents"
      description="Pleed doesn’t record uptime or publish incident reports yet, so nothing below is real data. It marks where that history would go."
    >
      <Reveal className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
        <Card as="section" aria-labelledby="status-uptime-title" className="gap-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h3 id="status-uptime-title" className="type-h4 text-fg">
              Uptime by day
            </h3>
            <PlaceholderBadge />
          </div>
          <ul className="flex flex-col gap-6">
            {HISTORY_ROWS.map((name) => (
              <li key={name} className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="type-label text-fg">{name}</span>
                  <span className="type-caption text-fg-tertiary">No data recorded</span>
                </div>
                <EmptyBars />
              </li>
            ))}
          </ul>
          <div aria-hidden="true" className="flex justify-between gap-3 type-caption text-fg-tertiary">
            <span className="md:hidden">30 days ago</span>
            <span className="max-md:hidden lg:hidden">60 days ago</span>
            <span className="max-lg:hidden">90 days ago</span>
            <span>Today</span>
          </div>
          <p className="border-t border-line-subtle pt-4 type-small text-fg-secondary">
            Discord keeps its own history:{" "}
            <TextLink href={`${DISCORD_STATUS_URL}/history`}>past Discord incidents</TextLink>.
          </p>
        </Card>
        <EmptyState
          icon={ScrollText}
          headingAs="h3"
          title="No incident reports yet"
          description={
            <>
              Pleed’s own incidents aren’t written up here yet. If something breaks, report it in the{" "}
              <TextLink href={SUPPORT_URL}>support server</TextLink>.
            </>
          }
        />
      </Reveal>
    </Section>
  );
}
