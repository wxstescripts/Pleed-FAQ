import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { SITE_NAME } from "@/lib/site";
import { AutomodCommands } from "@/components/dashboard/automod/automod-commands";
import { AutomodProvider } from "@/components/dashboard/automod/automod-context";
import { AutomodEditor } from "@/components/dashboard/automod/automod-editor";
import { AutomodStatusBadge } from "@/components/dashboard/automod/automod-status-badge";

const TITLE = "Auto-moderation";
const DESCRIPTION =
  "Choose what Pleed filters from your Discord server's chat — spam, links, server invites, mass mentions, all caps and blocked words — and what happens to the sender.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/dashboard/automod" },
  // Replaces the root openGraph object, so repeat what it needs.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/dashboard/automod",
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

/**
 * Server Component: the page header and the "More in Discord" commands are
 * static HTML; the provider, status badge and editor are the client islands.
 */
export default function AutomodPage() {
  return (
    <Container size="settings" className="flex flex-1 flex-col py-page">
      <AutomodProvider>
        <PageHeader
          title={TITLE}
          description="Pleed checks new messages against the filters you turn on and acts on anything they catch."
          meta={<AutomodStatusBadge />}
        />
        <AutomodEditor commands={<AutomodCommands />} />
      </AutomodProvider>
    </Container>
  );
}
