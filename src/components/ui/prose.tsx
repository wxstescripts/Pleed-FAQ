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
  /** Names the table region for screen readers ("Bot permissions"). */
  label: string;
  /** Optional visible caption above the table. */
  caption?: ReactNode;
  /**
   * Column headers, plain text. They also label each cell when the rows
   * stack on a narrow screen, so keep them short ("Needs", "What it does").
   */
  columns: string[];
  /**
   * One array of cells per row, in column order. The first cell titles the
   * row when it stacks (a command, a scope name).
   */
  rows: ReactNode[][];
  className?: string;
};

/**
 * Every table in docs/legal content. Wide enough (≥ 36rem of its own
 * width): a normal table — words stay whole, the last (description) column
 * keeps ≥ 12rem, anything still too wide scrolls inside the labelled,
 * keyboard-scrollable region. Narrower (phones, a card on a tablet): each
 * row becomes a block — the first cell as its title, every other cell
 * labelled with its column header — so no column is ever off-screen.
 * Explicit table roles keep the table semantics while the rows are blocks.
 *
 *   <ProseTable
 *     label="Permissions by command"
 *     columns={["Command", "Needs", "What it does"]}
 *     rows={[[<code key="c">!antinuke enable</code>, "Administrator", "Turns on anti-nuke."]]}
 *   />
 */
export function ProseTable({ label, caption, columns, rows, className }: ProseTableProps) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className={cn("prose-table", className)}>
      <table role="table">
        {caption ? <caption className="pb-2 text-left type-caption text-fg-tertiary">{caption}</caption> : null}
        <thead role="rowgroup">
          <tr role="row">
            {columns.map((column) => (
              <th key={column} role="columnheader" scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex} role="row">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} role="cell" data-label={columns[cellIndex]}>
                  {/* One box per cell, so the stacked layout's label/value grid never splits mixed text + links. */}
                  <div className="prose-table-value">{cell}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
