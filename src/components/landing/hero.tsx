import { ArrowRight, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { GradientText } from "@/components/ui/gradient-text";
import { Section } from "@/components/ui/section";
import { INVITE_URL, type CommandFacts } from "@/lib/site";

import { HeroVisual } from "./hero-visual";

/**
 * Landing hero. Server-rendered and fully visible in the HTML (no entrance
 * animation on the h1/lead/CTAs), so the headline is the LCP element.
 *
 * Layout: stacked (copy, then the product visual) below `lg`; two columns
 * from `lg` (DESIGN.md §2). The h1 uses `type-display`, the landing-only
 * display style, so it is written out here rather than through
 * <Section titleAs="h1"> (which renders `type-h1`).
 */
export function Hero({ facts }: { facts: CommandFacts }) {
  return (
    <Section behindHeader aria-labelledby="hero-title" className="overflow-x-clip bg-spotlight">
      <div className="grid items-center gap-14 md:gap-16 lg:grid-cols-[minmax(0,10fr)_minmax(0,11fr)] lg:gap-10 xl:gap-16">
        <div className="flex max-w-2xl flex-col items-start">
          <p className="type-eyebrow text-brand-fg">Discord security &amp; automation</p>
          <h1 id="hero-title" className="mt-5 type-display text-fg">
            <span className="block">Guard your server.</span>
            <GradientText className="block">Automate the rest.</GradientText>
          </h1>
          <p className="mt-6 max-w-xl type-lead text-fg-secondary">
            Anti-nuke, join gates, auto-moderation and auto-responders in one bot — plus{" "}
            {facts.uniqueCommandsLabel} commands, set up from Discord or the web dashboard.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button variant="discord" size="lg" href={INVITE_URL} className="max-sm:w-full">
              <DiscordIcon className="size-5" />
              Add to Discord
            </Button>
            <Button variant="secondary" size="lg" href="/dashboard" className="max-sm:w-full">
              <LayoutDashboard aria-hidden="true" />
              Open dashboard
            </Button>
          </div>
          <Button variant="link" href="/commands" className="group/cta mt-4">
            Or browse all {facts.uniqueCommands} commands
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 ease-standard group-hover/cta:translate-x-0.5"
            />
          </Button>
        </div>

        <HeroVisual />
      </div>
    </Section>
  );
}
