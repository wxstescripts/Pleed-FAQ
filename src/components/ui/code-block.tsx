import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

// The copy buttons are tiny client islands; CodeBlock itself is a Server Component.
export { CommandChip, CopyButton } from "@/components/ui/copy-button";
export type { CommandChipProps, CopyButtonProps } from "@/components/ui/copy-button";

export type CodeBlockProps = {
  code: string;
  /** Header label (file name, "Usage", language). */
  title?: ReactNode;
  /** Show a "$" / "!" style prompt glyph per line (purely visual, never copied). */
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
 * A Server Component — only the copy button hydrates; it reads the code
 * from the rendered lines (`data-code-text`), so the string isn't shipped
 * to the client twice.
 */
export function CodeBlock({ code, title, prompt, copyable = true, copyLabel = "Copy code", className }: CodeBlockProps) {
  // No overflow-hidden: nothing paints outside the rounded box (the bar and <pre> have no
  // background of their own), and the copy button's focus ring must never be clipped.
  // On touch the copy button grows to 44 px, so the title bar grows to 48 px and an untitled
  // block reserves 8 + 44 + 8 px for it (right padding and minimum height).
  return (
    <div data-code-block="" className={cn("not-prose group/code relative min-w-0 rounded-lg border border-line bg-inset", className)}>
      {title ? (
        <div className="flex h-10 items-center justify-between gap-3 border-b border-line-subtle pr-1 pl-4 pointer-coarse:h-12 pointer-coarse:pr-0.5">
          <span className="truncate type-eyebrow text-fg-tertiary">{title}</span>
          {copyable ? <CopyButton label={copyLabel} /> : null}
        </div>
      ) : null}
      <pre
        className={cn(
          "px-4 py-3.5 type-code-sm whitespace-pre-wrap text-fg wrap-anywhere",
          copyable && !title && "pr-12 pointer-coarse:min-h-15 pointer-coarse:pr-15",
        )}
      >
        <code>
          {code.split("\n").map((line, i) =>
            prompt ? (
              // Hanging indent: wrapped continuation lines align with the command, not the prompt.
              <span key={i} className="flex">
                <span aria-hidden="true" className="mr-2 shrink-0 text-fg-disabled select-none">
                  {prompt}
                </span>
                <span className="min-w-0" data-code-text="" data-empty={line ? undefined : ""}>
                  <CodeLine line={line} />
                </span>
              </span>
            ) : (
              <span key={i} className="block" data-code-text="" data-empty={line ? undefined : ""}>
                <CodeLine line={line} />
              </span>
            ),
          )}
        </code>
      </pre>
      {copyable && !title ? <CopyButton label={copyLabel} className="absolute top-2 right-2 bg-inset" /> : null}
    </div>
  );
}
