import { DEFAULT_PREFIX } from "@/lib/site";
import type { GuildSettings } from "@/lib/api";

/**
 * The dashboard has always limited the prefix to 3 characters (UTF-16 code
 * units, like the old `substring(0, 3)`), and the backend for this route is
 * not in the repo — keep the same limit so nothing the API might reject is sent.
 */
export const PREFIX_MAX_LENGTH = 3;

/** Why a prefix can't be saved, or null when it is fine. */
export function prefixProblem(value: string): string | null {
  if (value.length === 0) return "Enter a prefix.";
  if (/\s/.test(value)) return "Prefixes can't contain spaces.";
  if (value.length > PREFIX_MAX_LENGTH) return `Use ${PREFIX_MAX_LENGTH} characters or fewer.`;
  return null;
}

/** Problems worth showing while the person is still typing (an empty field waits for blur or Save). */
export function isObviousPrefixProblem(value: string): boolean {
  return /\s/.test(value) || value.length > PREFIX_MAX_LENGTH;
}

/**
 * Characters that open one of Discord's autocomplete pickers when a message
 * starts with them, so `<prefix>help` can turn into a suggestion instead of
 * being sent. A valid prefix — just an awkward one.
 */
const PICKERS: Record<string, string> = {
  "/": "command menu",
  ":": "emoji suggestions",
  "@": "member suggestions",
  "#": "channel suggestions",
};

export function prefixPicker(value: string): { char: string; picker: string } | null {
  const char = value.charAt(0);
  const picker = PICKERS[char];
  return picker ? { char, picker } : null;
}

/** The prefix the bot answers to right now (the API's value, or Pleed's default if it sent nothing usable). */
export function activePrefix(settings: GuildSettings): string {
  return typeof settings.prefix === "string" && settings.prefix.length > 0 ? settings.prefix : DEFAULT_PREFIX;
}

/** The welcome channel as the ID field shows it ("" = not set; the API may send null). */
export function channelValue(settings: GuildSettings): string {
  const value: unknown = settings.welcome_channel;
  if (typeof value === "string") return value;
  // Older rows may hold the ID as a JSON number; show it rather than pretend nothing is set.
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

/** Same values for every field this page edits (null and "" both mean "no channel"). */
export function sameSettings(a: GuildSettings, b: GuildSettings): boolean {
  return a.prefix === b.prefix && channelValue(a) === channelValue(b);
}
