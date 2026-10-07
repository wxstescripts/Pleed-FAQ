import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Section } from "@/components/ui/section";
import { getCommandCatalog } from "@/components/commands/catalog";
import { CommandExplorer } from "@/components/commands/command-explorer";
import { DEFAULT_PREFIX, getCommandFacts, INVITE_URL, SITE_NAME } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const facts = await getCommandFacts();
  const title = "Commands";
  const description = `Search all ${facts.uniqueCommands} ${SITE_NAME} commands across ${facts.categories} modules — anti-nuke, moderation, automation, economy and more — and copy the exact syntax.`;
  return {
    title,
    description,
    alternates: { canonical: "/commands" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: "/commands",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

/**
 * /commands — the public command library. A Server Component: the catalog
 * (owner-only commands hidden, duplicates merged) is built here and only that
 * compact list reaches the client explorer, which server-renders with the
 * URL's ?q= and ?category= and hydrates for live filtering.
 *
 * Reading searchParams renders the page per request, so a shared link like
 * /commands?q=ban arrives already filtered (no flash, no layout shift).
 */
export default async function CommandsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams;
  const facts = await getCommandFacts();
  const catalog = getCommandCatalog();

  return (
    <Section
      titleAs="h1"
      eyebrow="Command library"
      title="Every command, ready to copy"
      description={
        <>
          Search all {facts.uniqueCommands} commands across {facts.categories} modules and copy the exact syntax.
          Pleed listens for the <code className="type-code text-fg">{DEFAULT_PREFIX}</code> prefix by default — change it
          any time with <code className="type-code text-fg">{DEFAULT_PREFIX}prefix</code>.
        </>
      }
      actions={
        <>
          <Button variant="discord" href={INVITE_URL}>
            <DiscordIcon className="size-4" />
            Add to Discord
          </Button>
          <Button variant="secondary" href="/docs/getting-started">
            Getting started
          </Button>
        </>
      }
      spacing="compact"
      headerClassName="mb-8 md:mb-10"
    >
      <CommandExplorer catalog={catalog} />
    </Section>
  );
}
