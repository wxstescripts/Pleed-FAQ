"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { useRef, type ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";
import { useRevealSelected, useScrollOverflow } from "@/components/ui/use-scroll-overflow";

/**
 * Radio group (arrow-key navigation, one tab stop). Label the group with
 * aria-label / aria-labelledby, or wrap it in <Fieldset> + <FieldsetLegend>.
 * On touch screens plain option rows are ≥ 44 px tall and sit edge to edge,
 * so neighbouring 44 px hit areas never overlap (card options keep the gap).
 */
export function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      className={mergeClassName("grid gap-3 pointer-coarse:gap-0 pointer-coarse:has-data-option-card:gap-3", className)}
      {...props}
    />
  );
}

/** The bare radio dot. Prefer <RadioOption> which includes the label. */
export function Radio({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      className={mergeClassName(
        "group/radio relative inline-flex size-4.5 shrink-0 items-center justify-center rounded-full outline-none data-disabled:cursor-not-allowed pointer-coarse:-m-3.25 pointer-coarse:size-11",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none flex size-4.5 items-center justify-center rounded-full border border-line-control bg-inset transition-[background-color,border-color] duration-150 ease-standard group-hover/radio:border-line-control-hover group-focus-visible/radio:outline-2 group-focus-visible/radio:outline-offset-2 group-focus-visible/radio:outline-focus group-data-checked/radio:border-brand group-data-checked/radio:bg-brand group-data-disabled/radio:opacity-45"
      >
        <RadioPrimitive.Indicator
          keepMounted
          className="size-2 rounded-full bg-fg-on-brand transition-[opacity,scale] duration-150 ease-standard data-unchecked:scale-50 data-unchecked:opacity-0"
        />
      </span>
    </RadioPrimitive.Root>
  );
}

export type RadioOptionProps = Omit<RadioPrimitive.Root.Props, "children"> & {
  label: ReactNode;
  description?: ReactNode;
  /** Card style: the whole row is a bordered, clickable tile. */
  card?: boolean;
};

/**
 * Shared row/card look for RadioOption and CheckboxOption. Rows: the whole
 * label is the target; on touch it is ≥ 44 px tall with the control's 44 px
 * hit area inside it. Cards: bordered tiles that tint when selected.
 */
export function optionClasses(card: boolean) {
  return cn(
    "group/option flex cursor-pointer items-start gap-3 has-data-disabled:cursor-not-allowed",
    card
      ? "rounded-lg border border-line bg-surface-1 p-4 transition-colors duration-150 hover:border-line-hover hover:bg-surface-2 has-data-checked:border-brand-border has-data-checked:bg-brand-subtle has-data-disabled:hover:border-line has-data-disabled:hover:bg-surface-1"
      : "pointer-coarse:min-h-11 pointer-coarse:py-3",
  );
}

/** Label + optional description text of an option row. */
export function OptionText({ label, description }: { label: ReactNode; description?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="type-label text-fg group-has-data-disabled/option:text-fg-disabled">{label}</span>
      {description ? (
        <span className="type-caption text-fg-tertiary group-has-data-disabled/option:text-fg-disabled">{description}</span>
      ) : null}
    </span>
  );
}

/** Radio + label (+ description). The entire row is clickable. */
export function RadioOption({ label, description, card = false, className, ...props }: RadioOptionProps) {
  return (
    <label data-option-card={card ? "" : undefined} className={cn(optionClasses(card), className as string)}>
      <Radio className="mt-px" {...props} />
      <OptionText label={label} description={description} />
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
 * The track hugs its segments (`w-fit`, also inside grid and flex-column
 * parents that would otherwise stretch it); `fullWidth` stretches it and
 * shares the width equally. On a screen too narrow for every segment it
 * scrolls sideways inside an outer scroller (the track's border is never
 * clipped), the overflowing edge fades and the selected segment stays in
 * view.
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  useScrollOverflow(scrollerRef);
  useRevealSelected(scrollerRef, '[role="radio"][aria-checked="true"]');
  return (
    <div
      ref={scrollerRef}
      data-slot="segmented-scroller"
      className={cn(
        "overflow-fade-x max-w-full snap-x snap-proximity self-start justify-self-start overflow-x-auto overscroll-x-contain scrollbar-none",
        fullWidth ? "w-full" : "w-fit",
        className,
      )}
    >
      <RadioGroupPrimitive
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (next) => onValueChange(next as string) : undefined}
        disabled={disabled}
        name={name}
        {...aria}
        className={cn(
          "flex w-max gap-0.5 rounded-lg border border-line bg-inset p-0.5",
          fullWidth && "min-w-full",
        )}
      >
        {options.map((option) => (
          <RadioPrimitive.Root
            key={option.value}
            value={option.value}
            className={cn(
              "relative inline-flex shrink-0 cursor-pointer snap-start items-center justify-center gap-1.5 rounded-md px-3 font-medium whitespace-nowrap text-fg-tertiary transition-[background-color,color,box-shadow] duration-150 ease-standard select-none",
              "hover:text-fg focus-visible:focus-ring-inset",
              // Selected: raised pill + ring that is 3.1:1 against the inset track (WCAG 1.4.11).
              "data-checked:bg-surface-4 data-checked:text-fg data-checked:shadow-sm data-checked:inset-shadow-highlight data-checked:inset-ring data-checked:inset-ring-line-hover",
              "data-disabled:cursor-not-allowed data-disabled:opacity-45 [&_svg]:size-4",
              size === "md" ? "h-8 type-label pointer-coarse:h-11" : "h-7 type-micro pointer-coarse:h-11",
              fullWidth && "flex-1",
            )}
          >
            {option.icon}
            {option.label}
          </RadioPrimitive.Root>
        ))}
      </RadioGroupPrimitive>
    </div>
  );
}
