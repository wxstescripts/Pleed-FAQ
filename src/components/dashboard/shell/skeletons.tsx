"use client";

import { usePathname } from "next/navigation";

import { Container } from "@/components/ui/container";
import { LogoMark } from "@/components/ui/logo";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { AUTOMATIONS_PAGE, OVERVIEW_PAGE, isActivePage } from "./nav";

type PageKind = "overview" | "list" | "settings";

function kindForPath(pathname: string | null): PageKind {
  if (isActivePage(pathname, OVERVIEW_PAGE.href)) return "overview";
  if (isActivePage(pathname, AUTOMATIONS_PAGE.href)) return "list";
  return "settings";
}

/**
 * Content-area placeholder shaped like the page that is loading: the
 * overview (stats, module cards), a list page (wide) or a settings page
 * (the 768 px settings measure) — so nothing jumps sideways when it arrives.
 */
export function PageSkeleton({ label = "Loading page", announce = true }: { label?: string; announce?: boolean }) {
  const kind = kindForPath(usePathname());
  const body = (
    <Container size={kind === "settings" ? "settings" : "wide"} className="flex flex-1 flex-col py-page">
      <div aria-hidden="true" className="flex flex-col gap-3 pb-6 md:pb-8">
        <Skeleton className="h-8 w-56 max-w-full md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      {kind === "overview" ? <OverviewBlocks /> : kind === "list" ? <ListBlocks /> : <SettingsBlocks />}
    </Container>
  );
  return announce ? (
    <LoadingRegion label={label} className="flex flex-1 flex-col">
      {body}
    </LoadingRegion>
  ) : (
    body
  );
}

function OverviewBlocks() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-line bg-surface-1 p-4 sm:p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-line bg-surface-1 p-5">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListBlocks() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="h-40 rounded-xl border border-line bg-surface-1" />
      <div className="flex flex-col divide-y divide-line-subtle rounded-xl border border-line bg-surface-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsBlocks() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      {[3, 2].map((rows, i) => (
        <div key={i} className="flex flex-col rounded-xl border border-line bg-surface-1">
          <div className="flex items-center gap-4 border-b border-line-subtle p-5">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
          </div>
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="flex items-center justify-between gap-6 p-5">
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-56 max-w-full" />
              </div>
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * First render (server + hydration) and `?mock=sessionloading`: the shell's
 * frame — app bar below 1024 px, sidebar (icon rail on 1024–1279 px with a
 * mouse) above — around the page skeleton. No navigation is shown until the
 * session is known.
 */
export function SessionSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div
        aria-hidden="true"
        className="sticky top-0 z-header border-b border-line-subtle bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden"
      >
        <div className="flex h-header items-center gap-3 pr-3 pl-3.5 md:pr-6 md:pl-5">
          <Skeleton className="size-6 rounded-md" />
          <LogoMark size="sm" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto size-8 rounded-full" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-y-0 left-0 z-sticky hidden w-sidebar flex-col gap-3 border-r border-line-subtle bg-inset px-3 lg:flex",
          "lg:max-xl:pointer-fine:w-sidebar-rail",
        )}
      >
        <div className="flex h-header shrink-0 items-center gap-2 px-1 lg:max-xl:pointer-fine:justify-center lg:max-xl:pointer-fine:px-0">
          <LogoMark size="sm" />
          <Skeleton className="h-4 w-28 lg:max-xl:pointer-fine:hidden" />
        </div>
        <Skeleton className="h-13 rounded-lg lg:max-xl:pointer-fine:mx-auto lg:max-xl:pointer-fine:size-10" />
        <Skeleton className="h-9 rounded-lg lg:max-xl:pointer-fine:mx-auto lg:max-xl:pointer-fine:size-9" />
        <div className="mt-3 flex flex-col gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2.5 lg:max-xl:pointer-fine:justify-center lg:max-xl:pointer-fine:px-0">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-3.5 w-28 lg:max-xl:pointer-fine:hidden" />
            </div>
          ))}
        </div>
      </div>

      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none lg:pl-sidebar lg:max-xl:pointer-fine:pl-sidebar-rail"
      >
        <h1 className="sr-only">Pleed dashboard</h1>
        <LoadingRegion label="Checking your session" className="flex flex-1 flex-col">
          <PageSkeleton announce={false} />
        </LoadingRegion>
      </main>
    </div>
  );
}
