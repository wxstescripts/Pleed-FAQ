import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
 * Text building blocks for command cards: search-match highlighting, inline
 * `code` in descriptions, and usage lines whose arguments render as chips —
 * <required> solid, [optional] dashed. Hook-free, so they render on the
 * server (SSR of the explorer) and on the client alike.
 */

/** Wraps every match of `matcher` in <mark>. */
export function Highlight({ text, matcher }: { text: string; matcher: RegExp | null }): ReactNode {
  if (!matcher) return text;
  const parts = text.split(matcher);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded-xs bg-brand-subtle text-fg ring-1 ring-brand-border">
        {part}
      </mark>
    ) : part ? (
      <Fragment key={index}>{part}</Fragment>
    ) : null,
  );
}

/** Description text: `backticked` segments become inline code. */
export function RichText({ text, matcher }: { text: string; matcher: RegExp | null }) {
  const parts = text.split(/`([^`]+)`/);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <code
        key={index}
        className="rounded-xs border border-line-subtle bg-inset px-1 type-code text-fg-secondary"
      >
        <Highlight text={part} matcher={matcher} />
      </code>
    ) : (
      <Fragment key={index}>
        <Highlight text={part} matcher={matcher} />
      </Fragment>
    ),
  );
}

export type ArgKind = "required" | "optional";

/** One argument chip. The brackets stay in the text, so copying or reading it aloud keeps the syntax. */
export function ArgChip({ kind, children, className }: { kind: ArgKind; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1 whitespace-nowrap",
        kind === "required"
          ? "border-brand-border bg-brand-subtle text-brand-fg"
          : "border-dashed border-line-hover text-fg-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}

type UsagePart = { kind: "command" | ArgKind | "literal"; text: string };

function parseUsage(usage: string): { prefix: string; parts: UsagePart[] } {
  const [head = "", ...rest] = usage.trim().split(/\s+/);
  const prefix = /^[^\w\s]/.test(head) ? head.charAt(0) : "";
  return {
    prefix,
    parts: [
      { kind: "command", text: head.slice(prefix.length) },
      ...rest.map((token): UsagePart => ({
        kind: /^<.+>$/.test(token) ? "required" : /^\[.+\]$/.test(token) ? "optional" : "literal",
        text: token,
      })),
    ],
  };
}

/** The prefix a usage string starts with ("!"), or "" when it has none. */
export function usagePrefix(usage: string): string {
  return parseUsage(usage).prefix;
}

/**
 * A usage string in mono: prefix in brand colour, command name, then each
 * argument as a chip. Wraps between tokens, never inside one.
 */
export function UsageLine({ usage, matcher, className }: { usage: string; matcher: RegExp | null; className?: string }) {
  const { prefix, parts } = parseUsage(usage);
  return (
    <code className={cn("flex min-w-0 flex-wrap items-center gap-1 type-code-sm text-fg", className)}>
      {parts.map((part, index) =>
        part.kind === "command" ? (
          <span key={index} className="wrap-anywhere">
            {prefix ? <span className="text-brand-fg">{prefix}</span> : null}
            <Highlight text={part.text} matcher={matcher} />
          </span>
        ) : part.kind === "literal" ? (
          <span key={index} className="wrap-anywhere">
            <Highlight text={part.text} matcher={matcher} />
          </span>
        ) : (
          <ArgChip key={index} kind={part.kind}>
            <Highlight text={part.text} matcher={matcher} />
          </ArgChip>
        ),
      )}
    </code>
  );
}

/** "Syntax: <required> [optional]" key shown above the results. */
export function SyntaxLegend({ className }: { className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 type-caption text-fg-tertiary", className)}>
      <span className="inline-flex items-center gap-1.5">
        <ArgChip kind="required" className="type-code-xs">
          &lt;arg&gt;
        </ArgChip>
        required
      </span>
      <span className="inline-flex items-center gap-1.5">
        <ArgChip kind="optional" className="type-code-xs">
          [arg]
        </ArgChip>
        optional
      </span>
    </p>
  );
}
