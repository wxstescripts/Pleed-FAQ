"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";

/**
 * Modal dialog: focus trap, Escape, scroll lock, inert background, focus
 * returns to the trigger. Phones get a bottom-sheet presentation; ≥sm a
 * centred card.
 *
 *   <Dialog>
 *     <DialogTrigger render={<Button variant="secondary" />}>Open</DialogTrigger>
 *     <DialogContent title="Title" description="Optional">…</DialogContent>
 *   </Dialog>
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const backdropClasses =
  "fixed inset-0 z-overlay bg-scrim backdrop-blur-xs transition-opacity duration-200 ease-standard data-ending-style:opacity-0 data-starting-style:opacity-0";

const popupClasses = cn(
  "fixed z-modal flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden border border-line-strong bg-surface-2 text-fg shadow-xl inset-shadow-highlight outline-none",
  "transition-[translate,scale,opacity] duration-300 ease-out-expo data-ending-style:duration-150 data-ending-style:ease-exit",
  // phones: bottom sheet
  "inset-x-0 bottom-0 rounded-t-2xl pb-[env(safe-area-inset-bottom)] data-ending-style:translate-y-8 data-ending-style:opacity-0 data-starting-style:translate-y-8 data-starting-style:opacity-0",
  // ≥sm: centred card
  "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:pb-0 sm:data-ending-style:translate-y-[-48%] sm:data-ending-style:scale-[0.98] sm:data-starting-style:translate-y-[-48%] sm:data-starting-style:scale-[0.98]",
);

export type DialogContentProps = Omit<DialogPrimitive.Popup.Props, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  /** Footer actions (buttons). Rendered in a sticky footer row. */
  footer?: ReactNode;
  /** Hide the × close button (keep Escape + backdrop). */
  hideClose?: boolean;
  size?: "sm" | "md" | "lg";
};

const dialogSizes = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl" } as const;

export function DialogContent({
  title,
  description,
  footer,
  hideClose = false,
  size = "md",
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className={backdropClasses} />
      <DialogPrimitive.Popup className={mergeClassName(cn(popupClasses, dialogSizes[size]), className)} {...props}>
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex min-w-0 flex-col gap-1.5">
            <DialogPrimitive.Title className="type-h4 text-fg">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="type-small text-fg-secondary">{description}</DialogPrimitive.Description>
            ) : null}
          </div>
          {hideClose ? null : <DialogCloseButton />}
        </div>
        {children ? <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div> : <div className="h-5" />}
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-1/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

/** Shared × button for dialogs and sheets (must be inside a Dialog/Sheet). */
export function DialogCloseButton({ label = "Close", className }: { label?: string; className?: string }) {
  return (
    <DialogPrimitive.Close
      aria-label={label}
      className={cn(
        "relative -mt-1 -mr-1.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-fg-tertiary transition-colors duration-150 pointer-coarse:size-11 hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring",
        className,
      )}
    >
      <X aria-hidden="true" className="size-4.5" />
    </DialogPrimitive.Close>
  );
}

/* ------------------------------------------------------------------ */
/* AlertDialog — confirmations that need an explicit choice            */
/* ------------------------------------------------------------------ */

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogClose = AlertDialogPrimitive.Close;

export type AlertDialogContentProps = Omit<AlertDialogPrimitive.Popup.Props, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  /** Usually: <AlertDialogClose render={<Button variant="secondary"/>}>Cancel</AlertDialogClose> + confirm Button. */
  footer: ReactNode;
};

/**
 * Confirmation dialog (no click-outside dismissal). Use for destructive
 * actions such as deleting an auto-responder.
 */
export function AlertDialogContent({ title, description, footer, className, children, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className={backdropClasses} />
      <AlertDialogPrimitive.Popup
        className={mergeClassName(cn(popupClasses, "sm:max-w-md"), className)}
        {...props}
      >
        <div className="flex flex-col gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
          <AlertDialogPrimitive.Title className="type-h4 text-fg">{title}</AlertDialogPrimitive.Title>
          {description ? (
            <AlertDialogPrimitive.Description className="type-small text-fg-secondary">
              {description}
            </AlertDialogPrimitive.Description>
          ) : null}
        </div>
        {children ? <div className="px-5 pt-4 sm:px-6">{children}</div> : null}
        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-line bg-surface-1/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          {footer}
        </div>
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  );
}

