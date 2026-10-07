import { Terminal } from "lucide-react";

import { DEFAULT_PREFIX } from "@/lib/site";
import { CommandChip } from "@/components/ui/code-block";
import { SettingsSection } from "@/components/ui/settings-section";

/*
 * Anti-nuke settings the API (and so this page) doesn't cover — from the
 * Security & AntiNuke docs (docs/security.html): trusted admins, the
 * whitelist and the other modules (emoji, webhooks, bot adds, vanity URL).
 */
const COMMANDS = [
  {
    title: "Trusted admins",
    description: "Exempt staff you trust from every punishment.",
    command: `${DEFAULT_PREFIX}antinuke admin @user`,
  },
  {
    title: "Whitelist",
    description: "Let a bot or integration bulk-manage channels and roles.",
    command: `${DEFAULT_PREFIX}antinuke whitelist @bot`,
  },
  {
    title: "Everything else",
    description: "Emoji deletions, webhooks, bot adds and vanity URL changes have their own limits.",
    command: `${DEFAULT_PREFIX}antinuke config`,
  },
] as const;

/** "More in Discord": the anti-nuke settings that live in commands, each a copyable chip. */
export function DiscordCommands() {
  return (
    <SettingsSection
      icon={Terminal}
      title="More in Discord"
      description={
        <>
          Some anti-nuke settings are managed with commands in Discord. Select one to copy it. They&apos;re shown
          with the default prefix{" "}
          <code className="rounded-xs border border-line bg-inset px-1 type-code text-fg">{DEFAULT_PREFIX}</code> — if
          your server uses another, type that instead.
        </>
      }
    >
      <ul className="divide-y divide-line-subtle">
        {COMMANDS.map((item) => (
          <li
            key={item.command}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-6 md:py-5"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="type-label text-fg">{item.title}</p>
              <p className="max-w-xl type-caption text-fg-tertiary">{item.description}</p>
            </div>
            <CommandChip command={item.command} className="self-start sm:shrink-0 sm:self-center" />
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}
