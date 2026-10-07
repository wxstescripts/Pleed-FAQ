import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { GeneralSettingsEditor } from "@/components/dashboard/settings/general-settings-editor";

const title = "General settings";
const description =
  "Set Pleed's command prefix and the channel where it welcomes new members, from the Pleed dashboard.";

// Setting openGraph/twitter replaces the root objects — including the share card
// from src/app/opengraph-image.png / twitter-image.png — so the card is restated
// (same files, same alt text as src/app/opengraph-image.alt.txt).
const shareCard = {
  width: 1200,
  height: 630,
  alt: "Pleed logo beside the tagline “Security, moderation and automation for Discord servers”, with the features anti-nuke, join gates, auto-mod and automations",
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/dashboard/settings" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/dashboard/settings",
    title: `${title} · ${SITE_NAME}`,
    description,
    images: [{ url: "/opengraph-image.png", type: "image/png", ...shareCard }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${SITE_NAME}`,
    description,
    images: [{ url: "/twitter-image.png", ...shareCard }],
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
