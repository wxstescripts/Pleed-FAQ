import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { GeneralSettingsEditor } from "@/components/dashboard/settings/general-settings-editor";

const title = "General settings";
const description =
  "Set Pleed's command prefix and the channel where it welcomes new members, from the Pleed dashboard.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/dashboard/settings" },
  // Setting openGraph replaces the root layout's object, so the shared fields are repeated here.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${title} · ${SITE_NAME}`,
    description,
    url: "/dashboard/settings",
  },
};

/**
 * General settings (dashboard page contract, DESIGN.md §3): a Server
 * Component for the header; the settings form is one client island that
 * loads, edits and saves through the typed API client.
 */
export default function GeneralSettingsPage() {
  return (
    <Container size="settings" className="flex flex-1 flex-col py-page">
      <PageHeader
        title="General settings"
        description="The prefix members type to call Pleed, and the channel where Pleed greets people who join."
      />
      <GeneralSettingsEditor />
    </Container>
  );
}
