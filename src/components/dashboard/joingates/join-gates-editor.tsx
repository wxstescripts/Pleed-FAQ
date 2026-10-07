"use client";

import { m } from "framer-motion";
import { LifeBuoy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { flagOn, getJoinGatesConfig, saveJoinGatesConfig, toFlag, type ApiError, type JoinGatesConfig } from "@/lib/api";
import { usePleedMutation, usePleedQuery } from "@/lib/api/hooks";
import { SUPPORT_URL } from "@/lib/site";
import { fade } from "@/components/motion/tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { NumberField } from "@/components/ui/input";
import { SaveBar } from "@/components/ui/save-bar";
import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { IdInput } from "@/components/ui/snowflake-input";
import { ErrorState } from "@/components/ui/states";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";

import { JoinGatesCommands } from "./join-gates-commands";
import { GATE_SECTION, MESSAGES_SECTION, ROWS, SCREENING_SECTION, SECTION_BODY } from "./join-gates-copy";
import { Optional, WithUnit } from "./join-gates-labels";
import {
  describeMinutes,
  invalidIdFields,
  isUnconfigured,
  missingRequired,
  sameConfig,
  toSaveBody,
  wholeNumber,
  type IdField,
  type JoinGatesDraft,
} from "./join-gates-model";
import { GettingStarted, IdHelp, MissingSetup, TurningOff } from "./join-gates-notes";
import { JoinGatesSkeleton } from "./join-gates-skeleton";

/** DESIGN.md §3 "Save feedback": the same words on every page. */
const SAVE_ERROR = "Couldn't reach Pleed. Your changes are still here.";

/**
 * Loads the join gate config, then hands it to the form. Until a real config
 * has arrived there is nothing to edit: a skeleton of the same sections while
 * it loads, an ErrorState with retry if it failed — never
 * default values, which would overwrite the server's real setup if saved.
 */
export function JoinGatesEditor() {
  const query = usePleedQuery(getJoinGatesConfig);
  const [retrying, setRetrying] = useState(false);
  const [lastError, setLastError] = useState<ApiError | null>(null);
  // "Try again" had keyboard focus when the retry succeeded: hand focus to the master switch.
  const [refocus, setRefocus] = useState(false);

  // Derived state, adjusted during render (reload() clears query.error while it runs).
  if (query.error && query.error !== lastError) setLastError(query.error);
  if (retrying && query.status !== "loading") setRetrying(false);

  if (query.data) {
    return <JoinGatesForm saved={query.data} onSaved={(config) => query.setData(config)} focusSwitchOnMount={refocus} />;
  }

  if ((query.status === "error" || retrying) && lastError) {
    return (
      <LoadError
        error={lastError}
        retrying={retrying}
        onRetry={(fromKeyboardFocus) => {
          setRefocus(fromKeyboardFocus);
          setRetrying(true);
          query.reload();
        }}
      />
    );
  }

  return <JoinGatesSkeleton />;
}

/* ------------------------------------------------------------------ */

function JoinGatesForm({
  saved,
  onSaved,
  focusSwitchOnMount,
}: {
  saved: JoinGatesConfig;
  onSaved: (config: JoinGatesConfig) => void;
  focusSwitchOnMount: boolean;
}) {
  const save = usePleedMutation(saveJoinGatesConfig);
  const [draft, setDraft] = useState<JoinGatesDraft | null>(null);
  // A save was refused because an ID is malformed; the bar says so until every ID is valid.
  const [blocked, setBlocked] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const switchSlot = useRef<HTMLDivElement>(null);
  const gateDescriptionId = useId();

  const form: JoinGatesDraft = draft ?? saved;
  const on = flagOn(form.enabled);
  const savedOn = flagOn(saved.enabled);
  const unconfigured = isUnconfigured(saved);
  const missing = missingRequired(form);
  const invalid = invalidIdFields(form);
  const kickMinutes = wholeNumber(form.auto_kick_minutes);
  const dirty = draft !== null && !sameConfig(draft, saved);
  const saving = save.status === "pending";

  useEffect(() => {
    if (!focusSwitchOnMount) return;
    const active = document.activeElement;
    if (!active || active === document.body) switchSlot.current?.querySelector<HTMLElement>('[role="switch"]')?.focus();
  }, [focusSwitchOnMount]);

  // An ID that arrived from the API but isn't a valid snowflake shows its inline error straight away.
  useEffect(() => {
    revealIdErrors(formRef.current, invalidIdFields(saved), { focus: false });
  }, [saved]);

  /** Edit the draft. Every save sends the whole loaded object with these fields changed (same keys, 0/1 flags). */
  function update(patch: Partial<JoinGatesDraft>) {
    const next: JoinGatesDraft = { ...form, ...patch };
    const backToSaved =
      next.min_account_age_days !== null && next.auto_kick_minutes !== null && sameConfig(next, saved);
    if (backToSaved) {
      // Nothing to save, and an old save error no longer applies.
      setDraft(null);
      save.reset();
    } else {
      setDraft(next);
    }
    if (blocked && invalidIdFields(next).length === 0) setBlocked(false);
  }

  async function onSave() {
    if (saving) return;
    if (invalid.length > 0) {
      setBlocked(true);
      revealIdErrors(formRef.current, invalid, { focus: true });
      return;
    }
    const body = toSaveBody(form);
    const result = await save.mutate(body);
    // Failure: keep the draft — the SaveBar stays up, red, with "Try again".
    if (!result.ok) return;
    onSaved(body);
    // Keep anything edited while the request was in flight.
    setDraft((current) => (current === null || sameConfig(current, body) ? null : current));
    setBlocked(false);
    toast.success("Changes saved");
  }

  function onReset() {
    setDraft(null);
    setBlocked(false);
    save.reset();
  }

  return (
    <>
      <div ref={formRef} className="flex flex-col gap-6">
        {unconfigured ? <GettingStarted /> : null}

        <SettingsSection
          icon={GATE_SECTION.icon}
          title={GATE_SECTION.title}
          description={<span id={gateDescriptionId}>{GATE_SECTION.description}</span>}
          action={
            <div ref={switchSlot} className="flex items-center gap-3">
              {/* Visual status for sighted users; the switch announces on/off and the note below what's missing. */}
              <GateBadge on={on} complete={missing.length === 0} />
              <Switch
                checked={on}
                onCheckedChange={(checked) => update({ enabled: toFlag(checked) })}
                aria-label={GATE_SECTION.switchLabel}
                aria-describedby={gateDescriptionId}
              />
            </div>
          }
          disabled={!on}
          disabledHint={savedOn ? GATE_SECTION.disabledHintTurningOff : GATE_SECTION.disabledHintOff}
        >
          {on || savedOn ? (
            <div className={SECTION_BODY}>
              <m.div key={noteKey(on, missing.length, unconfigured)} initial="hidden" animate="visible" variants={fade}>
                {!on ? <TurningOff /> : missing.length > 0 && !unconfigured ? <MissingSetup missing={missing} /> : <IdHelp />}
              </m.div>
            </div>
          ) : null}
          <SettingRow
            label={ROWS.verify_channel_id.label}
            description={ROWS.verify_channel_id.description}
            control={<IdControl kind="channel" field="verify_channel_id" form={form} update={update} />}
          />
          <SettingRow
            label={ROWS.unverified_role_id.label}
            description={ROWS.unverified_role_id.description}
            control={<IdControl kind="role" field="unverified_role_id" form={form} update={update} />}
          />
          <SettingRow
            label={ROWS.verified_role_id.label}
            description={ROWS.verified_role_id.description}
            control={<IdControl kind="role" field="verified_role_id" form={form} update={update} />}
          />
          <SettingRow
            label={<Optional>{ROWS.bypass_role_id.label}</Optional>}
            description={ROWS.bypass_role_id.description}
            control={<IdControl kind="role" field="bypass_role_id" form={form} update={update} />}
          />
        </SettingsSection>

        <SettingsSection
          icon={SCREENING_SECTION.icon}
          title={SCREENING_SECTION.title}
          description={SCREENING_SECTION.description}
          disabled={!on}
          disabledHint={SCREENING_SECTION.disabledHint}
        >
          <SettingRow
            label={<WithUnit unit={ROWS.min_account_age_days.unit}>{ROWS.min_account_age_days.label}</WithUnit>}
            description={ROWS.min_account_age_days.description}
            control={
              <NumberField
                unit="days"
                min={0}
                smallStep={1}
                format={{ maximumFractionDigits: 0 }}
                decrementLabel="Fewer days"
                incrementLabel="More days"
                value={form.min_account_age_days}
                onValueChange={(value) => update({ min_account_age_days: value })}
                // A cleared field means "off": it settles on 0 once you leave it.
                onValueCommitted={(value) => update({ min_account_age_days: wholeNumber(value) })}
              />
            }
          />
          <SettingRow
            label={<WithUnit unit={ROWS.auto_kick_minutes.unit}>{ROWS.auto_kick_minutes.label}</WithUnit>}
            description={ROWS.auto_kick_minutes.description}
            control={
              <NumberField
                unit="min"
                min={0}
                smallStep={1}
                largeStep={15}
                format={{ maximumFractionDigits: 0 }}
                decrementLabel="Fewer minutes"
                incrementLabel="More minutes"
                value={form.auto_kick_minutes}
                onValueChange={(value) => update({ auto_kick_minutes: value })}
                onValueCommitted={(value) => update({ auto_kick_minutes: wholeNumber(value) })}
              />
            }
          >
            {kickMinutes >= 60 ? (
              <FieldDescription className="text-fg-secondary tabular-nums group-data-disabled/row:text-fg-disabled">
                That&rsquo;s {describeMinutes(kickMinutes)}.
              </FieldDescription>
            ) : null}
          </SettingRow>
        </SettingsSection>

        <SettingsSection
          icon={MESSAGES_SECTION.icon}
          title={MESSAGES_SECTION.title}
          description={MESSAGES_SECTION.description}
          disabled={!on}
          disabledHint={MESSAGES_SECTION.disabledHint}
        >
          <SettingRow
            label={ROWS.dm_on_join.label}
            description={ROWS.dm_on_join.description}
            control={
              <Switch checked={flagOn(form.dm_on_join)} onCheckedChange={(checked) => update({ dm_on_join: toFlag(checked) })} />
            }
          />
          <SettingRow
            label={<Optional>{ROWS.log_channel_id.label}</Optional>}
            description={ROWS.log_channel_id.description}
            control={<IdControl kind="channel" field="log_channel_id" form={form} update={update} />}
          />
        </SettingsSection>

        <JoinGatesCommands />
      </div>

      {/* Last child of the page Container, after the stack (DESIGN.md §3). Also guards leaving with unsaved changes. */}
      <SaveBar
        dirty={dirty}
        saving={saving}
        error={save.error ? SAVE_ERROR : null}
        message={blocked && invalid.length > 0 ? fixMessage(invalid.length) : undefined}
        onSave={() => void onSave()}
        onReset={onReset}
      />
    </>
  );
}

/** Re-mounting the note on a change of meaning fades the new one in. */
function noteKey(on: boolean, missing: number, unconfigured: boolean): string {
  if (!on) return "turning-off";
  return missing > 0 && !unconfigured ? "missing" : "help";
}

function fixMessage(count: number): string {
  return count === 1 ? "Fix the highlighted ID to save" : `Fix the ${count} highlighted IDs to save`;
}

function GateBadge({ on, complete }: { on: boolean; complete: boolean }) {
  if (!on) {
    return (
      <Badge aria-hidden="true" tone="neutral" dot>
        Off
      </Badge>
    );
  }
  return complete ? (
    <Badge aria-hidden="true" tone="success" dot>
      On
    </Badge>
  ) : (
    <Badge aria-hidden="true" tone="warning" dot>
      Needs setup
    </Badge>
  );
}

function IdControl({
  kind,
  field,
  form,
  update,
}: {
  kind: "channel" | "role";
  field: IdField;
  form: JoinGatesDraft;
  update: (patch: Partial<JoinGatesDraft>) => void;
}) {
  return (
    <IdInput
      kind={kind}
      data-field={field}
      value={form[field]}
      onValueChange={(value) => update({ [field]: value } as Partial<JoinGatesDraft>)}
    />
  );
}

/**
 * Shows IdInput's inline 17–20 digit error on these fields even if they were
 * never blurred (an ID that came from the API, or Ctrl+S while still typing),
 * and optionally moves focus to the first one. IdInput reveals its error on
 * blur, so this sends the blur React listens for.
 * TODO(design-system): use an IdInput prop that forces the error once it exists.
 */
function revealIdErrors(root: HTMLElement | null, fields: readonly IdField[], { focus }: { focus: boolean }) {
  if (!root || fields.length === 0) return;
  const inputs = fields
    .map((field) => root.querySelector<HTMLInputElement>(`input[data-field="${field}"]`))
    .filter((input): input is HTMLInputElement => input !== null);
  for (const input of inputs) input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
  if (!focus) return;
  const first = inputs.find((input) => !input.disabled);
  if (!first) return;
  first.focus({ preventScroll: true });
  first.scrollIntoView({ block: "center" });
}

/* ------------------------------------------------------------------ */

/** "GET /api/joingates/… → HTTP 503": the technical line under the message. */
function errorDetail(error: ApiError): string {
  let target: string = error.endpoint ?? "";
  if (error.url) {
    try {
      target = new URL(error.url).pathname;
    } catch {
      // Keep the endpoint name.
    }
  }
  const outcome = error.status ? `HTTP ${error.status}` : error.kind;
  return `${error.method ?? "GET"} ${target} → ${outcome}`.replace(/\s+/g, " ");
}

function LoadError({
  error,
  retrying,
  onRetry,
}: {
  error: ApiError;
  retrying: boolean;
  /** `fromKeyboardFocus`: "Try again" had focus, so focus should land somewhere useful afterwards. */
  onRetry: (fromKeyboardFocus: boolean) => void;
}) {
  const region = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col gap-6">
      <div ref={region} className="flex flex-col">
        <ErrorState
          headingAs="h2"
          title="Couldn't load your join gate settings"
          description={`${error.message} Nothing is shown until they load, so default values can't overwrite your real setup.`}
          detail={errorDetail(error)}
          retrying={retrying}
          onRetry={
            error.retryable || retrying
              ? () => onRetry(Boolean(region.current?.contains(document.activeElement)))
              : undefined
          }
          actions={
            <Button variant="ghost" href={SUPPORT_URL}>
              <LifeBuoy aria-hidden="true" />
              Support server
            </Button>
          }
        />
      </div>
      {/* The bot keeps working when the dashboard API doesn't: the commands still do the job. */}
      <JoinGatesCommands />
    </div>
  );
}
