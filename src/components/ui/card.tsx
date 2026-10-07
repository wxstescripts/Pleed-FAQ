import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const cardVariants = cva("relative flex flex-col rounded-xl border text-fg", {
  variants: {
    variant: {
      /** Default surface on the canvas. */
      default: "border-line bg-surface-1 inset-shadow-highlight",
      /** One level up — for emphasis inside a section. */
      raised: "border-line-strong bg-surface-2 inset-shadow-highlight shadow-md",
      /** Recessed well (code samples, previews inside a card). */
      inset: "border-line-subtle bg-inset",
      /** Border only. */
      outline: "border-line bg-transparent",
      /** Tinted brand surface for a single highlighted item. */
      brand: "border-brand-border bg-brand-subtle",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5 md:p-6",
      lg: "p-6 md:p-8",
    },
    interactive: {
      true: "cursor-pointer transition-[background-color,border-color,box-shadow,transform] duration-200 ease-standard hover:border-line-hover hover:bg-surface-2 active:translate-y-px focus-visible:focus-ring",
      false: "",
    },
  },
  defaultVariants: { variant: "default", padding: "md", interactive: false },
});

type CardVariantProps = VariantProps<typeof cardVariants>;

export type CardProps<T extends ElementType = "div"> = CardVariantProps & {
  as?: T;
  /** Makes the whole card a link (sets interactive styles). */
  href?: string;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children" | "href">;

/**
 * Surface container. Static by default (no hover lift — static cards must not
 * look clickable). Pass `href` (or `interactive`) for clickable cards.
 */
export function Card<T extends ElementType = "div">({
  as,
  href,
  variant,
  padding,
  interactive,
  className,
  children,
  ...props
}: CardProps<T>) {
  if (href) {
    const external = /^https?:\/\//.test(href);
    const classes = cn(cardVariants({ variant, padding, interactive: true }), className);
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
      </a>
    ) : (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn(cardVariants({ variant, padding, interactive }), className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

type CardTitleTag = "h2" | "h3" | "h4" | "p";

export function CardTitle({
  as = "h3",
  className,
  ...props
}: { as?: CardTitleTag } & ComponentPropsWithoutRef<"h3">) {
  const Tag = as;
  return <Tag className={cn("type-h4 text-fg", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("type-small text-fg-secondary", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-4 flex-1", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("mt-5 flex items-center gap-3 border-t border-line-subtle pt-4", className)} {...props} />
  );
}
