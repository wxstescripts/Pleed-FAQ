"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/*
 * The client islands of code-block.tsx. CodeBlock itself is a Server
 * Component: its token splitting renders on the server and never hydrates;
 * only these small buttons ship JS. Import them from "@/components/ui/code-block".
 */

function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
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

/**
 * The text of the CodeBlock that contains `el`, read from the rendered lines
 * (so the code string isn't sent to the client a second time as a prop).
 * Prompt glyphs are not part of it.
 */
function codeBlockText(el: Element | null): string {
  const block = el?.closest("[data-code-block]");
  if (!block) return "";
  return Array.from(block.querySelectorAll<HTMLElement>("[data-code-text]"), (line) =>
    line.hasAttribute("data-empty") ? "" : (line.textContent ?? ""),
  ).join("\n");
}

export type CopyButtonProps = {
  /** Text to copy. Omit inside a CodeBlock — it then copies the block's code. */
  value?: string;
  /** Accessible label, e.g. "Copy command". */
  label?: string;
  className?: string;
  size?: "sm" | "md";
};

/** Icon button that copies `value`, confirms with a check + live "Copied". */
export function CopyButton({ value, label = "Copy to clipboard", className, size = "sm" }: CopyButtonProps) {
  const { copied, copy } = useCopy();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => copy(value ?? codeBlockText(ref.current))}
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
