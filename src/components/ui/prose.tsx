import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

/**
 * Long-form typography (legal pages, docs articles). Styles plain HTML
 * children: h2/h3/h4, p, ul/ol, a, strong, code, pre, blockquote, hr, table.
 * Measure is capped at 68ch; h2/h3 get scroll-margin for anchor links.
 */
export function Prose<T extends ElementType = "div">({
  as,
  className,
  ...props
}: { as?: T } & Omit<ComponentPropsWithoutRef<T>, "as">) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={cn("prose", className)} {...props} />;
}
