"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";

import { cn, mergeClassName } from "@/lib/utils";

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
