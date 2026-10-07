import { Terminal } from "lucide-react";

import { CommandChip } from "@/components/ui/code-block";
import { SettingsSection } from "@/components/ui/settings-section";
import { DEFAULT_PREFIX } from "@/lib/site";

import { PANEL_COMMAND } from "./join-gates-notes";

/*
 * Join gate actions that only exist as commands (the API this page saves
 * through has no endpoint for them) — from the Join Gate / Anti-Alt list in
 * docs/security.html.
 */
const COMMANDS = [
  {
    title: "Post the Verify button",
    description: "Sends or refreshes the verification panel in your verification channel.",
    command: PANEL_COMMAND,
  },
  {
    title: "Check permissions",
    description: "Checks that Pleed has what it needs in the verification channel.",
    command: `${DEFAULT_PREFIX}joingate permissions`,
  },
  {
    title: "Re-verify a member",
    description: "Sends someone through the join gate again.",
    command: `${DEFAULT_PREFIX}joingate reverify @member`,
  },
  {
    title: "Whitelist a member",
    description: "Adds someone to the join gate whitelist. The blacklist works the same way.",
    command: `${DEFAULT_PREFIX}whitelist add @member`,
  },
] as const;

/** "More in Discord": the join gate tools that live in commands, each a copyable chip. */
export function JoinGatesCommands() {
  return (
    <SettingsSection
      icon={Terminal}
      title="More in Discord"
      description={
        <>
          The verification panel, whitelists and re-checks are run as commands in Discord. Select one to copy it.
          They use the default prefix,{" "}
          <code className="rounded-xs border border-line bg-inset px-1 type-code text-fg">{DEFAULT_PREFIX}</code>;
          type yours instead if your server changed it.
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
