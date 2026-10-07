import { useEffect, type RefObject } from "react";

/**
 * Marks a horizontal scroller with `data-overflow-start` / `data-overflow-end`
 * while there is hidden content on that side. Pair it with the
 * `overflow-fade-x` utility (globals.css), which fades the overflowing edge(s)
 * and pads focus/snap scrolling clear of the fade. Attributes are set
 * directly on the element — no React re-render on scroll.
 */
export function useScrollOverflow(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      el.toggleAttribute("data-overflow-start", max > 1 && el.scrollLeft > 1);
      el.toggleAttribute("data-overflow-end", max > 1 && el.scrollLeft < max - 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", schedule, { passive: true });
    // Its own size and its content's size (labels, fonts loading) both matter.
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", schedule);
      observer.disconnect();
      el.removeAttribute("data-overflow-start");
      el.removeAttribute("data-overflow-end");
    };
  }, [ref, enabled]);
}

/**
 * Keeps the selected item (`[aria-selected=true]` / `[aria-checked=true]`)
 * of a horizontal scroller fully in view — on mount (instantly), whenever
 * the selection changes and whenever keyboard focus moves to another item
 * (smoothly, unless reduced motion). It lands on a snap position (the start
 * of an item, minus the scroll padding), so the neighbour peeks out under
 * the edge fade instead of a half-cut label.
 */
export function useRevealSelected(ref: RefObject<HTMLElement | null>, selector: string, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const reveal = (item: HTMLElement | null, behavior: ScrollBehavior) => {
      if (!item || el.scrollWidth <= el.clientWidth) return;
      const pad = parseFloat(getComputedStyle(el).scrollPaddingInlineStart) || 0;
      const box = el.getBoundingClientRect();
      const offset = (node: HTMLElement) => node.getBoundingClientRect().left - box.left + el.scrollLeft;
      const left = offset(item);
      const right = left + item.offsetWidth;
      const max = el.scrollWidth - el.clientWidth;
      let target: number | null = null;
      if (left - pad < el.scrollLeft) {
        target = left - pad; // cut at the start: its own snap position
      } else if (right + pad > el.scrollLeft + el.clientWidth) {
        // Cut at the end: the first item start that brings it fully into view.
        const needed = right + pad - el.clientWidth;
        const role = item.getAttribute("role");
        const siblings = Array.from(item.parentElement?.children ?? []).filter(
          (node): node is HTMLElement => node instanceof HTMLElement && node.getAttribute("role") === role,
        );
        const stops = siblings.map((node) => offset(node) - pad).filter((stop) => stop >= needed);
        target = stops.length ? Math.min(...stops) : max;
      }
      if (target === null) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: reduce ? "instant" : behavior });
    };
    const selected = () => el.querySelector<HTMLElement>(selector);
    const frame = requestAnimationFrame(() => reveal(selected(), "instant"));
    const observer = new MutationObserver(() => reveal(selected(), "smooth"));
    observer.observe(el, { subtree: true, attributes: true, attributeFilter: ["aria-selected", "aria-checked"] });
    // Arrow keys move focus without selecting (manual activation): follow the focus.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches(":focus-visible") && target.parentElement?.closest("[role=tablist],[role=radiogroup]")) {
        reveal(target, "smooth");
      }
    };
    el.addEventListener("focusin", onFocusIn);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("focusin", onFocusIn);
    };
  }, [ref, selector, enabled]);
}
