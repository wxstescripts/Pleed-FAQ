"use client";

import { m } from "framer-motion";
import { LifeBuoy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import {
  flagOn,
  getSecurityConfig,
  saveSecurityConfig,
  toFlag,
  type ApiError,
  type SecurityConfig,
} from "@/lib/api";
import { usePleedMutation, usePleedQuery } from "@/lib/api/hooks";
import { SUPPORT_URL } from "@/lib/site";
import { fade } from "@/components/motion/tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { SaveBar } from "@/components/ui/save-bar";
import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ErrorState } from "@/components/ui/states";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";

import { DiscordCommands } from "./discord-commands";
import { PunishmentPicker } from "./punishment-picker";
import { RuleSummary } from "./rule-summary";
import {
  LIMITS_SECTION,
  MASTER_SECTION,
  OptionCardSkeleton,
  PermissionNote,
  PUNISHMENT_SECTION,
  SECTION_BODY,
  SliderSkeleton,
} from "./security-sections";
import { PUNISHMENTS, THRESHOLDS, sameConfig } from "./security-options";

/** DESIGN.md §3 "Save feedback": the same words on every page. */
const SAVE_ERROR = "Couldn't reach Pleed. Your changes are still here.";

/**
 * Loads the anti-nuke config, then hands it to the form. Until a real config
 * has arrived there is nothing to edit: a skeleton while loading, an
 * ErrorState (with retry) if it failed — never default values, which would
 * overwrite the server's real setup if saved.
 */
export function SecurityEditor() {
  const query = usePleedQuery(getSecurityConfig);
  const [retrying, setRetrying] = useState(false);
  const [lastError, setLastError] = useState<ApiError | null>(null);
  // Focus was on "Try again" when the retry succeeded: hand it to the master switch.
  const [refocus, setRefocus] = useState(false);

  // Derived state, adjusted during render (React's "storing information from previous renders").
  if (query.error && query.error !== lastError) setLastError(query.error);
  if (retrying && query.status !== "loading") setRetrying(false);

  if (query.data) {
    return <SecurityForm saved={query.data} onSaved={(config) => query.setData(config)} focusSwitchOnMount={refocus} />;
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

  return <SecurityLoading />;
}

/* ------------------------------------------------------------------ */

function SecurityForm({
  saved,
  onSaved,
  focusSwitchOnMount,
}: {
  saved: SecurityConfig;
  onSaved: (config: SecurityConfig) => void;
  focusSwitchOnMount: boolean;
}) {
  const save = usePleedMutation(saveSecurityConfig);
  const [draft, setDraft] = useState<SecurityConfig | null>(null);
  const config = draft ?? saved;
  const enabled = flagOn(config.enabled);
  const savedEnabled = flagOn(saved.enabled);

  const masterDescriptionId = useId();
  const punishmentTitleId = useId();
  const punishmentDescriptionId = useId();
  const switchSlot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusSwitchOnMount) return;
    const active = document.activeElement;
    if (!active || active === document.body) switchSlot.current?.querySelector<HTMLElement>('[role="switch"]')?.focus();
  }, [focusSwitchOnMount]);

  /** Edit the draft. Every save sends the whole loaded object with these fields changed (same keys, 0/1 flags). */
  function update(patch: Partial<SecurityConfig>) {
    const next = { ...config, ...patch };
    if (sameConfig(next, saved)) {
      // Back to what is saved: nothing to save, and an old save error no longer applies.
      setDraft(null);
      save.reset();
    } else {
      setDraft(next);
    }
  }

  async function onSave() {
    if (!draft) return;
    const body = draft;
    const result = await save.mutate(body);
    // Failure: keep the draft — the SaveBar stays up, red, with "Try again".
    if (!result.ok) return;
    onSaved(body);
    // Keep anything edited while the request was in flight.
    setDraft((current) => (current === body ? null : current));
    toast.success("Changes saved");
  }

  function onReset() {
    setDraft(null);
    save.reset();
  }

  return (
    <>
      <m.div initial="hidden" animate="visible" variants={fade} className="flex flex-col gap-6">
        <SettingsSection
          icon={MASTER_SECTION.icon}
          title={MASTER_SECTION.title}
          description={<span id={masterDescriptionId}>{MASTER_SECTION.description}</span>}
          action={
            <div ref={switchSlot} className="flex items-center gap-3">
              {/* Visual status for sighted users; the switch itself announces on/off. */}
              <Badge aria-hidden="true" tone={enabled ? "success" : "neutral"} dot>
                {enabled ? "On" : "Off"}
              </Badge>
              <Switch
                checked={enabled}
                onCheckedChange={(on) => update({ enabled: toFlag(on) })}
                aria-label="Anti-nuke protection"
                aria-describedby={masterDescriptionId}
              />
            </div>
          }
        >
          <div className={SECTION_BODY}>
            {enabled ? (
              <RuleSummary config={config} />
            ) : (
              <m.div initial="hidden" animate="visible" variants={fade}>
                {savedEnabled ? (
                  <Callout tone="warning" title="Anti-nuke turns off when you save">
                    Pleed will stop watching for mass bans, kicks and deletions. Your limits and punishment are kept for
                    when you turn it back on.
                  </Callout>
                ) : (
                  <Callout tone="warning" title="Anti-nuke is off">
                    Pleed isn&apos;t watching for mass bans, kicks or deletions. Turn it on to enforce the limits and
                    punishment below.
                  </Callout>
                )}
              </m.div>
            )}
            <PermissionNote />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={LIMITS_SECTION.icon}
          title={LIMITS_SECTION.title}
          description={LIMITS_SECTION.description}
          disabled={!enabled}
          disabledHint={LIMITS_SECTION.disabledHint}
        >
          {THRESHOLDS.map((threshold) => (
            <SettingRow
              key={threshold.key}
              label={threshold.label}
              description={threshold.description}
              control={
                <Slider
                  value={config[threshold.key]}
                  onValueChange={(value) => update({ [threshold.key]: value as number } as Partial<SecurityConfig>)}
                  min={threshold.min}
                  max={threshold.max}
                  step={1}
                  largeStep={Math.ceil(threshold.max / 4)}
                  unit={threshold.unit(config[threshold.key])}
                  disabled={!enabled}
                />
              }
            />
          ))}
        </SettingsSection>

        <SettingsSection
          icon={PUNISHMENT_SECTION.icon}
          title={<span id={punishmentTitleId}>{PUNISHMENT_SECTION.title}</span>}
          description={<span id={punishmentDescriptionId}>{PUNISHMENT_SECTION.description}</span>}
          disabled={!enabled}
          disabledHint={PUNISHMENT_SECTION.disabledHint}
        >
          <div className={SECTION_BODY}>
            <PunishmentPicker
              value={config.punishment}
              onValueChange={(punishment) => update({ punishment })}
              disabled={!enabled}
              labelledBy={punishmentTitleId}
              describedBy={punishmentDescriptionId}
            />
            {enabled && config.punishment === "alert" ? (
              <m.div initial="hidden" animate="visible" variants={fade}>
                <Callout tone="warning" title="Alert only won't stop an attack">
                  Whoever crosses a limit keeps their roles and can carry on. Switch to Ban, Kick or Quarantine once your
                  limits are tuned.
                </Callout>
              </m.div>
            ) : null}
          </div>
        </SettingsSection>

        <DiscordCommands />
      </m.div>

      {/* Last child of the page Container, after the stack (DESIGN.md §3). Also guards leaving with unsaved changes. */}
      <SaveBar
        dirty={draft !== null}
        saving={save.status === "pending"}
        error={save.error ? SAVE_ERROR : null}
        onSave={() => void onSave()}
        onReset={onReset}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

/** The loaded layout with skeleton values: same section frames, titles and row labels. */
function SecurityLoading() {
  return (
    <div className="flex flex-col gap-6">
      <LoadingRegion label="Loading anti-nuke settings">
        <div aria-hidden="true" className="flex flex-col gap-6">
          <SettingsSection
            icon={MASTER_SECTION.icon}
            title={MASTER_SECTION.title}
            description={MASTER_SECTION.description}
            action={
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            }
          >
            <div className={SECTION_BODY}>
              <RuleSummary config={null} />
              <PermissionNote />
            </div>
          </SettingsSection>

          <SettingsSection icon={LIMITS_SECTION.icon} title={LIMITS_SECTION.title} description={LIMITS_SECTION.description}>
            {THRESHOLDS.map((threshold) => (
              <SettingRow
                key={threshold.key}
                label={threshold.label}
                description={threshold.description}
                control={<SliderSkeleton />}
              />
            ))}
          </SettingsSection>

          <SettingsSection
            icon={PUNISHMENT_SECTION.icon}
            title={PUNISHMENT_SECTION.title}
            description={PUNISHMENT_SECTION.description}
          >
            <div className={SECTION_BODY}>
              <div className="@container">
                <div className="grid gap-3 @md:grid-cols-2">
                  {PUNISHMENTS.map((option) => (
                    <OptionCardSkeleton key={option.value} />
                  ))}
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>
      </LoadingRegion>
      {/* Static (no config needed) and interactive, so it stays outside the aria-hidden skeleton. */}
      <DiscordCommands />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** "GET /api/security/… → HTTP 503": the technical line under the message. */
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
    <div ref={region} className="flex flex-col">
      <ErrorState
        headingAs="h2"
        title="Couldn't load your anti-nuke settings"
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
  );
}
