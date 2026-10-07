import { ArrowRight, Check, CircleSlash, ShieldCheck, Undo2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusDot } from "@/components/ui/badge";
import { DiscordButton, DiscordMention, DiscordMessage, PLEED_AUTHOR } from "@/components/ui/discord-message";
import { cn } from "@/lib/utils";

/*
 * Small product illustrations for the feature bento. They are pictures
 * (aria-hidden — each card's text states the facts), built from the kit's
 * tokens and Discord previews so they match the dashboard and the bot.
 * Times, names and counts are an example scenario, not usage figures.
 */

/** Mono timestamp column used by the event-style vignettes. */
function Time({ children }: { children: string }) {
  return <span className="shrink-0 type-code-xs text-fg-tertiary tabular-nums max-sm:hidden">{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Anti-nuke: what Pleed sees in the audit log, and what it does        */
/* ------------------------------------------------------------------ */

const BAN_EVENTS = ["03:12:01", "03:12:04", "03:12:06"] as const;

export function AntiNukeVignette({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col overflow-hidden rounded-lg border border-line bg-inset", className)}>
      <div className="flex h-11 items-center justify-between gap-3 border-b border-line-subtle px-4">
        <span className="type-eyebrow text-fg-tertiary">Watching</span>
        <Badge tone="success" size="sm" dot>
          8 modules on
        </Badge>
      </div>
      <ul className="grid grid-cols-2 gap-px bg-line-subtle">
        {ANTI_NUKE_MODULES.map((module) => (
          <li key={module} className="flex min-w-0 items-center gap-2 bg-inset px-4 py-2.5">
            <StatusDot tone="success" />
            <span className="truncate type-caption text-fg-secondary">{module}</span>
          </li>
        ))}
      </ul>
      <div className="flex h-11 items-center justify-between gap-3 border-y border-line-subtle px-4">
        <span className="type-eyebrow text-fg-tertiary">Audit log · bans</span>
        <Badge tone="danger" size="sm" dot>
          Limit 3 / min
        </Badge>
      </div>
      <ol className="flex flex-col divide-y divide-line-subtle">
        {BAN_EVENTS.map((time, index) => (
          <li key={time} className="flex items-center gap-3 px-4 py-2.5">
            <Time>{time}</Time>
            <span className="min-w-0 flex-1 truncate type-small text-fg-secondary">
              <span className="font-medium text-fg">mod-account</span> banned a member
            </span>
            <span className="flex shrink-0 gap-0.5">
              {BAN_EVENTS.map((_, bar) => (
                <span
                  key={bar}
                  className={cn("h-3 w-1.5 rounded-full", bar <= index ? "bg-danger" : "bg-track")}
                />
              ))}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-3 bg-success-subtle px-4 py-2.5">
          <Time>03:12:06</Time>
          <span className="min-w-0 flex-1 truncate type-small text-fg">
            <span className="font-medium">Pleed</span> banned mod-account
          </span>
          <Check className="size-4 shrink-0 text-success-fg" />
        </li>
      </ol>
    </div>
  );
}

/** The eight actions anti-nuke can watch, each with its own threshold (docs: Security → Setting up AntiNuke). */
export const ANTI_NUKE_MODULES = [
  "Bans",
  "Kicks",
  "Channel deletes",
  "Role deletes",
  "Emoji deletes",
  "Webhooks",
  "Bot adds",
  "Vanity URL",
] as const;

/* ------------------------------------------------------------------ */
/* Join gate: the verify panel new members see                          */
/* ------------------------------------------------------------------ */

export function JoinGateVignette({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-4 rounded-lg border border-line bg-inset p-4", className)}>
      <DiscordMessage
        author={PLEED_AUTHOR}
        timestamp="Today at 18:40"
        embed={{
          accent: "brand",
          title: "Verify to get in",
          description: "Press the button below to unlock the rest of the server.",
        }}
        actions={
          <DiscordButton tone="success" icon={<ShieldCheck />}>
            Verify
          </DiscordButton>
        }
      />
      <div className="flex flex-wrap items-center gap-2 border-t border-line-subtle pt-4">
        <span className="type-caption text-fg-tertiary">New member</span>
        <Badge tone="warning" size="sm" dot>
          Unverified
        </Badge>
        <ArrowRight className="size-3.5 text-fg-tertiary" />
        <Badge tone="success" size="sm" dot>
          Verified
        </Badge>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auto-mod: a message caught by a filter + the filter list             */
/* ------------------------------------------------------------------ */

const AUTOMOD_FILTERS: { label: string; on: boolean }[] = [
  { label: "Links", on: true },
  { label: "Invites", on: true },
  { label: "Spam", on: true },
  { label: "Mentions", on: true },
  { label: "Caps", on: false },
  { label: "Blocked words", on: true },
];

export function AutoModVignette({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-4 rounded-lg border border-line bg-inset p-4", className)}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
        <Avatar name="Free Nitro" size="md" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="flex flex-wrap items-center gap-x-2">
            <span className="type-label text-fg">free-nitro</span>
            <span className="type-caption text-fg-tertiary">Today at 09:21</span>
          </p>
          <p className="truncate type-small text-fg-tertiary line-through decoration-danger">
            claim free nitro → discord.gg/xxxxxx
          </p>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone="danger" size="sm">
              <CircleSlash />
              Invite link deleted
            </Badge>
            <Badge size="sm">Timed out 10 min</Badge>
          </span>
        </div>
      </div>
      <ul className="flex flex-wrap gap-1.5 border-t border-line-subtle pt-4">
        {AUTOMOD_FILTERS.map((filter) => (
          <li
            key={filter.label}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 type-micro",
              filter.on ? "border-line-strong bg-surface-2 text-fg" : "border-line-subtle text-fg-tertiary",
            )}
          >
            <StatusDot tone={filter.on ? "success" : "neutral"} />
            {filter.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auto-responders: trigger → reply                                     */
/* ------------------------------------------------------------------ */

export function AutoResponderVignette({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-4 rounded-lg border border-line bg-inset p-4", className)}>
      <p className="flex flex-wrap items-center gap-2 type-caption text-fg-tertiary">
        When a message contains
        <span className="rounded-sm border border-brand-border bg-brand-subtle px-1.5 type-code-xs text-brand-fg">roles</span>
      </p>
      <DiscordMessage author={{ name: "Nova", accent: "info" }} timestamp="Today at 14:02">
        where do I get roles?
      </DiscordMessage>
      <DiscordMessage author={PLEED_AUTHOR} timestamp="Today at 14:02">
        Pick yours in <DiscordMention kind="channel">roles</DiscordMention> — each one unlocks its channels.
      </DiscordMessage>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Moderation: commands and what they did                               */
/* ------------------------------------------------------------------ */

const MOD_LINES = [
  { command: "!timeout @spammer 10m", result: "Timed out for 10 minutes", icon: Check },
  { command: "!jail @Bob 1h spamming", result: "Jailed for 1 hour", icon: Check },
  { command: "!lockdown raid", result: "Every channel locked for @everyone", icon: Check },
  { command: "!unlockdown", result: "Channels reopened", icon: Undo2 },
] as const;

export function ModerationVignette({ className }: { className?: string }) {
  return (
    <ul aria-hidden="true" className={cn("flex flex-col divide-y divide-line-subtle rounded-lg border border-line bg-inset", className)}>
      {MOD_LINES.map(({ command, result, icon: Icon }) => (
        <li key={command} className="flex flex-col gap-1 px-4 py-3">
          <code className="truncate type-code-sm text-fg">{command}</code>
          <span className="flex items-center gap-1.5 type-caption text-fg-tertiary">
            <Icon className="size-3.5 shrink-0 text-success-fg" />
            {result}
          </span>
        </li>
      ))}
    </ul>
  );
}
