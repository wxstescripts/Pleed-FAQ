import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Small element beside the title (status Badge, server name). */
  meta?: ReactNode;
  /** Buttons — beside the title on ≥md, full-width row under it on phones. */
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
};

/**
 * Dashboard (and dev tool) pages only: the page's single <h1> in `type-page`
 * (24 → 32 px — calm above dense settings cards), with description, status
 * meta and actions. Stacks cleanly on phones.
 *
 * Marketing pages never use it: their h1 is `<Section titleAs="h1">`
 * (type-h1, 34 → 60 px) — DESIGN.md §3 "Marketing page recipe".
 */
export function PageHeader({ title, description, meta, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 pb-6 md:pb-8", className)}>
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="type-page text-fg">{title}</h1>
            {meta}
          </div>
          {description ? <p className="max-w-2xl type-body text-fg-secondary">{description}</p> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 max-md:[&>*]:flex-1">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
