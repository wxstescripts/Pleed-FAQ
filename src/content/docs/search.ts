/**
 * Docs search: the index shape (served as JSON by /docs/search-index.json)
 * and the client-side matcher. Pure functions, no content imports — safe to
 * bundle into the search island.
 */

export type DocsSearchKind = "page" | "section" | "command";

export type DocsSearchEntry = {
  kind: DocsSearchKind;
  /** Page title, heading text, or the command ("!antinuke ban"). */
  title: string;
  href: string;
  /** Page slug ("" = docs home) and title, for grouping. */
  slug: string;
  page: string;
  /** The line shown under the title: a page's description, a command's description (or usage). */
  detail?: string;
  /** Extra words that should match but aren't shown (usage, aliases, section name). */
  keywords?: string;
};

export type DocsSearchIndex = { version: 1; entries: DocsSearchEntry[] };

export type DocsSearchResult = DocsSearchEntry & { score: number };

export type DocsSearchGroup = { slug: string; page: string; results: DocsSearchResult[] };

const KIND_BONUS: Record<DocsSearchKind, number> = { page: 30, section: 20, command: 0 };

/** Lowercase, hyphens dropped ("anti-nuke" finds "!antinuke"), single spaces. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-‐-―]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "!antinuke" and "antinuke" match the same commands. */
function stripPrefix(value: string): string {
  return value.replace(/^[!/]/, "");
}

function scoreEntry(entry: DocsSearchEntry, query: string, terms: string[]): number {
  const title = normalize(entry.title);
  const bare = stripPrefix(title);
  const q = stripPrefix(query);
  // The entry's own words must carry at least one term; the page title only
  // narrows ("security ban"), so "security" alone doesn't list every command on that page.
  const own = `${title} ${normalize(entry.detail ?? "")} ${normalize(entry.keywords ?? "")}`;
  const haystack = `${own} ${normalize(entry.page)}`;
  if (!terms.every((term) => haystack.includes(stripPrefix(term)))) return 0;
  if (!terms.some((term) => own.includes(stripPrefix(term)))) return 0;

  let score = 10;
  if (bare === q) score = 100;
  else if (bare.startsWith(q)) score = 80;
  else if (terms.every((term) => title.includes(stripPrefix(term)))) {
    // Every term in the title; better when one starts a word.
    score = 50 + (terms.some((term) => new RegExp(`(^|[\\s!/(&-])${escapeRegExp(stripPrefix(term))}`).test(title)) ? 10 : 0);
  } else if (terms.some((term) => title.includes(stripPrefix(term)))) score = 30;
  return score + KIND_BONUS[entry.kind];
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Ranks entries for a query (every word must appear in the title, the page
 * or the text) and groups them by page, best page first.
 */
export function searchDocs(entries: readonly DocsSearchEntry[], rawQuery: string, limit = 40): DocsSearchGroup[] {
  const query = normalize(rawQuery);
  if (!query) return [];
  const terms = query.split(" ").filter(Boolean);
  const results: DocsSearchResult[] = [];
  for (const entry of entries) {
    const score = scoreEntry(entry, query, terms);
    if (score > 0) results.push({ ...entry, score });
  }
  results.sort((a, b) => b.score - a.score || a.title.length - b.title.length);

  const groups = new Map<string, DocsSearchGroup>();
  for (const result of results.slice(0, limit)) {
    let group = groups.get(result.slug);
    if (!group) {
      group = { slug: result.slug, page: result.page, results: [] };
      groups.set(result.slug, group);
    }
    group.results.push(result);
  }
  return Array.from(groups.values());
}

/** Splits text into [plain, match, plain, match, …] around the query words (for <mark>). */
export function highlightParts(text: string, rawQuery: string): { text: string; match: boolean }[] {
  const terms = normalize(rawQuery)
    .split(" ")
    .map(stripPrefix)
    .filter((term) => term.length > 0);
  if (terms.length === 0) return [{ text, match: false }];
  const pattern = new RegExp(`(${terms.map(escapeRegExp).sort((a, b) => b.length - a.length).join("|")})`, "gi");
  return text
    .split(pattern)
    .filter((part) => part !== "")
    .map((part) => ({ text: part, match: terms.some((term) => part.toLowerCase() === term) }));
}
