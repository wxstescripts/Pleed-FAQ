import type { Metadata } from "next";
import { Suspense } from "react";

import { Section } from "@/components/ui/section";
import { HistoryPlaceholder } from "@/components/status/history-placeholder";
import { StatusBoard, StatusBoardSkeleton } from "@/components/status/status-board";
import { StatusProvider } from "@/components/status/status-provider";
import { Troubleshooting } from "@/components/status/troubleshooting";
import { SITE_NAME } from "@/lib/site";

const title = "Status";
const description =
  "Live status of Pleed’s website and dashboard API, plus Discord’s own platform status — so you can tell whether a problem is on Pleed’s side or Discord’s.";

// Setting openGraph/twitter here REPLACES the root objects — including the
// share card from src/app/opengraph-image.png / twitter-image.png — so the
// card is restated explicitly (same files, same alt text).
const shareCard = {
  width: 1200,
  height: 630,
  alt: "Pleed logo beside the tagline “Security, moderation and automation for Discord servers”, with the features anti-nuke, join gates, auto-mod and automations",
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/status" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/status",
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

/*
 * Static shell + ISR: Discord's status is fetched on the server with a 60 s
 * revalidate (see components/status/discord.ts), so this page regenerates at
 * most once a minute. The dashboard API is checked from the visitor's browser
 * (StatusProvider), and the website row is true by construction.
 */
export default function StatusPage() {
  return (
    <StatusProvider>
      <Section
        titleAs="h1"
        eyebrow="Status"
        title="Pleed status"
        description="Live checks of the website, the dashboard API and Discord itself, so you can tell at a glance whether a problem is on Pleed’s side or Discord’s."
      >
        <Suspense fallback={<StatusBoardSkeleton />}>
          <StatusBoard />
        </Suspense>
      </Section>
      <Troubleshooting />
      <HistoryPlaceholder />
    </StatusProvider>
  );
}
