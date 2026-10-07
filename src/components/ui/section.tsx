import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

type HeadingLevel = "h1" | "h2" | "h3";

export type SectionProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  /** Small uppercase label above the title (mono, brand colour). */
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Heading element for the title (default h2). Keep heading order logical. */
  titleAs?: HeadingLevel;
  /**
   * "start" (default) for content sections and any header with `actions`;
   * "center" for single-message sections (CTA band, short intro above a
   * symmetric grid). Never centre more than ~3 lines of text.
   */
  align?: "start" | "center";
  /** Buttons/links rendered beside (≥lg) or under the header. */
  actions?: ReactNode;
  /**
   * Vertical rhythm: default 64→128 px, compact 48→80 px, none.
   * Adjacent default/compact sections automatically share ONE gap (the
   * second section's top padding) — never add your own margins between them.
   */
  spacing?: "default" | "compact" | "none";
  container?: "content" | "wide" | "narrow" | false;
  /** Visual surface behind the whole section (raised keeps its padding on both sides). */
  tone?: "default" | "raised";
  /**
   * First section only (landing hero): pull the section up behind the
   * sticky site header so its decorative background (bg-spotlight, bg-grid)
   * starts at the very top of the page. Adds the header height to the top
   * padding, so content still starts below the header. The only sanctioned
   * header offset — never hand-roll `pt-header` / `-mt-header`.
   */
  behindHeader?: boolean;
  headerClassName?: string;
};

/**
 * Page section with an optional eyebrow/title/description header.
 * Pass an `id` to make it linkable: the title then labels the region and
 * anchor links land on the title (not on the empty top padding).
 * Wrap the section's CONTENT in <Reveal>, never the Section itself (the
 * adjacent-section rhythm relies on sections being siblings).
 */
export function Section({
  eyebrow,
  title,
  description,
  titleAs = "h2",
  align = "start",
  actions,
  spacing = "default",
  container = "content",
  tone = "default",
  behindHeader = false,
  className,
  headerClassName,
  children,
  id,
  ...props
}: SectionProps) {
  const titleId = id && title ? `${id}-title` : undefined;
  const hasHeader = Boolean(eyebrow || title || description || actions);
  const hasContent = children !== undefined && children !== null && children !== false;

  const inner = (
    <>
      {hasHeader ? (
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          titleId={titleId}
          description={description}
          titleAs={titleAs}
          align={align}
          actions={actions}
          // Header → content gap (40 → 56 px) only when content follows.
          className={cn(hasContent && "mb-10 md:mb-14", headerClassName)}
        />
      ) : null}
      {children}
    </>
  );

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      // Read by globals.css: adjacent-section rhythm + anchor scroll-margin.
      data-section={tone === "raised" ? "raised" : spacing}
      className={cn(
        "relative",
        spacing === "default" && "py-section [--section-pt:var(--spacing-section)]",
        spacing === "compact" && "py-section-sm [--section-pt:var(--spacing-section-sm)]",
        behindHeader && "-mt-header",
        behindHeader &&
          spacing === "default" &&
          "pt-[calc(var(--spacing-header)+var(--spacing-section))] [--section-pt:calc(var(--spacing-header)+var(--spacing-section))]",
        behindHeader &&
          spacing === "compact" &&
          "pt-[calc(var(--spacing-header)+var(--spacing-section-sm))] [--section-pt:calc(var(--spacing-header)+var(--spacing-section-sm))]",
        behindHeader && spacing === "none" && "pt-header [--section-pt:var(--spacing-header)]",
        tone === "raised" && "border-y border-line-subtle bg-surface-1",
        className,
      )}
      {...props}
    >
      {container ? <Container size={container}>{inner}</Container> : inner}
    </section>
  );
}

export type SectionHeaderProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  titleId?: string;
  description?: ReactNode;
  titleAs?: HeadingLevel;
  align?: "start" | "center";
  actions?: ReactNode;
  /** No outer margin by default — add `mb-10 md:mb-14` when content follows (Section does). */
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  titleId,
  description,
  titleAs: Title = "h2",
  align = "start",
  actions,
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-3", centered && "items-center")}>
        {eyebrow ? <p className="type-eyebrow text-brand-fg">{eyebrow}</p> : null}
        {title ? (
          <Title id={titleId} className={cn(Title === "h1" ? "type-h1" : "type-h2", "text-fg")}>
            {title}
          </Title>
        ) : null}
        {description ? <p className="type-lead text-fg-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
