import { cn } from "@/lib/utils";

export type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  /** Decorative separators are hidden from assistive tech (default). */
  decorative?: boolean;
  className?: string;
  /** Optional centred label, e.g. "or". */
  label?: string;
};

/** Hairline divider. */
export function Separator({ orientation = "horizontal", decorative = true, className, label }: SeparatorProps) {
  const a11y = decorative
    ? { "aria-hidden": true as const }
    : { role: "separator" as const, "aria-orientation": orientation };

  if (label && orientation === "horizontal") {
    return (
      <div className={cn("flex items-center gap-3", className)} {...a11y}>
        <span className="h-px flex-1 bg-line" />
        <span className="type-caption text-fg-tertiary">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }

  return (
    <div
      {...a11y}
      className={cn(
        "shrink-0 bg-line",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
      )}
    />
  );
}
