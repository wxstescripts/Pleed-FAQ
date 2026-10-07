import commandsData from "@/data/commands.json";
import { deriveCommandFacts, isPublicCommand, type CommandEntry } from "@/lib/site";

import { categorySlug } from "./categories";
import type { CatalogCategory, CatalogCommand, CommandCatalog, CommandForm } from "./types";

/*
 * SERVER ONLY — imported by the /commands page (a Server Component), never by
 * a client component, so the 128 KB commands.json stays out of every bundle.
 * The page hands the client explorer the compact catalog built here.
 *
 * Pipeline (commands.json is read-only):
 *  1. isPublicCommand() from @/lib/site hides owner/dev-only Core tooling
 *     (eval, shell, git*, dashboardtoken …) — the same filter behind the
 *     site-wide counts (getCommandFacts).
 *  2. Exact duplicates (same name, description, category and usage) are dropped.
 *  3. Entries with the same name in the same category become one card with
 *     several usage forms ("!ban <user>", "!ban <user> <reason>"). A form whose
 *     only description is the generated "Executes the X command." is dropped
 *     when another form has the same usage and a real description.
 *  4. The generated description is never shown; a few legacy descriptions
 *     still use the old "," prefix and are rewritten to the prefix in usage.
 */

const GENERIC_DESCRIPTION = /^Executes the \S+ command\.?$/i;

function normaliseDescription(raw: string, prefix: string): string | undefined {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text || GENERIC_DESCRIPTION.test(text)) return undefined;
  return (
    text
      // ",jail @user" → "!jail @user" (old prefix, kept in a few docstrings).
      .replace(/(^|[\s"'(`]),(?=[a-z])/g, `$1${prefix}`)
      // Docstrings cut after their first line end in ":" or "," — mark them as truncated.
      .replace(/\s*[,:]$/, "…")
  );
}

function argCount(usage: string): number {
  return usage.trim().split(/\s+/).length - 1;
}

function buildCatalog(data: readonly CommandEntry[]): CommandCatalog {
  const seen = new Set<string>();
  const groups = new Map<string, { name: string; category: string; forms: { usage: string; description?: string }[] }>();

  for (const entry of data) {
    if (!isPublicCommand(entry)) continue;
    const key = [entry.name, entry.description, entry.category, entry.usage].join("\u0000");
    if (seen.has(key)) continue; // exact duplicate
    seen.add(key);

    const usage = entry.usage.trim();
    const prefix = usage.charAt(0) || "!";
    const groupKey = `${entry.category}\u0000${entry.name}`;
    const group = groups.get(groupKey) ?? { name: entry.name, category: entry.category, forms: [] };
    groups.set(groupKey, group);
    const description = normaliseDescription(entry.description, prefix);
    if (!group.forms.some((form) => form.usage === usage && form.description === description)) {
      group.forms.push({ usage, description });
    }
  }

  const commands: CatalogCommand[] = [];
  for (const group of groups.values()) {
    // Same usage, one generic and one real description → keep the real one.
    const forms = group.forms
      .filter((form) => form.description || !group.forms.some((other) => other.usage === form.usage && other.description))
      .map((form, index) => ({ ...form, index }))
      .sort((a, b) => argCount(a.usage) - argCount(b.usage) || a.index - b.index);

    const descriptions = new Set(forms.map((form) => form.description));
    const shared = descriptions.size === 1 ? forms[0]?.description : undefined;
    commands.push({
      name: group.name,
      category: categorySlug(group.category),
      ...(shared ? { description: shared } : {}),
      forms: forms.map(({ usage, description }): CommandForm =>
        descriptions.size > 1 && description ? { usage, note: description } : { usage },
      ),
    });
  }

  commands.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const facts = deriveCommandFacts(data);
  const categories: CatalogCategory[] = facts.categoryNames.map((name) => {
    const slug = categorySlug(name);
    return { slug, name, count: commands.filter((command) => command.category === slug).length };
  });

  return { commands, categories, uniqueCommands: facts.uniqueCommands };
}

let cached: CommandCatalog | undefined;

/** The public command catalog (computed once per server process). */
export function getCommandCatalog(): CommandCatalog {
  cached ??= buildCatalog(commandsData as CommandEntry[]);
  return cached;
}
