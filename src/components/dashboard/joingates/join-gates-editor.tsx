"use client";

import { Hourglass, MessagesSquare, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { flagOn, getJoinGatesConfig, saveJoinGatesConfig, toFlag, type ApiError, type JoinGatesConfig } from "@/lib/api";
import { usePleedMutation, usePleedQuery } from "@/lib/api/hooks";
import { Badge } from "@/components/ui/badge";
import { FieldDescription } from "@/components/ui/field";
import { NumberField } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SaveBar } from "@/components/ui/save-bar";
import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { Skeleton } from "@/components/ui/skeleton";
import { IdInput } from "@/components/ui/snowflake-input";
import { ErrorState } from "@/components/ui/states";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";

import {
  describeMinutes,
  gateStatus,
  invalidIdFields,
  isUnconfigured,
  missingRequired,
  sameConfig,
  toSaveBody,
  wholeNumber,
  type GateStatus,
  type IdField,
  type JoinGatesDraft,
} from "./join-gates-model";
import { GettingStarted, InlineCode, PANEL_COMMAND, VerificationNote } from "./join-gates-notes";

const DESCRIPTION =
  "New members wait in a verification channel until they press Verify. Screen out brand-new accounts and kick anyone who never verifies.";

/** The one save-failure message every settings page uses (DESIGN.md → Save feedback). */
const SAVE_FAILED = "Couldn't reach Pleed. Your changes are still here.";

/**
 * Join gate settings: loads the config, then shows the editor. While loading
 * it renders `loading` (the server-rendered skeleton); if the load fails it
 * shows an ErrorState with a retry — never default values that could be
 * saved over the real config.
 */
export function JoinGatesEditor({ loading }: { loading: ReactNode }) {
  const query = usePleedQuery(getJoinGatesConfig);
  const [retryRequested, setRetryRequested] = useState(false);

  if (query.data) {
    return <JoinGatesForm saved={query.data} onSaved={query.setData} />;
  }

  const retrying = retryRequested && query.status === "loading";
  if (query.status === "error" || retrying) {
    return (
      <>
        <Header />
        <ErrorState
          headingAs="h2"
          title="Couldn't load join gate settings"
          description={`${query.error?.message ?? "Pleed's API didn't respond."} Nothing on your server has changed.`}
          detail={query.error ? describeLoadError(query.error) : undefined}
          retrying={retrying}
          onRetry={() => {
            setRetryRequested(true);
            query.reload();
          }}
        />
      </>
    );
  }

  return (
    <>
      <Header meta={<Skeleton className="h-6 w-12 rounded-md" />} />
      {loading}
    </>
  );
}

function Header({ meta }: { meta?: ReactNode }) {
  return <PageHeader title="Join gates" description={DESCRIPTION} meta={meta} />;
}

function GateBadge({ status }: { status: GateStatus }) {
  if (status === "on") {
    return (
      <Badge tone="success" dot>
        On
      </Badge>
    );
  }
  if (status === "incomplete") {
    return (
      <Badge tone="warning" dot>
        Needs setup
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" dot>
      Off
    </Badge>
  );
}

/** "GET /api/joingates · HTTP 503" — the technical line under the error. */
function describeLoadError(error: ApiError): string {
  const outcome = error.status ? `HTTP ${error.status}` : error.kind === "network" ? "no response" : error.kind;
  return `${error.method ?? "GET"} /api/joingates · ${outcome}`;
}

function JoinGatesForm({ saved, onSaved }: { saved: JoinGatesConfig; onSaved: (config: JoinGatesConfig) => void }) {
  const save = usePleedMutation(saveJoinGatesConfig);
  const [draft, setDraft] = useState<JoinGatesDraft | null>(null);
  // A save was refused because an ID is malformed; the bar says so until it's fixed.
  const [blocked, setBlocked] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const form: JoinGatesDraft = draft ?? saved;
  const on = flagOn(form.enabled);
  const dirty = draft !== null && !sameConfig(draft, saved);
  const invalid = invalidIdFields(form);
  const missing = missingRequired(form);
  const saving = save.status === "pending";
  const kickMinutes = wholeNumber(form.auto_kick_minutes);

  // An ID the API sent that isn't a valid snowflake gets its inline error straight away.
  useEffect(() => {
    revealErrors(formRef.current, invalidIdFields(saved), { focus: false });
  }, [saved]);

  function update(patch: Partial<JoinGatesDraft>) {
    setDraft((current) => ({ ...(current ?? saved), ...patch }));
    if (blocked && invalidIdFields({ ...form, ...patch }).length === 0) setBlocked(false);
  }

  async function handleSave() {
    if (saving) return;
    if (invalid.length > 0) {
      setBlocked(true);
      revealErrors(formRef.current, invalid, { focus: true });
      return;
    }
    // The whole loaded object with the edits: same keys, same order, 0/1 flags.
    const body = toSaveBody(form);
    const result = await save.mutate(body);
    if (!result.ok) return; // The SaveBar keeps the draft and shows SAVE_FAILED.
    onSaved(body);
    // Keep anything edited while the request was in flight.
    setDraft((current) => (current === null || sameConfig(current, body) ? null : current));
    setBlocked(false);
    toast.success("Changes saved");
  }

  function handleReset() {
    setDraft(null);
    setBlocked(false);
    save.reset();
  }

  const offHint = "Turn on the verification gate above to change these settings.";

  return (
    <>
      <Header meta={<GateBadge status={gateStatus(saved)} />} />
      <div ref={formRef} className="flex flex-col gap-6">
        {isUnconfigured(saved) ? <GettingStarted /> : null}

        <SettingsSection
          icon={ShieldCheck}
          title="Verification gate"
          description="New members get the unverified role and can only see the verification channel until they press Verify."
          action={
            <Switch
              aria-label="Enable the verification gate"
              checked={on}
              onCheckedChange={(checked) => update({ enabled: toFlag(checked) })}
            />
          }
          disabled={!on}
          disabledHint="The gate is off, so new members get in straight away. Turn it on to edit these settings."
        >
          {on ? (
            <div className="px-5 py-4 md:px-6">
              <VerificationNote missing={missing} />
            </div>
          ) : null}
          <SettingRow
            label="Verification channel"
            description={
              <>
                Where new members press Verify. Run <InlineCode>{PANEL_COMMAND}</InlineCode> in Discord to post or
                refresh the button.
              </>
            }
            control={<IdControl kind="channel" field="verify_channel_id" form={form} update={update} />}
          />
          <SettingRow
            label="Unverified role"
            description="Given to every new member until they verify. Let it see the verification channel only."
            control={<IdControl kind="role" field="unverified_role_id" form={form} update={update} />}
          />
          <SettingRow
            label="Verified role"
            description="Given once a member verifies. It should unlock the rest of your server."
            control={<IdControl kind="role" field="verified_role_id" form={form} update={update} />}
          />
          <SettingRow
            label={<Optional>Bypass role</Optional>}
            description="Members with this role skip the join gate."
            control={<IdControl kind="role" field="bypass_role_id" form={form} update={update} />}
          />
        </SettingsSection>

        <SettingsSection
          icon={Hourglass}
          title="Screening"
          description="Keep brand-new accounts out and clear away members who never verify."
          disabled={!on}
          disabledHint={offHint}
        >
          <SettingRow
            label={<WithUnit unit="in days">Minimum account age</WithUnit>}
            description="Accounts younger than this can't verify. Raid waves tend to use brand-new accounts. 0&nbsp;turns the check off."
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
                onValueCommitted={(value) => update({ min_account_age_days: wholeNumber(value) })}
              />
            }
          />
          <SettingRow
            label={<WithUnit unit="in minutes">Auto-kick unverified members</WithUnit>}
            description="Kick members who still haven't verified after this long. 0&nbsp;never kicks."
            control={
              <NumberField
                unit="min"
                min={0}
                smallStep={1}
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
          icon={MessagesSquare}
          title="Messages & logs"
          description="Point new members to verification and keep a record for your staff."
          disabled={!on}
          disabledHint={offHint}
        >
          <SettingRow
            label="DM new members"
            description="Pleed sends each new member a direct message telling them how to verify. Members who block DMs from server members won't receive it."
            control={
              <Switch checked={flagOn(form.dm_on_join)} onCheckedChange={(checked) => update({ dm_on_join: toFlag(checked) })} />
            }
          />
          <SettingRow
            label={<Optional>Log channel</Optional>}
            description="Pleed posts join gate activity here, separate from your other logs."
            control={<IdControl kind="channel" field="log_channel_id" form={form} update={update} />}
          />
        </SettingsSection>
      </div>
      <SaveBar
        dirty={dirty}
        saving={saving}
        error={save.status === "error" ? SAVE_FAILED : null}
        message={
          blocked && invalid.length > 0
            ? invalid.length === 1
              ? "Fix the highlighted ID to save"
              : `Fix the ${invalid.length} highlighted IDs to save`
            : undefined
        }
        onSave={() => void handleSave()}
        onReset={handleReset}
      />
    </>
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
      onValueChange={(value) => update({ [field]: value })}
    />
  );
}

/** "(optional)" after a row label; dims with the row when its section is off. */
function Optional({ children }: { children: ReactNode }) {
  return (
    <>
      {children}{" "}
      <span className="font-normal text-fg-tertiary group-data-disabled/row:text-fg-disabled">(optional)</span>
    </>
  );
}

/** The NumberField's unit is visual only, so the label carries it for screen readers. */
function WithUnit({ unit, children }: { unit: string; children: ReactNode }) {
  return (
    <>
      {children}
      <span className="sr-only">, {unit}</span>
    </>
  );
}

/**
 * Shows IdInput's inline 17–20 digit error on these fields even if they were
 * never blurred (an ID that arrived from the API, or Ctrl+S while typing), and
 * optionally moves focus to the first one. IdInput reveals its error on blur,
 * so this sends the blur React listens for.
 * TODO(design-system): replace with an IdInput prop that forces the error.
 */
function revealErrors(root: HTMLElement | null, fields: readonly IdField[], { focus }: { focus: boolean }) {
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
