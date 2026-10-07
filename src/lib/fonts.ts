import { Geist, Geist_Mono, Mona_Sans } from "next/font/google";

/**
 * Pleed type families (self-hosted by next/font — no requests to Google at
 * runtime, size-adjusted fallbacks so there is no layout shift).
 *
 * - Display: Mona Sans (variable weight + width). Headings use a slightly
 *   expanded width (font-stretch 104–112%) for a confident, premium voice.
 * - UI/body: Geist — highly legible at small sizes, neutral, crisp.
 * - Mono: Geist Mono — commands, code, keyboard keys, eyebrows.
 *
 * The CSS variables below are read by `@theme inline` in globals.css
 * (`--font-sans`, `--font-display`, `--font-mono`). Never reference
 * `--font-sans` from itself — that cycle was the Times New Roman bug.
 */
export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const fontDisplay = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona-sans",
  display: "swap",
  axes: ["wdth"],
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  // Mono only appears below the fold on most pages; don't compete with LCP.
  preload: false,
});

export const fontVariables = `${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`;
