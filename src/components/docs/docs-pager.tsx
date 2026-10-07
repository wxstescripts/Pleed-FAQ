import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DOCS_HOME, docsHref, docsPages } from "@/content/docs/index";

type PagerLink = { href: string; title: string };

/** Reading order: the docs home, then docsPages in order. */
function neighbours(slug: string | null): { prev?: PagerLink; next?: PagerLink } {
  const order: PagerLink[] = [
    { href: DOCS_HOME.href, title: "Overview" },
    ...docsPages.map((page) => ({ href: docsHref(page.slug), title: page.title })),
  ];
  const index = slug === null ? 0 : order.findIndex((link) => link.href === docsHref(slug));
  return { prev: index > 0 ? order[index - 1] : undefined, next: index >= 0 ? order[index + 1] : undefined };
}

function PagerCard({ link, direction }: { link: PagerLink; direction: "prev" | "next" }) {
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <Card
      href={link.href}
      padding="sm"
      rel={direction}
      className={cn("group/pager gap-1 px-4 sm:px-5", direction === "next" && "sm:col-start-2 sm:items-end sm:text-right")}
    >
      <span className="flex items-center gap-1.5 type-caption text-fg-tertiary">
        {direction === "prev" ? <Icon aria-hidden="true" className="size-3.5" /> : null}
        {direction === "prev" ? "Previous" : "Next"}
        {direction === "next" ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      </span>
      <span className="type-label text-fg transition-colors duration-150 group-hover/pager:text-brand-fg">{link.title}</span>
    </Card>
  );
}

/** Previous / next page links at the end of every docs page. `slug` null = docs home. */
export function DocsPager({ slug, className }: { slug: string | null; className?: string }) {
  const { prev, next } = neighbours(slug);
  if (!prev && !next) return null;
  return (
    <nav aria-label="Previous and next pages" className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {prev ? <PagerCard link={prev} direction="prev" /> : null}
      {next ? <PagerCard link={next} direction="next" /> : null}
    </nav>
  );
}
