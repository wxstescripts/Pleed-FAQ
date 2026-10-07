"use client";

import { DoorOpen, LifeBuoy, SquareTerminal } from "lucide-react";
import { useRef, useState } from "react";

import { getSettings, saveSettings, type ApiError, type GuildSettings } from "@/lib/api";
import { usePleedMutation, usePleedQuery } from "@/lib/api/hooks";
import { SUPPORT_URL } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { CommandChip } from "@/components/ui/code-block";
import { SaveBar } from "@/components/ui/save-bar";
import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { IdInput, isSnowflake, snowflakeHelp } from "@/components/ui/snowflake-input";
import { ErrorState } from "@/components/ui/states";
import { toast } from "@/components/ui/toast";

import { InlineCode } from "./inline-code";
import {
  PREFIX_MAX_LENGTH,
  activePrefix,
  channelValue,
  isObviousPrefixProblem,
  prefixPicker,
  prefixProblem,
  sameSettings,
} from "./prefix";
import { PrefixInput } from "./prefix-input";
import { PrefixPreview } from "./prefix-preview";
import { GeneralSettingsSkeleton } from "./settings-skeleton";

/** DESIGN.md "Save feedback": the same words on every settings page. */
const SAVE_ERROR = "Couldn't reach Pleed. Your changes are still here.";

/**
 * General settings: loads the guild's settings, then hands them to the form.
 * Never renders defaults when the load fails — saving them would overwrite
 * the real config — so a failed load shows an ErrorState and no SaveBar.
 */
export function GeneralSettingsEditor() {
  const query = usePleedQuery(getSettings);
  // Keeps the ErrorState (and the focus on its button, and its detail line) on screen while "Try again" runs.
  const [retrying, setRetrying] = useState(false);
  const [lastDetail, setLastDetail] = useState<string | undefined>(undefined);
  const detail = query.error ? describeError(query.error) : lastDetail;

  if (query.data) {
    return <GeneralSettingsForm saved={query.data} onSaved={(settings) => query.setData(settings)} />;
  }
  if (query.status === "error" || (retrying && query.status === "loading")) {
    return (
      <ErrorState
        headingAs="h2"
        title="Couldn't load general settings"
        description="Pleed's API didn't answer, so there's nothing to edit yet. Your saved settings are untouched — try again in a moment."
        detail={detail}
        retrying={query.status === "loading"}
        onRetry={() => {
          setRetrying(true);
          setLastDetail(detail);
          query.reload();
        }}
        actions={
          <Button variant="ghost" href={SUPPORT_URL}>
            <LifeBuoy aria-hidden="true" />
            Support server
          </Button>
        }
      />
    );
  }
  return <GeneralSettingsSkeleton />;
}

/** "GET /api/settings/… → HTTP 503": the technical line under a load error (guild ID elided so it fits a phone). */
function describeError(error: ApiError): string {
  let path = "";
  try {
    path = error.url ? new URL(error.url).pathname.replace(/\/\d{5,}$/, "/…") : "";
  } catch {
    path = "";
  }
  const outcome = error.status ? `HTTP ${error.status}` : `${error.kind} error`;
  return [error.method, path, path || error.method ? "→" : "", outcome].filter(Boolean).join(" ");
}

type FormProps = {
  /** The settings exactly as the API returned them (unknown fields included). */
  saved: GuildSettings;
  /** Called with the body that was saved, so it becomes the new baseline. */
  onSaved: (settings: GuildSettings) => void;
};

function GeneralSettingsForm({ saved, onSaved }: FormProps) {
  const save = usePleedMutation(saveSettings);
  // The whole loaded object, edited with spreads: the save body keeps every key the API sent.
  const [draft, setDraft] = useState<GuildSettings>(saved);
  const [prefixTouched, setPrefixTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const prefixRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<HTMLInputElement>(null);

  const dirty = !sameSettings(draft, saved);
  const saving = save.status === "pending";

  const prefix = draft.prefix ?? "";
  const prefixIssue = prefixProblem(prefix);
  const showPrefixIssue = prefixIssue && (prefixTouched || attempted || isObviousPrefixProblem(prefix));
  const picker = prefixIssue ? null : prefixPicker(prefix);

  const currentPrefix = activePrefix(saved);
  // The preview follows the field while it holds a usable prefix, else keeps the last saved one.
  const previewPrefix = prefixIssue ? currentPrefix : prefix;
  const prefixChanged = !prefixIssue && prefix !== saved.prefix;

  const channel = channelValue(draft);
  const channelInvalid = channel !== "" && !isSnowflake(channel);
  const channelSaved = channelValue(saved) !== "";

  function setPrefix(value: string) {
    setDraft((current) => ({ ...current, prefix: value }));
  }

  function setChannel(value: string) {
    setDraft((current) => ({
      ...current,
      // Clearing a channel the API sent as null sends null again (the body stays as loaded).
      welcome_channel: value === "" && saved.welcome_channel == null ? saved.welcome_channel : value,
    }));
  }

  async function onSave() {
    if (prefixIssue || channelInvalid) {
      // Nothing is sent: show every problem and take the person to the first one.
      setAttempted(true);
      setPrefixTouched(true);
      const field = prefixIssue ? prefixRef.current : channelRef.current;
      if (field && !prefixIssue) field.blur(); // IdInput shows its format message after a blur
      field?.focus();
      return;
    }
    const body = draft;
    const result = await save.mutate(body);
    if (result.ok) {
      onSaved(body);
      setAttempted(false);
      toast.success("Changes saved");
    }
    // On failure the draft stays and the SaveBar shows SAVE_ERROR with "Try again".
  }

  function onReset() {
    setDraft(saved);
    setPrefixTouched(false);
    setAttempted(false);
    save.reset();
  }

  const invalidMessage =
    attempted && (prefixIssue || channelInvalid)
      ? prefixIssue
        ? "Fix the prefix to save your changes"
        : "Fix the channel ID to save your changes"
      : undefined;

  return (
    <>
      <div className="flex flex-col gap-6">
        <SettingsSection
          icon={SquareTerminal}
          title="Command prefix"
          description="What members type before a command name. Slash commands keep working whatever you choose."
        >
          <SettingRow
            label="Prefix"
            description={
              <>
                Up to {PREFIX_MAX_LENGTH} characters, no spaces. Pleed&rsquo;s default is&nbsp;<InlineCode>!</InlineCode>
              </>
            }
            control={
              <PrefixInput
                inputRef={prefixRef}
                value={prefix}
                maxLength={PREFIX_MAX_LENGTH}
                onValueChange={setPrefix}
                onBlur={() => setPrefixTouched(true)}
                error={showPrefixIssue ? prefixIssue : null}
              />
            }
          />
          <div className="flex flex-col gap-4 px-5 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-1">
              <h3 className="type-label text-fg">Preview</h3>
              <p className="type-caption text-fg-tertiary">
                How members call Pleed with {prefixChanged ? "the new" : "this"} prefix.
              </p>
            </div>
            <PrefixPreview prefix={previewPrefix} />
            {/* One note at a time: an awkward prefix matters more than the reminder to tell members. */}
            {picker ? (
              <Callout tone="warning" title={`Typing ${picker.char} opens Discord's ${picker.picker}`}>
                <p>
                  Members may send a suggestion instead of <InlineCode>{prefix}help</InlineCode>. A symbol such as{" "}
                  <InlineCode>!</InlineCode>, <InlineCode>?</InlineCode> or <InlineCode>.</InlineCode> is easier to type.
                </p>
              </Callout>
            ) : prefixChanged ? (
              <Callout tone="info">
                <p>
                  Once you save, Pleed answers <InlineCode>{prefix}help</InlineCode> instead of{" "}
                  <InlineCode>{currentPrefix}help</InlineCode> — let your members know. Slash commands don&rsquo;t change.
                </p>
              </Callout>
            ) : null}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={DoorOpen}
          title="Welcome channel"
          description="Where Pleed posts a welcome card when someone joins your server."
          action={channelSaved ? undefined : <Badge tone="neutral">Not set</Badge>}
        >
          <SettingRow
            label="Channel ID"
            description={snowflakeHelp("channel")}
            control={<IdInput ref={channelRef} kind="channel" value={channel} onValueChange={setChannel} />}
          />
          <div className="flex flex-col gap-4 px-5 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-1">
              <h3 className="type-label text-fg">Welcome message</h3>
              <p className="type-caption text-fg-tertiary">
                The message itself is set in Discord. Copy a command and send it in your server.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                { command: `${currentPrefix}messages welcomemessage <text>`, what: "Set the welcome message text" },
                { command: `${currentPrefix}messages welcometoggle <state>`, what: "Turn welcome messages on or off" },
                { command: `${currentPrefix}messages testwelcome`, what: "Preview the welcome message" },
              ].map(({ command, what }) => (
                <li key={what} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <CommandChip command={command} />
                  <span className="type-caption text-fg-tertiary">{what}</span>
                </li>
              ))}
            </ul>
          </div>
        </SettingsSection>
      </div>
      <SaveBar
        dirty={dirty}
        saving={saving}
        error={save.status === "error" ? SAVE_ERROR : null}
        message={invalidMessage}
        onSave={() => void onSave()}
        onReset={onReset}
      />
    </>
  );
}
