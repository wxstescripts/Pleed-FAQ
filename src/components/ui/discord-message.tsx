import { ArrowUpRight, AtSign, Hash } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/ui/logo";

/*
 * Discord message previews built from Pleed tokens — the product UI that sells
 * a Discord bot (landing hero, docs examples, auto-responder replies, welcome
 * and verification DMs). It feels Discord-native (avatar column, name + BOT
 * tag + timestamp, embeds with a colour bar, buttons under the message) but
 * uses Pleed's own surfaces, type and tones — never Discord's palette, so it
 * never reads as an impersonation of Discord's client.
 *
 * Server Components; previews are static (buttons are not interactive).
 */

/** Name colours and embed bars come from Pleed's tones (think "role colour"). */
export type DiscordAccent = "default" | "brand" | "success" | "warning" | "danger" | "info";

const nameColor: Record<DiscordAccent, string> = {
  default: "text-fg",
  brand: "text-brand-fg",
  success: "text-success-fg",
  warning: "text-warning-fg",
  danger: "text-danger-fg",
  info: "text-info-fg",
};

const barColor: Record<DiscordAccent, string> = {
  default: "border-l-line-hover",
  brand: "border-l-brand-400",
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
  info: "border-l-info",
};

export type DiscordAuthor = {
  name: string;
  /** Avatar image (Discord CDN etc.); initials when absent. */
  avatarSrc?: string;
  /** A custom avatar node — wins over `avatarSrc` (PLEED_AUTHOR uses the logo mark). */
  avatar?: ReactNode;
  /** Shows the BOT tag after the name. */
  bot?: boolean;
  /** Name colour (a role colour), from Pleed's tones. */
  accent?: DiscordAccent;
};

/** Pleed as the message author — use it for every Pleed reply so all previews match. */
export const PLEED_AUTHOR: DiscordAuthor = {
  name: "Pleed",
  bot: true,
  accent: "brand",
  avatar: <LogoMark size="lg" className="rounded-full" />,
};

export type DiscordEmbedField = { name: ReactNode; value: ReactNode; inline?: boolean };

export type DiscordEmbed = {
  /** Colour bar on the left. */
  accent?: DiscordAccent;
  title?: ReactNode;
  description?: ReactNode;
  /** Inline fields share a row (up to 3) when the embed is ≥ 22rem wide; they stack below that. */
  fields?: DiscordEmbedField[];
  footer?: ReactNode;
};

export type DiscordMessageProps = {
  author: DiscordAuthor;
  /** "Today at 12:04" */
  timestamp: ReactNode;
  /** Message text — may contain <DiscordMention>s and inline `code`. */
  children?: ReactNode;
  embed?: DiscordEmbed;
  /** Buttons under the message: <DiscordButton>s. */
  actions?: ReactNode;
  className?: string;
};

/**
 *   <DiscordPreview channel="welcome">
 *     <DiscordMessage author={{ name: "Nova" }} timestamp="Today at 12:03">how do I verify?</DiscordMessage>
 *     <DiscordMessage author={PLEED_AUTHOR} timestamp="Today at 12:03"
 *       embed={{ accent: "brand", title: "Verify to join", description: <>Press the button in <DiscordMention kind="channel">verify</DiscordMention>.</> }}
 *       actions={<DiscordButton tone="brand">Verify</DiscordButton>} />
 *   </DiscordPreview>
 */
export function DiscordMessage({ author, timestamp, children, embed, actions, className }: DiscordMessageProps) {
  const accent = author.accent ?? "default";
  return (
    <div className={cn("grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-3 sm:gap-x-4", className)}>
      <div className="pt-0.5">
        {author.avatar ?? <Avatar src={author.avatarSrc} name={author.name} size="md" />}
      </div>
      <div className="flex min-w-0 flex-col">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={cn("min-w-0 truncate type-label", nameColor[accent])}>{author.name}</span>
          {author.bot ? (
            <Badge tone="brand" size="sm" className="rounded-xs px-1">
              BOT
            </Badge>
          ) : null}
          <span className="type-caption text-fg-tertiary">{timestamp}</span>
        </p>
        {children ? (
          <div
            className={cn(
              "mt-0.5 type-small text-fg-secondary [&>*+*]:mt-1",
              "[&_code]:rounded-xs [&_code]:bg-inset [&_code]:px-1 [&_code]:type-code [&_code]:text-fg",
            )}
          >
            {children}
          </div>
        ) : null}
        {embed ? <DiscordEmbedCard embed={embed} /> : null}
        {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

function DiscordEmbedCard({ embed }: { embed: DiscordEmbed }) {
  const fields = embed.fields ?? [];
  return (
    <div
      className={cn(
        "@container mt-2 max-w-md min-w-0 rounded-md border border-l-4 border-line bg-surface-2 py-3 pr-4 pl-3",
        barColor[embed.accent ?? "default"],
      )}
    >
      {embed.title ? <p className="type-label text-fg">{embed.title}</p> : null}
      {embed.description ? (
        <div
          className={cn(
            "type-small text-fg-secondary [&>*+*]:mt-1",
            "[&_code]:rounded-xs [&_code]:bg-inset [&_code]:px-1 [&_code]:type-code [&_code]:text-fg",
            embed.title && "mt-1",
          )}
        >
          {embed.description}
        </div>
      ) : null}
      {fields.length > 0 ? (
        <dl className="mt-2.5 grid grid-cols-1 gap-x-4 gap-y-2 @min-[22rem]:grid-cols-3">
          {fields.map((field, index) => (
            <div key={index} className={cn("min-w-0", !field.inline && "@min-[22rem]:col-span-full")}>
              <dt className="type-caption font-medium text-fg">{field.name}</dt>
              <dd className="type-small text-fg-secondary">{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {embed.footer ? <p className="mt-2.5 type-caption text-fg-tertiary">{embed.footer}</p> : null}
    </div>
  );
}

/**
 * A mention chip inside message text: `kind="user" | "role"` → @name,
 * `kind="channel"` → #name. Pass the bare name as children.
 */
export function DiscordMention({ kind, children }: { kind: "user" | "role" | "channel"; children: ReactNode }) {
  return (
    <span className="rounded-xs bg-brand-subtle px-0.5 font-medium whitespace-nowrap text-brand-fg">
      {kind === "channel" ? "#" : "@"}
      {children}
    </span>
  );
}

const buttonTones = {
  brand: "bg-brand text-fg-on-brand inset-shadow-highlight-strong",
  secondary: "bg-surface-4 text-fg inset-shadow-highlight",
  success: "bg-success-strong text-success-strong-fg inset-shadow-highlight-strong",
  danger: "bg-danger-strong text-danger-strong-fg inset-shadow-highlight-strong",
  link: "bg-surface-4 text-fg inset-shadow-highlight",
} as const;

/**
 * A message button as it appears in Discord (preview only — not interactive,
 * not focusable). `tone="link"` adds the ↗ of a link button.
 */
export function DiscordButton({
  tone = "secondary",
  icon,
  children,
}: {
  tone?: keyof typeof buttonTones;
  /** A lucide icon element, e.g. <ShieldCheck />. */
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium whitespace-nowrap select-none [&_svg]:size-4 [&_svg]:shrink-0",
        buttonTones[tone],
      )}
    >
      {icon}
      {children}
      {tone === "link" ? <ArrowUpRight aria-hidden="true" className="opacity-70" /> : null}
    </span>
  );
}

/**
 * The frame around a conversation preview: a surface panel with the channel
 * (or DM) name as its caption and the messages stacked inside.
 */
export function DiscordPreview({
  channel,
  kind = "channel",
  children,
  className,
}: {
  /** Channel name ("welcome") or, with kind="dm", the other person's name. Omit for no header. */
  channel?: string;
  kind?: "channel" | "dm";
  children: ReactNode;
  className?: string;
}) {
  const Icon = kind === "dm" ? AtSign : Hash;
  return (
    <figure className={cn("m-0 min-w-0 overflow-hidden rounded-xl border border-line bg-surface-1 inset-shadow-highlight", className)}>
      {channel ? (
        <figcaption className="flex h-11 items-center gap-2 border-b border-line-subtle px-4 type-label text-fg">
          <Icon aria-hidden="true" className="size-4 shrink-0 text-fg-tertiary" />
          <span className="truncate">{channel}</span>
          {kind === "dm" ? <span className="sr-only">(direct message)</span> : null}
        </figcaption>
      ) : null}
      <div className="flex flex-col gap-4 p-4 sm:p-5">{children}</div>
    </figure>
  );
}
