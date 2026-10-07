import { TextSearch } from "lucide-react";
import { Fragment } from "react";

import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/code-block";
import { commandName, COMMAND_REFERENCE_ID, countReferenceCommands, referenceAnchors } from "@/content/docs/content";
import type { DocsCommand, DocsPageContent } from "@/content/docs/types";
import { explorerHref } from "@/components/docs/command-explorer";
import { CommandUsage } from "@/components/docs/command-usage";
import { DocsHeading } from "@/components/docs/docs-heading";
import { InlineText } from "@/components/docs/inline-text";

const aliasClass = "rounded-xs border border-line bg-inset px-1.5 py-px type-code-xs text-fg-secondary";

function CommandRow({ command, anchor }: { command: DocsCommand; anchor: string }) {
  const name = commandName(command.usage);
  const slash = command.usage.startsWith("/");
  const explorer = slash ? null : explorerHref(command.usage);
  return (
    <li
      id={anchor}
      className="px-4 py-3.5 transition-colors duration-300 first:rounded-t-xl last:rounded-b-xl target:bg-brand-subtle sm:px-5"
    >
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 pt-1 type-code-sm wrap-break-word text-fg pointer-coarse:pt-2.5">
          <CommandUsage usage={command.usage} />
        </p>
        <div className="-mr-2 flex shrink-0 items-center gap-0.5">
          {slash ? (
            <Badge size="sm" tone="info" className="mr-1.5">
              Slash
            </Badge>
          ) : null}
          <CopyButton value={name} label={`Copy ${name}`} />
          {explorer ? (
            <IconButton
              size="icon-sm"
              href={explorer}
              label={`Look up ${name} in the command explorer`}
              title="Open in the command explorer"
              className="text-fg-tertiary"
            >
              <TextSearch />
            </IconButton>
          ) : null}
        </div>
      </div>
      {command.description ? (
        <p className="mt-1 type-small text-fg-secondary">
          <InlineText text={command.description} />
        </p>
      ) : (
        <p className="mt-1 type-small text-fg-tertiary">No description available.</p>
      )}
      {command.aliases?.length ? (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 type-caption text-fg-tertiary">
          <span>{command.aliases.length === 1 ? "Alias" : "Aliases"}</span>
          {command.aliases.map((alias) => (
            <code key={alias} className={aliasClass}>
              {alias}
            </code>
          ))}
        </p>
      ) : null}
    </li>
  );
}

/**
 * The page's full command reference, grouped by subsystem: an h2, a jump
 * list, then each group as an h3 over a list of commands (usage, copy,
 * explorer link where the explorer lists it, description, aliases). Each row
 * is an anchor target (#cmd-…) the docs search links to. Rendered inside
 * <Prose>, so the headings share the article's heading styles.
 */
export function CommandReference({ page }: { page: DocsPageContent }) {
  const reference = page.reference;
  if (!reference) return null;
  const anchors = referenceAnchors(page);
  const total = countReferenceCommands(page);
  const groupCount = reference.groups.length;
  return (
    <>
      <DocsHeading as="h2" id={COMMAND_REFERENCE_ID} title="Command reference" />
      <p>
        {total} {total === 1 ? "command" : "commands"}
        {groupCount > 1 ? ` in ${groupCount} groups` : ""}, generated from the bot&apos;s source.{" "}
        <span className="type-code text-brand-fg">&lt;angle brackets&gt;</span> mark required arguments and{" "}
        <span className="type-code text-fg-tertiary">[square brackets]</span> optional ones; an alias replaces the last word
        of the command.
      </p>
      {reference.intro ? (
        <p>
          <InlineText text={reference.intro} />
        </p>
      ) : null}
      {groupCount > 1 ? (
        <nav aria-label="Command groups" className="not-prose">
          <ul className="flex flex-wrap gap-2">
            {reference.groups.map((group) => (
              <li key={group.id}>
                <a
                  href={`#${group.id}`}
                  className="inline-flex h-8 items-center gap-2 rounded-full border border-line-strong px-3 type-label text-fg-secondary transition-colors duration-150 hover:border-line-hover hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring pointer-coarse:h-11 pointer-coarse:px-4"
                >
                  {group.title}
                  <span className="type-micro text-fg-tertiary tabular-nums">{group.commands.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {reference.groups.map((group) => (
        <Fragment key={group.id}>
          <DocsHeading as="h3" id={group.id} title={group.title}>
            {group.title}
            <span className="ml-2 align-middle type-caption font-normal text-fg-tertiary tabular-nums">
              {group.commands.length}
              <span className="sr-only"> commands</span>
            </span>
          </DocsHeading>
          {group.description ? (
            <p>
              <InlineText text={group.description} />
            </p>
          ) : null}
          <ul
            aria-label={`${group.title} commands`}
            className="not-prose mt-3! divide-y divide-line-subtle rounded-xl border border-line bg-surface-1"
          >
            {group.commands.map((command) => (
              <CommandRow key={anchors.get(command)} command={command} anchor={anchors.get(command) ?? ""} />
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}
