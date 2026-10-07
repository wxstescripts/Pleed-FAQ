import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DsNav({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Design system sections" className="lg:sticky lg:top-24 lg:self-start">
      <p className="mb-3 type-eyebrow text-fg-tertiary max-lg:hidden">On this page</p>
      <ul className="-mx-gutter flex gap-1 overflow-x-auto px-gutter pb-1 scrollbar-none lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              className="flex h-9 items-center rounded-md px-3 text-sm whitespace-nowrap text-fg-tertiary transition-colors duration-150 hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring max-lg:border max-lg:border-line pointer-coarse:h-11 lg:h-8 lg:px-2.5"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-line-subtle pb-4">
        <h2 id={`${id}-title`} className="type-h3 text-fg">
          {title}
        </h2>
        {description ? <p className="max-w-3xl type-small text-fg-secondary">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DsBlock({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="type-eyebrow text-fg-tertiary">{title}</h3>
      {children}
    </div>
  );
}

export function Swatch({
  className,
  name,
  note,
  bordered,
}: {
  className: string;
  name: string;
  note?: string;
  bordered?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-20 rounded-xl", bordered && "border border-line-strong", className)} />
      <div>
        <p className="type-code-xs text-fg">{name}</p>
        {note ? <p className="type-caption text-fg-tertiary">{note}</p> : null}
      </div>
    </div>
  );
}
