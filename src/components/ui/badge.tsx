import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, CircleDashed } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 border font-medium whitespace-nowrap [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "border-line-strong bg-surface-3 text-fg-secondary",
        brand: "border-brand-border bg-brand-subtle text-brand-fg",
        success: "border-success-border bg-success-subtle text-success-fg",
        warning: "border-warning-border bg-warning-subtle text-warning-fg",
        danger: "border-danger-border bg-danger-subtle text-danger-fg",
        info: "border-info-border bg-info-subtle text-info-fg",
        outline: "border-line-strong bg-transparent text-fg-secondary",
      },
      size: {
        sm: "h-5 rounded-sm px-1.5 text-xs",
        md: "h-6 rounded-md px-2 text-xs",
        lg: "h-7 rounded-md px-2.5 text-sm",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

const dotTone = {
  neutral: "bg-fg-tertiary",
  brand: "bg-brand-400",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  outline: "bg-fg-tertiary",
} as const;

export type BadgeProps = ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Leading status dot in the badge's tone. */
    dot?: boolean;
  };

/** Compact label for status, category, counts. Not interactive. */
export function Badge({ tone, size, dot, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot ? <span aria-hidden="true" className={cn("size-1.5 rounded-full", dotTone[tone ?? "neutral"])} /> : null}
      {children}
    </span>
  );
}

/**
 * Honest placeholder marker for data we don't have yet (server/user counts,
 * uptime, testimonials). Always pair with `// PLACEHOLDER: replace with real data`.
 */
export function PlaceholderBadge({
  className,
  children = "Placeholder",
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      title="Placeholder — real data not connected yet"
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border border-dashed border-line-hover px-2 type-eyebrow text-fg-tertiary",
        className,
      )}
      {...props}
    >
      <CircleDashed aria-hidden="true" className="size-3" />
      {children}
    </span>
  );
}

export type PillProps = {
  children: ReactNode;
  /** Optional leading element (icon, Badge). */
  leading?: ReactNode;
  /** Renders as a link with a trailing arrow. */
  href?: string;
  className?: string;
};

/**
 * Rounded announcement / eyebrow pill (hero "New: …" chip). As a link it gets
 * hover, focus and a 44 px touch target.
 */
export function Pill({ children, leading, href, className }: PillProps) {
  const classes = cn(
    "group/pill relative inline-flex h-8 max-w-full items-center gap-2 rounded-full border border-line-strong bg-surface-2/80 pr-3 pl-1.5 text-sm text-fg-secondary inset-shadow-highlight backdrop-blur",
    !leading && "pl-3",
    href &&
      "touch-target transition-colors duration-150 ease-standard hover:border-line-hover hover:bg-surface-3 hover:text-fg focus-visible:focus-ring",
    className,
  );
  const content = (
    <>
      {leading}
      <span className="truncate">{children}</span>
      {href ? (
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-fg-tertiary transition-transform duration-200 ease-standard group-hover/pill:translate-x-0.5 group-hover/pill:text-fg"
        />
      ) : null}
    </>
  );
  if (!href) return <span className={classes}>{content}</span>;
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

const statusTone = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-fg-tertiary",
  brand: "bg-brand-400",
} as const;

/**
 * Small status indicator dot with an optional calm pulse (disabled under
 * reduced motion). Decorative — always pair with a text label.
 */
export function StatusDot({
  tone = "neutral",
  pulse = false,
  className,
}: {
  tone?: keyof typeof statusTone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex size-2 shrink-0", className)}>
      {pulse ? (
        <span
          className={cn(
            "absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden",
            statusTone[tone],
          )}
        />
      ) : null}
      <span className={cn("relative inline-flex size-2 rounded-full", statusTone[tone])} />
    </span>
  );
}
