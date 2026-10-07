import { Link2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * An h2/h3 inside the docs article with a permalink: a link icon after the
 * text that shows on hover and keyboard focus (mouse/keyboard only — touch
 * readers use "On this page"). Styling comes from <Prose>.
 */
export function DocsHeading({
  as: Tag,
  id,
  title,
  children,
  className,
}: {
  as: "h2" | "h3";
  id: string;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Tag id={id} className={cn("group/heading", className)}>
      {children ?? title}
      <a
        href={`#${id}`}
        aria-label={`Link to this section: ${title}`}
        className="relative ml-2 inline-flex size-6 translate-y-px items-center justify-center rounded-sm align-middle text-fg-tertiary no-underline opacity-0 transition-[opacity,color,background-color] duration-150 group-hover/heading:opacity-100 hover:bg-hover hover:text-brand-fg focus-visible:opacity-100 focus-visible:focus-ring pointer-coarse:hidden"
      >
        <Link2 aria-hidden="true" className="size-4" />
      </a>
    </Tag>
  );
}
