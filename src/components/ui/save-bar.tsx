"use client";

import { CircleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

export type SaveBarProps = {
  /** Show the bar (there are unsaved changes). */
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onReset: () => void;
  message?: string;
  /** Error from the last save attempt — shown in the bar (also toast it). */
  error?: string | null;
  saveLabel?: string;
  resetLabel?: string;
  /** Warn before closing/reloading the tab while dirty (default true). */
  warnOnLeave?: boolean;
  className?: string;
};

/**
 * Discord-style "unsaved changes" bar. Place it as the LAST child of the
 * page content: it is position:sticky to the bottom of the viewport, so it
 * lines up with the content column (sidebar or not) and never covers the
 * last field. Hidden bars are inert (not focusable). Ctrl/⌘+S saves.
 */
export function SaveBar({
  dirty,
  saving = false,
  onSave,
  onReset,
  message = "You have unsaved changes",
  error,
  saveLabel = "Save changes",
  resetLabel = "Reset",
  warnOnLeave = true,
  className,
}: SaveBarProps) {
  const visible = dirty || saving;
  const saveRef = useRef(onSave);
  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  // Ctrl/⌘ + S
  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!saving) saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, saving]);

  // Leave-page warning
  useEffect(() => {
    if (!dirty || !warnOnLeave) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, warnOnLeave]);

  return (
    <div
      data-savebar={visible ? "visible" : "hidden"}
      className={cn(
        "pointer-events-none sticky bottom-0 z-savebar mt-8 pb-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <div
        role="region"
        aria-label="Unsaved changes"
        inert={!visible}
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-xl border bg-surface-3/95 p-3 shadow-xl inset-shadow-highlight backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:pl-5",
          "transition-[translate,opacity] duration-300 ease-out-expo",
          error ? "border-danger-border" : "border-line-hover",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+2rem)] opacity-0",
        )}
      >
        <p aria-live="polite" className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-fg">
          {error ? (
            <>
              <CircleAlert aria-hidden="true" className="size-4 shrink-0 text-danger-fg" />
              <span className="min-w-0">{error}</span>
            </>
          ) : visible ? (
            <span className="min-w-0">{message}</span>
          ) : null}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="mr-1 hidden items-center gap-1 type-caption text-fg-tertiary lg:inline-flex" aria-hidden="true">
            <Kbd>Ctrl</Kbd>
            <Kbd>S</Kbd>
          </span>
          <Button variant="ghost" onClick={onReset} disabled={saving} className="max-sm:flex-1">
            {resetLabel}
          </Button>
          <Button variant="primary" onClick={onSave} loading={saving} className="max-sm:flex-1">
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
