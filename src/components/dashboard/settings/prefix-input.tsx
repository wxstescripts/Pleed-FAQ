"use client";

import { CircleAlert } from "lucide-react";
import { useId, type Ref } from "react";

import { Input } from "@/components/ui/input";

export type PrefixInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  /** Message to show under the field (null = valid, or not shown yet). */
  error: string | null;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * The prefix text field. Same anatomy as the kit's IdInput, so both fields on
 * the page report problems the same way: the message sits under the control
 * (icon + text), is linked with aria-describedby and announced politely. The
 * label and description come from the SettingRow around it.
 */
export function PrefixInput({ value, onValueChange, error, onBlur, inputRef }: PrefixInputProps) {
  const errorId = useId();
  return (
    <div className="flex w-full min-w-0 flex-col">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        onBlur={onBlur}
        placeholder="!"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="font-mono"
      />
      {/* Always mounted (empty = 0 px) so the message is announced when it appears. */}
      <div aria-live="polite">
        {error ? (
          <p id={errorId} className="flex items-start gap-1.5 pt-2 type-caption text-danger-fg">
            <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
