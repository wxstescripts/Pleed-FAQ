"use client";

import { DoorOpen, Funnel, MessageSquareReply, ShieldAlert, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  DiscordButton,
  DiscordMention,
  DiscordMessage,
  DiscordPreview,
  PLEED_AUTHOR,
} from "@/components/ui/discord-message";
import { Input, NumberField } from "@/components/ui/input";
import { LogoMark } from "@/components/ui/logo";
import { Select } from "@/components/ui/select";
import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { AUTOMOD_PUNISHMENTS, SECURITY_PUNISHMENTS } from "./dashboard-data";

/*
 * A working preview of the dashboard, built from the same kit components the
 * dashboard pages use (SettingsSection, SettingRow, Switch, Slider, Select,
 * NumberField). Every control is live and the "what members see" column on
 * the right follows it — but nothing is sent anywhere: this island has no
 * API calls and no SaveBar (whose leave-guard would block navigation).
 * Fields and options mirror src/lib/api/types.ts, so the preview never shows
 * a setting the real dashboard doesn't have.
 */

type TabValue = "security" | "joingates" | "automod" | "responders";

const TABS: { value: TabValue; label: string; icon: LucideIcon }[] = [
  { value: "security", label: "Security", icon: ShieldAlert },
  { value: "joingates", label: "Join Gates", icon: DoorOpen },
  { value: "automod", label: "Auto-Mod", icon: Funnel },
  { value: "responders", label: "Auto-Responders", icon: MessageSquareReply },
];

function asNumber(value: number | readonly number[] | null, fallback: number): number {
  if (value === null) return fallback;
  return typeof value === "number" ? value : (value[0] ?? fallback);
}

/** Settings on the left, "what members see" on the right (below on narrower frames). */
function PanelLayout({ settings, preview, previewLabel }: { settings: ReactNode; preview: ReactNode; previewLabel: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_23rem] xl:gap-8">
      <div className="flex min-w-0 flex-col gap-6">{settings}</div>
      <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]">
        <p className="type-eyebrow text-fg-tertiary">{previewLabel}</p>
        {preview}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

const SECURITY_ACTION: Record<string, string> = {
  ban: "Banned the account",
  kick: "Kicked the account",
  quarantine: "Removed its roles",
  alert: "None — alert only",
};

type SecurityState = {
  enabled: boolean;
  ban: number;
  kick: number;
  channels: number;
  roles: number;
  punishment: string;
};

function SecurityPanel({ state, set }: { state: SecurityState; set: (next: Partial<SecurityState>) => void }) {
  return (
    <PanelLayout
      previewLabel="What your mods see"
      settings={
        <SettingsSection
          headingAs="h3"
          icon={ShieldAlert}
          title="Anti-nuke"
          description="Punish anyone who bans, kicks or deletes faster than these limits. Trusted admins and whitelisted bots are exempt."
          action={
            <>
              <Badge tone={state.enabled ? "success" : "neutral"} dot className="max-sm:hidden">
                {state.enabled ? "On" : "Off"}
              </Badge>
              <Switch
                aria-label="Enable anti-nuke"
                checked={state.enabled}
                onCheckedChange={(enabled) => set({ enabled })}
              />
            </>
          }
          disabled={!state.enabled}
          disabledHint="Turn on anti-nuke to edit its limits."
        >
          <SettingRow
            label="Ban threshold"
            description="Bans one account may make per minute."
            control={
              <Slider
                value={state.ban}
                onValueChange={(value) => set({ ban: asNumber(value, state.ban) })}
                min={1}
                max={20}
                unit="per minute"
              />
            }
          />
          <SettingRow
            className="max-sm:hidden"
            label="Kick threshold"
            description="Kicks one account may make per minute."
            control={
              <Slider
                value={state.kick}
                onValueChange={(value) => set({ kick: asNumber(value, state.kick) })}
                min={1}
                max={20}
                unit="per minute"
              />
            }
          />
          <SettingRow
            label="Channel deletions"
            description="Channels one account may delete per minute."
            control={
              <Slider
                value={state.channels}
                onValueChange={(value) => set({ channels: asNumber(value, state.channels) })}
                min={1}
                max={10}
                unit="per minute"
              />
            }
          />
          <SettingRow
            className="max-sm:hidden"
            label="Role deletions"
            description="Roles one account may delete per minute."
            control={
              <Slider
                value={state.roles}
                onValueChange={(value) => set({ roles: asNumber(value, state.roles) })}
                min={1}
                max={10}
                unit="per minute"
              />
            }
          />
          <SettingRow
            label="Punishment"
            description="What happens to the account that crosses a limit."
            control={
              <Select
                items={SECURITY_PUNISHMENTS}
                value={state.punishment}
                onValueChange={(punishment) => set({ punishment })}
              />
            }
          />
        </SettingsSection>
      }
      preview={
        state.enabled ? (
          <DiscordPreview channel="mod-log">
            <DiscordMessage
              author={PLEED_AUTHOR}
              timestamp="Today at 03:12"
              embed={{
                accent: state.punishment === "alert" ? "warning" : "danger",
                title: state.punishment === "alert" ? "Anti-nuke: ban limit crossed" : "Anti-nuke stopped a mass ban",
                description: (
                  <>
                    <DiscordMention kind="user">mod-account</DiscordMention> banned {state.ban}{" "}
                    {state.ban === 1 ? "member" : "members"} in under a minute — your limit is {state.ban}.
                  </>
                ),
                fields: [{ name: "Action taken", value: SECURITY_ACTION[state.punishment] ?? SECURITY_ACTION.ban }],
              }}
            />
          </DiscordPreview>
        ) : (
          <Callout tone="warning" title="Anti-nuke is off">
            A compromised account could ban every member and delete every channel, and nothing would stop it.
          </Callout>
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Join gates                                                          */
/* ------------------------------------------------------------------ */

type JoinGateState = { enabled: boolean; age: number; autokick: number; dm: boolean };

function JoinOutcome({ name, detail, tone, outcome }: { name: string; detail: string; tone: "success" | "warning" | "danger" | "neutral"; outcome: string }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="flex min-w-0 flex-col">
        <span className="truncate type-label text-fg">{name}</span>
        <span className="truncate type-caption text-fg-tertiary">{detail}</span>
      </span>
      <Badge tone={tone} size="sm" dot>
        {outcome}
      </Badge>
    </li>
  );
}

function JoinGatesPanel({ state, set }: { state: JoinGateState; set: (next: Partial<JoinGateState>) => void }) {
  const tooNew = state.age > 2;
  return (
    <PanelLayout
      previewLabel="What new members see"
      settings={
        <SettingsSection
          headingAs="h3"
          icon={DoorOpen}
          title="Join gate"
          description="New members get your unverified role until they press Verify in your verify channel."
          action={
            <>
              <Badge tone={state.enabled ? "success" : "neutral"} dot className="max-sm:hidden">
                {state.enabled ? "On" : "Off"}
              </Badge>
              <Switch
                aria-label="Enable the join gate"
                checked={state.enabled}
                onCheckedChange={(enabled) => set({ enabled })}
              />
            </>
          }
          disabled={!state.enabled}
          disabledHint="Turn on the join gate to edit its rules."
        >
          <SettingRow
            label="Minimum account age (days)"
            description="Accounts younger than this can't verify."
            control={
              <NumberField
                value={state.age}
                onValueChange={(value) => set({ age: asNumber(value, 0) })}
                min={0}
                max={365}
                unit="days"
              />
            }
          />
          <SettingRow
            label="Auto-kick after (minutes)"
            description="Kick members who haven't verified by then. 0 turns it off."
            control={
              <NumberField
                value={state.autokick}
                onValueChange={(value) => set({ autokick: asNumber(value, 0) })}
                min={0}
                max={1440}
                unit="min"
              />
            }
          />
          <SettingRow
            label="DM new members"
            description="Pleed sends each new member a direct message when they join."
            control={<Switch checked={state.dm} onCheckedChange={(dm) => set({ dm })} />}
          />
        </SettingsSection>
      }
      preview={
        state.enabled ? (
          <>
            <DiscordPreview channel="verify">
              <DiscordMessage
                author={PLEED_AUTHOR}
                timestamp="Today at 18:40"
                embed={{
                  accent: "brand",
                  title: "Verify to get in",
                  description: "Press the button below to unlock the rest of the server.",
                }}
                actions={<DiscordButton tone="success">Verify</DiscordButton>}
              />
            </DiscordPreview>
            <ul className="flex flex-col divide-y divide-line-subtle rounded-xl border border-line bg-surface-1">
              <JoinOutcome name="nova" detail="Account 3 years old · pressed Verify" tone="success" outcome="Verified" />
              <JoinOutcome
                name="fresh-alt"
                detail="Account 2 days old · pressed Verify"
                tone={tooNew ? "danger" : "success"}
                outcome={tooNew ? "Too new" : "Verified"}
              />
              <JoinOutcome
                name="lurker"
                detail="Never pressed Verify"
                tone={state.autokick > 0 ? "warning" : "neutral"}
                outcome={state.autokick > 0 ? `Kicked after ${state.autokick} min` : "Waits unverified"}
              />
            </ul>
          </>
        ) : (
          <Callout tone="warning" title="The join gate is off">
            New members — and raid accounts — get straight into every channel.
          </Callout>
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Auto-mod                                                            */
/* ------------------------------------------------------------------ */

type FilterKey = "anti_links" | "anti_invites" | "anti_spam" | "anti_caps" | "anti_mentions" | "bad_words_enabled";
type AutoModState = Record<FilterKey, boolean> & { punishment: string; minutes: number };

const FILTERS: { key: FilterKey; label: string; description: string }[] = [
  { key: "anti_links", label: "Links", description: "Delete messages with website links." },
  { key: "anti_invites", label: "Discord invites", description: "Delete invite links to other servers." },
  { key: "anti_spam", label: "Spam", description: "Catch members sending messages too fast." },
  { key: "anti_caps", label: "Excessive caps", description: "Delete messages that are mostly capital letters." },
  { key: "anti_mentions", label: "Mass mentions", description: "Delete messages that ping lots of members." },
  { key: "bad_words_enabled", label: "Blocked words", description: "Delete messages with words on your list." },
];

const SAMPLE_MESSAGES: { author: string; text: string; filter: FilterKey | null; reason: string }[] = [
  { author: "promo-acc", text: "join my server!! discord.gg/xxxxxx", filter: "anti_invites", reason: "Invite" },
  { author: "loud", text: "WHO WANTS FREE NITRO RIGHT NOW", filter: "anti_caps", reason: "Caps" },
  { author: "nova", text: "anyone up for a match later?", filter: null, reason: "" },
];

function AutoModPanel({ state, set }: { state: AutoModState; set: (next: Partial<AutoModState>) => void }) {
  const consequence =
    state.punishment === "timeout"
      ? `Timed out ${state.minutes} min`
      : state.punishment === "kick"
        ? "Kicked"
        : state.punishment === "ban"
          ? "Banned"
          : null;
  return (
    <PanelLayout
      previewLabel="What happens in chat"
      settings={
        <>
          <SettingsSection
            headingAs="h3"
            icon={Funnel}
            title="Filters"
            description="Every message is checked against the filters you turn on."
          >
            {FILTERS.map((filter) => (
              <SettingRow
                key={filter.key}
                label={filter.label}
                description={filter.description}
                control={
                  <Switch checked={state[filter.key]} onCheckedChange={(on) => set({ [filter.key]: on } as Partial<AutoModState>)} />
                }
              />
            ))}
          </SettingsSection>
          <SettingsSection headingAs="h3" title="Punishment" description="What happens after a message is caught.">
            <SettingRow
              label="Action"
              control={
                <Select
                  items={AUTOMOD_PUNISHMENTS}
                  value={state.punishment}
                  onValueChange={(punishment) => set({ punishment })}
                />
              }
            />
            {state.punishment === "timeout" ? (
              <SettingRow
                label="Timeout length (minutes)"
                control={
                  <NumberField
                    value={state.minutes}
                    onValueChange={(value) => set({ minutes: Math.max(1, asNumber(value, 10)) })}
                    min={1}
                    max={40320}
                    unit="min"
                  />
                }
              />
            ) : null}
          </SettingsSection>
        </>
      }
      preview={
        <DiscordPreview channel="general">
          {SAMPLE_MESSAGES.map((message) => {
            const caught = message.filter !== null && state[message.filter];
            return (
              <DiscordMessage key={message.author} author={{ name: message.author }} timestamp="Today at 21:07">
                <p className={cn(caught && "text-fg-tertiary line-through decoration-danger")}>{message.text}</p>
                {caught ? (
                  <p className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone="danger" size="sm">
                      Deleted · {message.reason}
                    </Badge>
                    {consequence ? <Badge size="sm">{consequence}</Badge> : null}
                  </p>
                ) : null}
              </DiscordMessage>
            );
          })}
        </DiscordPreview>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Auto-responders                                                     */
/* ------------------------------------------------------------------ */

const RESPONDERS: { trigger: string; before: string; channel: string; after: string }[] = [
  { trigger: "rules", before: "Please read ", channel: "rules", after: " before posting — it's short." },
  { trigger: "roles", before: "Pick your roles in ", channel: "roles", after: " — each one unlocks its channels." },
  { trigger: "apply", before: "Staff applications are open in ", channel: "apply", after: "." },
];

function RespondersPanel({ message, setMessage }: { message: string; setMessage: (value: string) => void }) {
  const text = message.trim();
  const match = text ? RESPONDERS.find((r) => text.toLowerCase().includes(r.trigger)) : undefined;
  return (
    <PanelLayout
      previewLabel="What happens in chat"
      settings={
        <SettingsSection
          headingAs="h3"
          icon={MessageSquareReply}
          title="Auto-responders"
          description="Pleed replies whenever a message contains a trigger."
        >
          <ul aria-label="Auto-responders" className="flex flex-col divide-y divide-line-subtle">
            {RESPONDERS.map((responder) => (
              <li
                key={responder.trigger}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 md:px-6"
              >
                <span className="flex shrink-0 items-center gap-2 sm:w-40">
                  <code className="rounded-sm border border-brand-border bg-brand-subtle px-1.5 type-code-xs text-brand-fg">
                    {responder.trigger}
                  </code>
                  <Badge size="sm">contains</Badge>
                </span>
                <span className="min-w-0 type-small text-fg-secondary">
                  {responder.before}#{responder.channel}
                  {responder.after}
                </span>
              </li>
            ))}
          </ul>
          <SettingRow
            layout="stacked"
            label="Try a message"
            description="Type what a member might say. Matching ignores upper and lower case."
            control={
              <Input
                value={message}
                onChange={(event) => setMessage(event.currentTarget.value)}
                placeholder="e.g. where are the rules?"
                autoComplete="off"
              />
            }
          />
        </SettingsSection>
      }
      preview={
        <DiscordPreview channel="general">
          {text ? (
            <>
              <DiscordMessage author={{ name: "you", accent: "info" }} timestamp="Today at 14:02">
                <p className="wrap-break-word">{text}</p>
              </DiscordMessage>
              {match ? (
                <DiscordMessage author={PLEED_AUTHOR} timestamp="Today at 14:02">
                  {match.before}
                  <DiscordMention kind="channel">{match.channel}</DiscordMention>
                  {match.after}
                </DiscordMessage>
              ) : (
                <p className="flex items-center gap-2 type-caption text-fg-tertiary">
                  <StatusDot />
                  No trigger matched, so Pleed stays quiet.
                </p>
              )}
            </>
          ) : (
            <p className="type-small text-fg-tertiary">Type a message on the left to test your auto-responders.</p>
          )}
        </DiscordPreview>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* The frame                                                           */
/* ------------------------------------------------------------------ */

export function DashboardPreview() {
  const [tab, setTab] = useState<TabValue>("security");
  const [security, setSecurity] = useState<SecurityState>({
    enabled: true,
    ban: 3,
    kick: 5,
    channels: 2,
    roles: 2,
    punishment: "ban",
  });
  const [joinGate, setJoinGate] = useState<JoinGateState>({ enabled: true, age: 7, autokick: 30, dm: true });
  const [autoMod, setAutoMod] = useState<AutoModState>({
    anti_links: true,
    anti_invites: true,
    anti_spam: true,
    anti_caps: false,
    anti_mentions: true,
    bad_words_enabled: false,
    punishment: "timeout",
    minutes: 10,
  });
  const [message, setMessage] = useState("where are the rules?");

  const current = TABS.find((t) => t.value === tab) ?? TABS[0];

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)} className="gap-5 md:gap-6">
      <TabsList aria-label="Dashboard pages" activateOnFocus>
        {TABS.map(({ value, label, icon: Icon }) => (
          <TabsTab key={value} value={value}>
            <Icon aria-hidden="true" />
            {label}
          </TabsTab>
        ))}
      </TabsList>

      <div className="overflow-clip rounded-2xl border border-line-strong bg-canvas shadow-lg inset-shadow-highlight">
        <div className="flex h-12 items-center gap-2 border-b border-line bg-surface-2 px-4 md:px-5">
          <LogoMark size="xs" />
          <span className="type-label text-fg">Dashboard</span>
          <span aria-hidden="true" className="type-label text-fg-disabled">
            /
          </span>
          <span className="truncate type-label text-fg-secondary">{current.label}</span>
          <Badge tone="brand" size="sm" className="ml-auto">
            Live preview
          </Badge>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <TabsPanel value="security">
            <SecurityPanel state={security} set={(next) => setSecurity((s) => ({ ...s, ...next }))} />
          </TabsPanel>
          <TabsPanel value="joingates">
            <JoinGatesPanel state={joinGate} set={(next) => setJoinGate((s) => ({ ...s, ...next }))} />
          </TabsPanel>
          <TabsPanel value="automod">
            <AutoModPanel state={autoMod} set={(next) => setAutoMod((s) => ({ ...s, ...next }))} />
          </TabsPanel>
          <TabsPanel value="responders">
            <RespondersPanel message={message} setMessage={setMessage} />
          </TabsPanel>
        </div>

        <div className="flex flex-col gap-3 border-t border-line bg-surface-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <p className="type-small text-fg-tertiary">Try the controls — nothing here is saved to a server.</p>
          <Button href="/dashboard" variant="secondary" size="sm" className="self-start sm:self-auto">
            Open the real dashboard
          </Button>
        </div>
      </div>
    </Tabs>
  );
}
