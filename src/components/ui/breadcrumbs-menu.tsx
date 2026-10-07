"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * The phone-only "…" of a collapsed Breadcrumbs trail (client island of
 * breadcrumbs.tsx): a real button that opens the hidden middle crumbs as a
 * menu of links, so "My Server" stays reachable — by touch, keyboard and
 * screen reader — when the trail is shortened.
 */
export function BreadcrumbsMenu({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Show full path"
            // Keeps the trail's 22 px line on mouse; on touch the button is 44 px like the crumbs' links.
            className="-my-1 size-7 rounded-sm text-fg-tertiary hover:text-fg pointer-coarse:my-0 pointer-coarse:size-11"
          />
        }
      >
        <MoreHorizontal aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item, index) =>
          item.href ? (
            <DropdownMenuLinkItem key={`${item.label}-${index}`} href={item.href}>
              {item.label}
            </DropdownMenuLinkItem>
          ) : (
            <DropdownMenuItem key={`${item.label}-${index}`} disabled>
              {item.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
