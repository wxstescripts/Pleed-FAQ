"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { useRef } from "react";

import { cn, mergeClassName } from "@/lib/utils";
import { useRevealSelected, useScrollOverflow } from "@/components/ui/use-scroll-overflow";

/**
 * Tabs (roving focus, arrow keys, Home/End). Two looks:
 * - variant="pill": segmented background with a sliding raised pill
 * - variant="line": underline indicator (page-level navigation within content)
 * A list that doesn't fit scrolls sideways: the overflowing edge fades out,
 * scrolling snaps to tab starts, and the selected tab is always scrolled
 * fully into view. Pill lists can `wrap` instead (filters with many options).
 */
export function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root className={mergeClassName("flex min-w-0 flex-col gap-4", className)} {...props} />;
}

export type TabsListProps = TabsPrimitive.List.Props & {
  variant?: "pill" | "line";
  /**
   * Pill only: wrap onto more rows instead of scrolling — for filter-style
   * lists (e.g. 12 command categories) where every option should stay
   * visible on a phone.
   */
  wrap?: boolean;
};

export function TabsList({ className, variant = "pill", wrap = false, children, ...props }: TabsListProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const wraps = wrap && variant === "pill";
  useScrollOverflow(scrollerRef, !wraps);
  useRevealSelected(scrollerRef, '[role="tab"][aria-selected="true"]', !wraps);

  return (
    // The scroller sits OUTSIDE the bordered track, so the track's border is never clipped:
    // it scrolls into view at the end, and the overflowing edge fades instead of cutting a word.
    <div
      ref={scrollerRef}
      data-slot="tabs-scroller"
      className={cn(
        "max-w-full",
        wraps
          ? "w-fit"
          : "overflow-fade-x snap-x snap-proximity overflow-x-auto overscroll-x-contain scrollbar-none",
        !wraps && (variant === "pill" ? "w-fit" : "w-full [contain:inline-size]"),
      )}
    >
      <TabsPrimitive.List
        data-variant={variant}
        className={mergeClassName(
          cn(
            "group/tabs-list relative flex items-center",
            variant === "pill" && "gap-0.5 rounded-lg border border-line bg-inset p-0.5",
            variant === "pill" && (wraps ? "w-fit max-w-full flex-wrap" : "w-max"),
            variant === "line" && "w-max min-w-full gap-1 border-b border-line",
          ),
          className,
        )}
        {...props}
      >
        {children}
        <TabsPrimitive.Indicator
          className={cn(
            "absolute top-0 left-0 transition-[translate,width,height] duration-300 ease-out-expo",
            "w-(--active-tab-width) translate-x-(--active-tab-left)",
            variant === "pill" &&
              // Raised pill + ring that is 3.1:1 against the inset track (WCAG 1.4.11).
              "z-base h-(--active-tab-height) translate-y-(--active-tab-top) rounded-md bg-surface-4 shadow-sm inset-shadow-highlight inset-ring inset-ring-line-hover",
            variant === "line" && "top-auto bottom-0 h-0.5 rounded-full bg-brand-400",
          )}
        />
      </TabsPrimitive.List>
    </div>
  );
}

export function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={mergeClassName(
        cn(
          "relative z-raised inline-flex shrink-0 snap-start items-center justify-center gap-1.5 font-medium whitespace-nowrap text-fg-tertiary transition-colors duration-150 ease-standard select-none",
          "hover:text-fg data-active:text-fg focus-visible:focus-ring-inset data-disabled:cursor-not-allowed data-disabled:opacity-45 [&_svg]:size-4",
          "group-data-[variant=pill]/tabs-list:h-8 group-data-[variant=pill]/tabs-list:rounded-md group-data-[variant=pill]/tabs-list:px-3 group-data-[variant=pill]/tabs-list:text-sm pointer-coarse:group-data-[variant=pill]/tabs-list:h-11",
          "group-data-[variant=line]/tabs-list:h-11 group-data-[variant=line]/tabs-list:min-w-11 group-data-[variant=line]/tabs-list:rounded-t-md group-data-[variant=line]/tabs-list:px-3 group-data-[variant=line]/tabs-list:text-sm",
        ),
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      className={mergeClassName("min-w-0 rounded-lg outline-none focus-visible:focus-ring", className)}
      {...props}
    />
  );
}
