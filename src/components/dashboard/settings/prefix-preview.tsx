import { DiscordMessage, DiscordPreview, PLEED_AUTHOR } from "@/components/ui/discord-message";

/**
 * How a member calls Pleed with `prefix`: a member types `<prefix>help` and
 * Pleed answers with its help menu (`!help` — "Displays the help menu." in
 * the command list). An illustration built from the shared Discord preview
 * kit, not a screenshot; the prefix is highlighted so the change is obvious.
 */
export function PrefixPreview({ prefix }: { prefix: string }) {
  return (
    <DiscordPreview channel="general">
      <DiscordMessage author={{ name: "Nova", accent: "info" }} timestamp="Today at 12:04">
        <p>
          <mark className="rounded-xs bg-brand-subtle px-0.5 font-medium text-brand-fg">{prefix}</mark>help
        </p>
      </DiscordMessage>
      <DiscordMessage
        author={PLEED_AUTHOR}
        timestamp="Today at 12:04"
        embed={{
          accent: "brand",
          title: "Pleed help",
          description: (
            <p>
              Pick a category to browse commands, or send <code>{prefix}help ban</code> to look up a single command.
            </p>
          ),
        }}
      />
    </DiscordPreview>
  );
}
