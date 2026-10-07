"use client";

import "./globals.css";

import { fontVariables } from "@/lib/fonts";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

import RootError from "./error";

/**
 * Last-resort boundary for a crash in the root layout itself. It replaces the
 * whole document, so it brings its own <html>/<body>, global styles and fonts
 * (the same `dark` class and font variables as layout.tsx) and reuses the root
 * error screen. Error boundaries are Client Components, so the title is a
 * React <title> instead of a `metadata` export.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" dir="ltr" className={cn("dark", fontVariables)}>
      <head>
        <title>{`Something went wrong · ${SITE_NAME}`}</title>
        <meta name="robots" content="noindex" />
      </head>
      <body className="min-h-dvh bg-canvas font-sans text-fg antialiased">
        <RootError error={error} retry={retry} />
      </body>
    </html>
  );
}
