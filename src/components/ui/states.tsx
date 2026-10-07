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
    return (
      <div
        role="alert"
        className={cn(
          "flex flex-col gap-3 rounded-lg border border-danger-border bg-danger-subtle p-4 sm:flex-row sm:items-center",
          className,
        )}
      >
        <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-danger-fg" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="type-label text-fg">{title}</p>
          {description ? <p className="type-small text-fg-secondary">{description}</p> : null}
        </div>
        {onRetry ? <RetryButton onRetry={onRetry} retrying={retrying} /> : null}
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

function RetryButton({ onRetry, retrying }: { onRetry: () => void; retrying?: boolean }) {
  return (
    <Button
      variant="secondary"
      onClick={onRetry}
      disabled={retrying}
      aria-busy={retrying || undefined}
      className={cn(retrying && "disabled:opacity-100")}
    >
      <RotateCcw aria-hidden="true" className={cn("size-4", retrying && "animate-spin motion-reduce:animate-none")} />
      {retrying ? "Retrying…" : "Try again"}
    </Button>
  );
}
