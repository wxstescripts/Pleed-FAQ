import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ResponsiveColumn<Row> = {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Shown as the card title on phones (exactly one column should set it). */
  primary?: boolean;
  /** Actions column: right-aligned in the table, footer of the card on phones. */
  actions?: boolean;
  /** Hide in the phone card layout. */
  hideOnMobile?: boolean;
  /** Table cell/header classes (alignment, width, `text-right`, `tabular-nums`). */
  className?: string;
};

export type ResponsiveListProps<Row> = {
  rows: Row[];
  columns: ResponsiveColumn<Row>[];
  getRowKey: (row: Row) => string;
  /** Accessible table caption (visually hidden unless `showCaption`). */
  caption: string;
  showCaption?: boolean;
  /** Rendered instead of the list when `rows` is empty. */
  empty?: ReactNode;
  className?: string;
};

/**
 * Data list that is a real <table> on ≥md and stacked cards on phones —
 * no horizontal scrolling. Long values wrap (`break-words`) instead of
 * pushing buttons out of the card. Use from client components when cells
 * contain handlers.
 */
export function ResponsiveList<Row>({
  rows,
  columns,
  getRowKey,
  caption,
  showCaption = false,
  empty,
  className,
}: ResponsiveListProps<Row>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const actions = columns.filter((c) => c.actions);
  const details = columns.filter((c) => c !== primary && !c.actions && !c.hideOnMobile);

  return (
    <div className={cn("min-w-0", className)}>
      {/* ≥ md: table */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-surface-1 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className={cn(showCaption ? "px-5 pt-4 pb-2 text-left type-small text-fg-secondary" : "sr-only")}>
            {caption}
          </caption>
          <thead>
            <tr className="border-b border-line bg-surface-2/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "h-10 px-5 type-caption font-medium whitespace-nowrap text-fg-tertiary",
                    col.actions && "text-right",
                    col.className,
                  )}
                >
                  {col.actions && typeof col.header === "string" ? <span className="sr-only">{col.header}</span> : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="transition-colors duration-150 hover:bg-surface-2/60">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-5 py-3.5 align-middle break-words text-fg-secondary",
                      col.primary && "font-medium text-fg",
                      col.actions && "w-px text-right whitespace-nowrap",
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* < md: cards */}
      <ul aria-label={caption} className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={getRowKey(row)} className="min-w-0 rounded-xl border border-line bg-surface-1 p-4 inset-shadow-highlight">
            <div className="min-w-0 text-sm font-medium break-words text-fg">{primary.cell(row)}</div>
            {details.length > 0 ? (
              <dl className="mt-3 grid gap-2.5">
                {details.map((col) => (
                  <div key={col.key} className="grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3">
                    <dt className="type-caption text-fg-tertiary">{col.header}</dt>
                    <dd className="min-w-0 text-sm break-words text-fg-secondary">{col.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {actions.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-line-subtle pt-3">
                {actions.map((col) => (
                  <div key={col.key}>{col.cell(row)}</div>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
