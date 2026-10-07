"use client";

import { SquareTerminal } from "lucide-react";

import { CommandChip } from "@/components/ui/code-block";
import { SettingsSection } from "@/components/ui/settings-section";
import { DEFAULT_PREFIX } from "@/lib/site";

/**
 * Auto-mod settings the dashboard API doesn't store. Each command and its
 * wording comes from the bot's own command reference (docs/moderation.html,
 * "AutoMod"), shown with the default prefix.
 */
const COMMANDS = [
  {
    title: "Blocked words",
    description: "Add a word to the list the Blocked words filter checks.",
    command: `${DEFAULT_PREFIX}words add <word>`,
  },
  {
    title: "Thresholds",
    description: "See or change how much it takes to trip each filter.",
    command: `${DEFAULT_PREFIX}automod thresholds`,
  },
  {
    title: "Ignored channels",
    description: "Let auto-mod skip a channel.",
    command: `${DEFAULT_PREFIX}ignore channel <channel>`,
  },
  {
    title: "Log channel",
    description: "Choose where Pleed reports what it catches.",
    command: `${DEFAULT_PREFIX}automod logs <channel>`,
  },
  {
    title: "Test a message",
    description: "See what a message would trigger, without punishing anyone.",
    command: `${DEFAULT_PREFIX}automod test <message>`,
  },
] as const;

/**
 * "More in Discord": a static list. A client module only because
 * SettingsSection (a client component) takes its icon as a component, which a
 * Server Component can't pass across the boundary.
 */
export function AutomodCommands() {
  return (
    <SettingsSection
      icon={SquareTerminal}
      title="More in Discord"
      description="These auto-mod settings are changed with commands. Copy one and run it in any channel of your server (shown with the default prefix)."
    >
      <ul className="divide-y divide-line-subtle">
        {COMMANDS.map((item) => (
          <li
            key={item.command}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-6 md:py-5"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="type-label text-fg">{item.title}</p>
              <p className="type-caption text-fg-tertiary">{item.description}</p>
            </div>
            <CommandChip command={item.command} className="shrink-0 self-start sm:self-center" />
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}
