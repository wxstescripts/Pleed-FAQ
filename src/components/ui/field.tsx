"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { mergeClassName } from "@/lib/utils";

/**
 * Field wiring (Base UI): any Pleed control placed inside <Field> is
 * automatically labelled by <FieldLabel>, described by <FieldDescription>
 * and linked to <FieldError> — no manual ids. Works for Input, Textarea,
 * NumberField, Switch, Checkbox and Slider. (Select uses SelectLabel.)
 */
export function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root className={mergeClassName("group/field flex min-w-0 flex-col gap-2", className)} {...props} />
  );
}

export function FieldLabel({
  className,
  optional,
  children,
  ...props
}: FieldPrimitive.Label.Props & { optional?: boolean }) {
  return (
    <FieldPrimitive.Label
      className={mergeClassName(
        "flex w-fit items-center gap-2 type-label text-fg select-none data-disabled:text-fg-disabled",
        className,
      )}
      {...props}
    >
      {children}
      {optional ? <span className="font-normal text-fg-tertiary">(optional)</span> : null}
    </FieldPrimitive.Label>
  );
}

export function FieldDescription({ className, ...props }: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      className={mergeClassName(
        "type-caption text-fg-tertiary group-data-disabled/field:text-fg-disabled",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Error text. Pass `match={true}` to always show it (server/async errors), or
 * a validity key (e.g. match="valueMissing") for native validation.
 * Icon + text — never colour alone.
 */
export function FieldError({ className, children, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      className={mergeClassName("flex items-start gap-1.5 type-caption text-danger-fg", className)}
      {...props}
    >
      <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </FieldPrimitive.Error>
  );
}

export type FormFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  /** Error message; when set the field is marked invalid and the message shown. */
  error?: ReactNode;
  optional?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
  children: ReactNode;
};

/** Label + control + description + error in the standard vertical layout. */
export function FormField({
  label,
  description,
  error,
  optional,
  disabled,
  name,
  className,
  children,
}: FormFieldProps) {
  return (
    <Field invalid={Boolean(error)} disabled={disabled} name={name} className={className}>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? <FieldError match={true}>{error}</FieldError> : null}
    </Field>
  );
}

/** Groups related fields under one legend (e.g. "Thresholds"). `disabled` disables every control inside. */
export function Fieldset({ className, ...props }: FieldsetPrimitive.Root.Props) {
  return <FieldsetPrimitive.Root className={mergeClassName("flex min-w-0 flex-col gap-4", className)} {...props} />;
}

export function FieldsetLegend({ className, ...props }: FieldsetPrimitive.Legend.Props) {
  return <FieldsetPrimitive.Legend className={mergeClassName("type-h4 text-fg", className)} {...props} />;
}
