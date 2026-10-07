import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

/*
 * Loading state for General settings. Mirrors the loaded page piece by piece —
 * SettingsSection cards (icon tile, title, full-width description on phones),
 * SettingRows (label + description beside a 256 px control from 640 px, the
 * control below on phones) and the preview / command blocks — so nothing jumps
 * when the real settings arrive.
 */

function SectionSkeleton({ children, titleWidth }: { children: ReactNode; titleWidth: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-1 inset-shadow-highlight">
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-4 gap-y-1 p-5 sm:grid-cols-[auto_minmax(0,1fr)] md:p-6">
        <Skeleton className="size-10 rounded-lg max-sm:hidden sm:row-span-2" />
        <div className="flex h-6 items-center">
          <Skeleton className={cn("h-4", titleWidth)} />
        </div>
        <div className="col-span-full flex flex-col gap-2 py-1 sm:col-span-1 sm:col-start-2">
          <Skeleton className="h-3.5 w-full max-w-md" />
          <Skeleton className="h-3.5 w-2/3 sm:hidden" />
        </div>
      </div>
      <div className="divide-y divide-line-subtle border-t border-line">{children}</div>
    </div>
  );
}

function RowSkeleton({ descriptionLines = 1 }: { descriptionLines?: number }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-6 md:py-5">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: descriptionLines }, (_, i) => (
          <Skeleton key={i} className={cn("h-3 max-w-xs", i === descriptionLines - 1 ? "w-3/5" : "w-full")} />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-lg pointer-coarse:h-11 sm:w-setting-control" />
    </div>
  );
}

function BlockSkeleton({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4 px-5 py-4 md:px-6 md:py-5">{children}</div>;
}

export function GeneralSettingsSkeleton() {
  return (
    <LoadingRegion label="Loading general settings" className="flex flex-col gap-6">
      <SectionSkeleton titleWidth="w-36">
        <RowSkeleton />
        <BlockSkeleton>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          {/* The Discord preview: channel bar, a member's message, Pleed's reply with an embed. */}
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="flex h-11 items-center border-b border-line-subtle px-4">
              <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="mt-1 h-24 w-full max-w-md rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </BlockSkeleton>
      </SectionSkeleton>
      <SectionSkeleton titleWidth="w-40">
        <RowSkeleton descriptionLines={2} />
      </SectionSkeleton>
      <SectionSkeleton titleWidth="w-44">
        {["w-64", "w-72", "w-52"].map((width) => (
          <div
            key={width}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-6 md:py-5"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
            <Skeleton className={cn("h-8 max-w-full rounded-md pointer-coarse:h-11", width)} />
          </div>
        ))}
      </SectionSkeleton>
    </LoadingRegion>
  );
}
