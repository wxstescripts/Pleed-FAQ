import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { IconTile } from "@/components/ui/icon-tile";

export type ComponentRowProps = {
  icon: LucideIcon;
  name: string;
  /** What this component does for you — in plain language, so "down" means something. */
  description: ReactNode;
  /** The StatusPill. */
  status: ReactNode;
  /** Where the status comes from and when it was checked. */
  meta?: ReactNode;
  className?: string;
};

/**
 * One service in a status card: icon · name + pill · what it does · how and
 * when it was checked. Rendered inside <ComponentList>. Server-safe (the
 * client rows render it too).
 */
export function ComponentRow({ icon, name, description, status, meta, className }: ComponentRowProps) {
  return (
    <li className={cn("flex gap-4 py-5 first:pt-0 last:pb-0", className)}>
      <IconTile icon={icon} tone="neutral" size="sm" className="mt-0.5 max-sm:hidden" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <h3 className="type-label text-fg">{name}</h3>
          {status}
        </div>
        <p className="type-small text-fg-secondary">{description}</p>
        {meta ? <div className="mt-1.5 type-caption text-fg-tertiary">{meta}</div> : null}
      </div>
    </li>
  );
}

export function ComponentList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ul aria-label={label} className="flex flex-col divide-y divide-line-subtle">
      {children}
    </ul>
  );
}
