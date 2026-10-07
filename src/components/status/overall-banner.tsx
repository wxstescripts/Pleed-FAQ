"use client";

import { AnimatePresence, m } from "framer-motion";
import { CircleAlert, CircleCheck, RotateCw, TriangleAlert, Wrench } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import { fade, scaleIn } from "@/components/motion/tokens";
import { Button } from "@/components/ui/button";
import { iconTileVariants } from "@/components/ui/icon-tile";
import { Spinner } from "@/components/ui/spinner";
import { LocalTime } from "./local-time";
import { deriveOverall, type DiscordOverall, type Overall, type Tone } from "./model";
import { useStatus } from "./status-provider";

const ICONS = { ok: CircleCheck, warning: TriangleAlert, danger: CircleAlert, maintenance: Wrench } as const;

/** A faint wash of the verdict's colour from the top of the card (the dot/icon/word carry the meaning). */
const WASH: Record<Tone, string> = {
  success: "before:from-success-subtle",
  warning: "before:from-warning-subtle",
  danger: "before:from-danger-subtle",
  info: "before:from-info-subtle",
  neutral: "before:from-hover",
};

const announcementTime = () => new Intl.DateTimeFormat(undefined, { timeStyle: "short" });

function VerdictIcon({ overall }: { overall: Overall }) {
  const tile = iconTileVariants({ tone: overall.tone, size: "lg" });
  if (overall.icon === "checking") {
    return (
      <span aria-hidden="true" className={tile}>
        <Spinner />
      </span>
    );
  }
  const Icon = ICONS[overall.icon];
  return (
    <span aria-hidden="true" className={tile}>
      <Icon strokeWidth={1.75} />
    </span>
  );
}

/**
 * The page's one-line answer ("Everything we can check is working"),
 * derived from Discord's status (server) and the dashboard API check
 * (client), plus the last-checked time and the Refresh control.
 */
export function OverallBanner({ discord }: { discord: DiscordOverall }) {
  const { api, checking, refresh, manualCompletions } = useStatus();
  const overall = deriveOverall(discord, api);
  const titleId = useId();

  // Screen-reader announcement: the verdict once it is known and whenever it
  // changes, plus a confirmation after each refresh the visitor asked for.
  // (Adjusting state during render — no effect, no extra paint.)
  const [seen, setSeen] = useState({ title: "", manual: 0 });
  const [announcement, setAnnouncement] = useState("");
  if (overall.icon !== "checking" && (overall.title !== seen.title || manualCompletions !== seen.manual)) {
    const manual = manualCompletions !== seen.manual;
    setSeen({ title: overall.title, manual: manualCompletions });
    setAnnouncement(
      manual && api ? `Checked again at ${announcementTime().format(api.at)}. ${overall.title}.` : `${overall.title}.`,
    );
  }

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "relative isolate overflow-clip rounded-2xl border border-line-strong bg-surface-1 inset-shadow-highlight shadow-md",
        // Colour wash (decorative): fades out by mid-card, under the content.
        "before:pointer-events-none before:absolute before:inset-0 before:-z-raised before:bg-linear-to-b before:to-transparent before:to-70%",
        WASH[overall.tone],
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5 md:p-8">
        <AnimatePresence initial={false} mode="wait">
          <m.div key={overall.icon} variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="shrink-0">
            <VerdictIcon overall={overall} />
          </m.div>
        </AnimatePresence>
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={overall.title}
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex min-w-0 flex-col gap-2 sm:pt-1"
          >
            <h2 id={titleId} className="type-h3 text-fg">
              {overall.title}
            </h2>
            <p className="max-w-2xl type-body text-fg-secondary">{overall.description}</p>
          </m.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line-subtle px-5 py-3 md:px-8">
        {/* Two fixed lines: the first one changes (time ↔ "Checking…") without moving anything. */}
        <div className="flex min-w-0 flex-col type-caption">
          <p className="flex items-center gap-2 text-fg-secondary">
            {checking || !api ? (
              <>
                <Spinner size="xs" className="text-fg-tertiary" />
                {api ? "Checking again…" : "Checking…"}
              </>
            ) : (
              <span>
                Last checked <LocalTime value={api.at} className="text-fg" />
              </span>
            )}
          </p>
          <p className="text-fg-tertiary">Refreshes every minute while you’re here</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          aria-disabled={checking || undefined}
          aria-busy={checking || undefined}
          className={cn(checking && "aria-disabled:opacity-100")}
        >
          <RotateCw aria-hidden="true" className={cn(checking && "animate-spin-slow")} />
          Refresh
        </Button>
      </div>

      <p role="status" className="sr-only">
        <span key={seen.manual}>{announcement}</span>
      </p>
    </section>
  );
}
