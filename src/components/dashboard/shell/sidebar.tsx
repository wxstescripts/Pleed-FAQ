"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";

import { IconButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { DashboardNavList, HelpNavList } from "./nav-list";
import { SearchTrigger } from "./search-trigger";
import { ServerMenu } from "./server-menu";
import { UserMenu, type DashboardUser } from "./user-menu";

export const SIDEBAR_ID = "dashboard-sidebar";

/**
 * ≥ 1024 px: the fixed sidebar — brand, the server being edited, search,
 * grouped navigation, help links and the account menu. `rail` collapses it
 * to a 64 px icon rail with tooltips (default on 1024–1279 px with a mouse).
 * It is the page's banner landmark on these widths; the phone/tablet app bar
 * takes that role below 1024 px (only one of the two is ever displayed).
 */
export function Sidebar({
  user,
  rail,
  onRailChange,
}: {
  user: DashboardUser;
  rail: boolean;
  onRailChange: (rail: boolean) => void;
}) {
  const toggle = (
    <IconButton
      label={rail ? "Expand sidebar" : "Collapse sidebar"}
      size="icon-sm"
      aria-expanded={!rail}
      aria-controls={SIDEBAR_ID}
      onClick={() => onRailChange(!rail)}
      className={cn("text-fg-tertiary", rail && "mx-auto")}
    >
      {rail ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
    </IconButton>
  );

  return (
    <header
      id={SIDEBAR_ID}
      className={cn(
        "fixed inset-y-0 left-0 z-sticky hidden flex-col border-r border-line-subtle bg-inset lg:flex",
        rail ? "w-sidebar-rail" : "w-sidebar",
      )}
    >
      <div className={cn("flex h-header shrink-0 items-center", rail ? "justify-center px-3" : "justify-between gap-2 pr-3 pl-4")}>
        <BrandLink rail={rail} />
        {rail ? null : toggle}
      </div>

      <div className={cn("flex shrink-0 flex-col gap-2 pb-3", rail ? "px-3" : "px-3")}>
        <ServerMenu rail={rail} />
        <SearchTrigger variant={rail ? "rail" : "field"} />
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-3 py-3", "scrollbar-none")}>
        <DashboardNavList variant={rail ? "rail" : "sidebar"} />
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-line-subtle px-3 pt-3 pb-3">
        <HelpNavList variant={rail ? "rail" : "sidebar"} />
        <UserMenu user={user} variant={rail ? "rail" : "sidebar"} />
        {rail ? (
          <Tooltip content="Expand sidebar" side="right">
            {toggle}
          </Tooltip>
        ) : null}
      </div>
    </header>
  );
}

/** "Pleed Dashboard" lockup → Overview. Mark only in the rail. */
export function BrandLink({ rail = false, compact = false }: { rail?: boolean; compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="-m-1.5 inline-flex min-w-0 shrink-0 items-center gap-2 rounded-lg p-1.5 transition-opacity duration-150 hover:opacity-90 focus-visible:focus-ring pointer-coarse:min-h-11 pointer-coarse:min-w-11"
    >
      {rail || compact ? (
        <Logo size="sm" markOnly title="Pleed dashboard" />
      ) : (
        <>
          <Logo size="sm" />
          <span className="type-label text-fg-tertiary">Dashboard</span>
        </>
      )}
    </Link>
  );
}
