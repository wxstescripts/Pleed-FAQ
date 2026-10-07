import commands from "@/data/commands.json";
import { isPublicCommand, type CommandEntry } from "@/lib/site";
import { commandWords } from "@/content/docs/content";

/*
 * Links from the docs reference into the command explorer (/commands?q=…).
 * The docs are generated from the bot's cogs and the explorer from
 * src/data/commands.json (read-only, a different export), so not every
 * documented command has an explorer entry. A link is only offered when the
 * explorer's public data really contains the command's top-level name —
 * never a link to an empty result. Server-only (imports the JSON).
 */

const PUBLIC_ROOTS: ReadonlySet<string> = new Set(
  (commands as CommandEntry[]).filter(isPublicCommand).flatMap((command) => {
    const root = command.usage.replace(/^[!/]/, "").split(/\s+/)[0]?.toLowerCase();
    return root ? [root, command.name.toLowerCase()] : [command.name.toLowerCase()];
  }),
);

/** "/commands?q=ban" for "!ban <member> [reason]", or null when the explorer doesn't list it. */
export function explorerHref(usage: string): string | null {
  const root = commandWords(usage)[0]?.toLowerCase();
  if (!root || !PUBLIC_ROOTS.has(root)) return null;
  return `/commands?q=${encodeURIComponent(root)}`;
}
