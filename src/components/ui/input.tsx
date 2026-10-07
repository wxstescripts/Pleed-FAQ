"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";

/**
 * Shared text-control look: recessed well, hairline border, brand focus.
 * 40 px tall (44 px + 16 px text on touch screens so iOS never zooms).
 */
export const controlClasses = [
  "w-full min-w-0 rounded-lg border border-line-strong bg-inset text-sm text-fg shadow-xs",
  "transition-[border-color,background-color,box-shadow] duration-150 ease-standard",
  "placeholder:text-fg-tertiary hover:border-line-hover",
  "focus-visible:border-brand-400 focus-visible:ring-3 focus-visible:ring-brand-500/30 focus-visible:outline-none",
  "data-invalid:border-danger aria-invalid:border-danger focus-visible:data-invalid:ring-danger/25 focus-visible:aria-invalid:ring-danger/25",
  "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-1 disabled:text-fg-disabled disabled:shadow-none",
  "data-disabled:cursor-not-allowed data-disabled:border-line data-disabled:bg-surface-1 data-disabled:text-fg-disabled",
  "read-only:bg-surface-1 pointer-coarse:text-base",
].join(" ");

export type InputProps = InputPrimitive.Props & {
  /** Icon or 1–2 characters shown inside the left edge (e.g. a Search icon, "!", "#"). */
  startAdornment?: ReactNode;
  /** Element inside the right edge (clear button, unit, Kbd hint). */
  endAdornment?: ReactNode;
  inputSize?: "sm" | "md";
  /** Classes for the wrapper when adornments are used. */
  wrapperClassName?: string;
};

/**
 * Text input. Inside <Field>/<FormField> it is labelled and described
 * automatically. Standalone, pass `aria-label`.
 */
export function Input({
  className,
  startAdornment,
  endAdornment,
  inputSize = "md",
  wrapperClassName,
  ...props
}: InputProps) {
  const sizeClasses =
    inputSize === "sm" ? "h-8 px-2.5 pointer-coarse:h-10" : "h-10 px-3 pointer-coarse:h-11";
  const input = (
    <InputPrimitive
      className={mergeClassName(
        cn(controlClasses, sizeClasses, startAdornment != null && "pl-9", endAdornment != null && "pr-10"),
        className,
      )}
      {...props}
    />
  );
  if (startAdornment == null && endAdornment == null) return input;
  return (
    <div className={cn("relative flex w-full min-w-0 items-center", wrapperClassName)}>
      {startAdornment != null ? (
        <span className="pointer-events-none absolute left-3 flex items-center font-mono text-sm text-fg-tertiary [&_svg]:size-4">
          {startAdornment}
        </span>
      ) : null}
      {input}
      {endAdornment != null ? (
        <span className="absolute right-2 flex items-center text-fg-tertiary [&_svg]:size-4">{endAdornment}</span>
      ) : null}
    </div>
  );
}

export type TextareaProps = Omit<ComponentProps<"textarea">, "className"> & {
  className?: string;
  /** Grow with content up to max-h (CSS field-sizing, progressive). */
  autoGrow?: boolean;
};

/** Multi-line text input; same look and Field wiring as Input. */
export function Textarea({ className, autoGrow = true, ...props }: TextareaProps) {
  return (
    <FieldPrimitive.Control
      render={<textarea />}
      className={cn(
        controlClasses,
        "min-h-24 resize-y px-3 py-2.5 leading-relaxed",
        autoGrow && "field-sizing-content max-h-80",
        className,
      )}
      {...(props as FieldPrimitive.Control.Props)}
    />
  );
}

export type NumberFieldProps = NumberFieldPrimitive.Root.Props & {
  /** Unit shown after the number, e.g. "days", "min". */
  unit?: string;
  inputClassName?: string;
  /** Accessible names for the steppers. */
  decrementLabel?: string;
  incrementLabel?: string;
};

const stepperClasses =
  "relative flex w-10 shrink-0 items-center justify-center text-fg-secondary transition-colors duration-150 touch-target hover:bg-surface-3 hover:text-fg active:bg-surface-4 focus-visible:focus-ring-inset disabled:pointer-events-none disabled:text-fg-disabled data-disabled:pointer-events-none data-disabled:text-fg-disabled [&_svg]:size-4";

/**
 * Numeric input with − / + steppers, keyboard (↑/↓, PgUp/PgDn), min/max
 * clamping and locale formatting. Inside <Field> it is labelled automatically.
 */
export function NumberField({
  className,
  unit,
  inputClassName,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  ...props
}: NumberFieldProps) {
  return (
    <NumberFieldPrimitive.Root className={mergeClassName("w-full max-w-60 min-w-0", className)} {...props}>
      <NumberFieldPrimitive.Group className="flex h-10 w-full min-w-0 overflow-hidden rounded-lg border border-line-strong bg-inset shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-line-hover has-[input:focus-visible]:border-brand-400 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-brand-500/30 has-[[aria-invalid=true]]:border-danger data-disabled:border-line data-disabled:bg-surface-1 pointer-coarse:h-11">
        <NumberFieldPrimitive.Decrement aria-label={decrementLabel} className={cn(stepperClasses, "border-r border-line")}>
          <Minus aria-hidden="true" />
        </NumberFieldPrimitive.Decrement>
        <div className="relative flex min-w-0 flex-1 items-center">
          <NumberFieldPrimitive.Input
            className={cn(
              "h-full w-full min-w-0 bg-transparent px-3 text-center text-sm text-fg tabular-nums outline-none data-disabled:text-fg-disabled pointer-coarse:text-base",
              unit && "pr-1 text-right",
              inputClassName,
            )}
          />
          {unit ? (
            <span aria-hidden="true" className="shrink-0 pr-3 text-sm text-fg-tertiary">
              {unit}
            </span>
          ) : null}
        </div>
        <NumberFieldPrimitive.Increment aria-label={incrementLabel} className={cn(stepperClasses, "border-l border-line")}>
          <Plus aria-hidden="true" />
        </NumberFieldPrimitive.Increment>
      </NumberFieldPrimitive.Group>
    </NumberFieldPrimitive.Root>
  );
}
