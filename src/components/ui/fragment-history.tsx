"use client";

import { useEffect } from "react";

type HistoryState = { __NA?: unknown } | null | undefined;

/**
 * Keeps Back/Forward working across plain `#fragment` links.
 *
 * A native fragment navigation (the "Skip to content" link, a docs table of
 * contents, `<a href="#faq">`) creates a history entry whose state is null.
 * The App Router ignores popstate for entries without its own state, so
 * after a later client-side navigation, Back to such an entry changed the
 * URL but left the other page on screen. This copies the router's state of
 * the same page onto the new entry, so Next.js restores it like any other.
 * Rendered once in the root layout; renders nothing.
 */
export function FragmentHistory() {
  useEffect(() => {
    let routerState: HistoryState = window.history.state;
    const remember = () => {
      const state = window.history.state as HistoryState;
      if (state?.__NA) routerState = state;
    };
    const onHashChange = () => {
      if (window.history.state == null && routerState?.__NA) {
        window.history.replaceState(routerState, "", window.location.href);
      }
      remember();
    };
    // Clicks (capture) run before a link navigates: remember the state of the page we're on.
    document.addEventListener("click", remember, true);
    window.addEventListener("popstate", remember);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", remember, true);
      window.removeEventListener("popstate", remember);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);
  return null;
}
