"use client";

import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLeaveGuard } from "@/components/ui/save-bar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogoMark } from "@/components/ui/logo";

import { getPageForPath } from "./nav";
import { DashboardNavList, HelpNavList } from "./nav-list";
import { SearchTrigger } from "./search-trigger";
import { ServerMenu } from "./server-menu";
import { BrandLink } from "./sidebar";
import { displayName, UserMenu, type DashboardUser } from "./user-menu";
import { DESKTOP_QUERY } from "./use-shell-prefs";

/**
 * Below 1024 px: a sticky top app bar — menu, brand, the current page,
 * search and the account menu — with the full navigation in a left drawer
 * (the shared Sheet: focus trap, Escape, scroll lock, inert page, nothing
 * focusable while closed). Phones get icon buttons; tablets get the
 * wordmark and a search field.
 */
export function AppBar({ user }: { user: DashboardUser }) {
  const pathname = usePathname();
  const page = getPageForPath(pathname);

  return (
    <header className="sticky top-0 z-header border-b border-line-subtle bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
      <div className="flex h-header items-center gap-1 pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.5rem,env(safe-area-inset-left))] md:gap-2 md:pr-[max(1.5rem,env(safe-area-inset-right))] md:pl-[max(1rem,env(safe-area-inset-left))]">
        <NavDrawer user={user} />
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <span className="md:hidden">
            <BrandLink compact />
          </span>
          <span className="hidden md:inline-flex">
            <BrandLink />
          </span>
          <span aria-hidden="true" className="hidden h-5 w-px shrink-0 bg-line md:block" />
          <p className="min-w-0 truncate type-label text-fg">
            <span className="md:hidden">{page?.shortLabel ?? "Dashboard"}</span>
            <span className="hidden md:inline">{page?.label ?? "Dashboard"}</span>
          </p>
        </div>
        <SearchTrigger variant="icon" className="md:hidden" />
        <SearchTrigger variant="field" className="hidden w-44 md:flex" />
        <UserMenu user={user} variant="compact" />
      </div>
    </header>
  );
}

function NavDrawer({ user }: { user: DashboardUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const firstLinkId = useId();
  const { confirmLeave } = useLeaveGuard();
  const name = displayName(user);

  // Route changed (link, Back/Forward, palette) → close. Resetting state on a
  // prop change during render is React's recommended pattern.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Rotating a tablet / widening the window into the sidebar layout hides the trigger: close.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            className="size-11 text-fg data-popup-open:bg-selected"
          />
        }
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        title="Dashboard"
        headerStart={<LogoMark size="md" />}
        // Keyboard and mouse: start on the first link. Touch: the sheet itself (no focus ring flash).
        initialFocus={(type) => (type === "touch" ? true : document.getElementById(firstLinkId))}
        bodyClassName="flex flex-col gap-6 py-4"
        footer={
          <div className="flex items-center gap-3">
            <Avatar src={user.image} name={name} size="md" />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate type-label text-fg">{name}</p>
              <p className="truncate type-caption text-fg-tertiary">Signed in with Discord</p>
            </div>
            <Button
              variant="destructive-ghost"
              size="sm"
              onClick={async () => {
                close();
                if (await confirmLeave()) void signOut();
              }}
            >
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        }
      >
        <ServerMenu onItemPress={close} />
        <DashboardNavList variant="sheet" onNavigate={close} firstLinkId={firstLinkId} />
        <HelpNavList variant="sheet" onNavigate={close} />
      </SheetContent>
    </Sheet>
  );
}
