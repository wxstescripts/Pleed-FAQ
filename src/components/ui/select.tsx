"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";
import { controlClasses } from "@/components/ui/input";

export type SelectItemData = {
  value: string;
  label: string;
  /** Second line in the popup (e.g. what a punishment does). */
  description?: string;
  disabled?: boolean;
};

export type SelectProps = {
  items: SelectItemData[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Visible label (recommended). */
  label?: ReactNode;
  /** Accessible name when there is no visible label. */
  "aria-label"?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  size?: "sm" | "md";
  className?: string;
  triggerClassName?: string;
};

/**
 * Styled select with a real listbox popup (type-ahead, arrows, Home/End,
 * Escape). For one-off native behaviour on phones use <NativeSelect>.
 * Wrap in <Field> to attach <FieldDescription>/<FieldError>.
 */
export function Select({
  items,
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder = "Select…",
  disabled,
  name,
  size = "md",
  className,
  triggerClassName,
  "aria-label": ariaLabel,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => {
        if (typeof next === "string") onValueChange?.(next);
      }}
      disabled={disabled}
      name={name}
    >
      <div className={cn("flex min-w-0 flex-col gap-2", className)}>
        {label ? (
          <SelectPrimitive.Label className="w-fit cursor-default text-sm leading-snug font-medium text-fg data-disabled:text-fg-disabled">
            {label}
          </SelectPrimitive.Label>
        ) : null}
        <SelectPrimitive.Trigger
          aria-label={label ? undefined : ariaLabel}
          className={cn(
            controlClasses,
            "flex items-center justify-between gap-2 text-left select-none data-popup-open:border-brand-400",
            size === "md" ? "h-10 px-3 pointer-coarse:h-11" : "h-8 px-2.5 pointer-coarse:h-10",
            triggerClassName,
          )}
        >
          <SelectPrimitive.Value
            placeholder={placeholder}
            className="min-w-0 flex-1 truncate data-placeholder:text-fg-tertiary"
          />
          <SelectPrimitive.Icon className="shrink-0 text-fg-tertiary">
            <ChevronsUpDown aria-hidden="true" className="size-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
      </div>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          className="z-popover outline-none select-none"
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          <SelectPrimitive.Popup className="min-w-(--anchor-width) origin-(--transform-origin) rounded-xl border border-line-strong bg-surface-2 p-1 text-fg shadow-lg inset-shadow-highlight outline-none transition-[scale,opacity] duration-150 ease-standard data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            <SelectPrimitive.List className="max-h-[min(var(--available-height),22rem)] scroll-py-1 overflow-y-auto">
              {items.map((item) => (
                <SelectPrimitive.Item
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className="grid min-h-9 cursor-default grid-cols-[1fr_1rem] items-center gap-3 rounded-md px-2.5 py-2 text-sm outline-none select-none data-disabled:opacity-45 data-highlighted:bg-surface-3 pointer-coarse:min-h-11"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <SelectPrimitive.ItemText className="truncate text-fg">{item.label}</SelectPrimitive.ItemText>
                    {item.description ? (
                      <span className="type-caption text-fg-tertiary">{item.description}</span>
                    ) : null}
                  </span>
                  <SelectPrimitive.ItemIndicator className="text-brand-fg">
                    <Check aria-hidden="true" className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export type NativeSelectProps = Omit<ComponentProps<"select">, "size" | "className"> & {
  size?: "sm" | "md";
  className?: string;
};

/**
 * Native <select> styled like the other controls (chevron included).
 * Inside <Field> it is labelled automatically.
 */
export function NativeSelect({ size = "md", className, children, ...props }: NativeSelectProps) {
  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <FieldPrimitive.Control
        render={<select />}
        className={cn(
          controlClasses,
          "appearance-none pr-9",
          size === "md" ? "h-10 pl-3 pointer-coarse:h-11" : "h-8 pl-2.5 pointer-coarse:h-10",
        )}
        {...(props as FieldPrimitive.Control.Props)}
      >
        {children}
      </FieldPrimitive.Control>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-tertiary"
      />
    </div>
  );
}

export { SelectPrimitive };

export function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return <SelectPrimitive.Separator className={mergeClassName("-mx-1 my-1 h-px bg-line", className)} {...props} />;
}
