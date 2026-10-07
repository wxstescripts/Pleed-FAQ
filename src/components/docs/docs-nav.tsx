"use client";

import { usePathname } from "next/navigation";
import { LifeBuoy, PanelLeft, SquareTerminal } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { SUPPORT_URL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { NavItem } from "@/components/ui/nav-item";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DOCS_HOME, DOCS_SECTIONS, docsHref, docsPages, getDocsPageMeta } from "@/content/docs/index";
import { DocsSearchButton } from "@/components/docs/docs-search";
import { DOCS_HOME_ICON, docsPageIcon } from "@/components/docs/page-icons";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname === `${href}/`;
}

/**
 * The docs page list, grouped by section. "sidebar" rows on desktop (≥ 1024),
 * 48 px "sheet" rows in the phone/tablet drawer. Active page: aria-current
 * and the brand indicator (NavItem).
 */
export function DocsNav({ variant, onNavigate }: { variant: "sidebar" | "sheet"; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6">
      <ul className="flex flex-col gap-0.5">
        <li>
          <NavItem
            variant={variant}
            href={DOCS_HOME.href}
            icon={DOCS_HOME_ICON}
            active={isActive(pathname, DOCS_HOME.href)}
            onClick={onNavigate}
          >
            Overview
          </NavItem>
        </li>
      </ul>
      {DOCS_SECTIONS.map((section) => {
        const pages = docsPages.filter((page) => page.section === section);
        const headingId = `docs-nav-${variant}-${section.toLowerCase().replace(/[^a-z]+/g, "-")}`;
        return (
          <div key={section} className="flex flex-col gap-1.5">
              <p id={headingId} className={cn("type-eyebrow text-fg-tertiary", variant === "sheet" ? "px-3" : "px-2.5")}>
                {section}
              </p>
              <ul aria-labelledby={headingId} className="flex flex-col gap-0.5">
                {pages.map((page) => {
                  const href = docsHref(page.slug);
                  return (
                    <li key={page.slug}>
                      <NavItem
                        variant={variant}
                        href={href}
                        icon={docsPageIcon(page.slug)}
                        active={isActive(pathname, href)}
                        onClick={onNavigate}
                      >
                        {page.title}
                      </NavItem>
                    </li>
                  );
                })}
              </ul>
          </div>
        );
      })}
      <div className="flex flex-col gap-1.5 border-t border-line-subtle pt-5">
        <p id={`docs-nav-${variant}-more`} className={cn("type-eyebrow text-fg-tertiary", variant === "sheet" ? "px-3" : "px-2.5")}>
          More
        </p>
        <ul aria-labelledby={`docs-nav-${variant}-more`} className="flex flex-col gap-0.5">
          <li>
            <NavItem variant={variant} href="/commands" icon={SquareTerminal} onClick={onNavigate}>
              Command explorer
            </NavItem>
          </li>
          <li>
            <NavItem variant={variant} href={SUPPORT_URL} icon={LifeBuoy}>
              Support server
            </NavItem>
          </li>
        </ul>
      </div>
    </nav>
  );
}

/** Where the reader is, for the phone docs bar: "Security & anti-nuke" / "Overview". */
function useCurrentDocsTitle(): string {
  const pathname = usePathname() ?? "";
  const slug = pathname.replace(/^\/docs\/?/, "").split("/")[0];
  return (slug && getDocsPageMeta(slug)?.title) || "Overview";
}

/**
 * Phones and tablet portrait (< 1024): a sticky bar under the site header
 * with the "Docs menu" button (opens the page list in a Sheet), the current
 * page and search.
 */
export function DocsMobileBar() {
  const [open, setOpen] = useState(false);
  const title = useCurrentDocsTitle();
  return (
    <div className="flex h-13 items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="outline" size="sm" className="-ml-1 pointer-coarse:pr-3.5 pointer-coarse:pl-3" />
          }
        >
          <PanelLeft aria-hidden="true" />
          Docs menu
        </SheetTrigger>
        <SheetContent
          side="left"
          title="Documentation"
          bodyClassName="px-3 py-4"
          footer={
            <Button variant="secondary" fullWidth href={SUPPORT_URL}>
              <LifeBuoy aria-hidden="true" />
              Ask in the support server
            </Button>
          }
        >
          <DocsNav variant="sheet" onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <p className="min-w-0 flex-1 truncate type-label text-fg-secondary" aria-hidden="true">
        {title}
      </p>
      <DocsSearchButton variant="icon" className="-mr-2" />
    </div>
  );
}
