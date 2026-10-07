import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/** Keyboard key. Use inside text ("Press <Kbd>/</Kbd> to search"). */
export function Kbd({ className, ...props }: ComponentPropsWithoutRef<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm border border-line-strong border-b-line-hover bg-surface-2 px-1 type-code-xs leading-none font-medium text-fg-secondary",
        className,
      )}
      {...props}
    />
  );
}

/** Key combination, e.g. <KbdGroup keys={["Ctrl", "K"]} />. */
export function KbdGroup({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </span>
  );
}
