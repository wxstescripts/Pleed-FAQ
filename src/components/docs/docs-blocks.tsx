import { LifeBuoy } from "lucide-react";

import { INVITE_URL, SUPPORT_URL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { IconTile } from "@/components/ui/icon-tile";
import { ProseTable } from "@/components/ui/prose";
import { docsHref, getDocsPageMeta } from "@/content/docs/index";
import type { DocsBlock } from "@/content/docs/types";
import { CommandUsage } from "@/components/docs/command-usage";
import { InlineText } from "@/components/docs/inline-text";
import { docsPageIcon } from "@/components/docs/page-icons";

const CALLOUT_TONE = { info: "info", tip: "brand", warning: "warning" } as const;

/** Numbered how-to steps: a numbered rail with the text beside it. */
function Steps({ items }: { items: string[] }) {
  return (
    <ol className="not-prose flex flex-col">
      {items.map((item, index) => (
        <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
          {/* The rail between two numbers. */}
          {index < items.length - 1 ? (
            <span aria-hidden="true" className="absolute top-8 bottom-1 left-3.5 w-px bg-line" />
          ) : null}
          <span
            aria-hidden="true"
            className="relative flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-2 type-micro text-fg-secondary tabular-nums"
          >
            {index + 1}
          </span>
          <p className="min-w-0 flex-1 pt-0.5 type-body text-fg-secondary">
            <span className="sr-only">Step {index + 1}: </span>
            <InlineText text={item} />
          </p>
        </li>
      ))}
    </ol>
  );
}

function PageCards({ slugs }: { slugs: string[] }) {
  return (
    <ul className="not-prose grid grid-cols-1 gap-3 sm:grid-cols-2">
      {slugs.flatMap((slug) => {
        const page = getDocsPageMeta(slug);
        if (!page) return [];
        return [
          <li key={slug} className="flex">
            <Card href={docsHref(slug)} padding="sm" className="w-full flex-row items-start gap-3">
              <IconTile icon={docsPageIcon(slug)} size="sm" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="type-label text-fg">{page.title}</span>
                <span className="type-caption text-fg-tertiary">{page.description}</span>
              </span>
            </Card>
          </li>,
        ];
      })}
    </ul>
  );
}

/** Renders guide blocks inside <Prose> (components carry not-prose themselves). */
export function DocsBlocks({ blocks }: { blocks: DocsBlock[] }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "p":
        return (
          <p key={index}>
            <InlineText text={block.text} />
          </p>
        );
      case "list":
        return (
          <ul key={index}>
            {block.items.map((item, i) => (
              <li key={i}>
                <InlineText text={item} />
              </li>
            ))}
          </ul>
        );
      case "steps":
        return <Steps key={index} items={block.items} />;
      case "callout":
        return (
          <Callout key={index} tone={CALLOUT_TONE[block.tone]} title={block.title}>
            <p>
              <InlineText text={block.text} />
            </p>
          </Callout>
        );
      case "code":
        return <CodeBlock key={index} code={block.code} title={block.title} copyLabel="Copy command" />;
      case "commands":
        return (
          <ProseTable
            key={index}
            label={block.label}
            columns={["Command", "What it does"]}
            rows={block.commands.map((command) => [
              <code key="usage" className="type-code-sm">
                <CommandUsage usage={command.usage} />
              </code>,
              command.description ? <InlineText key="description" text={command.description} /> : "—",
            ])}
          />
        );
      case "table":
        return (
          <ProseTable
            key={index}
            label={block.label}
            columns={block.columns}
            rows={block.rows.map((row) => row.map((cell, i) => <InlineText key={i} text={cell} />))}
          />
        );
      case "invite":
        return (
          <div key={index} className="not-prose flex flex-wrap gap-3">
            <Button variant="discord" href={INVITE_URL}>
              <DiscordIcon aria-hidden="true" className="size-4" />
              Add to Discord
            </Button>
            <Button variant="secondary" href={SUPPORT_URL}>
              <LifeBuoy aria-hidden="true" />
              Support server
            </Button>
          </div>
        );
      case "pages":
        return <PageCards key={index} slugs={block.slugs} />;
      default:
        return null;
    }
  });
}
