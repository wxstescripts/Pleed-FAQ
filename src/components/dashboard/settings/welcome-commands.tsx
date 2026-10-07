import { MessageSquareText } from "lucide-react";

import { CommandChip } from "@/components/ui/code-block";
import { SettingsSection } from "@/components/ui/settings-section";

import { InlineCode } from "./inline-code";

/*
 * The welcome message has no API field: it is written, switched and tested
 * with the Welcome & goodbye commands (docs/server-setup.html — usages and
 * descriptions from there). Same row pattern as the other dashboard pages'
 * "in Discord" lists: what it does on the left, a copyable command on the right.
 */
const COMMANDS = [
  { title: "Message text", description: "Set the welcome message text.", usage: "messages welcomemessage <text>" },
  { title: "On or off", description: "Turn welcome messages on or off.", usage: "messages welcometoggle <state>" },
  { title: "Test it", description: "Preview the welcome message.", usage: "messages testwelcome" },
] as const;

/** "Welcome message": the commands for it, shown with the prefix the server uses now. */
export function WelcomeCommands({ prefix }: { prefix: string }) {
  return (
    <SettingsSection
      icon={MessageSquareText}
      title="Welcome message"
      description={
        <>
          Written and tested in Discord — select a command to copy it. Shown with your current prefix,&nbsp;
          <InlineCode>{prefix}</InlineCode>.
        </>
      }
    >
      <ul className="divide-y divide-line-subtle">
        {COMMANDS.map((item) => (
          <li
            key={item.usage}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-6 md:py-5"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="type-label text-fg">{item.title}</p>
              <p className="max-w-xl type-caption text-fg-tertiary">{item.description}</p>
            </div>
            <CommandChip command={`${prefix}${item.usage}`} className="self-start sm:shrink-0 sm:self-center" />
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}
