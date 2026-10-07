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
  /** Eyebrow above the title (marketing pages). */
  eyebrow?: ReactNode;
  className?: string;
};

/**
 * The page's single <h1> with description and actions. Used by dashboard
 * pages and simple marketing pages. Stacks cleanly on phones.
 */
export function PageHeader({ title, description, meta, actions, breadcrumbs, eyebrow, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 pb-6 md:pb-8", className)}>
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="flex min-w-0 flex-col gap-2">
          {eyebrow ? <p className="type-eyebrow text-brand-fg">{eyebrow}</p> : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="type-h2 text-fg">{title}</h1>
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
