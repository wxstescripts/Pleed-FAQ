"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";

export type ScrollRegionProps = Omit<ComponentPropsWithoutRef<"div">, "role" | "tabIndex" | "aria-label"> & {
  /** Names the region while it scrolls ("Auto-responders", "Permissions by command"). */
  label: string;
};

/**
 * A sideways scroller that is a keyboard stop ONLY while it actually scrolls.
 * While its content overflows it is a labelled region (`role="region"`,
 * `aria-label`, `tabIndex=0`), so keyboard users can scroll it with the arrow
 * keys (WCAG 2.1.1; axe `scrollable-region-focusable`). When everything fits
 * — the usual case — it is a plain box: no dead tab stop with a focus ring in
 * front of every table. Re-checked whenever the box or its content resizes.
 *
 * A tiny client island: its children stay server-rendered. Used by
 * ProseTable and ResponsiveList; give it `overflow-x-auto` and `relative`.
 */
export function ScrollRegion({ label, children, ...props }: ScrollRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (el.scrollWidth > el.clientWidth + 1) {
        el.setAttribute("role", "region");
        el.setAttribute("aria-label", label);
        el.tabIndex = 0;
      } else {
        el.removeAttribute("role");
        el.removeAttribute("aria-label");
        el.removeAttribute("tabindex");
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Its own width and its content's width (fonts loading, rows added) both matter.
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [label]);
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}
