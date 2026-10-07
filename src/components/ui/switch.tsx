"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn, mergeClassName } from "@/lib/utils";

export type SwitchProps = SwitchPrimitive.Root.Props & {
  size?: "sm" | "md";
};

/**
 * On/off switch (role="switch", aria-checked, Space/Enter). Renders a native
 * <button>, never shrinks, and has a 44 px hit area on touch screens.
 *
 * Label it with one of:
 * - <SettingRow label=… control={<Switch/>}/> (recommended in settings),
 * - <Field><FieldLabel>…</FieldLabel><Switch/></Field>,
 * - aria-label="…" when no visible label exists.
 */
export function Switch({ className, size = "md", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      nativeButton
      render={<button type="button" />}
      data-size={size}
      className={mergeClassName(
        cn(
          "group/switch relative inline-flex shrink-0 items-center rounded-full border p-0.5 touch-target",
          "border-line-hover bg-surface-4 transition-[background-color,border-color,box-shadow] duration-200 ease-standard",
          "hover:border-fg-disabled data-checked:border-transparent data-checked:bg-brand data-checked:hover:bg-brand-hover",
          "focus-visible:focus-ring",
          "data-disabled:cursor-not-allowed data-disabled:opacity-45",
          size === "md" ? "h-6 w-10" : "h-5 w-8",
        ),
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-fg-secondary shadow-sm transition-[translate,background-color] duration-200 ease-standard",
          "data-checked:bg-white",
          size === "md" ? "size-[1.125rem] data-checked:translate-x-4" : "size-3.5 data-checked:translate-x-3",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
