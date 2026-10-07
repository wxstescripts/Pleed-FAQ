"use client";

import type { SecurityPunishment } from "@/lib/api";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";

import { PUNISHMENTS } from "./security-options";

export type PunishmentPickerProps = {
  value: string;
  onValueChange: (value: SecurityPunishment) => void;
  disabled?: boolean;
  /** Id of the visible element that names the group (the section title). */
  labelledBy: string;
  /** Id of the text that explains the group (the section description). */
  describedBy?: string;
};

/**
 * Ban / kick / quarantine / alert as radio cards: one tab stop, arrow keys
 * move the choice, each card says in plain words what happens to the account.
 * Two columns once the card body is 28rem wide (a container query, so it
 * follows the settings column rather than the viewport).
 */
export function PunishmentPicker({ value, onValueChange, disabled, labelledBy, describedBy }: PunishmentPickerProps) {
  return (
    <div className="@container">
      <RadioGroup
        value={value}
        onValueChange={(next) => onValueChange(next as SecurityPunishment)}
        disabled={disabled}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className="@md:grid-cols-2"
      >
        {PUNISHMENTS.map((option) => {
          const Icon = option.icon;
          return (
            <RadioOption
              key={option.value}
              card
              value={option.value}
              label={
                <span className="flex items-center gap-2">
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-fg-tertiary transition-colors duration-150 group-has-data-checked/option:text-brand-fg group-has-data-disabled/option:text-fg-disabled"
                  />
                  {option.label}
                </span>
              }
              description={option.description}
            />
          );
        })}
      </RadioGroup>
    </div>
  );
}
