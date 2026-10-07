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
  align?: "start" | "center";
  /** Buttons/links rendered beside (desktop) or under (phones) the header. */
  actions?: ReactNode;
  /** Vertical rhythm: default 64→128 px, compact 48→80 px, none. */
  spacing?: "default" | "compact" | "none";
  container?: "content" | "wide" | "narrow" | false;
  /** Visual surface behind the whole section. */
  tone?: "default" | "raised";
  headerClassName?: string;
};

/**
 * Page section with an optional eyebrow/title/description header.
 * Pass an `id` to make it linkable; the title then labels the region.
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
  className,
  headerClassName,
  children,
  id,
  ...props
}: SectionProps) {
  const titleId = id && title ? `${id}-title` : undefined;
  const hasHeader = Boolean(eyebrow || title || description || actions);

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
          className={headerClassName}
        />
      ) : null}
      {children}
    </>
  );

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "relative scroll-mt-header",
        spacing === "default" && "py-section",
        spacing === "compact" && "py-section-sm",
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
        "mb-10 flex flex-col gap-6 md:mb-14",
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
