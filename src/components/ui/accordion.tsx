"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";

/**
 * Accordion / FAQ. Closed panels stay in the DOM (hidden="until-found") so
 * Ctrl+F and search engines can find their text. Heading level is
 * configurable to keep the page outline valid.
 */
export function Accordion({ className, hiddenUntilFound = true, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      hiddenUntilFound={hiddenUntilFound}
      className={mergeClassName(
        "flex w-full flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-1",
        className,
      )}
      {...props}
    />
  );
}

export function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return <AccordionPrimitive.Item className={mergeClassName("group/item", className)} {...props} />;
}

export function AccordionTrigger({
  className,
  children,
  headingLevel = 3,
  ...props
}: AccordionPrimitive.Trigger.Props & { headingLevel?: 2 | 3 | 4 }) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <AccordionPrimitive.Header render={<Heading />} className="m-0">
      <AccordionPrimitive.Trigger
        className={mergeClassName(
          cn(
            "group/trigger flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-sans text-base font-medium text-fg transition-colors duration-150 ease-standard md:px-6",
            "min-h-14 hover:bg-hover focus-visible:focus-ring-inset data-panel-open:text-fg",
          ),
          className,
        )}
        {...props}
      >
        <span className="min-w-0 text-pretty">{children}</span>
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-fg-tertiary transition-[transform,color,border-color] duration-300 ease-out-expo group-hover/trigger:text-fg group-data-panel-open/trigger:rotate-45 group-data-panel-open/trigger:border-brand-border group-data-panel-open/trigger:text-brand-fg"
        >
          <Plus className="size-4" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionPanel({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      className={mergeClassName(
        "h-(--accordion-panel-height) overflow-hidden transition-[height] duration-300 ease-out-expo data-ending-style:h-0 data-starting-style:h-0",
        className,
      )}
      {...props}
    >
      <div className="max-w-measure px-5 pb-5 type-body text-fg-secondary md:px-6 [&_a]:text-brand-fg [&_a]:underline [&_a]:decoration-brand-fg/35 [&_a]:underline-offset-4 [&_a:hover]:decoration-current [&_code]:rounded-sm [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-0.5 [&_code]:type-code [&_code]:text-fg">
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export type FaqItem = { question: string; answer: ReactNode; id?: string };

/** Ready-made FAQ list. */
export function FaqList({
  items,
  headingLevel = 3,
  className,
}: {
  items: FaqItem[];
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <Accordion className={className}>
      {items.map((item, index) => (
        <AccordionItem key={item.id ?? index} value={item.id ?? String(index)}>
          <AccordionTrigger headingLevel={headingLevel}>{item.question}</AccordionTrigger>
          <AccordionPanel>{item.answer}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
