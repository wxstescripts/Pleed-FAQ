"use client";

import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogClose, AlertDialogContent } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { holdToastsWhileSaveBarExits } from "@/components/ui/toast";

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
  /**
   * Guard unsaved changes (default true): leaving through an in-app link
   * (sidebar, header, drawer), the browser's Back/Forward buttons, a reload
   * or closing the tab asks first. Choosing "Discard changes" calls
   * `onReset` and then continues to where the user was going.
   */
  warnOnLeave?: boolean;
  className?: string;
};

/**
 * Discord-style "unsaved changes" bar. Place it as the LAST child of the
 * page content column, AFTER (not inside) the `gap-*` stack of sections: it
 * is position:sticky to the bottom of the viewport, so it lines up with the
 * content column (sidebar or not).
 *
 * Space: while visible the bar is in flow, so it reserves its own height and
 * never covers the last field. While hidden it collapses to 0 px (the bar is
 * taken out of flow, slides down and fades) — no empty band at the end of
 * the page. Hidden bars are inert (not focusable). Ctrl/⌘+S saves.
 *
 * While visible it also keeps keyboard focus from hiding under it (WCAG 2.2
 * SC 2.4.11), lifts the toast stack above itself, and guards navigation
 * (`warnOnLeave`).
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
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

  // Publish the bar's footprint (height + bottom offset, including a wrapped
  // message) as --savebar-h on <html>. globals.css turns it into
  // scroll-padding-bottom (focus never lands under the bar) and the toast
  // stack's lift (translate only). Removed the moment the bar hides.
  useLayoutEffect(() => {
    const bar = barRef.current;
    const wrapper = wrapperRef.current;
    if (!visible || !bar || !wrapper) return;
    const root = document.documentElement;
    const publish = () => {
      const bottomOffset = parseFloat(getComputedStyle(wrapper).paddingBottom) || 0;
      root.style.setProperty("--savebar-h", `${Math.ceil(bar.offsetHeight + bottomOffset)}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--savebar-h");
    };
  }, [visible]);

  // Visible → hidden (usually a successful save): the toast stack slides down
  // for 300 ms; a "Saved" toast requested in the same update waits for it.
  const wasVisible = useRef(visible);
  useLayoutEffect(() => {
    if (wasVisible.current && !visible) holdToastsWhileSaveBarExits();
    wasVisible.current = visible;
  }, [visible]);

  // Focus Not Obscured (WCAG 2.2 SC 2.4.11). A control that is "inside the
  // viewport" but under the sticky bar isn't scrolled by the browser, so
  // nudge it above the bar — on focus, and when the bar appears over the
  // control that is already focused (e.g. a switch you just toggled).
  useEffect(() => {
    if (!visible) return;
    const reveal = (el: Element | null) => {
      const bar = barRef.current;
      const wrapper = wrapperRef.current;
      if (!(el instanceof HTMLElement) || !bar || !wrapper || wrapper.contains(el)) return;
      if (!el.matches(":focus-visible") || isInFixedLayer(el)) return; // dialogs, sheets, menus, toasts float above the bar
      // The bar's resting top edge (layout box, ignoring its entrance translate).
      const bottomOffset = parseFloat(getComputedStyle(wrapper).paddingBottom) || 0;
      const barTop = wrapper.getBoundingClientRect().bottom - bottomOffset - bar.offsetHeight;
      const target = el.getBoundingClientRect();
      // 6 px = the focus ring (2 px outline + 2 px offset) plus a hair.
      if (target.bottom + 6 > barTop && target.top < window.innerHeight) {
        el.scrollIntoView({ block: "nearest" }); // honours scroll-padding-bottom
      }
    };
    let frame = requestAnimationFrame(() => reveal(document.activeElement));
    const onFocusIn = (event: FocusEvent) => {
      cancelAnimationFrame(frame);
      // After the browser's own focus scrolling.
      frame = requestAnimationFrame(() => reveal(event.target as Element | null));
    };
    document.addEventListener("focusin", onFocusIn);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [visible]);

  return (
    <div
      ref={wrapperRef}
      data-savebar={visible ? "visible" : "hidden"}
      className={cn(
        "pointer-events-none sticky bottom-0 z-savebar",
        // Visible: in flow, reserves its height (+ breathing room). Hidden: 0 px tall.
        visible ? "pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]" : "h-0",
        className,
      )}
    >
      <div
        ref={barRef}
        role="region"
        aria-label="Unsaved changes"
        inert={!visible}
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-xl border bg-surface-3/95 p-3 shadow-xl inset-shadow-highlight backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:pl-5",
          "transition-[translate,opacity] duration-300 ease-out-expo",
          error ? "border-danger-border" : "border-line-hover",
          visible
            ? "relative translate-y-0 opacity-100"
            : // Out of flow at the same spot (bottom of the 0 px wrapper = bottom of the viewport when
              // stuck). The exit drop stays smaller than the 1rem offset, so a hidden bar never adds
              // scrollable overflow below the page.
              "pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] translate-y-2 opacity-0",
        )}
      >
        <p aria-live="polite" className="flex min-w-0 flex-1 items-center gap-2 type-label text-fg">
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
      <UnsavedChangesGuard when={dirty && warnOnLeave} onDiscard={onReset} />
    </div>
  );
}

/** True when the element sits in a fixed layer (dialog, sheet, popover, toast) that never scrolls under the bar. */
function isInFixedLayer(el: HTMLElement): boolean {
  for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).position === "fixed") return true;
  }
  return false;
}

type PendingLeave = { kind: "link"; href: string } | { kind: "history"; key: string };

/*
 * Minimal Navigation API types (not in TypeScript's DOM lib yet). Back and
 * Forward inside the app are same-document traversals, which only the
 * Navigation API can cancel — popstate fires after the App Router has
 * already started rendering the other page.
 */
type NavigateEventLike = Event & {
  navigationType: "push" | "replace" | "reload" | "traverse";
  cancelable: boolean;
  destination: { url: string; key: string };
};
type NavigationLike = EventTarget & {
  traverseTo(key: string): { committed: Promise<unknown>; finished: Promise<unknown> };
};

function getNavigation(): NavigationLike | undefined {
  return (window as Window & { navigation?: NavigationLike }).navigation;
}

export type UnsavedChangesGuardProps = {
  /** Guard while true (there are unsaved changes). */
  when: boolean;
  /** Called when the user chooses "Discard changes", before navigating on. */
  onDiscard?: () => void;
  title?: string;
  description?: string;
};

/**
 * Asks before unsaved changes are lost. SaveBar renders it for you
 * (`warnOnLeave`); use it directly only for an edit form without a SaveBar.
 *
 * - In-app links (next/link and plain same-origin <a>, e.g. the dashboard
 *   sidebar or drawer): the click is held and a "Discard changes?" dialog
 *   opens — Keep editing (default focus) / Discard changes.
 * - Back/Forward within the app: the step is cancelled before anything
 *   changes and the same dialog opens; "Discard changes" then goes there
 *   (needs the Navigation API; browsers without it just go back).
 * - Reload, closing the tab, other sites: the browser's native prompt.
 * Same-page #anchors, new-tab and modified clicks (Ctrl/⌘/Shift/middle)
 * are never blocked.
 */
export function UnsavedChangesGuard({
  when,
  onDiscard,
  title = "Discard unsaved changes?",
  description = "You changed settings on this page without saving them. If you leave now, those changes are lost.",
}: UnsavedChangesGuardProps) {
  const router = useRouter();
  const [pendingLeave, setPendingLeave] = useState<PendingLeave | null>(null);
  const bypass = useRef(false);

  useEffect(() => {
    if (!when) return;
    bypass.current = false;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!bypass.current) event.preventDefault();
    };

    // Capture phase on document: runs before next/link's onClick, which then
    // sees defaultPrevented and doesn't navigate.
    const onClick = (event: MouseEvent) => {
      if (bypass.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // new tab/window
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download")) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      const url = new URL(anchor.getAttribute("href") ?? "", window.location.href);
      if (url.origin !== window.location.origin) return; // leaving the app: beforeunload asks
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // #anchor on this page
      event.preventDefault();
      setPendingLeave({ kind: "link", href: url.pathname + url.search + url.hash });
    };

    // Back/Forward to another page of the app: cancel the traversal before
    // the URL or the page changes, then ask.
    const navigation = getNavigation();
    const onNavigate = (event: Event) => {
      const nav = event as NavigateEventLike;
      if (bypass.current || nav.navigationType !== "traverse" || !nav.cancelable) return;
      const url = new URL(nav.destination.url);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // #anchor on this page
      nav.preventDefault();
      setPendingLeave({ kind: "history", key: nav.destination.key });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    navigation?.addEventListener("navigate", onNavigate);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
      navigation?.removeEventListener("navigate", onNavigate);
    };
  }, [when]);

  const discard = () => {
    const leave = pendingLeave;
    setPendingLeave(null);
    if (!leave) return;
    bypass.current = true;
    onDiscard?.();
    if (leave.kind === "link") {
      router.push(leave.href);
      return;
    }
    const traversal = getNavigation()?.traverseTo(leave.key);
    // The entry can disappear meanwhile (e.g. history pruned) — then simply stay.
    traversal?.committed.catch(() => {});
    traversal?.finished.catch(() => {});
  };

  return (
    <AlertDialog open={pendingLeave !== null} onOpenChange={(open) => (open ? undefined : setPendingLeave(null))}>
      <AlertDialogContent
        title={title}
        description={description}
        footer={
          <>
            <AlertDialogClose render={<Button variant="ghost" />}>Keep editing</AlertDialogClose>
            <Button variant="destructive" onClick={discard}>
              Discard changes
            </Button>
          </>
        }
      />
    </AlertDialog>
  );
}
