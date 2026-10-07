/*
 * Shapes shared by the server catalog (catalog.ts) and the client explorer.
 * This file has no runtime code and never imports commands.json, so client
 * components can import it freely.
 */

/** One way to call a command, exactly as the bot documents it. */
export type CommandForm = {
  /** Usage string straight from the data, e.g. "!ban <user> <reason>". */
  usage: string;
  /** Description of this form, only when the forms of one command differ. */
  note?: string;
};

/** One card: a command name within one category, with every documented form. */
export type CatalogCommand = {
  name: string;
  /** Category slug (see categories.ts). */
  category: string;
  /** Real description shared by every form; absent when the data only has a generic one. */
  description?: string;
  /** Simplest form first. */
  forms: CommandForm[];
};

export type CatalogCategory = {
  slug: string;
  /** Name as it appears in commands.json ("Antinuke"). */
  name: string;
  /** Commands (cards) in this category. */
  count: number;
};

export type CommandCatalog = {
  commands: CatalogCommand[];
  categories: CatalogCategory[];
  /** Unique public command names — the site-wide "N commands" figure. */
  uniqueCommands: number;
};
