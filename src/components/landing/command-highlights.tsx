import { ArrowRight } from "lucide-react";

import { Stagger } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommandChip } from "@/components/ui/code-block";
import { Section } from "@/components/ui/section";
import { isPublicCommand, type CommandEntry, type CommandFacts } from "@/lib/site";

/*
 * A hand-picked set of real public commands. Names, categories and usage
 * strings are read from src/data/commands.json at render time (server only —
 * the JSON never reaches the client); only the one-line summaries are
 * written here, from the docs, because most descriptions in the file are the
 * placeholder "Executes the X command." A pick that disappears from the file
 * simply drops out instead of showing a stale usage.
 */
const PICKS: { name: string; category: string; title: string; summary: string }[] = [
  { name: "setup", category: "Server", title: "Setup center", summary: "Opens one panel that links to every setup flow." },
  {
    name: "lockdown",
    category: "Moderation",
    title: "Server lockdown",
    summary: "Locks every channel for @everyone in one go when a raid hits.",
  },
  {
    name: "jail",
    category: "Moderation",
    title: "Jail",
    summary: "Swaps a member's roles for a jailed role — optionally for a set time.",
  },
  { name: "purge", category: "Moderation", title: "Purge", summary: "Bulk-deletes messages in the current channel." },
  { name: "snipe", category: "Snipe", title: "Snipe", summary: "Shows the last deleted message here — or one further back." },
  {
    name: "setupticket",
    category: "Moderation",
    title: "Ticket setup",
    summary: "A wizard that posts a ticket panel members click to open a ticket.",
  },
  {
    name: "setupvc",
    category: "Voice",
    title: "VoiceMaster setup",
    summary: "Creates the channel members join to get their own temp voice channel.",
  },
  {
    name: "automationsetup",
    category: "Automation",
    title: "Automation panel",
    summary: "Opens the automation settings panel with toggle buttons.",
  },
  { name: "ai", category: "Core", title: "AI assistant", summary: "Ask Pleed's built-in AI assistant a question." },
];

type Highlight = { key: string; title: string; summary: string; category: string; usage: string };

async function getHighlights(): Promise<Highlight[]> {
  const data = (await import("@/data/commands.json")).default as CommandEntry[];
  return PICKS.flatMap((pick) => {
    // Same name + category can appear more than once (different argument lists): show the fullest usage.
    const entry = data
      .filter((c) => c.name === pick.name && c.category === pick.category && isPublicCommand(c))
      .sort((a, b) => b.usage.length - a.usage.length)[0];
    if (!entry) return [];
    return [{ key: `${entry.category}-${entry.name}`, title: pick.title, summary: pick.summary, category: entry.category, usage: entry.usage }];
  });
}

export async function CommandHighlights({ facts }: { facts: CommandFacts }) {
  const highlights = await getHighlights();
  return (
    <Section
      id="commands"
      eyebrow="Commands"
      title="Prefer typing? Run it from chat."
      description={
        <>
          {facts.uniqueCommands} public commands across {facts.categories} modules. Prefix commands start with{" "}
          <code className="rounded-sm bg-surface-3 px-1 type-code text-fg">!</code> — change it any time — and slash
          commands work alongside them.
        </>
      }
      actions={
        <Button href="/commands" variant="secondary" className="group/more">
          Browse all commands
          <ArrowRight
            aria-hidden="true"
            className="transition-transform duration-200 ease-standard group-hover/more:translate-x-0.5"
          />
        </Button>
      }
    >
      <Stagger as="ul" role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        {highlights.map((command, index) => (
          <li
            key={command.key}
            className={
              // 9 cards: the last one spans both columns of the 2-column (md–lg) grid so no row is half empty.
              index === highlights.length - 1 && highlights.length % 2 === 1 ? "flex md:col-span-2 xl:col-span-1" : "flex"
            }
          >
            <Card className="w-full gap-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="type-h4 text-fg">{command.title}</h3>
                <Badge size="sm" tone="outline">
                  {command.category}
                </Badge>
              </div>
              <p className="type-small text-fg-secondary">{command.summary}</p>
              <CommandChip command={command.usage} className="mt-auto self-start" />
            </Card>
          </li>
        ))}
      </Stagger>
    </Section>
  );
}
