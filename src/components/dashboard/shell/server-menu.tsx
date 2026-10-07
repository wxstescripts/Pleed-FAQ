"use client";

import { ChevronDown, Copy, Plus, Server } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconTile } from "@/components/ui/icon-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { INVITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

import { useManagedServer } from "./dashboard-data";

/**
 * The server the dashboard edits. Honest by design: the API has no guild
 * selector (every settings page reads and writes one fixed server), so this
 * is an indicator with a menu of real actions — copy the ID, see the
 * servers Pleed is in, invite Pleed elsewhere — not a fake switcher.
 */
export function ServerMenu({
  rail = false,
  onItemPress,
  className,
}: {
  rail?: boolean;
  /** Called after a menu item is chosen (the phone drawer closes itself). */
  onItemPress?: () => void;
  className?: string;
}) {
  const { id, name, status } = useManagedServer();
  const title = name ?? "Server";
  const accessibleName = name ? `Server: ${name}` : `Server ID ${id}`;

  const trigger = rail ? (
    <button
      type="button"
      aria-label={`${accessibleName}. Server menu`}
      className="relative mx-auto flex size-10 items-center justify-center rounded-lg transition-colors duration-150 ease-standard hover:bg-hover active:bg-pressed focus-visible:focus-ring data-popup-open:bg-selected pointer-coarse:size-11"
    >
      <ServerGlyph name={name} />
    </button>
  ) : (
    <button
      type="button"
      className={cn(
        "group/server flex w-full min-w-0 items-center gap-3 rounded-lg border border-line p-2 text-left",
        "transition-[background-color,border-color] duration-150 ease-standard hover:border-line-hover hover:bg-hover active:bg-pressed focus-visible:focus-ring",
        "data-popup-open:border-line-hover data-popup-open:bg-selected",
      )}
    >
      <ServerGlyph name={name} />
      <span className="flex min-w-0 flex-1 flex-col">
        {status === "loading" && !name ? (
          <>
            <span className="sr-only">Server</span>
            <Skeleton className="my-0.5 h-4 w-24" />
          </>
        ) : (
          <span className="truncate type-label text-fg">{title}</span>
        )}
        <span className="truncate type-code-xs text-fg-tertiary">
          <span className="sr-only">ID </span>
          {id}
        </span>
      </span>
      <ChevronDown
        aria-hidden="true"
        className="size-4 shrink-0 text-fg-tertiary transition-transform duration-200 ease-standard group-data-popup-open/server:rotate-180"
      />
    </button>
  );

  const copyId = () => {
    navigator.clipboard.writeText(id).then(
      () => toast.success("Server ID copied"),
      () => toast.error("Couldn't copy the server ID", { description: id }),
    );
  };

  return (
    <div className={className}>
      <DropdownMenu
        onOpenChange={(open, details) => {
          if (!open && details.reason === "item-press") onItemPress?.();
        }}
      >
        {rail ? (
          <Tooltip content={name ?? "Server"} side="right">
            <DropdownMenuTrigger render={trigger} />
          </Tooltip>
        ) : (
          <DropdownMenuTrigger render={trigger} />
        )}
        <DropdownMenuContent side={rail ? "right" : "bottom"} align="start" className="w-72 max-w-[calc(100vw-2rem)]">
          <div className="flex items-start gap-3 px-2.5 pt-2.5 pb-2">
            <ServerGlyph name={name} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="type-label wrap-anywhere text-fg">{title}</p>
              <p className="type-code-xs break-all text-fg-tertiary">ID {id}</p>
            </div>
          </div>
          <p className="px-2.5 pb-2.5 type-caption text-fg-tertiary">
            Every page in this dashboard edits this server. Switching between servers isn&apos;t available yet.
          </p>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyId}>
            <Copy aria-hidden="true" />
            Copy server ID
          </DropdownMenuItem>
          <DropdownMenuLinkItem href="/dashboard#servers">
            <Server aria-hidden="true" />
            Servers with Pleed
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href={INVITE_URL}>
            <Plus aria-hidden="true" />
            Add Pleed to another server
          </DropdownMenuLinkItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Initials when the API told us the server's name, a neutral server icon otherwise. */
function ServerGlyph({ name }: { name: string | null }) {
  if (name) return <Avatar name={name} size="sm" shape="rounded" />;
  return <IconTile icon={Server} size="sm" tone="neutral" />;
}
