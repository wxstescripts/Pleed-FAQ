import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { AutoResponders } from "@/components/dashboard/automations/auto-responders";

const title = "Auto-responders";
const description =
  "Make Pleed reply automatically when a message contains a trigger: create, preview and delete your server's auto-responders.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/dashboard/automations" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${title} · ${SITE_NAME}`,
    description,
    url: "/dashboard/automations",
  },
};

export default function AutomationsPage() {
  return (
    <Container size="wide" className="flex flex-1 flex-col py-page">
      <PageHeader
        title="Auto-responders"
        description="Pleed answers automatically when a message contains one of your triggers. Use them for the questions, rules and links your members keep asking about."
      />
      <AutoResponders />
    </Container>
  );
}
