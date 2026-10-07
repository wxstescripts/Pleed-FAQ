import type { Metadata } from "next";
import { Ban, Handshake, LifeBuoy, RefreshCw, UserX } from "lucide-react";

import { DISCORD_GUIDELINES_URL, DISCORD_TERMS_URL, SITE_NAME, SUPPORT_URL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";

const TITLE = "Terms of Service";
const DESCRIPTION = "Rules and guidelines for inviting and using Pleed across your Discord servers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/terms",
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

/*
 * Source: legacy_html/terms.html — the same five sections, ported faithfully
 * and reworded for clarity. Owner review: the "Last updated" date is a
 * placeholder; no clauses (governing law, liability caps, age limits…) were
 * added.
 */
const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    content: (
      <>
        <p>
          By inviting, accessing or using Pleed in any Discord server, you agree to be bound by these Terms of Service,
          as well as Discord’s <TextLink href={DISCORD_TERMS_URL}>Terms of Service</TextLink> and{" "}
          <TextLink href={DISCORD_GUIDELINES_URL}>Community Guidelines</TextLink>.
        </p>
        <p>
          How Pleed handles data is explained in the <TextLink href="/privacy">Privacy Policy</TextLink>.
        </p>
      </>
    ),
  },
  {
    id: "usage-rules",
    title: "Usage rules and prohibited conduct",
    content: (
      <>
        <p>When using Pleed, you agree not to:</p>
        <ul>
          <li>Abuse, exploit or flood bot commands, APIs or rate limits.</li>
          <li>
            Use Pleed for harmful, illegal or destructive activities, including malicious anti-nuke triggers or
            spamming.
          </li>
          <li>Attempt to bypass access controls, security measures or blacklists.</li>
          <li>Violate Discord’s Terms of Service or Community Guidelines.</li>
        </ul>
      </>
    ),
  },
  {
    id: "availability",
    title: "Service availability and changes",
    content: (
      <p>
        Pleed is provided on an “as is” and “as available” basis. We reserve the right to modify, pause or discontinue
        any feature, command or service at any time without prior notice.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Termination and access restriction",
    content: (
      <p>
        We reserve the right to restrict, ban or block any user or Discord server from accessing Pleed if these Terms of
        Service are violated.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact and support",
    content: (
      <>
        <p>If you have questions about these terms or need help, join Pleed’s official support community on Discord.</p>
        <div className="not-prose">
          <Button href={SUPPORT_URL} variant="secondary" className="print:hidden">
            <LifeBuoy aria-hidden="true" />
            Join the support server
          </Button>
          <p className="hidden type-body text-fg-secondary print:block">Support server: {SUPPORT_URL}</p>
        </div>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title={TITLE}
      description={DESCRIPTION}
      highlightsNote="A plain-language summary — the full terms follow."
      highlights={[
        {
          icon: Handshake,
          text: (
            <>
              Inviting or using Pleed means you accept these terms <strong>and Discord’s own</strong> Terms of Service
              and Community Guidelines.
            </>
          ),
        },
        {
          icon: Ban,
          text: (
            <>
              <strong>Don’t abuse Pleed</strong>: no flooding, exploiting, bypassing its security or using it to cause
              harm.
            </>
          ),
        },
        {
          icon: RefreshCw,
          text: (
            <>
              Pleed is provided <strong>as is</strong>. Features and commands can change or stop without notice.
            </>
          ),
        },
        {
          icon: UserX,
          text: (
            <>
              Breaking these terms can get a <strong>user or server blocked</strong> from Pleed.
            </>
          ),
        },
      ]}
      sections={SECTIONS}
      related={{
        href: "/privacy",
        title: "Privacy Policy",
        description: "What Pleed collects, why, and how to have it removed.",
      }}
    />
  );
}
