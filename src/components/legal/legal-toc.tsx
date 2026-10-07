"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type TocItem = {
  /** id of the target element (a section, or a sub-heading inside one). */
  id: string;
  label: string;
  /** Visible section number ("1"); omitted for "At a glance" and sub-headings. */
  number?: string;
  level: 2 | 3;
};

/** Keys that scroll the page: a user scrolling by keyboard ends a TOC jump's "pin". */
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

/**
 * Scroll-spy: the id of the section being read.
 *
 * - A section is current once its top passes a reading line a little below
 *   the sticky header (the html scroll-padding + up to 20% of the viewport).
 * - After a jump (TOC click, any #fragment link, a URL with a hash) the
 *   target stays current while it is on screen, even when it is too close to
 *   the end of the page to reach the reading line; the next wheel, touch or
 *   scrolling key releases it.
 * - At the very bottom of the page the last section that is on screen wins,
 *   so a short final section still gets highlighted.
 * One rAF-throttled passive scroll listener; no layout writes.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const pinned = useRef<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const targets = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const pinFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && targets.some((t) => t.id === id)) pinned.current = id;
    };

    let frame = 0;
    const compute = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const line = padding + Math.min(viewport * 0.2, 160);
      const tops = targets.map((t) => t.getBoundingClientRect().top);

      let current = targets[0].id;
      tops.forEach((top, i) => {
        if (top <= line) current = targets[i].id;
      });

      const pin = pinned.current ? targets.findIndex((t) => t.id === pinned.current) : -1;
      const doc = document.documentElement;
      const atBottom = Math.ceil(window.scrollY + viewport) >= doc.scrollHeight - 2;

      if (pin >= 0 && tops[pin] > -1 && tops[pin] < viewport) {
        current = targets[pin].id;
      } else {
        pinned.current = null;
        if (atBottom) {
          tops.forEach((top, i) => {
            if (top < viewport) current = targets[i].id;
          });
        }
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };
    const release = () => {
      pinned.current = null;
    };
    const onKey = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) release();
    };
    const onHash = () => {
      pinFromHash();
      schedule();
    };

    pinFromHash();
    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", onKey);
    };
  }, [key]);

  const pin = (id: string) => {
    pinned.current = id;
    setActive(id);
  };

  return { active, pin };
}

/** The section number column ("01"). Level-2 items without a number keep the slot, so every label aligns. */
function TocNumber({ item }: { item: TocItem }) {
  if (item.level === 3) return null;
  return (
    <span aria-hidden="true" className="w-5 shrink-0 type-code-xs text-fg-tertiary tabular-nums">
      {item.number?.padStart(2, "0")}
    </span>
  );
}

/**
 * Sticky "On this page" for ≥ 1024 px: a rail of links with the current
 * section marked (2 px brand segment on the rail, `aria-current="location"`).
 */
export function LegalTocNav({ items, className }: { items: TocItem[]; className?: string }) {
  const { active, pin } = useActiveSection(items.map((item) => item.id));
  return (
    <nav aria-labelledby="legal-toc-title" className={className}>
      <p id="legal-toc-title" className="mb-3 type-eyebrow text-fg-tertiary">
        On this page
      </p>
      <ul className="flex flex-col border-l border-line">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => pin(item.id)}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "relative -ml-px flex min-h-9 items-baseline gap-2 rounded-r-md border-l-2 border-transparent py-2 pr-2 type-small text-fg-tertiary",
                  "transition-[color,border-color,background-color] duration-150 ease-standard",
                  "hover:border-line-hover hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring",
                  "aria-[current=location]:border-brand-400 aria-[current=location]:text-fg",
                  "pointer-coarse:min-h-11 pointer-coarse:items-center",
                  item.level === 3 ? "pl-14" : "pl-3",
                )}
              >
                <TocNumber item={item} />
                <span className="min-w-0">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * "On this page" for phones and tablet portrait: a native <details>
 * disclosure (works without JavaScript, opens for find-in-page), closed by
 * default so the document starts right away. Choosing a section closes it.
 */
export function LegalTocDisclosure({ items, className }: { items: TocItem[]; className?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const sections = items.filter((item) => item.number).length;
  return (
    <details ref={ref} className={cn("group/toc rounded-xl border border-line bg-surface-1 inset-shadow-highlight", className)}>
      <summary
        className={cn(
          "flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 select-none",
          "transition-colors duration-150 ease-standard hover:bg-hover active:bg-pressed focus-visible:focus-ring",
          "group-open/toc:rounded-b-none [&::-webkit-details-marker]:hidden",
        )}
      >
        <span className="flex items-baseline gap-2">
          <span className="type-label text-fg">On this page</span>
          <span className="type-caption text-fg-tertiary">{sections} sections</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-fg-tertiary transition-transform duration-200 ease-standard group-open/toc:rotate-180"
        />
      </summary>
      <nav aria-label="On this page" className="border-t border-line-subtle px-2 py-2">
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => ref.current?.removeAttribute("open")}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-md pr-2 type-small text-fg-secondary",
                  "transition-colors duration-150 ease-standard hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring",
                  item.level === 3 ? "pl-13" : "pl-2",
                )}
              >
                <TocNumber item={item} />
                <span className="min-w-0">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
