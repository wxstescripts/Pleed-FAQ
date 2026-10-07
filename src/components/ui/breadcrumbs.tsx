import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = { label: string; href?: string };

function Chevron() {
  return <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-fg-disabled" />;
}

/**
 * Breadcrumb trail. The last item is the current page (aria-current, not a
 * link). On phones, trails longer than 3 collapse their middle items to "…".
 */
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  const collapse = items.length > 3;
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 type-small text-fg-tertiary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const hiddenOnPhone = collapse && index > 0 && index < items.length - 2;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {collapse && index === 1 ? (
                <li aria-hidden="true" className="flex items-center gap-1.5 sm:hidden">
                  <Chevron />…
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
                    className="relative truncate rounded-xs transition-colors duration-150 touch-target hover:text-fg focus-visible:focus-ring"
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
