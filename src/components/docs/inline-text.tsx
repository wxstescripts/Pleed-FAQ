import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { TextLink } from "@/components/ui/text-link";
import type { Inline } from "@/content/docs/types";

/** Inline code that looks the same inside <Prose>, tables, steps and callouts. */
export const inlineCodeClass =
  "rounded-xs border border-line bg-surface-2 px-1 py-px type-code text-fg box-decoration-clone";

// `code` · **strong** · _em_ (not inside words) · [label](href)
const TOKEN = /`([^`]+)`|\*\*(.+?)\*\*|(?<![\w])_([^_]+?)_(?![\w])|\[([^\]]+)\]\(([^)\s]+)\)/g;

function render(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `${keyPrefix}${index++}`;
    const [, code, strong, em, label, href] = match;
    if (code !== undefined) {
      nodes.push(
        <code key={key} className={inlineCodeClass}>
          {code}
        </code>,
      );
    } else if (strong !== undefined) {
      nodes.push(
        <strong key={key} className="text-fg">
          {render(strong, `${key}-`)}
        </strong>,
      );
    } else if (em !== undefined) {
      nodes.push(<em key={key}>{render(em, `${key}-`)}</em>);
    } else if (label !== undefined && href !== undefined) {
      nodes.push(
        <TextLink key={key} href={href}>
          {render(label, `${key}-`)}
        </TextLink>,
      );
    }
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * Renders the docs' tiny inline markup (see Inline in src/content/docs/types.ts).
 * A Server Component: no client JS.
 */
export function InlineText({ text, className }: { text: Inline; className?: string }) {
  const nodes = render(text, "i");
  return className ? <span className={cn(className)}>{nodes}</span> : <>{nodes}</>;
}

/** Plain text of an inline string (for labels, search, metadata). */
export function inlineToPlainText(text: Inline): string {
  return text.replace(TOKEN, (_, code, strong, em, label) => code ?? strong ?? em ?? label ?? "");
}
