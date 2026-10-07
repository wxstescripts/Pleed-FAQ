"use client";

import { useEffect } from "react";

/** Scrolls to the element a fragment id names, honouring html's scroll-padding (lands under the sticky header). */
export function scrollToFragment(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ block: "start" });
  return true;
}

/**
 * Makes "/#features"-style links work when the URL already carries that
 * fragment. Next's <Link> treats a click on the current URL as a no-op, so
 * after scrolling away from Features, clicking "Features" again (header,
 * mobile menu, footer, any page link) did nothing. A plain `<a href="#x">`
 * scrolls again in every browser; this restores that behaviour.
 *
 * Only that exact case is handled (same path + query + fragment, plain
 * left click, same tab, not inside a dialog — the mobile menu scrolls once it
 * has closed); everything else stays with Next and the browser.
 * One capture listener on the document, rendered once by the site header.
 */
export function SameHashScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href*='#']");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;
      // Links inside a dialog (the mobile menu) wait for it to close and release its scroll lock.
      if (link.closest("[role='dialog']")) return;
      const url = new URL(link.href, window.location.href);
      const here = window.location;
      if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return;
      if (!url.hash || url.hash !== here.hash) return;
      if (scrollToFragment(decodeURIComponent(url.hash.slice(1)))) event.preventDefault();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
