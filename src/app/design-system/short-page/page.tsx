import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

import { ShortPageDemo } from "../_components/short-page-demo";

export const metadata: Metadata = {
  title: "Short dashboard page",
  description: "A dashboard page shorter than the viewport: the SaveBar rests at the bottom of the screen (development only).",
  robots: { index: false, follow: false },
};

/**
 * Dev-only reference for the dashboard page contract (DESIGN.md §3 SaveBar):
 * the page column fills the viewport under the header and the page Container
 * is `<Container size="settings" className="flex flex-1 flex-col py-page">`,
 * so a SaveBar on a short page rests at the bottom of the screen instead of
 * floating under the content, and spans exactly the cards' width.
 */
export default function ShortPagePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-header border-b border-line-subtle bg-canvas/85 backdrop-blur-md">
        <Container size="wide" className="flex h-header items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" />
            <Badge tone="brand" size="sm" className="max-sm:hidden">
              Design system
            </Badge>
          </div>
          <Button href="/design-system#settings" variant="ghost" size="sm">
            Back to the showcase
          </Button>
        </Container>
      </header>
      {/* The page column: fills the viewport below the header (flex-1 in a min-h-dvh column), a flex column. */}
      <div className="flex flex-1 flex-col">
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {/* A settings page: the `settings` measure keeps every control within reach of its label. */}
          <Container size="settings" className="flex flex-1 flex-col py-page">
            <ShortPageDemo />
          </Container>
        </main>
      </div>
    </div>
  );
}
