"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";
import type { LucideIcon } from "lucide-react";
import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { IconTile } from "@/components/ui/icon-tile";

export type SettingsSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /**
   * Compact header control, e.g. the module's master
   * <Switch aria-label="Enable anti-nuke" /> (optionally with a status Badge).
   * Stays in the title row at every width and stays enabled when `disabled`.
   */
  action?: ReactNode;
  /**
   * Disables every control in the body (native fieldset) — while the module
   * is off. Not while saving: that would drop keyboard focus (the SaveBar
   * already blocks a second save).
   */
  disabled?: boolean;
  /** Message shown at the top of the body while disabled ("Turn on Anti-nuke to edit thresholds"). */
  disabledHint?: ReactNode;
  headingAs?: "h2" | "h3";
  /** Danger zone styling (destructive settings). */
  tone?: "default" | "danger";
  className?: string;
  children?: ReactNode;
};

/**
 * A card that groups related settings. The body is a <fieldset>, so
 * `disabled` really disables the controls (not just opacity).
 */
export function SettingsSection({
  title,
  description,
  icon,
  action,
  disabled = false,
  disabledHint,
  headingAs: Heading = "h2",
  tone = "default",
  className,
  children,
}: SettingsSectionProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "overflow-hidden rounded-xl border bg-surface-1 inset-shadow-highlight",
        tone === "danger" ? "border-danger-border" : "border-line",
        className,
      )}
    >
      {/*
        Header grid. Phones: title | action on the first row (the action top-aligned with the
        title's first line), the description on its own row across the FULL card width — not
        squeezed into the title's column beside an empty one under the action. From 640 px:
        icon (spanning both rows) | title over description | action.
      */}
      <div
        className={cn(
          "grid items-start gap-x-4 gap-y-1 p-5 md:p-6",
          action ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-[minmax(0,1fr)]",
          icon && (action ? "sm:grid-cols-[auto_minmax(0,1fr)_auto]" : "sm:grid-cols-[auto_minmax(0,1fr)]"),
        )}
      >
        {icon ? (
          <IconTile
            icon={icon}
            tone={tone === "danger" ? "danger" : "brand"}
            className="max-sm:hidden sm:col-start-1 sm:row-span-2 sm:row-start-1"
          />
        ) : null}
        <Heading id={titleId} className={cn("col-start-1 row-start-1 min-w-0 type-h4 text-fg", icon && "sm:col-start-2")}>
          {title}
        </Heading>
        {description ? (
          <p
            className={cn(
              "col-span-full row-start-2 max-w-2xl type-small text-fg-secondary sm:col-span-1",
              icon ? "sm:col-start-2" : "sm:col-start-1",
            )}
          >
            {description}
          </p>
        ) : null}
        {action ? (
          <div className={cn("col-start-2 row-start-1 flex items-center gap-3 self-start", icon && "sm:col-start-3")}>
            {action}
          </div>
        ) : null}
      </div>
      {children ? (
        <FieldsetPrimitive.Root disabled={disabled} className="m-0 min-w-0 border-t border-line p-0">
          {disabled && disabledHint ? (
            <p className="border-b border-line-subtle bg-surface-2/60 px-5 py-3 type-small text-fg-secondary md:px-6">
              {disabledHint}
            </p>
          ) : null}
          <div className="divide-y divide-line-subtle">{children}</div>
        </FieldsetPrimitive.Root>
      ) : null}
    </section>
  );
}

type SettingRowBase = {
  description?: ReactNode;
  /** The control. Switches, inputs, selects, NumberFields and sliders inside are labelled by `label` automatically. */
  control?: ReactNode;
  /**
   * - "auto" (default): compact controls (Switch, Checkbox, or anything
   *   marked `data-compact-control`) stay beside the label at EVERY width;
   *   any other control sits beside it from 640 px and below it on phones.
   * - "inline": always beside the label (compact custom controls).
   * - "stacked": always below (textareas, checkbox lists, previews).
   */
  layout?: "auto" | "inline" | "stacked";
  /** Error message for the control. */
  error?: ReactNode;
  /** Extra content under the description (e.g. a live preview). */
  children?: ReactNode;
  className?: string;
  name?: string;
};

export type SettingRowProps = SettingRowBase &
  (
    | { label: ReactNode; hideLabel?: false }
    | {
        /** Not rendered with `hideLabel` — the control carries its own visible label. */
        label?: ReactNode;
        /**
         * The control renders its own visible label (a custom control). The
         * row then stacks: control, description, children, error; the
         * description is still rendered and linked to the control. Not needed
         * for Slider or Select — give the ROW the label and pass them bare.
         */
        hideLabel: true;
      }
  );

/*
 * One width per control kind, so every settings page lines up (DESIGN.md §3):
 * - beside the label (≥ 640 px), all ending at the row's right edge: text,
 *   ID and select controls fill the 16rem `w-setting-control` column;
 *   sliders (`data-slider`) 20rem; NumberField (`data-number-field`) 10rem;
 *   switches, checkboxes (`data-compact-control`) and buttons keep their
 *   own width.
 * - stacked (phones, `layout="stacked"`, `hideLabel`): full width up to
 *   28rem (`max-w-md`); sliders the full row width (their value readout
 *   shares the right edge with the controls above); compact controls and
 *   buttons keep their own width.
 * Builders pass no width classes to controls inside a SettingRow.
 */
const controlWidths = {
  inline: cn(
    "sm:w-setting-control",
    "sm:has-[[data-slider]]:w-80",
    "sm:has-[[data-number-field]]:w-40",
    "has-[[data-compact-control]]:w-auto sm:has-[[data-compact-control]]:w-auto sm:has-[>[data-slot=button]]:w-auto",
  ),
  stacked:
    "w-full max-w-md has-[[data-slider]]:max-w-none has-[>[data-slot=button]]:w-auto has-[>[data-compact-control]]:w-auto",
} as const;

// Literal class strings (Tailwind only generates classes it can read in the source).
const rowLayouts = {
  inline: "flex-row flex-wrap items-start justify-between gap-x-4 gap-y-2 sm:items-center sm:gap-x-6",
  stacked: "flex-col gap-y-3",
  // Phones: stack, unless the control is compact — then stay a top-aligned row.
  auto: cn(
    "flex-col gap-x-4 gap-y-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-2",
    "has-[[data-slot=setting-control]_[data-compact-control]]:flex-row has-[[data-slot=setting-control]_[data-compact-control]]:flex-wrap has-[[data-slot=setting-control]_[data-compact-control]]:justify-between",
    "max-sm:has-[[data-slot=setting-control]_[data-compact-control]]:items-start max-sm:has-[[data-slot=setting-control]_[data-compact-control]]:gap-y-2",
  ),
} as const;

/**
 * One setting: label + description beside (or above) the control. Uses Base
 * UI Field, so label/description/error are wired to the control with ids.
 * Every control goes in bare (no label, no width classes): the row label
 * names it, and the row sizes it so the column of controls lines up.
 */
export function SettingRow({
  label,
  description,
  control,
  layout = "auto",
  error,
  children,
  className,
  name,
  hideLabel = false,
}: SettingRowProps) {
  const descriptionNode = description ? (
    <FieldPrimitive.Description className="max-w-xl type-caption text-fg-tertiary group-data-disabled/row:text-fg-disabled">
      {description}
    </FieldPrimitive.Description>
  ) : null;
  const errorNode = error ? (
    <FieldPrimitive.Error match={true} className="type-caption text-danger-fg">
      {error}
    </FieldPrimitive.Error>
  ) : null;

  if (hideLabel) {
    return (
      <FieldPrimitive.Root
        data-setting-row=""
        invalid={Boolean(error)}
        name={name}
        className={cn("group/row flex flex-col gap-2 px-5 py-4 md:px-6 md:py-5", className)}
      >
        {control ? (
          <div data-slot="setting-control" className={cn("flex min-w-0 items-center", controlWidths.stacked)}>
            {control}
          </div>
        ) : null}
        {descriptionNode}
        {children}
        {errorNode}
      </FieldPrimitive.Root>
    );
  }

  const stacked = layout === "stacked";
  return (
    <FieldPrimitive.Root
      data-setting-row=""
      invalid={Boolean(error)}
      name={name}
      className={cn("group/row flex px-5 py-4 md:px-6 md:py-5", rowLayouts[layout], className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <FieldPrimitive.Label className="w-fit type-label text-fg data-disabled:text-fg-disabled">{label}</FieldPrimitive.Label>
        {descriptionNode}
        {children}
      </div>
      {control ? (
        <div
          data-slot="setting-control"
          className={cn(
            "flex min-w-0 items-center",
            stacked ? controlWidths.stacked : cn("shrink-0 sm:justify-end", controlWidths.inline),
            layout === "auto" && "max-sm:w-full max-sm:has-[[data-compact-control]]:w-auto",
          )}
        >
          {control}
        </div>
      ) : null}
      {/* Full width: wraps onto its own line under the label + control. */}
      {errorNode ? <div className="w-full">{errorNode}</div> : null}
    </FieldPrimitive.Root>
  );
}
