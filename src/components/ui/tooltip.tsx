"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Tooltip for supplementary info (never the only place information lives —
 * touch users can't hover). Icon buttons still need their own aria-label.
 *
 *   <Tooltip content="Copy usage"><IconButton label="Copy usage">…</IconButton></Tooltip>
 */
export function TooltipProvider({ children, delay = 400 }: { children: ReactNode; delay?: number }) {
  return <TooltipPrimitive.Provider delay={delay}>{children}</TooltipPrimitive.Provider>;
}

export type TooltipProps = {
  content: ReactNode;
  /** The trigger element (must accept a ref and spread props). */
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  delay?: number;
  className?: string;
};

export function Tooltip({ content, children, side = "top", align = "center", delay, className }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger delay={delay} render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} align={align} sideOffset={8} className="z-tooltip">
          <TooltipPrimitive.Popup
            className={cn(
              "max-w-64 origin-(--transform-origin) rounded-md border border-line-strong bg-surface-3 px-2.5 py-1.5 text-xs leading-snug text-fg shadow-md transition-[scale,opacity] duration-150 ease-standard data-ending-style:scale-95 data-ending-style:opacity-0 data-instant:duration-0 data-starting-style:scale-95 data-starting-style:opacity-0",
              className,
            )}
          >
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
