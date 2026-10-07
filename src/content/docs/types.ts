import type { DocsPageMeta } from "./index";

/**
 * Inline text uses a tiny markup, rendered by <InlineText> (src/components/docs/inline-text.tsx):
 *   `code`  **strong**  _emphasis_  [label](href)
 * href: /docs/<slug>#anchor, /commands?q=…, #anchor (same page) or an https URL.
 * Nothing else is interpreted — no HTML.
 */
export type Inline = string;

/** One command as documented by the bot's cogs (usage keeps the full parent path). */
export type DocsCommand = {
  /** "!antinuke ban [status] <args>" or "/send <channel>" — `<required>`, `[optional]`. */
  usage: string;
  /** Omitted when the source has no help text ("No description available."). */
  description?: Inline;
  /** Alternative names for the last word of the usage ("aka …"). */
  aliases?: string[];
};

export type DocsBlock =
  | { type: "p"; text: Inline }
  | { type: "list"; items: Inline[] }
  /** Numbered how-to steps. */
  | { type: "steps"; items: Inline[] }
  | { type: "callout"; tone: "info" | "tip" | "warning"; title?: string; text: Inline }
  | { type: "code"; title?: string; code: string }
  /** A short "command — what it does" table inside a guide (ProseTable). */
  | { type: "commands"; label: string; commands: DocsCommand[] }
  /** A generic table (ProseTable): first cell titles the row on phones. */
  | { type: "table"; label: string; columns: string[]; rows: Inline[][] }
  /** "Add to Discord" + support server buttons. */
  | { type: "invite" }
  /** Cards linking to other docs pages, by slug. */
  | { type: "pages"; slugs: string[] };

export type DocsSubsection = { id: string; title: string; blocks: DocsBlock[] };

export type DocsGuideSection = {
  id: string;
  title: string;
  blocks: DocsBlock[];
  subsections?: DocsSubsection[];
};

export type DocsCommandGroup = {
  /** Anchor id (unique within the page). */
  id: string;
  title: string;
  description?: Inline;
  commands: DocsCommand[];
};

export type DocsPageContent = {
  slug: DocsPageMeta["slug"];
  /** Intro paragraph under the h1. */
  lead: Inline;
  sections: DocsGuideSection[];
  /** The full command reference for this module, grouped by subsystem. */
  reference?: { intro?: Inline; groups: DocsCommandGroup[] };
};

export type DocsPage = DocsPageMeta & DocsPageContent;

/** One "On this page" entry. */
export type DocsHeading = { id: string; title: string; level: 2 | 3 };
