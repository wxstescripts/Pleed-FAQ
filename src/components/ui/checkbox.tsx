"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";
import { OptionText, optionClasses } from "@/components/ui/radio-group";

/**
 * Checkbox (supports `indeterminate`). The visible box is 18 px; on touch
 * screens the control grows to 44×44 with negative margins (layout unchanged).
 * Label it by wrapping in <FieldLabel> inside <Field>, a native <label>, or
 * pass aria-label.
 */
export function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      className={mergeClassName(
        "group/checkbox peer relative inline-flex size-4.5 shrink-0 items-center justify-center rounded-xs outline-none data-disabled:cursor-not-allowed pointer-coarse:-m-3.25 pointer-coarse:size-11",
        className,
      )}
      data-compact-control=""
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none flex size-4.5 items-center justify-center rounded-xs border border-line-control bg-inset text-fg-on-brand",
          "transition-[background-color,border-color] duration-150 ease-standard",
          "group-hover/checkbox:border-line-control-hover group-data-checked/checkbox:border-brand group-data-checked/checkbox:bg-brand group-data-indeterminate/checkbox:border-brand group-data-indeterminate/checkbox:bg-brand",
          "group-focus-visible/checkbox:outline-2 group-focus-visible/checkbox:outline-offset-2 group-focus-visible/checkbox:outline-focus",
          "group-data-invalid/checkbox:border-danger group-data-disabled/checkbox:opacity-45",
        )}
      >
        <CheckboxPrimitive.Indicator
          keepMounted
          className="flex items-center justify-center transition-[opacity,scale] duration-150 ease-standard data-unchecked:scale-75 data-unchecked:opacity-0"
          render={(indicatorProps, state) => (
            <span {...indicatorProps}>
              {state.indeterminate ? (
                <Minus aria-hidden="true" className="size-3" strokeWidth={3} />
              ) : (
                <Check aria-hidden="true" className="size-3" strokeWidth={3} />
              )}
            </span>
          )}
        />
      </span>
    </CheckboxPrimitive.Root>
  );
}

export type CheckboxOptionProps = Omit<CheckboxPrimitive.Root.Props, "children"> & {
  label: ReactNode;
  description?: ReactNode;
  /** Card style: the whole row is a bordered, clickable tile. */
  card?: boolean;
};

/**
 * Checkbox + label (+ description) — the row pattern for every checkbox
 * list (notification toggles, ignored channels, permissions). The entire
 * row is clickable; on touch each row is ≥ 44 px so the 44 px hit areas of
 * neighbouring boxes never overlap. Mirrors <RadioOption>.
 *
 *   <CheckboxGroup aria-labelledby="notify-label" value={events} onValueChange={setEvents}>
 *     <CheckboxOption value="join" label="Member joins" description="…" />
 *   </CheckboxGroup>
 */
export function CheckboxOption({ label, description, card = false, className, ...props }: CheckboxOptionProps) {
  return (
    <label data-option-card={card ? "" : undefined} className={cn(optionClasses(card), className as string)}>
      <Checkbox className="mt-px" {...props} />
      <OptionText label={label} description={description} />
    </label>
  );
}

/**
 * Group of <CheckboxOption>s (role="group"). Name it with `aria-labelledby`
 * pointing at a visible heading, or wrap it in <Fieldset> + <FieldsetLegend>.
 * Controlled with `value` (ticked option values) / `onValueChange`, or let
 * each option manage `checked` itself. `allValues` enables a parent
 * checkbox (Base UI CheckboxGroup).
 */
export function CheckboxGroup({ className, ...props }: CheckboxGroupPrimitive.Props) {
  return (
    <CheckboxGroupPrimitive
      className={mergeClassName("grid gap-3 pointer-coarse:gap-0 pointer-coarse:has-data-option-card:gap-3", className)}
      {...props}
    />
  );
}
