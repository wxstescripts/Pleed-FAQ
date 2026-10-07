import { CircleAlert, Inbox, RotateCcw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
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
  /**
   * "card" / "plain": a page or section failed to load. "inline": a danger
   * Callout (role="alert") for a failure inside a region — a list or card
   * that didn't load, an action that failed. A failed settings SAVE is the
   * SaveBar's `error`, not an ErrorState.
   */
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
    // A danger Callout with role="alert": icon beside the text at every width; when the
    // banner is narrow (phones) the retry button wraps onto its own line, indented to the text.
    return (
      <Callout
        tone="danger"
        role="alert"
        title={title}
        className={className}
        actions={
          onRetry || actions ? (
            <>
              {onRetry ? <RetryButton onRetry={onRetry} retrying={retrying} /> : null}
              {actions}
            </>
          ) : undefined
        }
      >
        {description || detail ? (
          <>
            {description ? <p>{description}</p> : null}
            {detail ? <p className="type-code-sm wrap-anywhere text-fg-tertiary">{detail}</p> : null}
          </>
        ) : null}
      </Callout>
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

/**
 * "Try again". While retrying it is inert but keeps keyboard focus (Button's
 * aria-disabled, not `disabled`); the icon turns like a Spinner (slower, never
 * frozen, under reduced motion).
 */
function RetryButton({ onRetry, retrying, className }: { onRetry: () => void; retrying?: boolean; className?: string }) {
  return (
    <Button
      variant="secondary"
      onClick={onRetry}
      aria-disabled={retrying || undefined}
      aria-busy={retrying || undefined}
      className={cn(retrying && "aria-disabled:opacity-100", className)}
    >
      <RotateCcw aria-hidden="true" className={cn("size-4", retrying && "animate-spin-slow")} />
      {retrying ? "Retrying…" : "Try again"}
    </Button>
  );
}
