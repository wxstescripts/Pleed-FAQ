"use client";

import { BookOpen, ChevronsUpDown, House, LifeBuoy, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLeaveGuard } from "@/components/ui/save-bar";
import { Tooltip } from "@/components/ui/tooltip";
import { SUPPORT_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export type DashboardUser = { name?: string | null; image?: string | null };

export function displayName(user: DashboardUser): string {
  return user.name?.trim() || "Discord user";
}

/**
 * Account menu: who is signed in, links back to the site and help, and Log
 * out (the real next-auth `signOut()`, behind the unsaved-changes guard).
 *
 * - `sidebar`: full-width row with avatar, name and a chevron (sidebar footer)
 * - `rail`: avatar only, with a tooltip (icon rail)
 * - `compact`: avatar-only 44 px button (phone/tablet app bar)
 */
export function UserMenu({ user, variant }: { user: DashboardUser; variant: "sidebar" | "rail" | "compact" }) {
  const { confirmLeave } = useLeaveGuard();
  const name = displayName(user);

  const logOut = async () => {
    if (await confirmLeave()) void signOut();
  };

  const trigger =
    variant === "sidebar" ? (
      <button
        type="button"
        className={cn(
          "group/user flex w-full min-w-0 items-center gap-3 rounded-lg p-2 text-left",
          "transition-colors duration-150 ease-standard hover:bg-hover active:bg-pressed focus-visible:focus-ring data-popup-open:bg-selected",
        )}
      >
        <Avatar src={user.image} name={name} size="sm" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate type-label text-fg">{name}</span>
          <span className="truncate type-caption text-fg-tertiary">Account</span>
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-fg-tertiary" />
      </button>
    ) : (
      <button
        type="button"
        aria-label={`Account menu for ${name}`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-full p-0 data-popup-open:bg-selected",
          variant === "compact" ? "size-11" : "mx-auto",
        )}
      >
        <Avatar src={user.image} name={name} size="sm" />
      </button>
    );

  return (
    <DropdownMenu>
      {variant === "rail" ? (
        <Tooltip content={name} side="right">
          <DropdownMenuTrigger render={trigger} />
        </Tooltip>
      ) : (
        <DropdownMenuTrigger render={trigger} />
      )}
      <DropdownMenuContent
        side={variant === "compact" ? "bottom" : variant === "rail" ? "right" : "top"}
        align={variant === "compact" ? "end" : "start"}
        className="w-64 max-w-[calc(100vw-2rem)]"
      >
        <div className="flex items-center gap-3 px-2.5 pt-2.5 pb-2">
          <Avatar src={user.image} name={name} size="md" />
          <div className="flex min-w-0 flex-col">
            <p className="type-label wrap-anywhere text-fg">{name}</p>
            <p className="type-caption text-fg-tertiary">Signed in with Discord</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLinkItem href="/">
          <House aria-hidden="true" />
          Pleed home
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem href="/docs">
          <BookOpen aria-hidden="true" />
          Documentation
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem href={SUPPORT_URL}>
          <LifeBuoy aria-hidden="true" />
          Support server
        </DropdownMenuLinkItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={() => void logOut()}>
          <LogOut aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
