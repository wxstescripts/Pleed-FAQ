"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";
import { backdropClasses, DialogCloseButton } from "@/components/ui/dialog";
import { NavItem, type NavItemProps } from "@/components/ui/nav-item";

/**
 * Sheet / Drawer — a Dialog that slides in from an edge. Focus-trapped,
 * Escape and backdrop close it, body scroll is locked, the page behind is
 * inert, and focus returns to the trigger. Use for the mobile site menu and
 * the dashboard navigation drawer.
 *
 *   <Sheet open={open} onOpenChange={setOpen}>
 *     <SheetTrigger render={<IconButton label="Open menu"><Menu/></IconButton>} />
 *     <SheetContent side="right" title="Menu">…links…</SheetContent>
 *   </Sheet>
 */
export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

const sideClasses = {
  right:
    "inset-y-0 right-0 h-dvh w-[min(22rem,calc(100vw-3rem))] border-l data-ending-style:translate-x-full data-starting-style:translate-x-full",
  left: "inset-y-0 left-0 h-dvh w-[min(20rem,calc(100vw-3rem))] border-r data-ending-style:-translate-x-full data-starting-style:-translate-x-full",
  bottom:
    "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)] data-ending-style:translate-y-full data-starting-style:translate-y-full",
  top: "inset-x-0 top-0 max-h-[85dvh] rounded-b-2xl border-b data-ending-style:-translate-y-full data-starting-style:-translate-y-full",
} as const;

export type SheetContentProps = Omit<SheetPrimitive.Popup.Props, "title"> & {
  side?: keyof typeof sideClasses;
  /** Required accessible title. Use `hideTitle` to keep it screen-reader only. */
  title: ReactNode;
  hideTitle?: boolean;
  description?: ReactNode;
  /** Element shown at the start of the header row (e.g. <Logo/>). */
  headerStart?: ReactNode;
  /** Sticky footer (e.g. the "Add to Discord" CTA). */
  footer?: ReactNode;
  hideClose?: boolean;
  bodyClassName?: string;
};

export function SheetContent({
  side = "right",
  title,
  hideTitle = false,
  description,
  headerStart,
  footer,
  hideClose = false,
  className,
  bodyClassName,
  children,
  ...props
}: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop className={backdropClasses} />
      <SheetPrimitive.Popup
        className={mergeClassName(
          cn(
            "fixed z-modal flex flex-col border-line-strong bg-surface-1 text-fg shadow-xl outline-none",
            "transition-[translate,opacity] duration-300 ease-out-expo data-ending-style:duration-200 data-ending-style:ease-exit",
            sideClasses[side],
          ),
          className,
        )}
        {...props}
      >
        <div className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-line-subtle px-4 pt-[env(safe-area-inset-top)] sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {headerStart}
            <SheetPrimitive.Title className={cn("truncate type-h4 text-fg", hideTitle && "sr-only")}>
              {title}
            </SheetPrimitive.Title>
          </div>
          {hideClose ? null : <DialogCloseButton className="mt-0 mr-0" />}
        </div>
        {description ? (
          <SheetPrimitive.Description className="px-4 pt-4 type-small text-fg-secondary sm:px-5">
            {description}
          </SheetPrimitive.Description>
        ) : null}
        <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4", bodyClassName)}>
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-line-subtle px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
            {footer}
          </div>
        ) : null}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

/**
 * Large touch-friendly link row for sheet navigation (48 px) — a
 * <NavItem variant="sheet">: same hover/active/focus states as the desktop
 * header and sidebar. Pass icons via `icon`. Close the sheet on navigation
 * via `onClick` (or wrap in <SheetClose render={<SheetNavItem … />} />).
 */
export function SheetNavItem(props: Omit<NavItemProps, "variant">) {
  return <NavItem variant="sheet" {...props} />;
}
