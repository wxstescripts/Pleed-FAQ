import {
  AudioLines,
  Coins,
  DoorOpen,
  Funnel,
  Gamepad2,
  Gavel,
  History,
  MessageSquareReply,
  ScrollText,
  Search,
  ShieldAlert,
  Ticket,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Reveal, Stagger } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { cn } from "@/lib/utils";

import {
  ANTI_NUKE_MODULES,
  AntiNukeVignette,
  AutoModVignette,
  AutoResponderVignette,
  JoinGateVignette,
  ModerationVignette,
} from "./feature-vignettes";

/*
 * Every sentence here is backed by the bot's docs (docs/*.html) or the
 * dashboard API (src/lib/api/types.ts). Things the old landing claimed that
 * don't exist (CAPTCHA, tamper-proof logs, analytics charts, dashboard
 * custom commands) stay out.
 */

function BentoCard({
  icon,
  title,
  children,
  visual,
  className,
  wide = false,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  visual: ReactNode;
  className?: string;
  /** Text beside the visual from md (the anti-nuke card). */
  wide?: boolean;
}) {
  return (
    <Card
      as="article"
      padding="lg"
      className={cn("gap-6 md:gap-8", wide && "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center", className)}
    >
      <div className="flex flex-col gap-4">
        <IconTile icon={icon} />
        <div className="flex flex-col gap-1.5">
          <h3 className={cn("text-fg", wide ? "type-h3" : "type-h4")}>{title}</h3>
          {children}
        </div>
      </div>
      <div className={cn("min-w-0", !wide && "mt-auto")}>{visual}</div>
    </Card>
  );
}

const MODULES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Ticket,
    title: "Tickets",
    description: "Panels members click to open a ticket, with claiming, participants and blacklists.",
  },
  {
    icon: ScrollText,
    title: "Logging",
    description: "One log channel, or route each event type to its own — managed from an interactive panel.",
  },
  {
    icon: Coins,
    title: "Economy & leveling",
    description: "Wallets, a bank, businesses, stocks and casino games, plus XP levels with role rewards.",
  },
  {
    icon: AudioLines,
    title: "VoiceMaster",
    description: "Join-to-create voice channels that members rename, limit, lock and hide themselves.",
  },
  {
    icon: History,
    title: "Snipe",
    description: "Bring back deleted and edited messages and ghost pings — per channel, member or server.",
  },
  {
    icon: WandSparkles,
    title: "Welcome & setup",
    description: "A setup center, welcome and goodbye messages, and a templated update logger.",
  },
  {
    icon: Search,
    title: "Info & utility",
    description: "User and server info, keyword highlights, profile lookups, image and emoji tools.",
  },
  {
    icon: Gamepad2,
    title: "Fun & music",
    description: "Slash-command games, music and Spotify playback, server counters and webhooks.",
  },
];

export function Features({ categories }: { categories: number }) {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Security first. Everything else built in."
      description="Anti-nuke and the join gate stop damage before it spreads. Auto-moderation, auto-responders and a full moderation kit handle the everyday."
    >
      <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <BentoCard
          wide
          icon={ShieldAlert}
          title="Anti-nuke"
          className="md:col-span-2"
          visual={<AntiNukeVignette />}
        >
          <p className="type-body text-fg-secondary">
            When one account bans, kicks or deletes faster than your limits, Pleed stops it — by banning, kicking or
            quarantining that account, or just reporting it. Trusted admins and whitelisted bots are exempt.
          </p>
          <p className="mt-3 type-small text-fg-secondary">
            It watches {ANTI_NUKE_MODULES.length} kinds of action, each with its own limit: bans, kicks, channel and role
            deletions, emoji deletions, webhook creation, bot adds and vanity URL changes.
          </p>
          <p className="mt-6 border-t border-line-subtle pt-4 type-caption text-fg-tertiary">
            Also in the security module: kick-trap channels, fake permissions and command rate limits.
          </p>
        </BentoCard>

        <BentoCard icon={DoorOpen} title="Join gate" visual={<JoinGateVignette />}>
          <p className="type-small text-fg-secondary">
            New members wait in an unverified role until they press Verify. Set a minimum account age, auto-kick anyone
            who doesn&apos;t verify in time, and let a bypass role skip the gate.
          </p>
        </BentoCard>

        <BentoCard icon={Funnel} title="Auto-moderation" visual={<AutoModVignette />}>
          <p className="type-small text-fg-secondary">
            Filters links, invites, spam, repeated messages, caps, mass mentions and blocked words. Pick a punishment per
            category; strikes escalate for repeat offenders.
          </p>
        </BentoCard>

        <BentoCard icon={MessageSquareReply} title="Auto-responders" visual={<AutoResponderVignette />}>
          <p className="type-small text-fg-secondary">
            Reply or react when a message matches a trigger — with cooldowns, a chance to fire, and channel or role
            filters. Or build your own custom commands.
          </p>
        </BentoCard>

        <BentoCard icon={Gavel} title="Moderation" visual={<ModerationVignette />}>
          <p className="type-small text-fg-secondary">
            Warn, time out, kick, ban, purge, jail with timed sentences, and lock the whole server down in one command —
            logged wherever you want.
          </p>
        </BentoCard>
      </Stagger>

      <Reveal className="mt-16 md:mt-20">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <h3 className="type-h3 text-fg">And the rest of your server</h3>
          <p className="type-small text-fg-secondary">
            <TextLink href="/commands">Browse all {categories} modules</TextLink>
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map(({ icon, title, description }) => (
            <li key={title} className="flex gap-4 bg-surface-1 p-5 lg:flex-col lg:gap-3 lg:p-6">
              <IconTile icon={icon} tone="neutral" size="sm" />
              <div className="flex min-w-0 flex-col gap-1">
                <h4 className="type-label text-fg">{title}</h4>
                <p className="type-small text-fg-secondary">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
