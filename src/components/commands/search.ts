import type { CatalogCommand } from "./types";

/*
 * Client-side search over the compact catalog: names, usage and real
 * descriptions (the generated "Executes the X command." text was removed on
 * the server, so it never matches). Every word must match somewhere; names
 * rank above usage, usage above descriptions.
 */

export type IndexedCommand = {
  command: CatalogCommand;
  /** Position in the catalog (category, then name) — the stable tie-breaker. */
  order: number;
  name: string;
  /** Arguments of every form, lower-cased ("<user> <reason> <channel>"). */
  args: string;
  /** Description and per-form notes, lower-cased. */
  text: string;
};

export function buildIndex(commands: readonly CatalogCommand[]): IndexedCommand[] {
  return commands.map((command, order) => ({
    command,
    order,
    name: command.name.toLowerCase(),
    args: command.forms
      .map((form) => form.usage.split(/\s+/).slice(1).join(" "))
      .join(" ")
      .toLowerCase(),
    text: [command.description, ...command.forms.map((form) => form.note)].filter(Boolean).join(" ").toLowerCase(),
  }));
}

/** Lower-cased words of a query; a leading prefix ("!ban", "/ban") is ignored. */
export function tokenize(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/^[!/,?.]+(?=\w)/, ""))
    .filter(Boolean);
  return Array.from(new Set(words)).slice(0, 8);
}

function scoreToken(entry: IndexedCommand, token: string): number {
  if (entry.name === token) return 120;
  if (entry.name.startsWith(token)) return 80;
  if (entry.name.includes(token)) return 60;
  if (entry.args.includes(token)) return 30;
  if (entry.text.includes(token)) return 20;
  return 0;
}

/** Matching commands, best first. */
export function rank(entries: readonly IndexedCommand[], tokens: readonly string[]): CatalogCommand[] {
  const scored: { entry: IndexedCommand; score: number }[] = [];
  for (const entry of entries) {
    let score = 0;
    for (const token of tokens) {
      const tokenScore = scoreToken(entry, token);
      if (!tokenScore) {
        score = 0;
        break;
      }
      score += tokenScore;
    }
    if (score) scored.push({ entry, score });
  }
  scored.sort(
    (a, b) =>
      b.score - a.score || a.entry.name.length - b.entry.name.length || a.entry.order - b.entry.order,
  );
  return scored.map(({ entry }) => entry.command);
}

/** Case-insensitive matcher for highlighting, longest words first; null when there's nothing to mark. */
export function buildMatcher(tokens: readonly string[]): RegExp | null {
  if (!tokens.length) return null;
  const source = [...tokens]
    .sort((a, b) => b.length - a.length)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return new RegExp(`(${source})`, "gi");
}

function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** "Did you mean…" — command names within one or two typos of the first word. */
export function suggestNames(entries: readonly IndexedCommand[], tokens: readonly string[], limit = 3): string[] {
  const word = tokens[0];
  if (!word || word.length < 3) return [];
  const tolerance = word.length <= 4 ? 1 : 2;
  const best = new Map<string, number>();
  for (const { name } of entries) {
    if (best.has(name)) continue;
    const d = distance(word, name);
    if (d <= tolerance) best.set(name, d);
  }
  return Array.from(best.entries())
    .sort((a, b) => a[1] - b[1] || a[0].length - b[0].length || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}
