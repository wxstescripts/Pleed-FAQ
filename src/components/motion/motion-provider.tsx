"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Wraps the app once (root layout). Use `m.div` (not `motion.div`) inside
 * client components so only the lazily loaded `domAnimation` features ship.
 * `reducedMotion="user"` makes every framer animation honour
 * prefers-reduced-motion (transforms are skipped, opacity still fades).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
