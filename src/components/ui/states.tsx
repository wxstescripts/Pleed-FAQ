import { CircleAlert, Inbox, RotateCcw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";

type HeadingTag = "h2" | "h3" | "h4";

export type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Buttons / links (e.g. "Add your first responder", "Clear filters"). */
  actions?: ReactNode;
  headingAs?: HeadingTag;
  /** "card" draws a dashed frame; "plain" is just centred content. */
  variant?: "card" | "plain";
  className?: string;
  children?: ReactNode;
};

/** Nothing here yet — explain why and offer the next step. */
export function EmptyState({
  title,
  description,
  icon = Inbox,
  actions,
  headingAs: Heading = "h3",
  variant = "card",
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        variant === "card" && "rounded-xl border border-dashed border-line-strong bg-surface-1/50",
        className,
      )}
    >
      <IconTile icon={icon} tone="neutral" size="lg" />
      <div className="flex max-w-md flex-col gap-1.5">
        <Heading className="type-h4 text-fg">{title}</Heading>
        {description ? <p className="type-small text-fg-secondary">{description}</p> : null}
      </div>
      {children}
      {actions ? <div className="mt-1 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

export type ErrorStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  /** Technical detail (error message / status), shown in mono. */
  detail?: string;
  /** Retry handler — renders a "Try again" button (client components only). */
  onRetry?: () => void;
  retrying?: boolean;
  /** Extra actions (e.g. link to the support server). */
  actions?: ReactNode;
  headingAs?: HeadingTag;
  variant?: "card" | "plain" | "inline";
  className?: string;
};

/**
 * Something failed to load. Never render default data instead of this —
 * an error must not look like an empty or real state.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this. Check your connection and try again.",
  detail,
  onRetry,
  retrying,
  actions,
  headingAs: Heading = "h3",
  variant = "card",
  className,
}: ErrorStateProps) {
  if (variant === "inline") {
    // Icon beside the text at every width; on phones the retry button wraps onto its own
    // line, indented to the text (icon 20 px + gap 12 px = pl-8).
    return (
      <div
        role="alert"
        className={cn(
          "flex flex-wrap items-start gap-3 rounded-lg border border-danger-border bg-danger-subtle p-4 sm:flex-nowrap",
          className,
        )}
      >
        <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-danger-fg" />
        <div className="flex min-w-0 flex-1 basis-0 flex-col gap-0.5">
          <p className="type-label text-fg">{title}</p>
          {description ? <p className="type-small text-fg-secondary">{description}</p> : null}
        </div>
        {onRetry || actions ? (
          <div className="flex flex-wrap items-center gap-2 max-sm:basis-full max-sm:pl-8 sm:shrink-0 sm:self-center">
            {onRetry ? <RetryButton onRetry={onRetry} retrying={retrying} /> : null}
            {actions}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        variant === "card" && "rounded-xl border border-danger-border bg-danger-subtle/40",
        className,
      )}
    >
      <IconTile icon={CircleAlert} tone="danger" size="lg" />
      <div className="flex max-w-md flex-col gap-1.5">
        <Heading className="type-h4 text-fg">{title}</Heading>
        {description ? <p className="type-small text-fg-secondary">{description}</p> : null}
        {detail ? (
          <p className="mx-auto mt-1 max-w-full rounded-md bg-inset px-2 py-1 type-code-sm wrap-anywhere text-fg-tertiary">
            {detail}
          </p>
        ) : null}
      </div>
      {onRetry || actions ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? <RetryButton onRetry={onRetry} retrying={retrying} /> : null}
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/** "Try again". While retrying it ignores clicks but keeps keyboard focus (aria-disabled, not `disabled`). */
function RetryButton({ onRetry, retrying, className }: { onRetry: () => void; retrying?: boolean; className?: string }) {
  return (
    <Button
      variant="secondary"
      onClick={retrying ? undefined : onRetry}
      aria-disabled={retrying || undefined}
      aria-busy={retrying || undefined}
      className={cn(retrying && "aria-disabled:opacity-100", className)}
    >
      <RotateCcw aria-hidden="true" className={cn("size-4", retrying && "animate-spin motion-reduce:animate-none")} />
      {retrying ? "Retrying…" : "Try again"}
    </Button>
  );
}
