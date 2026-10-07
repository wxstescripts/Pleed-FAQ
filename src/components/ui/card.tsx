import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn, isExternalHref } from "@/lib/utils";
import { IconTile } from "@/components/ui/icon-tile";

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
    const external = isExternalHref(href);
    const classes = cn(cardVariants({ variant, padding, interactive: true }), className);
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
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

export type FeatureCardProps = {
  /** lucide icon, shown in a brand IconTile (20 px, stroke 1.75). */
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Heading level — keep the page outline valid (h3 under a section h2). */
  titleAs?: CardTitleTag;
  /** Whole card becomes a link (hover + focus states). */
  href?: string;
  variant?: "default" | "raised" | "outline";
  /** Extra content under the text (a command chip, a list, a tiny preview). */
  children?: ReactNode;
  className?: string;
};

/**
 * The one feature-card pattern (landing features, docs overviews, dashboard
 * module tiles): IconTile → 16 px → title + description (6 px apart) →
 * 16 px → optional extra content. Put them in a grid with `gap-4 lg:gap-6`.
 */
export function FeatureCard({
  icon,
  title,
  description,
  titleAs = "h3",
  href,
  variant = "default",
  children,
  className,
}: FeatureCardProps) {
  return (
    <Card variant={variant} href={href} className={cn("gap-4", className)}>
      {icon ? <IconTile icon={icon} /> : null}
      <div className="flex flex-col gap-1.5">
        <CardTitle as={titleAs}>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      {children}
    </Card>
  );
}
