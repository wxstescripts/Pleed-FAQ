"use client";

import { House, RotateCcw, ServerCrash } from "lucide-react";
import { useEffect, useRef, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IconTile } from "@/components/ui/icon-tile";
import { Logo } from "@/components/ui/logo";
import { TextLink } from "@/components/ui/text-link";
import { SUPPORT_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Root error boundary: a render error anywhere below the root layout (the
 * marketing layout, a page, the dashboard shell) lands here. It replaces the
 * whole subtree — the site header included — so it draws its own minimal
 * frame instead of re-mounting the header that may be what crashed. A crash
 * in the root layout itself is handled by global-error.tsx.
 *
 * `retry` (Next 16.3) re-fetches the segment and re-renders it; while it runs
 * the button reads "Retrying…" and stays focused but inert.
 */
export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const [retrying, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Surface it for whoever is looking (browser console / server logs via digest).
    console.error(error);
  }, [error]);

  useEffect(() => {
    // The page the user was reading just vanished: move focus to the explanation so
    // keyboard and screen-reader users start from it — unless they've already moved on.
    if (document.activeElement === document.body || document.activeElement === null) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, []);

  // Production server errors carry only a digest (the message is redacted); in development show the real message.
  const detail =
    process.env.NODE_ENV === "development" ? error.message || error.digest : error.digest ? `Reference ${error.digest}` : undefined;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="h-header shrink-0 border-b border-line-subtle">
        <Container className="flex h-full items-center">
          <Logo href="/" />
        </Container>
      </header>

      <main id="main" className="flex flex-1 flex-col">
        <Container size="narrow" className="my-auto py-section">
          <div className="flex flex-col items-center gap-6 text-center">
            <IconTile icon={ServerCrash} tone="danger" size="lg" />
            <div className="flex flex-col items-center gap-3">
              <p className="type-eyebrow text-danger-fg">Unexpected error</p>
              <h1 ref={headingRef} tabIndex={-1} className="type-h2 text-fg outline-none">
                Something went wrong
              </h1>
              <p className="max-w-lg type-lead text-fg-secondary">
                This page hit an error while loading. Trying again usually fixes it — your Pleed settings are safe.
              </p>
              {detail ? (
                <p className="mt-1 max-w-full rounded-md border border-line-subtle bg-inset px-2.5 py-1 type-code-sm wrap-anywhere text-fg-tertiary">
                  {detail}
                </p>
              ) : null}
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                size="lg"
                onClick={() => startTransition(() => retry())}
                aria-disabled={retrying || undefined}
                aria-busy={retrying || undefined}
                className={cn(retrying && "aria-disabled:opacity-100")}
              >
                <RotateCcw aria-hidden="true" className={cn(retrying && "animate-spin-slow")} />
                {retrying ? "Retrying…" : "Try again"}
              </Button>
              {/* A full page load, not a client navigation: whatever broke may live in shared client state. */}
              <Button size="lg" variant="secondary" href="/" prefetch={false} onClick={hardNavigate}>
                <House aria-hidden="true" />
                Back to home
              </Button>
            </div>

            <p className="type-small text-fg-tertiary">
              Still broken? Check the <TextLink href="/status">status page</TextLink> or tell us in the{" "}
              <TextLink href={SUPPORT_URL}>support server</TextLink>.
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}

/** Turn a next/link click into a real page load (keeps modifier-clicks and middle-clicks as they are). */
function hardNavigate(event: React.MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.location.assign(event.currentTarget.href);
}
