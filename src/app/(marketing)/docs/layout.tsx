import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { DocsMobileBar, DocsNav } from "@/components/docs/docs-nav";
import { DocsSearchButton, DocsSearchProvider } from "@/components/docs/docs-search";

/**
 * Docs shell (inside the marketing layout's header/main/footer):
 * - < 1024: a sticky bar under the site header — "Docs menu" (Sheet) + search.
 * - ≥ 1024: a sticky left sidebar with search and the page list.
 * Pages render their own article (+ "On this page" column from 1280).
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsSearchProvider>
      <div className="sticky top-header z-sticky border-b border-line-subtle bg-canvas/85 backdrop-blur-md lg:hidden">
        <Container size="wide">
          <DocsMobileBar />
        </Container>
      </div>
      <Container size="wide" className="flex-1 lg:grid lg:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
        <div
          className="sticky top-header hidden max-h-[calc(100dvh-var(--spacing-header))] self-start overflow-y-auto overscroll-contain py-10 pr-2 lg:block"
        >
          <div className="flex flex-col gap-6">
            <DocsSearchButton />
            <DocsNav variant="sidebar" />
          </div>
        </div>
        <div className="min-w-0 pt-8 pb-section-sm md:pt-10 lg:pt-10">{children}</div>
      </Container>
    </DocsSearchProvider>
  );
}
