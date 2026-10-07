import { CircleHelp } from "lucide-react";

import type { SecurityConfig } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

import { THRESHOLDS, findPunishment } from "./security-options";

/**
 * The current rule in plain words — "If one account, within a minute, bans 3
 * members … then Pleed bans them" — built live from the draft, so every
 * slider or punishment change reads back as a sentence. `config={null}`
 * renders the same frame with skeleton values (loading).
 */
export function RuleSummary({ config }: { config: SecurityConfig | null }) {
  const punishment = config ? findPunishment(config.punishment) : undefined;
  const alertOnly = punishment?.value === "alert";
  const OutcomeIcon = punishment?.icon ?? CircleHelp;

  return (
    <div className="@container rounded-lg border border-line bg-inset">
      <div className="grid @lg:grid-cols-[minmax(0,1fr)_minmax(0,13rem)]">
        <div className="p-4">
          <p className="type-eyebrow text-fg-tertiary">If one account, in a minute</p>
          <ul className="mt-3 grid gap-x-6 gap-y-2 @sm:grid-cols-2">
            {THRESHOLDS.map((threshold, index) => {
              const value = config?.[threshold.key];
              const Icon = threshold.icon;
              return (
                <li key={threshold.key} className="flex min-w-0 items-center gap-2.5 type-small text-fg-secondary">
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-fg-tertiary" />
                  <span className="min-w-0">
                    {index > 0 ? <span className="sr-only">or </span> : null}
                    {threshold.verb}{" "}
                    {value === undefined ? (
                      <Skeleton className="inline-block h-3.5 w-4 align-middle" />
                    ) : (
                      <span className="font-medium text-fg tabular-nums">{value}</span>
                    )}{" "}
                    {threshold.object(value ?? 2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="border-t border-line p-4 @lg:border-t-0 @lg:border-l">
          <p className="type-eyebrow text-fg-tertiary">Then Pleed</p>
          {config ? (
            <p className={cn("mt-3 flex items-start gap-2.5 type-label", alertOnly ? "text-warning-fg" : "text-brand-fg")}>
              <OutcomeIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {/* An unknown value from the API is shown as-is rather than guessed. */}
              <span className="min-w-0">{punishment?.outcome ?? `Applies "${config.punishment}"`}</span>
            </p>
          ) : (
            <Skeleton className="mt-3.5 h-4 w-28" />
          )}
        </div>
      </div>
    </div>
  );
}
