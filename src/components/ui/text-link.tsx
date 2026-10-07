import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export type TextLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  /** Force external behaviour (auto-detected for http(s) URLs). */
  external?: boolean;
  /** "brand" (default) for links in body copy, "subtle" for footers/meta text. */
  tone?: "brand" | "subtle";
};

/**
 * Inline text link. Internal paths use next/link; external URLs open in a new
 * tab with rel="noopener noreferrer", a ↗ affordance and an sr-only hint.
 */
export function TextLink({ href, external, tone = "brand", className, children, ...props }: TextLinkProps) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const classes = cn(
    "rounded-xs underline-offset-4 transition-colors duration-150 ease-standard focus-visible:focus-ring",
    tone === "brand"
      ? "text-brand-fg underline decoration-brand-fg/35 hover:text-brand-100 hover:decoration-current"
      : "text-fg-secondary hover:text-fg hover:underline",
    className,
  );
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn(classes, "inline-flex items-baseline gap-0.5")} {...props}>
        {children}
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 self-center opacity-70" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
