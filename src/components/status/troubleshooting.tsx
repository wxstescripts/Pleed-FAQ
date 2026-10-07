import { Activity, LifeBuoy, ShieldCheck, Terminal } from "lucide-react";

import { Stagger } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/card";
import { CommandChip } from "@/components/ui/code-block";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { DEFAULT_PREFIX, SUPPORT_URL } from "@/lib/site";

/**
 * "Pleed not responding?" — the checks a server admin can do themselves, in
 * order. Grounded in the docs (prefix + slash commands, permissions and role
 * hierarchy in Getting started) and the real `!ping` command.
 */
export function Troubleshooting() {
  return (
    <Section
      id="troubleshooting"
      eyebrow="Troubleshooting"
      title="Pleed not responding?"
      description="Work through these in order. Most problems turn out to be a prefix or a permission, not an outage."
    >
      <Stagger as="ol" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-4">
        <li className="flex">
          <FeatureCard
            className="flex-1"
            icon={Activity}
            title="Check Discord first"
            description="If the Gateway or API shows a problem above, Pleed can’t work until Discord recovers. Nothing to fix on your side."
          />
        </li>
        <li className="flex">
          <FeatureCard
            className="flex-1"
            icon={Terminal}
            title="Ping the bot"
            description="Run this in a channel Pleed can see. A reply with its latency means the bot is online. Changed the prefix? Use yours instead."
          >
            <div className="mt-auto">
              <CommandChip command={`${DEFAULT_PREFIX}ping`} />
            </div>
          </FeatureCard>
        </li>
        <li className="flex">
          <FeatureCard
            className="flex-1"
            icon={ShieldCheck}
            title="Check its permissions"
            description="Pleed needs the permission for each action, like Manage Roles, and its role must sit above the roles it manages."
          >
            <p className="mt-auto type-small">
              <TextLink href="/docs/getting-started">Permissions in Getting started</TextLink>
            </p>
          </FeatureCard>
        </li>
        <li className="flex">
          <FeatureCard
            className="flex-1"
            icon={LifeBuoy}
            title="Ask the team"
            description="Still stuck, or think something is down? The support server is the quickest way to reach the people who run Pleed."
          >
            <div className="mt-auto">
              <Button variant="secondary" href={SUPPORT_URL}>
                <DiscordIcon className="size-4" />
                Support server
              </Button>
            </div>
          </FeatureCard>
        </li>
      </Stagger>
    </Section>
  );
}
