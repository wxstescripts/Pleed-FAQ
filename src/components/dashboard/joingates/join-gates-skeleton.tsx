import { cn } from "@/lib/utils";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

type RowKind = "id" | "number" | "switch";

/**
 * Loading state for the join gate page: the same three cards, header grids,
 * row paddings and control widths as the loaded page (SettingsSection +
 * SettingRow), so nothing jumps when the settings arrive. A Server Component
 * — the page renders it and hands it to the editor.
 */
export function JoinGatesSkeleton() {
  return (
    <LoadingRegion label="Loading join gate settings" className="flex flex-col gap-6">
      <SectionSkeleton action titleWidth="w-40" rows={["id", "id", "id", "id"]} note />
      <SectionSkeleton titleWidth="w-28" rows={["number", "number"]} />
      <SectionSkeleton titleWidth="w-36" rows={["switch", "id"]} />
    </LoadingRegion>
  );
}

function SectionSkeleton({
  action = false,
  note = false,
  titleWidth,
  rows,
}: {
  action?: boolean;
  note?: boolean;
  titleWidth: string;
  rows: RowKind[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-1 inset-shadow-highlight">
      <div
        className={cn(
          "grid items-start gap-x-4 gap-y-1 p-5 md:p-6",
          action
            ? "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            : "grid-cols-[minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)]",
        )}
      >
        <Skeleton className="size-10 rounded-lg max-sm:hidden sm:col-start-1 sm:row-span-2 sm:row-start-1" />
        <div className="col-start-1 row-start-1 flex h-6 items-center sm:col-start-2 md:h-7">
          <Skeleton className={cn("h-4 rounded-sm", titleWidth)} />
        </div>
        <div className="col-span-full row-start-2 flex max-w-2xl flex-col gap-2 py-1 sm:col-span-1 sm:col-start-2">
          <Skeleton className="h-3 w-full max-w-md rounded-sm" />
          <Skeleton className="h-3 w-2/3 rounded-sm sm:hidden" />
        </div>
        {action ? <Skeleton className="col-start-2 row-start-1 h-6 w-10 rounded-full sm:col-start-3" /> : null}
      </div>
      <div className="divide-y divide-line-subtle border-t border-line">
        {note ? (
          <div className="px-5 py-4 md:px-6">
            <Skeleton className="h-24 w-full rounded-lg sm:h-20" />
          </div>
        ) : null}
        {rows.map((kind, index) => (
          <RowSkeleton key={index} kind={kind} />
        ))}
      </div>
    </div>
  );
}

function RowSkeleton({ kind }: { kind: RowKind }) {
  const compact = kind === "switch";
  return (
    <div
      className={cn(
        "flex gap-x-4 gap-y-3 px-5 py-4 sm:items-center sm:justify-between sm:gap-x-6 md:px-6 md:py-5",
        compact ? "flex-row items-start justify-between" : "flex-col sm:flex-row",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex h-5 items-center">
          <Skeleton className="h-3.5 w-36 rounded-sm" />
        </div>
        <div className="flex flex-col gap-1.5 py-0.5">
          <Skeleton className="h-3 w-full max-w-sm rounded-sm" />
          <Skeleton className="h-3 w-1/2 rounded-sm" />
        </div>
      </div>
      {kind === "id" ? (
        <Skeleton className="h-10 w-full max-w-md shrink-0 rounded-lg pointer-coarse:h-11 sm:w-setting-control" />
      ) : kind === "number" ? (
        <Skeleton className="h-10 w-full max-w-60 shrink-0 rounded-lg pointer-coarse:h-11 sm:w-40" />
      ) : (
        <Skeleton className="h-6 w-10 shrink-0 rounded-full" />
      )}
    </div>
  );
}
