"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";

/**
 * Radio group (arrow-key navigation, one tab stop). Label the group with
 * aria-label / aria-labelledby, or wrap it in <Fieldset> + <FieldsetLegend>.
 */
export function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return <RadioGroupPrimitive className={mergeClassName("grid gap-3", className)} {...props} />;
}

/** The bare radio dot. Prefer <RadioOption> which includes the label. */
export function Radio({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      className={mergeClassName(
        "relative inline-flex size-[1.125rem] shrink-0 items-center justify-center rounded-full border border-line-control bg-inset touch-target transition-[background-color,border-color] duration-150 ease-standard hover:border-fg-tertiary focus-visible:focus-ring data-checked:border-brand data-checked:bg-brand data-disabled:cursor-not-allowed data-disabled:opacity-45",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        keepMounted
        className="size-2 rounded-full bg-white transition-[opacity,scale] duration-150 ease-standard data-unchecked:scale-50 data-unchecked:opacity-0"
      />
    </RadioPrimitive.Root>
  );
}

export type RadioOptionProps = Omit<RadioPrimitive.Root.Props, "children"> & {
  label: ReactNode;
  description?: ReactNode;
  /** Card style: the whole row is a bordered, clickable tile. */
  card?: boolean;
};

/** Radio + label (+ description). The entire row is clickable. */
export function RadioOption({ label, description, card = false, className, ...props }: RadioOptionProps) {
  return (
    <label
      className={cn(
        "group/option flex cursor-pointer items-start gap-3 has-data-disabled:cursor-not-allowed",
        card &&
          "rounded-lg border border-line bg-surface-1 p-4 transition-colors duration-150 hover:border-line-hover hover:bg-surface-2 has-data-checked:border-brand-border has-data-checked:bg-brand-subtle",
        className as string,
      )}
    >
      <Radio className="mt-0.5" {...props} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm leading-snug font-medium text-fg group-has-data-disabled/option:text-fg-disabled">
          {label}
        </span>
        {description ? <span className="type-caption text-fg-tertiary">{description}</span> : null}
      </span>
    </label>
  );
}

export type SegmentedOption = { value: string; label: ReactNode; icon?: ReactNode };

export type SegmentedControlProps = {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Required unless aria-labelledby is passed. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  size?: "sm" | "md";
  /** Stretch segments to fill the width. */
  fullWidth?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
};

/**
 * Single-choice segmented control (radiogroup semantics, arrow keys).
 * Scrolls horizontally instead of wrapping on narrow screens.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  fullWidth = false,
  disabled,
  name,
  className,
  ...aria
}: SegmentedControlProps) {
  return (
    <RadioGroupPrimitive
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next) => onValueChange(next as string) : undefined}
      disabled={disabled}
      name={name}
      {...aria}
      className={cn(
        "inline-flex max-w-full gap-0.5 overflow-x-auto rounded-lg border border-line bg-inset p-0.5 scrollbar-none",
        fullWidth && "flex w-full",
        className,
      )}
    >
      {options.map((option) => (
        <RadioPrimitive.Root
          key={option.value}
          value={option.value}
          className={cn(
            "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 font-medium whitespace-nowrap text-fg-tertiary transition-[background-color,color,box-shadow] duration-150 ease-standard select-none",
            "hover:text-fg focus-visible:focus-ring-inset data-checked:bg-surface-3 data-checked:text-fg data-checked:shadow-sm data-checked:inset-shadow-highlight",
            "data-disabled:cursor-not-allowed data-disabled:opacity-45 [&_svg]:size-4",
            size === "md" ? "h-8 text-sm pointer-coarse:h-10" : "h-7 text-xs pointer-coarse:h-9",
            fullWidth && "flex-1",
          )}
        >
          {option.icon}
          {option.label}
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  );
}
