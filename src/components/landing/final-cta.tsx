import { LayoutDashboard } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { LogoMark } from "@/components/ui/logo";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { INVITE_URL, SUPPORT_URL } from "@/lib/site";

/** Closing call to action: one message, centred, with the same two actions as the hero. */
export function FinalCta() {
  return (
    <Section aria-labelledby="cta-title">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface-1 px-6 py-14 text-center inset-shadow-highlight sm:px-10 md:py-20">
          <div aria-hidden="true" className="absolute inset-0 -z-raised bg-spotlight" />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-raised h-2/3 bg-grid mask-fade-b" />
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <LogoMark size="xl" className="shadow-glow" />
            <h2 id="cta-title" className="mt-8 type-h2 text-fg">
              Secure your server before you need to.
            </h2>
            <p className="mt-4 type-lead text-fg-secondary">
              Invite Pleed, turn on anti-nuke and the join gate, and tune everything else from the dashboard.
            </p>
            <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button variant="discord" size="lg" href={INVITE_URL} className="max-sm:w-full">
                <DiscordIcon className="size-5" />
                Add to Discord
              </Button>
              <Button variant="secondary" size="lg" href="/dashboard" className="max-sm:w-full">
                <LayoutDashboard aria-hidden="true" />
                Open dashboard
              </Button>
            </div>
            <p className="mt-6 type-small text-fg-tertiary">
              Questions first? Ask in the <TextLink href={SUPPORT_URL}>support server</TextLink>.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
