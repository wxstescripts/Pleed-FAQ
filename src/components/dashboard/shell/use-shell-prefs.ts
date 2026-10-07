"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Small client-only preferences for the dashboard shell. The shell renders
 * only after the session resolves (the server and the first client render
 * show the session skeleton), so these snapshots never take part in
 * hydration; the server snapshots exist for completeness.
 */

/** Tailwind `lg` → `xl` on a mouse/trackpad: the sidebar starts as an icon rail. */
const AUTO_RAIL_QUERY = "(min-width: 64rem) and (max-width: 79.98rem) and (pointer: fine)";
/** Tailwind `lg`: the sidebar replaces the phone/tablet app bar. */
export const DESKTOP_QUERY = "(min-width: 64rem)";

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar: icon rail or full width                                    */
/* ------------------------------------------------------------------ */

// Per-viewer convenience only (DESIGN: browser storage never holds real state).
const SIDEBAR_KEY = "pleed:dashboard-sidebar";
type SidebarPreference = "rail" | "full" | null;
const listeners = new Set<() => void>();

/** The last choice made on this page view — used when localStorage is blocked. */
let memory: SidebarPreference = null;

function readPreference(): SidebarPreference {
  try {
    const value = window.localStorage.getItem(SIDEBAR_KEY);
    return value === "rail" || value === "full" ? value : memory;
  } catch {
    return memory;
  }
}

function subscribePreference(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * `rail` — the ≥ 1024 px sidebar shows icons only (64 px). Default: rail on
 * 1024–1279 px with a fine pointer (tooltips work there), full everywhere
 * else (touch tablets need visible labels). The toggle's choice is kept for
 * this browser.
 */
export function useSidebarRail(): { rail: boolean; setRail: (rail: boolean) => void } {
  const preference = useSyncExternalStore(subscribePreference, readPreference, () => null);
  const autoRail = useMediaQuery(AUTO_RAIL_QUERY);
  const rail = preference === "rail" || (preference === null && autoRail);
  const setRail = useCallback((next: boolean) => {
    memory = next ? "rail" : "full";
    try {
      window.localStorage.setItem(SIDEBAR_KEY, memory);
    } catch {
      // Storage blocked (private mode, previews): the in-memory choice still applies.
    }
    listeners.forEach((listener) => listener());
  }, []);
  return { rail, setRail };
}

/* ------------------------------------------------------------------ */
/* Platform: ⌘ on Apple keyboards, Ctrl elsewhere                       */
/* ------------------------------------------------------------------ */

const noop = () => () => {};

export function useModifierKey(): "⌘" | "Ctrl" {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "Ctrl",
  );
}
