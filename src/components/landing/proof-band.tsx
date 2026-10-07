import { Blocks, Server, Terminal, Users } from "lucide-react";

import { Stagger } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { StatCard } from "@/components/ui/stat-card";
import { SITE_STATS, type CommandFacts } from "@/lib/site";

/**
 * Honest numbers only. Commands and modules are derived from
 * src/data/commands.json by getCommandFacts() (owner-only Core commands
 * hidden, duplicate names counted once). Server and member counts have no
 * data source yet, so they render as labelled placeholders.
 */
export function ProofBand({ facts }: { facts: CommandFacts }) {
  return (
    <Section spacing="compact" aria-label="Pleed at a glance">
      <Stagger as="ul" role="list" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        <li className="flex min-w-0">
          <StatCard
            size="lg"
            icon={Terminal}
            label="Commands"
            value={facts.uniqueCommands}
            hint="Unique public commands"
            className="w-full"
          />
        </li>
        <li className="flex min-w-0">
          <StatCard
            size="lg"
            icon={Blocks}
            label="Modules"
            value={facts.categories}
            hint="From anti-nuke to voice"
            className="w-full"
          />
        </li>
        <li className="flex min-w-0">
          <StatCard
            size="lg"
            icon={Server}
            label="Servers"
            // PLACEHOLDER: replace with real data (SITE_STATS.servers has no source yet)
            value={SITE_STATS.servers}
            placeholder={SITE_STATS.servers === null}
            hint="Live count not connected yet"
            className="w-full"
          />
        </li>
        <li className="flex min-w-0">
          <StatCard
            size="lg"
            icon={Users}
            label="Members protected"
            // PLACEHOLDER: replace with real data (SITE_STATS.users has no source yet)
            value={SITE_STATS.users}
            placeholder={SITE_STATS.users === null}
            hint="Live count not connected yet"
            className="w-full"
          />
        </li>
      </Stagger>
    </Section>
  );
}
