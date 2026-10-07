"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for insecure contexts / older browsers.
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), timeout);
  };
  return { copied, copy };
}

export type CopyButtonProps = {
  value: string;
  /** Accessible label, e.g. "Copy command". */
  label?: string;
  className?: string;
  size?: "sm" | "md";
};

/** Icon button that copies `value`, confirms with a check + live "Copied". */
export function CopyButton({ value, label = "Copy to clipboard", className, size = "sm" }: CopyButtonProps) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={label}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-md text-fg-tertiary transition-colors duration-150 hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring",
        size === "sm" ? "size-8 pointer-coarse:size-11" : "size-10 pointer-coarse:size-11",
        className,
      )}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-success-fg" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}

export type CodeBlockProps = {
  code: string;
  /** Header label (file name, "Usage", language). */
  title?: ReactNode;
  /** Show a "$" / "!" style prompt glyph per line (purely visual). */
  prompt?: string;
  copyable?: boolean;
  copyLabel?: string;
  className?: string;
};

/** Tokens up to this many characters never break internally when a line wraps. */
const UNBREAKABLE_TOKEN = 24;

/**
 * Wraps each short whitespace-separated token in a nowrap span, so a wrapped
 * line breaks BETWEEN tokens ("--threshold 3 --do ban" never becomes "--" /
 * "do"). Longer tokens (URLs, IDs) may still break anywhere so nothing
 * overflows. Copying still yields the original text.
 */
function CodeLine({ line }: { line: string }) {
  if (!line) return " ";
  return line.split(/(\s+)/).map((part, index) =>
    part && part.length <= UNBREAKABLE_TOKEN && !/\s/.test(part) ? (
      <span key={index} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * Monospace block with optional title and copy button. Long lines wrap
 * between tokens (no horizontal scroll on phones). Safe inside <Prose>.
 */
export function CodeBlock({ code, title, prompt, copyable = true, copyLabel = "Copy code", className }: CodeBlockProps) {
  return (
    <div className={cn("not-prose group/code relative min-w-0 overflow-hidden rounded-lg border border-line bg-inset", className)}>
      {title ? (
        <div className="flex h-10 items-center justify-between gap-3 border-b border-line-subtle pr-1 pl-4">
          <span className="truncate type-eyebrow text-fg-tertiary">{title}</span>
          {copyable ? <CopyButton value={code} label={copyLabel} /> : null}
        </div>
      ) : null}
      <pre className={cn("px-4 py-3.5 type-code-sm whitespace-pre-wrap text-fg wrap-anywhere", copyable && !title && "pr-12")}>
        <code>
          {code.split("\n").map((line, i) =>
            prompt ? (
              // Hanging indent: wrapped continuation lines align with the command, not the prompt.
              <span key={i} className="flex">
                <span aria-hidden="true" className="mr-2 shrink-0 text-fg-disabled select-none">
                  {prompt}
                </span>
                <span className="min-w-0">
                  <CodeLine line={line} />
                </span>
              </span>
            ) : (
              <span key={i} className="block">
                <CodeLine line={line} />
              </span>
            ),
          )}
        </code>
      </pre>
      {copyable && !title ? <CopyButton value={code} label={copyLabel} className="absolute top-2 right-2 bg-inset" /> : null}
    </div>
  );
}

export type CommandChipProps = {
  /** Full command text to display and copy, e.g. "!antinuke enable". */
  command: string;
  className?: string;
  /** Visual size. */
  size?: "sm" | "md";
};

/**
 * Inline command pill that copies itself on click — for "Run `!setup`"
 * moments in copy, docs and the commands explorer.
 */
export function CommandChip({ command, className, size = "md" }: CommandChipProps) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(command)}
      className={cn(
        "group/chip relative inline-flex max-w-full items-center gap-2 rounded-md border border-line-strong bg-inset font-mono text-fg transition-[border-color,background-color] duration-150 pointer-coarse:h-11 hover:border-brand-border hover:bg-brand-subtle focus-visible:focus-ring",
        size === "md" ? "h-8 pr-2 pl-2.5 type-code-sm" : "h-6 pr-1.5 pl-2 type-code-xs",
        className,
      )}
    >
      <span className="truncate">{command}</span>
      <span className="flex shrink-0 text-fg-tertiary group-hover/chip:text-brand-fg" aria-hidden="true">
        {copied ? <Check className="size-3.5 text-success-fg" /> : <Copy className="size-3.5" />}
      </span>
      <span className="sr-only">{copied ? "Copied" : "Copy command"}</span>
    </button>
  );
}
