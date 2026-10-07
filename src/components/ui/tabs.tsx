"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn, mergeClassName } from "@/lib/utils";

/**
 * Tabs (roving focus, arrow keys, Home/End). Two looks:
 * - variant="pill": segmented background with a sliding raised pill
 * - variant="line": underline indicator (page-level navigation within content)
 * The list scrolls horizontally on narrow screens — it never wraps.
 */
export function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root className={mergeClassName("flex min-w-0 flex-col gap-4", className)} {...props} />;
}

export function TabsList({
  className,
  variant = "pill",
  children,
  ...props
}: TabsPrimitive.List.Props & { variant?: "pill" | "line" }) {
  return (
    <TabsPrimitive.List
      data-variant={variant}
      className={mergeClassName(
        cn(
          "group/tabs-list relative flex max-w-full items-center overflow-x-auto scrollbar-none",
          variant === "pill" && "w-fit gap-0.5 rounded-lg border border-line bg-inset p-0.5",
          variant === "line" && "w-full gap-1 border-b border-line",
        ),
        className,
      )}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        className={cn(
          "absolute left-0 transition-[translate,width,height] duration-300 ease-out-expo",
          "w-(--active-tab-width) translate-x-(--active-tab-left)",
          variant === "pill" &&
            "top-0.5 -z-0 h-(--active-tab-height) rounded-md bg-surface-3 shadow-sm inset-shadow-highlight",
          variant === "line" && "bottom-0 h-0.5 rounded-full bg-brand-400",
        )}
      />
    </TabsPrimitive.List>
  );
}

export function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={mergeClassName(
        cn(
          "relative z-10 inline-flex shrink-0 items-center justify-center gap-1.5 font-medium whitespace-nowrap text-fg-tertiary transition-colors duration-150 ease-standard select-none",
          "hover:text-fg data-active:text-fg focus-visible:focus-ring-inset data-disabled:cursor-not-allowed data-disabled:opacity-45 [&_svg]:size-4",
          "group-data-[variant=pill]/tabs-list:h-8 group-data-[variant=pill]/tabs-list:rounded-md group-data-[variant=pill]/tabs-list:px-3 group-data-[variant=pill]/tabs-list:text-sm pointer-coarse:group-data-[variant=pill]/tabs-list:h-10",
          "group-data-[variant=line]/tabs-list:h-11 group-data-[variant=line]/tabs-list:rounded-t-md group-data-[variant=line]/tabs-list:px-3 group-data-[variant=line]/tabs-list:text-sm",
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
