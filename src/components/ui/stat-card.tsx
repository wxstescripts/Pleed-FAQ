import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { PlaceholderBadge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon-tile";
import { Skeleton } from "@/components/ui/skeleton";

export type StatCardProps = {
  label: ReactNode;
  /** The number/value. `null` renders "—" (pair with `placeholder` when data is missing by design). */
  value: ReactNode | null;
  /** Small text under the value ("across 12 servers", "derived from commands.json"). */
  hint?: ReactNode;
  icon?: LucideIcon;
  /** Marks the value as a placeholder (shows a Placeholder tag). Add a PLACEHOLDER code comment too. */
  placeholder?: boolean;
  loading?: boolean;
  size?: "md" | "lg";
  className?: string;
};

/** A single metric. Values use tabular numerals so updates don't jitter. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  placeholder = false,
  loading = false,
  size = "md",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface-1 p-5 inset-shadow-highlight",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="type-small font-medium text-fg-secondary">{label}</p>
        {icon ? <IconTile icon={icon} size="sm" tone="neutral" /> : null}
      </div>
      {loading ? (
        <div aria-hidden="true" className="flex flex-col gap-2">
          <Skeleton className={size === "lg" ? "h-12 w-28" : "h-8 w-20"} />
          {hint !== undefined ? <Skeleton className="h-3.5 w-32" /> : null}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <p
              className={cn(
                size === "lg" ? "type-metric-lg" : "type-metric",
                "text-fg",
                (value === null || placeholder) && "text-fg-tertiary",
              )}
            >
              {value === null ? "—" : value}
            </p>
            {placeholder ? <PlaceholderBadge /> : null}
          </div>
          {hint ? <p className="type-caption text-fg-tertiary">{hint}</p> : null}
        </div>
      )}
    </div>
  );
}
