import { cn } from "@/lib/utils";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

import { COMPOSER_FOOTER, COMPOSER_GRID, COMPOSER_PREVIEW, RESPONDERS_STACK } from "./layout";

/**
 * Loading state with the final layout's shape: the composer card (fields,
 * match type, preview, button) and the list (table rows from 1024 px, cards
 * below), so nothing jumps when the responders arrive.
 */
export function AutoRespondersSkeleton() {
  return (
    <LoadingRegion label="Loading auto-responders" className={RESPONDERS_STACK}>
      <ComposerSkeleton />
      <ListSkeleton />
    </LoadingRegion>
  );
}

function FieldSkeleton({ control }: { control: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className={cn("rounded-lg", control)} />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

function ComposerSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface-1 inset-shadow-highlight">
      <div className="flex items-start gap-4 p-5 md:p-6">
        <Skeleton className="size-10 shrink-0 rounded-lg max-sm:hidden" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-4/5 max-w-sm" />
        </div>
      </div>
      <div className="@container border-t border-line p-5 md:p-6">
        <div className={COMPOSER_GRID}>
          <div className="flex flex-col gap-5">
            <FieldSkeleton control="h-10 pointer-coarse:h-11" />
            <div className="-mt-1 flex items-center gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-18" />
            </div>
            <FieldSkeleton control="h-24" />
          </div>
          <div className={cn("flex flex-col gap-3", COMPOSER_PREVIEW)}>
            <Skeleton className="h-6 w-20" />
            <div className="flex flex-col gap-4 rounded-xl border border-line p-4 sm:p-5">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3 sm:gap-4">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className={i === 0 ? "h-3.5 w-2/5" : "h-3.5 w-4/5"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={COMPOSER_FOOTER}>
            <Skeleton className="h-10 w-full rounded-lg pointer-coarse:h-11 sm:w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-h-10 items-center gap-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-6 w-8" />
      </div>
      {/* From 1024 px: table */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-surface-1 lg:block">
        <div className="flex h-10 items-center gap-6 border-b border-line bg-surface-2/50 px-5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-6 border-b border-line-subtle px-5 py-4 last:border-b-0">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-18" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        ))}
      </div>
      {/* Below 1024 px: cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
