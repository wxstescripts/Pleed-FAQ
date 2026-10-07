import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Inline `code` inside settings copy (row descriptions, notes) — Pleed's code chip, no prose styles needed. */
export function InlineCode({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        "rounded-xs border border-line bg-inset px-1 type-code whitespace-nowrap text-fg box-decoration-clone",
        className,
      )}
    >
      {children}
    </code>
  );
}
