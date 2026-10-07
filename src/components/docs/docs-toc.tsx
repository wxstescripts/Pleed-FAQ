"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { DocsHeading } from "@/content/docs/types";

/** How far below the viewport top a heading counts as "reached" (scroll-padding + slack). */
function activationLine(): number {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 80;
  return padding + 24;
}

/**
 * Scroll-spy: the id of the last heading whose top has passed the activation
 * line (or the last heading once the page can't scroll further). Positions
 * are read in one rAF per scroll — fine for the ≤ 20 headings a page has.
 */
function useActiveHeading(ids: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0]);
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = activationLine();
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && window.scrollY > 0) current = elements[elements.length - 1].id;
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [ids]);
  return active;
}

/**
 * "On this page" for ≥ 1280: sticky beside the article, the section you're
 * reading highlighted (aria-current="location"), kept in view inside the
 * list when the list scrolls.
 */
export function DocsToc({ headings }: { headings: DocsHeading[] }) {
  const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const active = useActiveHeading(ids);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!list || !link || list.scrollHeight <= list.clientHeight) return;
    const top = link.offsetTop - list.offsetTop;
    if (top < list.scrollTop + 24 || top > list.scrollTop + list.clientHeight - 48) {
      list.scrollTo({ top: top - list.clientHeight / 2 });
    }
  }, [active]);

  return (
    <nav aria-labelledby="docs-toc-title" className="flex max-h-full flex-col gap-3">
      <p id="docs-toc-title" className="type-eyebrow text-fg-tertiary">
        On this page
      </p>
      <ul ref={listRef} className="-ml-px min-h-0 overflow-y-auto overscroll-contain border-l border-line pr-1 scrollbar-none">
        {headings.map((heading) => {
          const current = heading.id === active;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "relative -ml-px flex min-h-8 items-center border-l py-1 type-small transition-colors duration-150 focus-visible:focus-ring-inset",
                  heading.level === 3 ? "pl-6" : "pl-3",
                  current
                    ? "border-brand-400 text-fg"
                    : "border-transparent text-fg-tertiary hover:border-line-hover hover:text-fg-secondary",
                )}
              >
                {heading.title}
              </a>
            </li>
          );
        })}
      </ul>
      <a
        href="#main"
        className="inline-flex w-fit items-center gap-1.5 rounded-sm type-caption text-fg-tertiary transition-colors duration-150 hover:text-fg focus-visible:focus-ring"
      >
        <ArrowUp aria-hidden="true" className="size-3.5" />
        Back to top
      </a>
    </nav>
  );
}
