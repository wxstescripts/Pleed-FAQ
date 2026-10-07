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

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/status" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/status",
    title: `${title} · ${SITE_NAME}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${SITE_NAME}`,
    description,
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
