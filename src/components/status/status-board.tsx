import { Card } from "@/components/ui/card";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { getDiscordStatus } from "./discord";
import { DiscordCard } from "./discord-card";
import { OverallBanner } from "./overall-banner";
import { PleedCard } from "./pleed-card";

/**
 * The live board: verdict banner, then Pleed's and Discord's services side
 * by side from 1024 px. Async (Discord's status is fetched on the server),
 * so the page renders it inside <Suspense fallback={<StatusBoardSkeleton/>}>.
 */
export async function StatusBoard() {
  const discord = await getDiscordStatus();
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <OverallBanner discord={discord.ok ? { ok: true, indicator: discord.indicator } : { ok: false }} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <PleedCard />
        <DiscordCard discord={discord} />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-4">
      <Skeleton className="size-8 shrink-0 rounded-md max-sm:hidden" />
      <div className="flex flex-1 flex-col gap-2.5 pt-1">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card padding="none">
      <div className="flex items-start justify-between gap-4 border-b border-line-subtle px-5 py-4 md:px-6">
        <div className="flex flex-col gap-2 py-0.5">
          <Skeleton className="h-4.5 w-20" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>
      <div className="flex flex-col gap-8 px-5 py-6 md:px-6">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </Card>
  );
}

/** Same footprint as the board, so nothing jumps when it streams in. */
export function StatusBoardSkeleton() {
  return (
    <LoadingRegion label="Loading service status" className="flex flex-col gap-4 lg:gap-6">
      <div className="rounded-2xl border border-line-strong bg-surface-1 inset-shadow-highlight shadow-md">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:gap-5 md:p-8">
          <Skeleton className="size-12 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-3 sm:pt-1.5">
            <Skeleton className="h-6 w-3/4 max-w-md" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-1/2 max-w-sm" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-line-subtle px-5 py-3 md:px-8">
          <Skeleton className="h-3.5 w-56" />
          <Skeleton className="h-8 w-24 rounded-md pointer-coarse:h-11" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </LoadingRegion>
  );
}
