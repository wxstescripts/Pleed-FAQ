"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType } from "react";

/**
 * In-view entrances that are safe for SEO, LCP and no-JS:
 *
 * - The server renders content fully visible (no opacity:0 in the HTML).
 * - After hydration, only elements that are still BELOW the fold are hidden
 *   and then faded/risen in when they scroll into view. Anything already on
 *   screen is left alone, so there is no flash and no layout shift
 *   (transform + opacity only).
 * - prefers-reduced-motion, missing IntersectionObserver or print → nothing
 *   is ever hidden.
 *
 * Usable from Server Components: <Reveal> and <Stagger> are tiny client
 * islands; their children can be server-rendered.
 */

type RevealMode = "self" | "children";

type RevealOptions = {
  mode: RevealMode;
  delay: number;
  step: number;
  y: number | undefined;
  maxDelay: number;
};

function useReveal(ref: React.RefObject<HTMLElement | null>, options: RevealOptions) {
  const { mode, delay, step, y, maxDelay } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Only animate content the user hasn't seen yet.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return;

    const targets = (mode === "children" ? Array.from(el.children) : [el]) as HTMLElement[];
    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-delay", `${Math.min(delay + index * step, maxDelay)}ms`);
      if (y !== undefined) target.style.setProperty("--reveal-y", `${y}px`);
      target.dataset.reveal = "hidden";
    });

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        frame = requestAnimationFrame(() => {
          targets.forEach((target) => {
            target.dataset.reveal = "shown";
          });
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      targets.forEach((target) => {
        target.dataset.reveal = "shown";
      });
    };
  }, [ref, mode, delay, step, y, maxDelay]);
}

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  /** Delay before the entrance, in ms. */
  delay?: number;
  /** Rise distance in px (default 12). */
  y?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Fades and rises its own element in when it enters the viewport. */
export function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  y,
  children,
  ...rest
}: PolymorphicProps<T>) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { mode: "self", delay, step: 0, y, maxDelay: 1200 });
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Reveals each direct child in sequence (`step` ms apart, capped at
 * `maxDelay`). Keep `step` small (40–80 ms) so rows settle together.
 */
export function Stagger<T extends ElementType = "div">({
  as,
  delay = 0,
  step = 60,
  maxDelay = 480,
  y,
  children,
  ...rest
}: PolymorphicProps<T> & { step?: number; maxDelay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { mode: "children", delay, step, y, maxDelay });
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
