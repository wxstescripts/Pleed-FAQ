"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The sticky site header's surface — the only client code the header shell
 * needs. Transparent at the very top (a `Section behindHeader` hero glow shows
 * through), then canvas/80 + blur + a hairline once the page scrolls.
 *
 * No scroll listener: a 1 px sentinel at the top of the page is observed, so
 * nothing runs while scrolling. The border is always there (transparent at
 * the top), so the header's height never changes — zero layout shift.
 * Children stay server-rendered.
 */
export function HeaderSurface({ children }: { children: ReactNode }) {
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Out of flow, top of the page: once it leaves the viewport the page has scrolled ≥ 8 px. */}
      <span ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-2" />
      <header
        data-scrolled={scrolled ? "" : undefined}
        className={cn(
          "sticky top-0 z-header h-header shrink-0 border-b border-transparent",
          "transition-[background-color,border-color,backdrop-filter] duration-200 ease-standard",
          "data-scrolled:border-line-subtle data-scrolled:bg-canvas/95",
          "data-scrolled:supports-backdrop-filter:bg-canvas/80 data-scrolled:supports-backdrop-filter:backdrop-blur-md data-scrolled:supports-backdrop-filter:backdrop-saturate-150",
        )}
      >
        {children}
      </header>
    </>
  );
}
