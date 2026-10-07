import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Restrained brand gradient for ONE short phrase per page (e.g. a word in the
 * hero headline). Never for body copy, buttons or whole headings.
 * Falls back to brand-fg colour where background-clip:text is unsupported.
 */
export function GradientText({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "bg-linear-120 from-brand-200 via-brand-400 to-brand-violet bg-clip-text text-brand-fg [-webkit-text-fill-color:transparent] supports-[not(background-clip:text)]:[-webkit-text-fill-color:currentColor]",
        "box-decoration-clone pb-[0.06em]",
        className,
      )}
      {...props}
    />
  );
}
