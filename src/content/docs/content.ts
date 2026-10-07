import { DOCS_HOME, docsHref, docsPages, getDocsPageMeta } from "./index";
import type { DocsSearchEntry, DocsSearchIndex } from "./search";
import type { DocsCommand, DocsHeading, DocsPage, DocsPageContent } from "./types";
import { automation } from "./pages/automation";
import { economy } from "./pages/economy";
import { fun } from "./pages/fun";
import { gettingStarted } from "./pages/getting-started";
import { moderation } from "./pages/moderation";
import { security } from "./pages/security";
import { serverSetup } from "./pages/server-setup";
import { tickets } from "./pages/tickets";
import { utility } from "./pages/utility";
import { voice } from "./pages/voice";

/**
 * Full docs content (server only — the bodies never ship to the client).
 * Page order, titles and sections come from ./index (docsPages).
 */
const CONTENT: Record<string, DocsPageContent> = Object.fromEntries(
  [gettingStarted, serverSetup, security, moderation, automation, tickets, voice, economy, utility, fun].map((page) => [
    page.slug,
    page,
  ]),
);

export const COMMAND_REFERENCE_ID = "command-reference";

export function getDocsPage(slug: string): DocsPage | undefined {
  const meta = getDocsPageMeta(slug);
  const content = CONTENT[slug];
  return meta && content ? { ...meta, ...content } : undefined;
}

export function getAllDocsPages(): DocsPage[] {
  return docsPages.map((meta) => ({ ...meta, ...CONTENT[meta.slug] }));
}

/** "On this page": every h2 and h3, in document order. */
export function getDocsHeadings(page: DocsPageContent): DocsHeading[] {
  const headings: DocsHeading[] = [];
  for (const section of page.sections) {
    headings.push({ id: section.id, title: section.title, level: 2 });
    for (const sub of section.subsections ?? []) headings.push({ id: sub.id, title: sub.title, level: 3 });
  }
  if (page.reference) {
    headings.push({ id: COMMAND_REFERENCE_ID, title: "Command reference", level: 2 });
    for (const group of page.reference.groups) headings.push({ id: group.id, title: group.title, level: 3 });
  }
  return headings;
}

/** Number of distinct commands documented in a page's reference (derived, never typed by hand). */
export function countReferenceCommands(page: DocsPageContent): number {
  return new Set((page.reference?.groups ?? []).flatMap((group) => group.commands.map((command) => command.usage))).size;
}

/** The command words of a usage line: "!antinuke ban [status] <args>" → ["antinuke", "ban"]. */
export function commandWords(usage: string): string[] {
  const words: string[] = [];
  for (const token of usage.replace(/^[!/]/, "").split(/\s+/)) {
    if (!token || /^[<[]/.test(token)) break;
    words.push(token);
  }
  return words;
}

/** Stable anchor for a reference entry: "!antinuke ban [status] <args>" → "cmd-antinuke-ban". */
export function commandAnchor(command: DocsCommand): string {
  const words = commandWords(command.usage).join("-").toLowerCase();
  return `cmd-${words.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "command"}`;
}

/** The command as typed, without arguments: "!antinuke ban [status] <args>" → "!antinuke ban". */
export function commandName(usage: string): string {
  const prefix = usage.startsWith("/") ? "/" : usage.startsWith("!") ? "!" : "";
  return `${prefix}${commandWords(usage).join(" ")}`;
}

/**
 * Anchors for one page's reference entries, unique within the page (the same
 * command can appear in two groups): Map<command, anchor>.
 */
export function referenceAnchors(page: DocsPageContent): Map<DocsCommand, string> {
  const anchors = new Map<DocsCommand, string>();
  const used = new Set<string>();
  for (const group of page.reference?.groups ?? []) {
    for (const command of group.commands) {
      const base = commandAnchor(command);
      let anchor = base;
      for (let n = 2; used.has(anchor); n++) anchor = `${base}-${n}`;
      used.add(anchor);
      anchors.set(command, anchor);
    }
  }
  return anchors;
}

/** Strips the inline markup (`code`, **bold**, _em_, [label](href)) for search and metadata. */
function plain(text: string): string {
  return text.replace(/`([^`]+)`|\*\*(.+?)\*\*|(?<![\w])_([^_]+?)_(?![\w])|\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, b, c, d) => a ?? b ?? c ?? d ?? "");
}

/** Everything the docs search looks through: pages, headings and every reference command. */
export function buildDocsSearchIndex(): DocsSearchIndex {
  const entries: DocsSearchEntry[] = [
    { kind: "page", title: DOCS_HOME.title, href: DOCS_HOME.href, slug: "", page: DOCS_HOME.title, detail: DOCS_HOME.description },
  ];
  for (const page of getAllDocsPages()) {
    const href = docsHref(page.slug);
    entries.push({ kind: "page", title: page.title, href, slug: page.slug, page: page.title, detail: page.description, keywords: page.section });
    for (const heading of getDocsHeadings(page)) {
      entries.push({ kind: "section", title: heading.title, href: `${href}#${heading.id}`, slug: page.slug, page: page.title });
    }
    const anchors = referenceAnchors(page);
    for (const group of page.reference?.groups ?? []) {
      for (const command of group.commands) {
        entries.push({
          kind: "command",
          title: commandName(command.usage),
          href: `${href}#${anchors.get(command)}`,
          slug: page.slug,
          page: page.title,
          detail: command.description ? plain(command.description) : command.usage,
          keywords: [command.usage, ...(command.aliases ?? [])].join(" "),
        });
      }
    }
  }
  return { version: 1, entries };
}
