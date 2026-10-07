import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Loading placeholder with a slow shimmer (static under reduced motion).
 * Match the size of the content it stands in for to avoid layout shift.
 */
export function Skeleton({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-md bg-surface-3 bg-linear-90 from-surface-3 via-surface-4 to-surface-3 bg-size-[200%_100%] animate-shimmer motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/** A few lines of text-shaped skeletons. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

/**
 * Wrap a loading region: announces "Loading…" once to screen readers and
 * marks the region busy. Put Skeletons inside.
 */
export function LoadingRegion({
  label = "Loading",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}
