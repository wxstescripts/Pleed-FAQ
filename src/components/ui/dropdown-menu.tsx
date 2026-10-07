"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";

/**
 * Dropdown menu (arrow keys, type-ahead, Escape, focus return).
 *
 *   <DropdownMenu>
 *     <DropdownMenuTrigger render={<Button variant="ghost" />}>Account</DropdownMenuTrigger>
 *     <DropdownMenuContent align="end">
 *       <DropdownMenuLabel>Signed in as …</DropdownMenuLabel>
 *       <DropdownMenuItem onClick={…}><LogOut/> Sign out</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 */
export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;

export function DropdownMenuContent({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  children,
  ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, "side" | "align" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="z-popover outline-none" side={side} align={align} sideOffset={sideOffset}>
        <MenuPrimitive.Popup
          className={mergeClassName(
            "min-w-48 origin-(--transform-origin) rounded-xl border border-line-strong bg-surface-2 p-1 text-fg shadow-lg inset-shadow-highlight outline-none transition-[scale,opacity] duration-150 ease-standard data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

const itemClasses =
  "relative flex min-h-9 cursor-default items-center gap-2.5 rounded-md px-2.5 text-sm text-fg-secondary outline-none select-none data-highlighted:bg-surface-3 data-highlighted:text-fg data-disabled:pointer-events-none data-disabled:opacity-45 pointer-coarse:min-h-11 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-tertiary data-highlighted:[&_svg]:text-fg";

export function DropdownMenuItem({
  className,
  destructive,
  ...props
}: MenuPrimitive.Item.Props & { destructive?: boolean }) {
  return (
    <MenuPrimitive.Item
      className={mergeClassName(
        cn(
          itemClasses,
          destructive &&
            "text-danger-fg data-highlighted:bg-danger-subtle data-highlighted:text-danger-fg [&_svg]:text-danger-fg data-highlighted:[&_svg]:text-danger-fg",
        ),
        className,
      )}
      {...props}
    />
  );
}

/** Menu item that navigates (renders an <a>). */
export function DropdownMenuLinkItem({
  href,
  className,
  children,
  external,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <MenuPrimitive.Item
      className={cn(itemClasses, className)}
      render={
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} />
      }
    >
      {children}
    </MenuPrimitive.Item>
  );
}

export function DropdownMenuCheckboxItem({ className, children, ...props }: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem className={mergeClassName(cn(itemClasses, "pr-8"), className)} {...props}>
      {children}
      <MenuPrimitive.CheckboxItemIndicator className="absolute right-2.5 text-brand-fg">
        <Check aria-hidden="true" className="size-4 text-brand-fg!" />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  );
}

/** Non-interactive heading inside the menu (e.g. "Signed in as …"). */
export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-2.5 pt-2 pb-1.5 type-caption text-fg-tertiary", className)} {...props} />;
}

/** Label for a <DropdownMenuGroup> (must be inside the group; names it for AT). */
export function DropdownMenuGroupLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      className={mergeClassName("px-2.5 pt-2 pb-1.5 type-caption text-fg-tertiary", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return <MenuPrimitive.Separator className={mergeClassName("-mx-1 my-1 h-px bg-line", className)} {...props} />;
}
