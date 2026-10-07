"use client";

import { CircleAlert } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

/** What the ID points at — sets the adornment, placeholder and messages. */
export type SnowflakeKind = "channel" | "role" | "user";

const ADORNMENT: Record<SnowflakeKind, string> = { channel: "#", role: "@", user: "@" };
const NOUN: Record<SnowflakeKind, string> = { channel: "Channel", role: "Role", user: "User" };

/** Discord IDs ("snowflakes") are 17–20 digits. Keep them as strings — they exceed Number.MAX_SAFE_INTEGER. */
export function isSnowflake(value: string): boolean {
  return /^\d{17,20}$/.test(value);
}

/**
 * Normalises what people paste into an ID field:
 *   "<#123…>" (channel mention) · "<@&123…>" (role) · "<@123…>" / "<@!123…>" (user)
 *   → "123…"; a channel link https://discord.com/channels/<guild>/<channel>
 *   → the channel ID. Anything else is returned trimmed, unchanged (and is
 *   then flagged by the 17–20 digit check instead of being silently mangled).
 */
export function parseSnowflake(input: string, kind?: SnowflakeKind): string {
  const value = input.trim();
  const mention = value.match(/^<(#|@&|@!?)(\d+)>$/);
  if (mention) return mention[2];
  if (kind === "channel") {
    const link = value.match(/discord(?:app)?\.com\/channels\/(?:\d+|@me)\/(\d+)/);
    if (link) return link[1];
  }
  return value;
}

/** Ready-made help text for the field description. */
export function snowflakeHelp(kind: SnowflakeKind): string {
  const what = kind === "channel" ? "the channel" : kind === "role" ? "the role (Server Settings → Roles)" : "the member";
  return `Turn on Developer Mode in Discord, right-click ${what} and choose “Copy ${NOUN[kind]} ID”. You can also paste a mention.`;
}

export type IdInputProps = Omit<InputProps, "value" | "defaultValue" | "onChange" | "onValueChange" | "type" | "inputMode" | "startAdornment"> & {
  kind: SnowflakeKind;
  /** The ID as a string ("" = none). */
  value: string;
  /** Receives the normalised value (mentions and channel links are converted to the bare ID). */
  onValueChange: (value: string) => void;
  /** Show "Enter a … ID" when left empty (after the first blur). */
  required?: boolean;
  /** Override the format error message. */
  invalidMessage?: string;
};

/**
 * Discord ID field for channel / role / user IDs (Join Gates, Settings…).
 * `#` / `@` adornment, numeric keyboard, mention + link cleanup on paste,
 * and a built-in 17–20 digit check shown after the first blur (never while
 * typing). Works inside FormField / Field / SettingRow (label and
 * description come from there) or standalone with `aria-label`. Validate
 * again with `isSnowflake()` before saving.
 *
 *   <FormField label="Verified role" description={snowflakeHelp("role")}>
 *     <IdInput kind="role" value={roleId} onValueChange={setRoleId} />
 *   </FormField>
 */
export function IdInput({
  kind,
  value,
  onValueChange,
  required = false,
  invalidMessage,
  placeholder,
  className,
  wrapperClassName,
  onBlur,
  "aria-describedby": describedBy,
  ...props
}: IdInputProps) {
  const errorId = useId();
  const [touched, setTouched] = useState(false);

  let error: string | null = null;
  if (value === "") {
    if (required && touched) error = `Enter a ${NOUN[kind].toLowerCase()} ID.`;
  } else if (!isSnowflake(value) && (touched || value.length > 20 || /\D/.test(value))) {
    error = invalidMessage ?? `${NOUN[kind]} IDs are 17–20 digits — paste the ID, not the name.`;
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col", wrapperClassName)}>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        startAdornment={ADORNMENT[kind]}
        placeholder={placeholder ?? `Paste a ${NOUN[kind].toLowerCase()} ID`}
        value={value}
        onChange={(event) => onValueChange(parseSnowflake(event.currentTarget.value, kind))}
        onBlur={(event) => {
          setTouched(true);
          onBlur?.(event);
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={[describedBy, error ? errorId : null].filter(Boolean).join(" ") || undefined}
        className={cn("font-mono tabular-nums placeholder:font-sans", className)}
      />
      {/* Always mounted (empty = 0 px) so screen readers announce the error when it appears after blur. */}
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
