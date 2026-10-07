import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const iconTileVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center border inset-shadow-highlight",
  {
    variants: {
      tone: {
        brand: "border-brand-border bg-brand-subtle text-brand-fg",
        neutral: "border-line-strong bg-surface-3 text-fg-secondary",
        success: "border-success-border bg-success-subtle text-success-fg",
        warning: "border-warning-border bg-warning-subtle text-warning-fg",
        danger: "border-danger-border bg-danger-subtle text-danger-fg",
        info: "border-info-border bg-info-subtle text-info-fg",
      },
      size: {
        sm: "size-8 rounded-md [&_svg]:size-4",
        md: "size-10 rounded-lg [&_svg]:size-5",
        lg: "size-12 rounded-xl [&_svg]:size-6",
      },
    },
    defaultVariants: { tone: "brand", size: "md" },
  },
);

export type IconTileProps = VariantProps<typeof iconTileVariants> & {
  icon: LucideIcon;
  className?: string;
  /** Accessible label if the icon conveys meaning on its own (rare). */
  label?: string;
};

/**
 * A lucide icon in a tinted tile — feature cards, setting sections, empty
 * states. Use ONE tone per context (brand by default); semantic tones only
 * when the colour carries meaning (danger zone, success state).
 */
export function IconTile({ icon: Icon, tone, size, className, label }: IconTileProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(iconTileVariants({ tone, size }), className)}
    >
      <Icon strokeWidth={1.75} />
    </span>
  );
}
