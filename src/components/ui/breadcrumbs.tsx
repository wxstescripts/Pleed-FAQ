import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { BreadcrumbsMenu } from "@/components/ui/breadcrumbs-menu";

export type BreadcrumbItem = { label: string; href?: string };

function Chevron() {
  return <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-fg-disabled" />;
}

/**
 * Breadcrumb trail. The last item is the current page (aria-current, not a
 * link). On phones, trails longer than 3 keep the first and the last two
 * crumbs; the middle ones move into a "…" menu button ("Show full path"), so
 * every crumb stays reachable by touch, keyboard and screen reader.
 */
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  const collapse = items.length > 3;
  const hidden = collapse ? items.slice(1, items.length - 2) : [];
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 type-small text-fg-tertiary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const hiddenOnPhone = collapse && index > 0 && index < items.length - 2;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {collapse && index === 1 ? (
                <li className="flex items-center gap-1.5 sm:hidden">
                  <Chevron />
                  <BreadcrumbsMenu items={hidden} />
                </li>
              ) : null}
              <li className={cn("flex min-w-0 items-center gap-1.5", hiddenOnPhone && "max-sm:hidden")}>
                {index > 0 ? <Chevron /> : null}
                {isLast || !item.href ? (
                  <span aria-current={isLast ? "page" : undefined} className={cn("truncate", isLast && "text-fg")}>
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex max-w-full items-center truncate rounded-xs transition-colors duration-150 hover:text-fg focus-visible:focus-ring pointer-coarse:min-h-11"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
