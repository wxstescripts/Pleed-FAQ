import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ScrollRegion } from "@/components/ui/scroll-region";

export type ResponsiveColumn<Row> = {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Shown as the card title on phones (exactly one column should set it). */
  primary?: boolean;
  /** Actions column: shrink-wrapped and right-aligned in the table; on phones see `cardActions`. */
  actions?: boolean;
  /** Hide in the phone card layout. */
  hideOnMobile?: boolean;
  /**
   * Preferred table column width (any CSS length, e.g. "12rem", "30%").
   * Optional — columns share the space by content otherwise.
   */
  width?: string;
  /** Table cell/header classes (alignment, `text-right`, `tabular-nums`). */
  className?: string;
};

export type ResponsiveListProps<Row> = {
  rows: Row[];
  columns: ResponsiveColumn<Row>[];
  getRowKey: (row: Row) => string;
  /** Accessible table caption (visually hidden unless `showCaption`). Also names the scroll region. */
  caption: string;
  showCaption?: boolean;
  /** Rendered instead of the list when `rows` is empty. */
  empty?: ReactNode;
  /**
   * Where the actions go on the phone cards. "header" (default): beside the
   * card title, right-aligned — for icon actions (≤ 2 IconButtons, a Switch),
   * so a card doesn't grow a whole footer row for one trash icon. "footer":
   * a bordered row under the details — for text buttons.
   */
  cardActions?: "header" | "footer";
  className?: string;
};

/**
 * Data list that is a real <table> on ≥md and stacked cards on phones.
 *
 * Long values (URLs, regexes, IDs) never push the action buttons out:
 * every cell uses `overflow-wrap: anywhere`, which — unlike `break-words` —
 * also lowers the column's min-content width, so the auto table layout
 * shrinks to the container. The actions column is shrink-wrapped
 * (`w-px whitespace-nowrap`). As a last-resort safety net the table sits in
 * a keyboard-scrollable region instead of an `overflow-hidden` box that
 * would clip it. Use from client components when cells contain handlers.
 */
export function ResponsiveList<Row>({
  rows,
  columns,
  getRowKey,
  caption,
  showCaption = false,
  empty,
  cardActions = "header",
  className,
}: ResponsiveListProps<Row>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const actions = columns.filter((c) => c.actions);
  const details = columns.filter((c) => c !== primary && !c.actions && !c.hideOnMobile);
  const hasWidths = columns.some((c) => c.width);

  return (
    <div className={cn("min-w-0", className)}>
      {/* ≥ md: table (a keyboard-scrollable region only while it actually scrolls) */}
      <ScrollRegion
        label={caption}
        className="relative hidden overflow-x-auto rounded-xl border border-line bg-surface-1 focus-visible:focus-ring md:block"
      >
        <table className="w-full border-collapse text-left type-small">
          <caption className={cn(showCaption ? "px-5 pt-4 pb-2 text-left type-small text-fg-secondary" : "sr-only")}>
            {caption}
          </caption>
          {hasWidths ? (
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} style={col.width ? { width: col.width } : undefined} />
              ))}
            </colgroup>
          ) : null}
          <thead>
            <tr className="border-b border-line bg-surface-2/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "h-10 px-5 type-caption font-medium whitespace-nowrap text-fg-tertiary",
                    col.actions && "w-px text-right",
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
              <tr key={getRowKey(row)} className="transition-colors duration-150 hover:bg-hover">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-5 py-3.5 align-middle text-fg-secondary",
                      col.actions ? "w-px text-right whitespace-nowrap" : "wrap-anywhere",
                      col.primary && "font-medium text-fg",
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
      </ScrollRegion>

      {/* < md: cards */}
      <ul aria-label={caption} className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={getRowKey(row)} className="min-w-0 rounded-xl border border-line bg-surface-1 p-4 inset-shadow-highlight">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 type-label wrap-anywhere text-fg">{primary.cell(row)}</div>
              {cardActions === "header" && actions.length > 0 ? (
                // Icon buttons (32 px, 44 px on touch) centred on the title's first line, not adding height.
                <div className="-my-1.5 -mr-1.5 flex shrink-0 items-center gap-1 pointer-coarse:-my-3 pointer-coarse:-mr-3">
                  {actions.map((col) => (
                    <div key={col.key} className="flex">
                      {col.cell(row)}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            {details.length > 0 ? (
              <dl className="mt-3 grid gap-2.5">
                {details.map((col) => (
                  <div key={col.key} className="grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3">
                    <dt className="type-caption text-fg-tertiary">{col.header}</dt>
                    <dd className="min-w-0 type-small wrap-anywhere text-fg-secondary">{col.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {cardActions === "footer" && actions.length > 0 ? (
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
