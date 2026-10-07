"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn, mergeClassName } from "@/lib/utils";

export type SwitchProps = SwitchPrimitive.Root.Props & {
  size?: "sm" | "md";
};

/**
 * On/off switch (role="switch", aria-checked, Space/Enter). Renders a native
 * <button> that never shrinks. On touch screens the button itself grows to
 * 48×44 (negative margins keep the layout identical) while the visible track
 * stays 40×24.
 *
 * Label it with one of:
 * - <SettingRow label=… control={<Switch/>}/> (recommended in settings),
 * - <Field><FieldLabel>…</FieldLabel><Switch/></Field>,
 * - aria-label="…" when no visible label exists.
 */
export function Switch({ className, size = "md", ...props }: SwitchProps) {
  const md = size === "md";
  return (
    <SwitchPrimitive.Root
      nativeButton
      render={<button type="button" />}
      data-size={size}
      data-compact-control=""
      className={mergeClassName(
        cn(
          "group/switch relative inline-flex shrink-0 items-center justify-center rounded-full outline-none",
          "data-disabled:cursor-not-allowed",
          md
            ? "h-6 w-10 pointer-coarse:-mx-1 pointer-coarse:-my-2.5 pointer-coarse:h-11 pointer-coarse:w-12"
            : "h-5 w-8 pointer-coarse:-mx-1.5 pointer-coarse:-my-3 pointer-coarse:h-11 pointer-coarse:w-11",
        ),
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none flex shrink-0 items-center rounded-full border border-line-control bg-surface-4 p-0.5",
          "transition-[background-color,border-color,opacity] duration-200 ease-standard",
          "group-hover/switch:border-line-control-hover group-data-checked/switch:border-transparent group-data-checked/switch:bg-brand group-data-checked/switch:group-hover/switch:bg-brand-hover",
          "group-focus-visible/switch:outline-2 group-focus-visible/switch:outline-offset-2 group-focus-visible/switch:outline-focus",
          "group-data-disabled/switch:opacity-45",
          md ? "h-6 w-10" : "h-5 w-8",
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block rounded-full bg-fg-secondary shadow-sm transition-[translate,background-color] duration-200 ease-standard",
            "data-checked:bg-thumb",
            md ? "size-4.5 data-checked:translate-x-4" : "size-3.5 data-checked:translate-x-3",
          )}
        />
      </span>
    </SwitchPrimitive.Root>
  );
}
