"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { useId, type ReactNode } from "react";

import { cn, mergeClassName } from "@/lib/utils";

export type SliderProps = Omit<SliderPrimitive.Root.Props, "children"> & {
  /** Visible label (associated automatically). */
  label?: ReactNode;
  /** Accessible name when there is no visible label. */
  "aria-label"?: string;
  /** Helper text under the track. */
  description?: ReactNode;
  /** Unit appended to the value display, e.g. "per minute". */
  unit?: string;
  /** Show the current value at the top right (default true). */
  showValue?: boolean;
  /** Show min / max under the track (default true). */
  showRange?: boolean;
  /** Custom value formatter for the display. */
  formatValue?: (value: number) => string;
};

/**
 * Labelled single-value slider: visible value, min/max, 44 px touch track,
 * full keyboard support (arrows, Shift+arrows / PgUp/PgDn = largeStep,
 * Home/End).
 *
 * In a SettingRow pass NO `label`: the row label names it (Base UI Field),
 * the row description describes it, and the value readout sits above the
 * track in the 20rem control column (full width on phones). Standalone
 * (forms, filters), give it its own `label` / `description`.
 */
export function Slider({
  className,
  label,
  description,
  unit,
  showValue = true,
  showRange = true,
  formatValue,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  const format = (v: number) => (formatValue ? formatValue(v) : String(v));
  const descriptionId = useId();
  return (
    <SliderPrimitive.Root
      data-slider=""
      min={min}
      max={max}
      thumbAlignment="edge"
      className={mergeClassName("group/slider grid w-full grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1", className)}
      {...props}
    >
      {label ? (
        <SliderPrimitive.Label className="type-label text-fg data-disabled:text-fg-disabled">
          {label}
        </SliderPrimitive.Label>
      ) : (
        <span />
      )}
      {showValue ? (
        <SliderPrimitive.Value className="justify-self-end font-mono text-sm font-medium text-fg tabular-nums data-disabled:text-fg-disabled">
          {(_formatted, values) => (
            <>
              {format(values[0] ?? min)}
              {unit ? <span className="ml-1 font-sans font-normal text-fg-tertiary">{unit}</span> : null}
            </>
          )}
        </SliderPrimitive.Value>
      ) : (
        <span />
      )}
      <SliderPrimitive.Control className="group/control relative col-span-2 flex h-11 w-full touch-none items-center select-none data-disabled:cursor-not-allowed pointer-fine:h-8">
        {/*
          Rail (bg-track, 2.2:1 on surface-1) vs filled range (brand-400): 3.3:1,
          so the value reads by lightness, not hue alone. The white thumb
          (18.7:1) carries the ≥3:1 control boundary (WCAG 1.4.11).
        */}
        <SliderPrimitive.Track className="relative h-1.5 w-full rounded-full bg-track select-none">
          <SliderPrimitive.Indicator className="rounded-full bg-brand-400 select-none group-data-disabled/control:bg-fg-disabled" />
          <SliderPrimitive.Thumb
            aria-label={label ? undefined : ariaLabel}
            aria-describedby={description ? descriptionId : undefined}
            getAriaValueText={(_formatted, value) => (unit ? `${format(value)} ${unit}` : format(value))}
            className={cn(
              "relative block size-5 rounded-full border-2 border-brand-400 bg-thumb shadow-thumb transition-[box-shadow,scale] duration-150 ease-standard select-none",
              "hover:shadow-thumb-hover data-dragging:scale-110 data-dragging:shadow-thumb-active",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
              // Disabled: a dim thumb, so a turned-off section doesn't keep its brightest element.
              "data-disabled:border-transparent data-disabled:bg-fg-disabled data-disabled:shadow-none",
            )}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
      {showRange ? (
        <div
          aria-hidden="true"
          className="col-span-2 -mt-1 flex justify-between type-caption text-fg-tertiary tabular-nums group-data-disabled/slider:text-fg-disabled"
        >
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      ) : null}
      {description ? (
        <p id={descriptionId} className="col-span-2 type-caption text-fg-tertiary group-data-disabled/slider:text-fg-disabled">
          {description}
        </p>
      ) : null}
    </SliderPrimitive.Root>
  );
}
