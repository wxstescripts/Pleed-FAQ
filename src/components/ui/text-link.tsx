import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn, isExternalHref } from "@/lib/utils";

export type TextLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  /** Force external behaviour (auto-detected for http(s) URLs). */
  external?: boolean;
  /** "brand" (default) for links in body copy, "subtle" for meta text and footers. */
  tone?: "brand" | "subtle";
  /**
   * "always" (default): underlined at rest — required for links inside
   * sentences (WCAG 1.4.1: colour alone can't mark a link, and `subtle` has
   * the same colour as body text). "hover": only for standalone link lists
   * whose context already says "these are links" (footer columns, nav).
   */
  underline?: "always" | "hover";
};

/** Longest ending glued to the icon — a long token (a URL) keeps only its last characters glued, so it can still wrap. */
const MAX_GLUE = 12;

/**
 * Splits link text so the last word can be glued to the ↗ icon: the link
 * still wraps between words like any inline text, but the icon never lands
 * alone at the start of a line. Only plain-text endings can be split; other
 * children keep the icon right after them.
 */
function splitLastWord(children: ReactNode): { head: ReactNode; tail: ReactNode } {
  if (typeof children === "string" || typeof children === "number") {
    const text = String(children);
    const match = text.match(/^([\s\S]*\s)?(\S+)\s*$/);
    if (!match) return { head: text, tail: null };
    const head = match[1] ?? "";
    const word = Array.from(match[2]);
    if (word.length <= MAX_GLUE) return { head: head || null, tail: match[2] };
    return { head: head + word.slice(0, -4).join(""), tail: word.slice(-4).join("") };
  }
  if (Array.isArray(children) && children.length > 0) {
    const last = children[children.length - 1];
    if (typeof last === "string" || typeof last === "number") {
      const { head, tail } = splitLastWord(last);
      return { head: [...children.slice(0, -1), head], tail };
    }
  }
  return { head: children, tail: null };
}

/**
 * Inline text link. Internal paths use next/link; external URLs open in a new
 * tab with rel="noopener noreferrer", a ↗ affordance and an sr-only hint.
 * It is a plain inline `<a>`, so a long link wraps inside its sentence like
 * any other words.
 */
export function TextLink({
  href,
  external,
  tone = "brand",
  underline = "always",
  className,
  children,
  ...props
}: TextLinkProps) {
  const isExternal = external ?? isExternalHref(href);
  const classes = cn(
    "rounded-xs underline-offset-4 transition-[color,text-decoration-color] duration-150 ease-standard focus-visible:focus-ring",
    underline === "always" ? "underline hover:decoration-current" : "no-underline hover:underline",
    tone === "brand"
      ? "text-brand-fg decoration-brand-fg/35 hover:text-brand-100"
      : "text-fg-secondary decoration-line-control hover:text-fg",
    className,
  );
  if (isExternal) {
    const { head, tail } = splitLastWord(children);
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {head}
        <span className="whitespace-nowrap">
          {tail}
          <ArrowUpRight aria-hidden="true" className="ml-0.5 inline-block size-3.5 align-baseline opacity-70" />
        </span>
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
