"use client";

import { Search } from "lucide-react";

import { IconButton } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { usePalette } from "./command-palette";
import { useModifierKey } from "./use-shell-prefs";

/**
 * Opens the search palette (also Ctrl/⌘ + K).
 * - `field`: looks like a search box (sidebar, tablet app bar) with the shortcut hint on mouse devices
 * - `icon`: 44 px icon button (phone app bar)
 * - `rail`: icon button with a tooltip (icon rail)
 */
export function SearchTrigger({ variant, className }: { variant: "field" | "icon" | "rail"; className?: string }) {
  const { openPalette } = usePalette();
  const modifier = useModifierKey();
  const shortcut = modifier === "⌘" ? "Meta+K" : "Control+K";

  if (variant === "field") {
    return (
      <button
        type="button"
        onClick={openPalette}
        aria-haspopup="dialog"
        aria-keyshortcuts={shortcut}
        className={cn(
          "group/search flex h-9 w-full min-w-0 items-center gap-2.5 rounded-lg border border-line bg-inset px-2.5 text-left text-fg-tertiary",
          "transition-[border-color,color,background-color] duration-150 ease-standard hover:border-line-hover hover:text-fg-secondary active:bg-pressed focus-visible:focus-ring pointer-coarse:h-11",
          className,
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate type-small">Search</span>
        <span aria-hidden="true" className="flex shrink-0 items-center gap-1 pointer-coarse:hidden">
          <Kbd>{modifier}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
    );
  }

  const button = (
    <IconButton
      label="Search"
      onClick={openPalette}
      aria-haspopup="dialog"
      aria-keyshortcuts={shortcut}
      className={cn(variant === "icon" && "size-11", variant === "rail" && "mx-auto", className)}
    >
      <Search aria-hidden="true" />
    </IconButton>
  );

  if (variant === "rail") {
    return (
      <Tooltip content={`Search (${modifier} K)`} side="right">
        {button}
      </Tooltip>
    );
  }
  return button;
}
