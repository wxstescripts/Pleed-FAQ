import type { Metadata } from "next";

import { CommandHighlights } from "@/components/landing/command-highlights";
import { DashboardSection } from "@/components/landing/dashboard-section";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProofBand } from "@/components/landing/proof-band";
import { getCommandFacts, SITE_NAME } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const facts = await getCommandFacts();
  const title = `${SITE_NAME} — Discord bot for anti-nuke, join gates and auto-moderation`;
  const description = `Pleed guards Discord servers with anti-nuke and a join gate, keeps chat clean with auto-moderation and auto-responders, and adds ${facts.uniqueCommandsLabel} commands — set up in chat or on the web dashboard.`;
  return {
    // The home page states the full positioning instead of "Home · Pleed".
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    // Setting openGraph/twitter replaces the root objects, so restate what they carry.
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: "/", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Home() {
  const facts = await getCommandFacts();
  return (
    <>
      <Hero facts={facts} />
      <ProofBand facts={facts} />
      <Features categories={facts.categories} />
      <DashboardSection />
      <CommandHighlights facts={facts} />
      <HowItWorks />
      <Faq facts={facts} />
      <FinalCta />
    </>
  );
}
