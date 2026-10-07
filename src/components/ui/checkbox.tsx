"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";

import { mergeClassName } from "@/lib/utils";

/**
 * Checkbox (supports `indeterminate`). Label it by wrapping in <FieldLabel>
 * inside <Field>, a native <label>, or pass aria-label.
 */
export function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      className={mergeClassName(
        "peer relative inline-flex size-[1.125rem] shrink-0 items-center justify-center rounded-[0.3rem] border border-line-control bg-inset text-fg-on-brand touch-target transition-[background-color,border-color] duration-150 ease-standard hover:border-fg-tertiary focus-visible:focus-ring data-checked:border-brand data-checked:bg-brand data-indeterminate:border-brand data-indeterminate:bg-brand data-disabled:cursor-not-allowed data-disabled:opacity-45 data-invalid:border-danger",
        className,
      )}
      {...props}
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
    </CheckboxPrimitive.Root>
  );
}
