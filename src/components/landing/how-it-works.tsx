import { Eye, SlidersHorizontal, UserPlus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Reveal, Stagger } from "@/components/motion/reveal";
import { StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { CommandChip } from "@/components/ui/code-block";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { IconTile } from "@/components/ui/icon-tile";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { INVITE_URL } from "@/lib/site";

/*
 * Steps follow docs/getting-started.html: invite (Administrator recommended,
 * or a narrower permission set), run the setup wizards or use the dashboard,
 * and mind the role hierarchy.
 */

function Step({
  number,
  icon,
  title,
  children,
  extra,
}: {
  number: number;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  extra: ReactNode;
}) {
  return (
    <li className="flex">
      <Card
        padding="lg"
        className="w-full gap-5 md:grid md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-6 lg:flex lg:flex-col lg:gap-5"
      >
        <div className="flex items-center gap-4 md:row-span-2 md:flex-col md:items-start lg:flex-row lg:items-center">
          <IconTile icon={icon} />
          <span className="type-eyebrow text-brand-fg">Step {number}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="type-h4 text-fg">{title}</h3>
          <p className="type-small text-fg-secondary">{children}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:col-start-2 lg:mt-auto">{extra}</div>
      </Card>
    </li>
  );
}

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="Get started"
      title="Protected in three steps"
      description="Invite it, choose what to turn on, and let it work. No config files, no code."
    >
      <Stagger as="ol" role="list" className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Step
          number={1}
          icon={UserPlus}
          title="Invite Pleed"
          extra={
            <Button variant="discord" size="sm" href={INVITE_URL}>
              <DiscordIcon className="size-4" />
              Add to Discord
            </Button>
          }
        >
          Add Pleed to your server. Administrator gives anti-nuke and moderation full coverage, or grant a narrower set
          of permissions yourself.
        </Step>
        <Step
          number={2}
          icon={SlidersHorizontal}
          title="Set it up your way"
          extra={
            <>
              <CommandChip command="!antinuke enable" />
              <span className="type-small text-fg-tertiary">
                or <TextLink href="/dashboard">open the dashboard</TextLink>
              </span>
            </>
          }
        >
          Run <code className="rounded-sm bg-surface-3 px-1 type-code text-fg">!setup</code> or a module&apos;s own
          wizard in chat, or set limits, filters and replies from the web dashboard.
        </Step>
        <Step
          number={3}
          icon={Eye}
          title="Pleed keeps watch"
          extra={
            <ul className="flex flex-wrap gap-1.5" aria-label="Watching">
              {["Audit log", "New joins", "Messages"].map((item) => (
                <li
                  key={item}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line-strong bg-surface-2 px-2 type-micro text-fg-secondary"
                >
                  <StatusDot tone="success" />
                  {item}
                </li>
              ))}
            </ul>
          }
        >
          From then on Pleed checks the audit log, new joins and messages, and acts the moment a rule is crossed — no
          moderator has to be online.
        </Step>
      </Stagger>

      <Reveal className="mt-6 lg:mt-8">
        <Callout tone="info" title="Keep Pleed's role near the top">
          Pleed can only ban, kick, time out or jail members whose highest role sits below its own. Drag its role up in
          Server Settings → Roles, and give it View Audit Log for anti-nuke.
        </Callout>
      </Reveal>
    </Section>
  );
}
