import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Long-form typography (legal pages, docs articles). Styles plain HTML
 * children: h2/h3/h4, p, ul/ol, a, strong, code, pre, blockquote, hr, table.
 * Measure is capped at 68ch. Anchor offsets come from the global
 * scroll-padding (no scroll-margin on headings).
 */
export function Prose<T extends ElementType = "div">({
  as,
  className,
  ...props
}: { as?: T } & Omit<ComponentPropsWithoutRef<T>, "as">) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={cn("prose", className)} {...props} />;
}

export type ProseTableProps = {
  /** Names the scroll region for screen readers ("Bot permissions"). */
  label: string;
  /** Optional visible caption above the table. */
  caption?: ReactNode;
  /** `<thead>` / `<tbody>` rows. */
  children: ReactNode;
  className?: string;
};

/**
 * A prose table inside a labelled, keyboard-scrollable region. Use it for
 * every table in docs/legal content: cells keep words whole and, if a row
 * still can't fit a phone (long command syntax, IDs), the table scrolls
 * sideways inside its region instead of widening the page.
 *
 *   <ProseTable label="OAuth scopes">
 *     <thead><tr><th>Scope</th><th>Why</th></tr></thead>
 *     <tbody>…</tbody>
 *   </ProseTable>
 */
export function ProseTable({ label, caption, children, className }: ProseTableProps) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className={cn("prose-table", className)}>
      <table>
        {caption ? <caption className="pb-2 text-left type-caption text-fg-tertiary">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}
