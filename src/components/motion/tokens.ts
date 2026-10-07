/**
 * Motion tokens for framer-motion (mirrors the CSS tokens in globals.css).
 * Rules: animate transform + opacity only, 150–500 ms, never hide LCP
 * content on the server (use <Reveal/> for in-view entrances).
 */
export const duration = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
  slower: 0.5,
  reveal: 0.6,
} as const;

export const ease = {
  /** Default UI easing — quick start, gentle settle. */
  standard: [0.2, 0, 0, 1],
  /** Entrances and reveals. */
  outExpo: [0.16, 1, 0.3, 1],
  /** Exits. */
  exit: [0.4, 0, 1, 1],
  inOut: [0.45, 0, 0.55, 1],
} as const;

export const spring = {
  /** Toggles, thumbs, small UI. */
  snappy: { type: "spring", stiffness: 520, damping: 38, mass: 0.7 },
  /** Panels, sheets, larger surfaces. */
  gentle: { type: "spring", stiffness: 260, damping: 32, mass: 0.9 },
} as const;

/** Distance (px) for rise-in entrances. Keep small: 8–16. */
export const RISE = 12;

/** Ready-made variants for `m.*` components. */
export const fadeRise = {
  hidden: { opacity: 0, y: RISE },
  visible: { opacity: 1, y: 0, transition: { duration: duration.reveal, ease: ease.outExpo } },
} as const;

export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.standard } },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease: ease.outExpo } },
} as const;

export const staggerChildren = (step = 0.06, delay = 0) =>
  ({
    hidden: {},
    visible: { transition: { staggerChildren: step, delayChildren: delay } },
  }) as const;
