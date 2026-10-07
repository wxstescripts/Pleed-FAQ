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
  /** Header control, e.g. the module's master <Switch aria-label="Enable anti-nuke" />. Stays enabled when `disabled`. */
  action?: ReactNode;
  /** Disables every control in the body (native fieldset) — e.g. while the module is off or saving. */
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
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between md:p-6">
        <div className="flex min-w-0 items-start gap-4">
          {icon ? <IconTile icon={icon} tone={tone === "danger" ? "danger" : "brand"} className="max-sm:hidden" /> : null}
          <div className="flex min-w-0 flex-col gap-1">
            <Heading id={titleId} className="type-h4 text-fg">
              {title}
            </Heading>
            {description ? <p className="max-w-2xl type-small text-fg-secondary">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
      </div>
      {children ? (
        <FieldsetPrimitive.Root
          disabled={disabled}
          className="m-0 min-w-0 border-t border-line p-0"
        >
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

export type SettingRowProps = {
  label: ReactNode;
  description?: ReactNode;
  /** The control. Switches/inputs/NumberFields inside are labelled by `label` automatically. */
  control?: ReactNode;
  /** Wide controls (sliders, textareas, lists) go below the text instead of beside it. */
  layout?: "inline" | "stacked";
  /** Error message for the control. */
  error?: ReactNode;
  /** Extra content under the description (e.g. a live preview). */
  children?: ReactNode;
  className?: string;
  name?: string;
};

/**
 * One setting: label + description on the left, control on the right
 * (stacks on phones). Uses Base UI Field so label/description/error are
 * wired to the control with ids. For Slider and Select, give the control its
 * own `label` and use <SettingRow layout="stacked" label=… hideLabel>.
 */
export function SettingRow({
  label,
  description,
  control,
  layout = "inline",
  error,
  children,
  className,
  name,
  hideLabel = false,
}: SettingRowProps & { hideLabel?: boolean }) {
  const stacked = layout === "stacked";
  return (
    <FieldPrimitive.Root
      data-setting-row=""
      invalid={Boolean(error)}
      name={name}
      className={cn(
        "flex gap-x-6 gap-y-3 px-5 py-4 md:px-6 md:py-5",
        stacked ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {hideLabel ? null : (
        <div className="flex min-w-0 flex-col gap-1">
          <FieldPrimitive.Label className="w-fit text-sm leading-snug font-medium text-fg data-disabled:text-fg-secondary">{label}</FieldPrimitive.Label>
          {description ? (
            <FieldPrimitive.Description className="max-w-xl type-caption text-fg-tertiary">
              {description}
            </FieldPrimitive.Description>
          ) : null}
          {children}
        </div>
      )}
      {control ? (
        <div className={cn("flex min-w-0 items-center", stacked ? "w-full" : "shrink-0 sm:justify-end")}>{control}</div>
      ) : null}
      {hideLabel && children ? children : null}
      {error ? (
        <FieldPrimitive.Error match={true} className="type-caption text-danger-fg">
          {error}
        </FieldPrimitive.Error>
      ) : null}
    </FieldPrimitive.Root>
  );
}
