"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/**
 * Global toast manager — call from anywhere (event handlers, async code):
 *
 *   import { toast } from "@/components/ui/toast";
 *   toast.success("Settings saved");
 *   toast.error("Couldn't save", { description: "The API didn't respond.", action: { label: "Retry", onClick: save } });
 *   toast.promise(saveConfig(), { loading: "Saving…", success: "Saved", error: "Save failed" });
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

function add(type: ToastType | undefined, title: ReactNode, options: ToastOptions = {}) {
  const { description, timeout, action, id } = options;
  return manager.add({
    id,
    type,
    title,
    description,
    priority: type === "error" ? "high" : "low",
    timeout: timeout ?? (type === "error" ? 8000 : type === "loading" ? 0 : 5000),
    actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
  });
}

export const toast = Object.assign((title: ReactNode, options?: ToastOptions) => add(undefined, title, options), {
  success: (title: ReactNode, options?: ToastOptions) => add("success", title, options),
  error: (title: ReactNode, options?: ToastOptions) => add("error", title, options),
  warning: (title: ReactNode, options?: ToastOptions) => add("warning", title, options),
  info: (title: ReactNode, options?: ToastOptions) => add("info", title, options),
  loading: (title: ReactNode, options?: ToastOptions) => add("loading", title, options),
  dismiss: (id?: string) => manager.close(id),
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
  success: <CircleCheck aria-hidden="true" className="size-[1.125rem] text-success-fg" />,
  error: <CircleAlert aria-hidden="true" className="size-[1.125rem] text-danger-fg" />,
  warning: <TriangleAlert aria-hidden="true" className="size-[1.125rem] text-warning-fg" />,
  info: <Info aria-hidden="true" className="size-[1.125rem] text-info-fg" />,
  loading: <Spinner size="sm" className="text-brand-fg" />,
};

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((t) => (
    <ToastPrimitive.Root key={t.id} toast={t} className="pl-toast">
      <ToastPrimitive.Content className="pl-toast-content flex items-start gap-3 p-4 pr-3">
        {t.type && t.type in icons ? <span className="mt-px flex shrink-0">{icons[t.type as ToastType]}</span> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastPrimitive.Title className="text-sm leading-snug font-medium text-fg" />
          <ToastPrimitive.Description className="text-sm leading-snug text-fg-secondary" />
          {t.actionProps ? (
            <ToastPrimitive.Action className="mt-2.5 inline-flex h-8 w-fit items-center rounded-md border border-line-strong bg-surface-3 px-3 text-sm font-medium text-fg transition-colors duration-150 touch-target hover:bg-surface-4 focus-visible:focus-ring" />
          ) : null}
        </div>
        <ToastPrimitive.Close
          aria-label="Dismiss notification"
          className="relative -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-tertiary transition-colors duration-150 touch-target hover:bg-surface-3 hover:text-fg focus-visible:focus-ring"
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
