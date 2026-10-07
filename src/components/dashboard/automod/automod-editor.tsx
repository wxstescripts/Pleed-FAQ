"use client";

import { m } from "framer-motion";
import { Check, Gavel, ListFilter, Minus } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";

import { flagOn, saveAutomodConfig, toFlag, type ApiError, type AutomodConfig, type AutomodPunishment } from "@/lib/api";
import { usePleedMutation } from "@/lib/api/hooks";
import { DEFAULT_PREFIX } from "@/lib/site";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/components/motion/tokens";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { NumberField } from "@/components/ui/input";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { SaveBar } from "@/components/ui/save-bar";
import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";

import { useAutomodQuery } from "./automod-context";
import {
  FILTERS,
  InlineCode,
  PUNISHMENTS,
  TIMEOUT_MAX_MINUTES,
  TIMEOUT_MIN_MINUTES,
  activeFilters,
  describeConfig,
  formatMinutes,
  sameConfig,
  type AutomodFilter,
} from "./filters";

/** DESIGN.md "Save feedback": the same words on every dashboard page. */
const SAVE_ERROR = "Couldn't reach Pleed. Your changes are still here.";

const FILTERS_DESCRIPTION = "Each filter checks new messages. Turn on the ones your server needs.";
const ACTION_DESCRIPTION = "What happens to a message a filter catches, and to the member who sent it.";
const DEFAULT_ACTION_DESCRIPTION = (
  <>
    Used by every filter. To give one filter its own action, use{" "}
    <InlineCode>{DEFAULT_PREFIX}automod punishment</InlineCode> in Discord.
  </>
);

/** Conditional reveal of the timeout length: opacity + a 4 px drop, 200 ms (transform/opacity only). */
const reveal = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.standard } },
} as const;

export function AutomodEditor({ commands }: { commands?: ReactNode }) {
  const query = useAutomodQuery();
  const [retrying, setRetrying] = useState(false);

  if (query.data) return <AutomodForm saved={query.data} onSaved={query.setData} commands={commands} />;

  // A failed load (and its retries) keeps the error card on screen, so "Try again" keeps focus while it retries.
  if (query.status === "error" || (retrying && query.status === "loading")) {
    return (
      <div className="flex flex-col gap-6">
        <ErrorState
          headingAs="h2"
          title="Couldn't load your auto-mod settings"
          description="Nothing has changed in your server. Check that Pleed is online, then try again."
          detail={query.error ? requestDetail(query.error) : undefined}
          retrying={query.status === "loading"}
          onRetry={() => {
            setRetrying(true);
            query.reload();
          }}
        />
        {commands}
      </div>
    );
  }

  return <AutomodSkeleton commands={commands} />;
}

/* ------------------------------------------------------------------ */
/* The form (only ever rendered with a config that really loaded)      */
/* ------------------------------------------------------------------ */

function AutomodForm({
  saved,
  onSaved,
  commands,
}: {
  saved: AutomodConfig;
  onSaved: (config: AutomodConfig) => void;
  commands?: ReactNode;
}) {
  const save = usePleedMutation(saveAutomodConfig);
  const [draft, setDraft] = useState<AutomodConfig | null>(null);
  // The timeout field can be empty while someone types; the draft keeps the last whole number.
  const [timeoutBlank, setTimeoutBlank] = useState(false);
  const [showTimeoutError, setShowTimeoutError] = useState(false);
  const [revealTimeout, setRevealTimeout] = useState(false);
  const timeoutRef = useRef<HTMLDivElement>(null);

  const config = draft ?? saved;
  const active = activeFilters(config);
  const anyOn = active.length > 0;
  const timing = config.punishment === "timeout";
  const dirty = (draft !== null && !sameConfig(draft, saved)) || (timing && timeoutBlank);

  const timeoutProblem = !timing
    ? null
    : timeoutBlank
      ? "Enter how many minutes the timeout lasts."
      : config.timeout_minutes < TIMEOUT_MIN_MINUTES || config.timeout_minutes > TIMEOUT_MAX_MINUTES
        ? `Enter a length from ${TIMEOUT_MIN_MINUTES} to ${TIMEOUT_MAX_MINUTES.toLocaleString("en-US")} minutes (28 days).`
        : null;

  function update(patch: Partial<AutomodConfig>) {
    const next = { ...config, ...patch };
    setDraft(next);
    // Back to what is saved: a stale "couldn't save" must not greet the next edit.
    if (sameConfig(next, saved) && save.status === "error") save.reset();
  }

  async function onSave() {
    if (!draft || save.status === "pending") return;
    if (anyOn && timeoutProblem) {
      setShowTimeoutError(true);
      timeoutRef.current?.querySelector<HTMLInputElement>("input:not([type='hidden']):not([aria-hidden='true'])")?.focus();
      return;
    }
    const submitted = draft; // the whole loaded object, edited fields spread in (same keys, 0/1 flags)
    const result = await save.mutate(submitted);
    if (!result.ok) return; // the SaveBar shows SAVE_ERROR and keeps the draft
    onSaved(submitted);
    setDraft((current) => (current && !sameConfig(current, submitted) ? current : null));
    setTimeoutBlank(false);
    setShowTimeoutError(false);
    toast.success("Changes saved");
  }

  function onReset() {
    setDraft(null);
    setTimeoutBlank(false);
    setShowTimeoutError(false);
    save.reset();
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <SummaryCard config={config} dirty={dirty} />

        <SettingsSection icon={ListFilter} title="Filters" description={FILTERS_DESCRIPTION}>
          {FILTERS.map((filter) => {
            const on = flagOn(config[filter.key]);
            return (
              <SettingRow
                key={filter.key}
                className={filterRowClasses}
                label={<FilterLabel filter={filter} on={on} />}
                description={filter.description}
                control={<Switch checked={on} onCheckedChange={(next) => update({ [filter.key]: toFlag(next) })} />}
              />
            );
          })}
        </SettingsSection>

        <SettingsSection
          icon={Gavel}
          title="Action"
          description={ACTION_DESCRIPTION}
          disabled={!anyOn}
          disabledHint="Turn on a filter above to choose what happens to the messages it catches."
        >
          <DefaultAction
            value={config.punishment}
            disabled={!anyOn}
            onValueChange={(value) => {
              setRevealTimeout(true);
              update({ punishment: value });
            }}
          />

          {timing ? (
            // Shown only for "Time out"; it follows the choice in the reading and tab order.
            <m.div ref={timeoutRef} initial={revealTimeout ? "hidden" : false} animate="visible" variants={reveal}>
              <SettingRow
                label="Timeout length"
                description={
                  timeoutBlank
                    ? "How long the sender can't chat. Discord allows up to 28 days."
                    : `The sender can't chat for ${formatMinutes(config.timeout_minutes)}. Discord allows up to 28 days.`
                }
                error={showTimeoutError ? timeoutProblem : null}
                control={
                  <NumberField
                    value={timeoutBlank ? null : config.timeout_minutes}
                    onValueChange={(value) => {
                      if (value === null) {
                        setTimeoutBlank(true);
                        setDraft({ ...config });
                        return;
                      }
                      setTimeoutBlank(false);
                      update({ timeout_minutes: Math.round(value) });
                    }}
                    onBlur={() => setShowTimeoutError(true)}
                    min={TIMEOUT_MIN_MINUTES}
                    max={TIMEOUT_MAX_MINUTES}
                    step={1}
                    largeStep={60}
                    format={{ maximumFractionDigits: 0 }}
                    locale="en-US"
                    unit="min"
                    decrementLabel="One minute shorter"
                    incrementLabel="One minute longer"
                  />
                }
              />
            </m.div>
          ) : null}
        </SettingsSection>

        {commands}
      </div>
      <SaveBar
        dirty={dirty}
        saving={save.status === "pending"}
        error={save.status === "error" ? SAVE_ERROR : null}
        onSave={() => void onSave()}
        onReset={onReset}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

/**
 * Filter rows hang their icon tile in a 44 px column left of the text from
 * 640 px (the row's own padding + tile 32 + gap 12); on phones the icon sits
 * inline before the label, so the description keeps the full width.
 */
const filterRowClasses = "sm:pl-16 md:pl-17";

function FilterLabel({ filter, on }: { filter: AutomodFilter; on: boolean }) {
  const Icon = filter.icon;
  return (
    <span className="relative flex items-center gap-2">
      <IconTile
        icon={Icon}
        size="sm"
        tone={on ? "brand" : "neutral"}
        className="absolute top-0 -left-11 max-sm:hidden"
      />
      <Icon aria-hidden="true" className={cn("size-4 shrink-0 sm:hidden", on ? "text-brand-fg" : "text-fg-tertiary")} />
      {filter.label}
    </span>
  );
}

/**
 * "Default action": label, description and radio cards, laid out like a
 * stacked SettingRow. Not a SettingRow on purpose: inside its Field every
 * radio would be named after the row label ("Default action") instead of its
 * own option, and the row label would point at the first hidden radio input.
 */
function DefaultActionFrame({
  ids,
  disabled = false,
  children,
}: {
  ids?: { label: string; description: string };
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 md:px-6 md:py-5">
      <p id={ids?.label} className={cn("type-label", disabled ? "text-fg-disabled" : "text-fg")}>
        Default action
      </p>
      <p
        id={ids?.description}
        className={cn("max-w-xl type-caption", disabled ? "text-fg-disabled" : "text-fg-tertiary")}
      >
        {DEFAULT_ACTION_DESCRIPTION}
      </p>
      {children}
    </div>
  );
}

function DefaultAction({
  value,
  disabled,
  onValueChange,
}: {
  value: AutomodPunishment;
  disabled: boolean;
  onValueChange: (value: AutomodPunishment) => void;
}) {
  const id = useId();
  const ids = { label: `${id}-label`, description: `${id}-description` };
  return (
    <DefaultActionFrame ids={ids} disabled={disabled}>
      <RadioGroup
        aria-labelledby={ids.label}
        aria-describedby={ids.description}
        value={value}
        disabled={disabled}
        onValueChange={(next) => onValueChange(next as AutomodPunishment)}
        className="mt-3 grid gap-3 sm:grid-cols-2"
      >
        {PUNISHMENTS.map((option) => (
          // Named by the option label alone; its consequence is the description.
          <RadioOption
            key={option.value}
            value={option.value}
            card
            aria-labelledby={`${id}-${option.value}`}
            aria-describedby={`${id}-${option.value}-description`}
            label={<span id={`${id}-${option.value}`}>{option.label}</span>}
            description={<span id={`${id}-${option.value}-description`}>{option.description}</span>}
          />
        ))}
      </RadioGroup>
    </DefaultActionFrame>
  );
}

function SummaryCard({ config, dirty }: { config: AutomodConfig; dirty: boolean }) {
  const count = activeFilters(config).length;
  return (
    <Card as="section" aria-labelledby="automod-summary" className="gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex min-h-6 items-center justify-between gap-3">
          <h2 id="automod-summary" className="type-eyebrow text-fg-tertiary">
            Summary
          </h2>
          {dirty ? (
            <Badge tone="warning" size="sm">
              Not saved yet
            </Badge>
          ) : null}
        </div>
        <p className="flex items-center gap-2.5 type-h4 text-fg">
          <StatusDot tone={count > 0 ? "success" : "neutral"} />
          {count > 0 ? `${count} of ${FILTERS.length} filters on` : "No filters on"}
        </p>
        <p className="type-small text-fg-secondary">{describeConfig(config)}</p>
      </div>
      <ul aria-label="Filter status" className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const on = flagOn(config[filter.key]);
          return (
            <li key={filter.key}>
              <Badge tone={on ? "success" : "outline"} className={cn(!on && "text-fg-tertiary")}>
                {on ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
                {filter.label}
                <span className="sr-only">{on ? ": on" : ": off"}</span>
              </Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** `GET /api/automod/… → HTTP 503` — the technical line under the error message. */
function requestDetail(error: ApiError): string {
  let path = "";
  try {
    path = error.url ? new URL(error.url).pathname : "";
  } catch {
    path = "";
  }
  const target = [error.method, path || error.endpoint].filter(Boolean).join(" ");
  const outcome = error.status ? `HTTP ${error.status}` : error.kind === "network" ? "no response" : error.kind;
  return target ? `${target} → ${outcome}` : outcome;
}

/* ------------------------------------------------------------------ */
/* Loading: the real layout, with skeletons where values will appear   */
/* ------------------------------------------------------------------ */

function AutomodSkeleton({ commands }: { commands?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <LoadingRegion label="Loading auto-mod settings" className="flex flex-col gap-6">
        <Card aria-hidden="true" className="gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex h-6 items-center">
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["w-16", "w-16", "w-28", "w-28", "w-20", "w-28"].map((width, index) => (
              <Skeleton key={index} className={cn("h-6 rounded-md", width)} />
            ))}
          </div>
        </Card>

        <SettingsSection icon={ListFilter} title="Filters" description={FILTERS_DESCRIPTION}>
          {FILTERS.map((filter) => (
            <SettingRow
              key={filter.key}
              className={filterRowClasses}
              label={<FilterLabel filter={filter} on={false} />}
              description={filter.description}
              control={<Skeleton data-compact-control="" className="h-6 w-10 rounded-full" />}
            />
          ))}
        </SettingsSection>

        <SettingsSection icon={Gavel} title="Action" description={ACTION_DESCRIPTION}>
          <DefaultActionFrame>
            <div aria-hidden="true" className="mt-3 grid gap-3 sm:grid-cols-2">
              {PUNISHMENTS.map((option) => (
                <div key={option.value} className="flex gap-3 rounded-lg border border-line p-4">
                  <Skeleton className="size-4.5 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2 pt-0.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </DefaultActionFrame>
        </SettingsSection>
      </LoadingRegion>
      {commands}
    </div>
  );
}
