"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Global toast manager — call from anywhere (event handlers, async code):
 *
 *   import { toast } from "@/components/ui/toast";
 *   toast.success("Changes saved");                 // after a SaveBar save
 *   toast.error("Couldn't delete the responder", { description: "The API didn't respond.", action: { label: "Retry", onClick: remove } });
 *   toast.promise(syncCommands(), { loading: "Syncing…", success: "Commands synced", error: "Sync failed" });
 *
 * A failed SETTINGS save is not a toast: pass `error` to the SaveBar (it is
 * already on screen, announces it and turns Save into "Try again"). Toasts
 * are for actions that leave nothing on screen (delete, copy, sync, invite).
 *
 * <Toaster/> is rendered once in the root layout. Toasts are announced to
 * screen readers (errors assertively), pause on hover/focus, can be swiped
 * away, and F6 jumps to the toast region.
 */
const manager = ToastPrimitive.createToastManager();

type ToastType = "success" | "error" | "warning" | "info" | "loading";

export type ToastOptions = {
  description?: ReactNode;
  /** ms before auto-dismiss (0 = stay until dismissed). Errors default to 8000. */
  timeout?: number;
  action?: { label: string; onClick: () => void };
  id?: string;
};

/*
 * Choreography with the SaveBar. While a SaveBar is visible the toast stack
 * is lifted above it (CSS translate driven by --savebar-h, see globals.css).
 * A successful save hides the bar in the SAME update that usually calls
 * toast.success(), so the stack slides back down (300 ms) exactly while the
 * new toast slides up — a visible bounce. Toasts requested while a bar is on
 * screen therefore wait for React to commit and, if the bar just hid, for
 * the stack to settle. The delay is ≤ 1 frame + 300 ms and only ever applies
 * around a SaveBar.
 */
const SETTLE_MS = 300;
let holdUntil = 0;
let seq = 0;
const pending = new Map<string, { frame?: number; timer?: number }>();

/** Called by SaveBar when it hides. Toasts added in the next 300 ms appear once the stack has settled. */
export function holdToastsWhileSaveBarExits() {
  holdUntil = performance.now() + SETTLE_MS;
}

function add(type: ToastType | undefined, title: ReactNode, options: ToastOptions = {}) {
  const { description, timeout, action } = options;
  const id = options.id ?? `pl-toast-${++seq}`;
  const show = () => {
    pending.delete(id);
    manager.add({
      id,
      type,
      title,
      description,
      priority: type === "error" ? "high" : "low",
      timeout: timeout ?? (type === "error" ? 8000 : type === "loading" ? 0 : 5000),
      actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
    });
  };
  if (typeof document === "undefined" || !document.querySelector('[data-savebar="visible"]')) {
    show();
    return id;
  }
  // Two frames: the update that may hide the bar has committed by then (its
  // layout effect calls holdToastsWhileSaveBarExits), then wait out the slide.
  const entry: { frame?: number; timer?: number } = {};
  pending.set(id, entry);
  entry.frame = requestAnimationFrame(() => {
    entry.frame = requestAnimationFrame(() => {
      entry.frame = undefined;
      const wait = holdUntil - performance.now();
      if (wait <= 0) show();
      else entry.timer = window.setTimeout(show, wait);
    });
  });
  return id;
}

function cancelPending(id?: string) {
  for (const [key, entry] of pending) {
    if (id !== undefined && key !== id) continue;
    if (entry.frame !== undefined) cancelAnimationFrame(entry.frame);
    if (entry.timer !== undefined) clearTimeout(entry.timer);
    pending.delete(key);
  }
}

export const toast = Object.assign((title: ReactNode, options?: ToastOptions) => add(undefined, title, options), {
  success: (title: ReactNode, options?: ToastOptions) => add("success", title, options),
  error: (title: ReactNode, options?: ToastOptions) => add("error", title, options),
  warning: (title: ReactNode, options?: ToastOptions) => add("warning", title, options),
  info: (title: ReactNode, options?: ToastOptions) => add("info", title, options),
  loading: (title: ReactNode, options?: ToastOptions) => add("loading", title, options),
  dismiss: (id?: string) => {
    cancelPending(id);
    manager.close(id);
  },
  update: manager.update,
  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: ReactNode; success: ReactNode | ((value: T) => ReactNode); error: ReactNode | ((err: unknown) => ReactNode) },
  ) =>
    manager.promise(promise, {
      loading: { title: messages.loading, type: "loading" },
      success: (value: T) => ({
        title: typeof messages.success === "function" ? messages.success(value) : messages.success,
        type: "success",
      }),
      error: (err: unknown) => ({
        title: typeof messages.error === "function" ? messages.error(err) : messages.error,
        type: "error",
        priority: "high",
      }),
    }),
});

const icons: Record<ToastType, ReactNode> = {
  success: <CircleCheck aria-hidden="true" className="size-4.5 text-success-fg" />,
  error: <CircleAlert aria-hidden="true" className="size-4.5 text-danger-fg" />,
  warning: <TriangleAlert aria-hidden="true" className="size-4.5 text-warning-fg" />,
  info: <Info aria-hidden="true" className="size-4.5 text-info-fg" />,
  loading: <Spinner size="sm" className="text-brand-fg" />,
};

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((t) => (
    <ToastPrimitive.Root key={t.id} toast={t} className="pl-toast">
      <ToastPrimitive.Content className="pl-toast-content flex items-start gap-3 p-4 pr-3">
        {t.type && t.type in icons ? <span className="mt-px flex shrink-0">{icons[t.type as ToastType]}</span> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastPrimitive.Title className="type-label text-fg" />
          <ToastPrimitive.Description className="type-small text-fg-secondary" />
          {t.actionProps ? (
            <ToastPrimitive.Action className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-2.5 w-fit")} />
          ) : null}
        </div>
        <ToastPrimitive.Close
          aria-label="Dismiss notification"
          className="relative -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-tertiary transition-colors duration-150 pointer-coarse:size-11 hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring"
        >
          <X aria-hidden="true" className="size-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ));
}

/** Render once (root layout). */
export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={manager} limit={3}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className={cn("pl-toast-viewport")}>
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
