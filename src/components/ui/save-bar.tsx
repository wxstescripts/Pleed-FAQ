"use client";

import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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
 * page Container, AFTER (not inside) the `gap-*` stack of sections: it is
 * position:sticky to the bottom of the viewport, so it lines up with the
 * content column (sidebar or not).
 *
 * Page contract (DESIGN.md §3): the page Container is
 * `flex flex-1 flex-col py-page` inside a page column that is at least as
 * tall as the viewport, so on a short page the bar rests at the bottom of
 * the screen (mt-auto) instead of floating under the content.
 *
 * Space: while visible the bar is in flow, so it reserves its own height and
 * never covers the last field. While hidden it takes no space (the bar is
 * taken out of flow, slides down and fades) — no empty band at the end of
 * the page. Hidden bars are inert (not focusable). Ctrl/⌘+S saves.
 *
 * While visible it also keeps keyboard focus from hiding under it (WCAG 2.2
 * SC 2.4.11), lifts the toast stack above itself, and guards navigation
 * (`warnOnLeave`, plus `useLeaveGuard()` for programmatic navigation). When
 * it hides, keyboard focus that was on Save/Reset returns to the last edited
 * control (never to a destructive button).
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
  // message) as --savebar-h on <html>. globals.css turns it into the toast
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

  // Where keyboard focus returns when the bar hides:
  // - lastEdited: the control the user last CHANGED (typed in, toggled,
  //   picked, slid) — not merely tabbed past. A Danger-zone button between
  //   the fields and the bar must never inherit focus after a save.
  // - lastFocused: the last element focused outside the bar (and outside
  //   dialogs/toasts), the fallback when nothing was edited by keyboard or
  //   pointer that we could see — never a destructive button.
  const lastEdited = useRef<HTMLElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const outsideBar = (target: EventTarget | null): target is Element => {
      const wrapper = wrapperRef.current;
      return Boolean(wrapper) && target instanceof Element && !wrapper!.contains(target);
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (outsideBar(target) && target instanceof HTMLElement && !isInFixedLayer(target)) lastFocused.current = target;
    };
    // `input` / `change`: text fields, number fields, range inputs, native selects, and the
    // hidden inputs Base UI updates for Select, Checkbox, Radio and Switch.
    const onValue = (event: Event) => {
      if (!outsideBar(event.target)) return;
      const control = editedControl(event.target);
      if (control && !isInFixedLayer(control)) lastEdited.current = control;
    };
    // Toggles, pickers and sliders that change value on a click or a key (Space, Enter,
    // arrows…). Plain buttons are not controls, so a Danger-zone button is never recorded.
    const onActivate = (event: Event) => {
      if (!outsideBar(event.target)) return;
      if (event instanceof KeyboardEvent && !EDIT_KEYS.has(event.key)) return;
      // A Slider's track or a NumberField's −/+ buttons edit the composite's own input.
      const composite = event.target.closest(COMPOSITE_CONTROLS);
      const control =
        event.target.closest<HTMLElement>(EDIT_CONTROLS) ??
        (composite ? Array.from(composite.querySelectorAll<HTMLElement>(EDIT_CONTROLS)).find(isEditable) : null);
      if (control && isEditable(control) && !isInFixedLayer(control)) lastEdited.current = control;
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("input", onValue, true);
    document.addEventListener("change", onValue, true);
    document.addEventListener("click", onActivate, true);
    document.addEventListener("keydown", onActivate, true);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("input", onValue, true);
      document.removeEventListener("change", onValue, true);
      document.removeEventListener("click", onActivate, true);
      document.removeEventListener("keydown", onActivate, true);
    };
  }, []);

  // Visible → hidden (a successful save, or Reset):
  // - the toast stack slides down for 300 ms; a "Saved" toast requested in
  //   the same update waits for it;
  // - the bar turns inert, which would drop keyboard focus to <body> if it
  //   was on Save/Reset (or on a field a page disabled while saving). Focus
  //   goes back to the last edited control instead (no scroll) — else the
  //   last focused element unless it is destructive, else #main — so the
  //   next Tab continues from there and Enter never fires a destructive action.
  const wasVisible = useRef(visible);
  useLayoutEffect(() => {
    if (wasVisible.current && !visible) {
      holdToastsWhileSaveBarExits();
      const active = document.activeElement;
      const inBar = Boolean(wrapperRef.current?.contains(active));
      const lost = !active || active === document.body; // blurred by `disabled` / `inert`
      if (inBar || lost) {
        const fallback = lastFocused.current && !isDestructive(lastFocused.current) ? lastFocused.current : null;
        restoreFocus(isFocusable(lastEdited.current) ? lastEdited.current : fallback);
      }
    }
    wasVisible.current = visible;
  }, [visible]);

  // Focus Not Obscured (WCAG 2.2 SC 2.4.11). A control that is "inside the
  // viewport" but under the sticky bar isn't scrolled by the browser, so
  // nudge it above the bar — on focus, and when the bar appears over the
  // control that is already focused (e.g. a switch you just toggled).
  // Only elements OUTSIDE the bar are nudged: focusing Reset/Save never
  // scrolls the page (they are always fully visible).
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
      // Hidden = the focus ring (2 px outline + 2 px offset, plus a hair) reaches the bar.
      if (target.bottom + FOCUS_RING > barTop && target.top < window.innerHeight) {
        const scroller = getScrollParent(wrapper);
        // Rest the element FOCUS_GAP above the bar, but never push its top under the sticky header.
        const topLimit = parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0;
        const delta = Math.min(target.bottom + FOCUS_GAP - barTop, Math.max(0, target.top - topLimit));
        if (delta > 0) {
          if (scroller === document.scrollingElement) window.scrollBy({ top: delta, behavior: "instant" });
          else scroller.scrollBy({ top: delta, behavior: "instant" });
        }
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
        // mt-auto: on a page shorter than the viewport the bar rests at the bottom of the
        // screen, not under the content (needs the flex page column — DESIGN.md §3 SaveBar).
        // -mb-page: it absorbs the page Container's bottom padding (py-page), so it rests 16 px
        // above the viewport bottom — exactly where it sits while stuck — instead of rising
        // by the padding at the end of a long page.
        "pointer-events-none sticky bottom-0 z-savebar mt-auto -mb-page",
        // Visible: in flow, reserves its height (+ breathing room). Hidden: takes no space
        // (its height cancels the negative margin).
        visible ? "pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]" : "h-page",
        className,
      )}
    >
      <div
        ref={barRef}
        role="region"
        aria-label="Unsaved changes"
        inert={!visible}
        className={cn(
          // Fills the page column, so in a `settings` Container it shares the cards' edges.
          "pointer-events-auto flex w-full flex-col gap-3 rounded-xl border bg-surface-3/95 p-3 shadow-xl inset-shadow-highlight backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:pl-5",
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
          {/* aria-disabled, not `disabled`: a focused Reset keeps focus (but is inert) while a save runs. */}
          <Button variant="ghost" onClick={onReset} aria-disabled={saving || undefined} className="max-sm:flex-1">
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

/** px below a focused element that count as "its focus ring" (2 px outline + 2 px offset + a hair). */
const FOCUS_RING = 6;
/** Where a nudged element comes to rest: this many px above the bar. */
const FOCUS_GAP = 16;

/** Controls whose value changes on a click or a key press (Base UI renders these roles). */
const ROLE_CONTROLS = "[role=switch],[role=checkbox],[role=radio],[role=slider],[role=combobox],[role=spinbutton]";
/** Every control a settings page edits, for resolving `input`/`change` targets. */
const EDIT_CONTROLS = `${ROLE_CONTROLS},input,textarea,select,[contenteditable=true]`;
/** Kit controls whose pointer parts (Slider track, NumberField −/+) edit an inner input. */
const COMPOSITE_CONTROLS = "[data-slider],[data-number-field]";
/** Keys that change a focused control's value (Tab and modifiers only move focus). */
const EDIT_KEYS = new Set([" ", "Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"]);

/**
 * A control focus can return to: not Base UI's hidden form inputs (aria-hidden,
 * tabindex -1), not a destructive button. Role controls with a roving
 * tabindex of -1 (an unselected radio) still count — they take focus.
 */
function isEditable(el: HTMLElement): boolean {
  if (el.getAttribute("aria-hidden") === "true" || el.closest("[aria-hidden=true]")) return false;
  const native = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
  if (native && (el.tabIndex < 0 || (el instanceof HTMLInputElement && el.type === "hidden"))) return false;
  return !isDestructive(el);
}

/**
 * The control an `input`/`change` event edited: the target itself when it is
 * a real control; for Base UI's hidden form inputs (Select, Checkbox, Switch,
 * Radio) the visible control of the same SettingRow, group or field.
 */
function editedControl(target: Element): HTMLElement | null {
  const direct = target.closest<HTMLElement>(EDIT_CONTROLS);
  if (direct && isEditable(direct)) return direct;
  const scope = target.closest("[role=radiogroup], [role=group], [data-setting-row], fieldset") ?? target.parentElement;
  const candidates = scope ? Array.from(scope.querySelectorAll<HTMLElement>(EDIT_CONTROLS)).filter(isEditable) : [];
  // Prefer the control the user is working with (it has focus), then a radio group's
  // selected option, then the scope's first control.
  const active = document.activeElement;
  if (active instanceof HTMLElement && candidates.includes(active)) return active;
  if (scope?.getAttribute("role") === "radiogroup") {
    const checked = candidates.find((el) => el.getAttribute("aria-checked") === "true");
    if (checked) return checked;
  }
  return candidates[0] ?? null;
}

/** Destructive buttons (`Button variant="destructive" | "destructive-ghost"`) never receive returned focus. */
function isDestructive(el: Element): boolean {
  return Boolean(el.closest('[data-variant^="destructive"]'));
}

/** True when the element sits in a fixed layer (dialog, sheet, popover, toast) that never scrolls under the bar. */
function isInFixedLayer(el: Element): boolean {
  // An <input> itself doesn't count: Base UI's visually hidden inputs (the Slider thumb's
  // range input) are `position: fixed` inside a transformed thumb, i.e. part of the page.
  const start = el instanceof HTMLInputElement ? el.parentElement : el;
  for (let node: Element | null = start; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).position === "fixed") return true;
  }
  return false;
}

/** The element whose scrolling moves the page under the sticky bar (usually the document). */
function getScrollParent(el: HTMLElement): HTMLElement {
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) return node;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

/** Can this element take focus again (still in the page, not disabled, inert or hidden)? */
function isFocusable(el: HTMLElement | null): el is HTMLElement {
  if (!el || !el.isConnected || el.closest("[inert]")) return false;
  if ((el as HTMLButtonElement).disabled || el.closest("fieldset:disabled")) return false;
  return el.getClientRects().length > 0;
}

/** Puts keyboard focus back on `el` (no scrolling), else on the page's #main landmark. */
function restoreFocus(el: HTMLElement | null) {
  if (isFocusable(el)) {
    el.focus({ preventScroll: true });
    return;
  }
  const main = document.getElementById("main");
  if (!main) return;
  if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
  main.focus({ preventScroll: true });
}

type PendingLeave =
  | { kind: "link"; href: string }
  | { kind: "history"; key: string }
  /** A `confirmLeave()` call (useLeaveGuard): resolves true on Discard, false on Keep editing. */
  | { kind: "confirm"; resolve: (leave: boolean) => void };

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

/*
 * Guards that currently hold unsaved changes (normally the page's one
 * SaveBar). `confirmLeave()` asks the most recent one.
 */
type ActiveGuard = { ask: () => Promise<boolean> };
const activeGuards = new Set<ActiveGuard>();

/**
 * Resolves true when it is fine to leave: immediately when nothing is
 * unsaved, otherwise after the user picks "Discard changes" in the same
 * dialog the in-app links get (false for "Keep editing" / Escape). Changes
 * are reset (`onDiscard`) before it resolves, and the browser's own
 * "Leave site?" prompt is skipped for the navigation that follows.
 */
export function confirmLeave(): Promise<boolean> {
  const guard = Array.from(activeGuards).at(-1);
  return guard ? guard.ask() : Promise.resolve(true);
}

/**
 * For navigation the guard can't see — `router.push()` in a server
 * switcher, a redirect after a delete, `signOut()` from the account menu.
 * Wrap it instead of adding your own confirm:
 *
 *   const { confirmLeave } = useLeaveGuard();
 *   <DropdownMenuItem onClick={async () => { if (await confirmLeave()) signOut(); }}>Sign out</DropdownMenuItem>
 *   onValueChange={async (id) => { if (await confirmLeave()) router.push(`/dashboard?guild=${id}`); }}
 *
 * Works anywhere under the page (sidebar, header, menus); with nothing
 * unsaved it resolves true at once.
 */
export function useLeaveGuard() {
  return { confirmLeave };
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
 * - Programmatic navigation (router.push, signOut): wrap it in
 *   `confirmLeave()` from `useLeaveGuard()` — same dialog.
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
  // Mirrors the state for event handlers and promise settling (no side effects in updaters).
  const pendingRef = useRef<PendingLeave | null>(null);
  const bypass = useRef(false);

  const setPending = useCallback((next: PendingLeave | null) => {
    const previous = pendingRef.current;
    // A confirmLeave() that is replaced or dismissed resolves "stay".
    if (previous?.kind === "confirm" && previous !== next) previous.resolve(false);
    pendingRef.current = next;
    setPendingLeave(next);
  }, []);

  // Pending confirmLeave() calls resolve "stay" if the guard goes away.
  useEffect(() => () => setPending(null), [setPending]);

  useEffect(() => {
    if (!when) return;
    bypass.current = false;

    const guard: ActiveGuard = {
      ask: () => new Promise<boolean>((resolve) => setPending({ kind: "confirm", resolve })),
    };
    activeGuards.add(guard);

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
      setPending({ kind: "link", href: url.pathname + url.search + url.hash });
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
      setPending({ kind: "history", key: nav.destination.key });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    navigation?.addEventListener("navigate", onNavigate);
    return () => {
      activeGuards.delete(guard);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
      navigation?.removeEventListener("navigate", onNavigate);
    };
  }, [when, setPending]);

  const discard = () => {
    const leave = pendingRef.current;
    pendingRef.current = null;
    setPendingLeave(null);
    if (!leave) return;
    bypass.current = true;
    onDiscard?.();
    if (leave.kind === "confirm") {
      leave.resolve(true);
      return;
    }
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
    <AlertDialog open={pendingLeave !== null} onOpenChange={(open) => (open ? undefined : setPending(null))}>
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
