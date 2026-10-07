import type { Metadata } from "next";
import { Fingerprint, LifeBuoy, LogIn, ShieldCheck, Trash2 } from "lucide-react";

import { SITE_NAME, SUPPORT_URL } from "@/lib/site";
import { PlaceholderBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { ProseTable } from "@/components/ui/prose";
import { TextLink } from "@/components/ui/text-link";
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "What Pleed collects to run in your Discord server and on its dashboard, how that data is used and protected, and how to have it removed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/privacy",
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
 * Source: legacy_html/privacy.html (ported faithfully, reworded for clarity),
 * plus the dashboard's Discord sign-in, which the legacy page predates
 * (src/app/api/auth/[...nextauth]/route.ts: scopes `identify guilds`, a
 * NextAuth JWT session cookie, no database adapter).
 * Owner review: the "Last updated" date and the contact e-mail are
 * placeholders; nothing here adds obligations the legacy policy didn't have.
 */
const SECTIONS: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    subsections: [{ id: "dashboard-sign-in", title: "Signing in to the dashboard" }],
    content: (
      <>
        <p>Pleed collects only the data it needs to work across Discord servers:</p>
        <ProseTable
          label="Data Pleed collects"
          columns={["Data", "Why Pleed uses it"]}
          rows={[
            ["User IDs", "To manage user settings, permissions, economy balances and ticket systems."],
            ["Server (guild) IDs", "To save server configurations, anti-nuke rules and custom prefixes."],
            ["Command input", "Processed in real time to run the commands you use."],
          ]}
        />
        <h3 id="dashboard-sign-in">Signing in to the dashboard</h3>
        <p>
          The web dashboard uses Discord’s OAuth2 sign-in. You log in on Discord’s own page, so Pleed never sees your
          Discord password. Discord then shares only what these two scopes allow:
        </p>
        <ProseTable
          label="Discord sign-in scopes"
          columns={["Scope", "What Discord shares", "Why it’s requested"]}
          rows={[
            [<code key="scope">identify</code>, "Your Discord user ID, username and avatar.", "To show who is signed in."],
            [
              <code key="scope">guilds</code>,
              "The servers you’re a member of: their names, icons and your permissions in each.",
              "To let the dashboard see which servers you can manage.",
            ],
          ]}
        />
        <p>
          Neither scope lets Pleed read your messages or act on your behalf. Signing in sets a session cookie on this
          website, which keeps you signed in and holds the access token Discord issues for these scopes. Signing out
          deletes it.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-data",
    title: "How we use and protect data",
    content: (
      <ul>
        <li>Data is used strictly to deliver Pleed’s core features and your server’s configuration.</li>
        <li>All data is stored securely on private server infrastructure.</li>
        <li>
          We <strong>do not sell, trade or share</strong> user data with any third parties.
        </li>
      </ul>
    ),
  },
  {
    id: "data-removal",
    title: "Data removal and your rights",
    content: (
      <>
        <p>Server owners can clear their server’s data by removing Pleed from the server.</p>
        <p>
          To request complete deletion of your user data, contact us directly in the{" "}
          <TextLink href={SUPPORT_URL}>Pleed support server</TextLink>.
        </p>
        <Callout tone="neutral" title="Revoking dashboard access">
          After you sign in to the dashboard, Discord lists Pleed under <strong>User Settings → Authorized Apps</strong>
          . Choose <strong>Deauthorize</strong> there to revoke its access at any time.
        </Callout>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact and support",
    content: (
      <>
        <p>
          Questions about this policy, or a request to delete your data? Ask in Pleed’s official support server on
          Discord.
        </p>
        <div className="not-prose flex flex-col items-start gap-4">
          <Button href={SUPPORT_URL} variant="secondary" className="print:hidden">
            <LifeBuoy aria-hidden="true" />
            Join the support server
          </Button>
          <p className="hidden type-body text-fg-secondary print:block">Support server: {SUPPORT_URL}</p>
          <p className="flex flex-wrap items-center gap-2 type-small text-fg-tertiary">
            Email
            {/* PLACEHOLDER: owner to add a contact e-mail address for privacy requests (or remove this line). */}
            <PlaceholderBadge title="Placeholder — the owner adds a contact e-mail before launch" />
          </p>
        </div>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title={TITLE}
      description={DESCRIPTION}
      highlightsNote="A plain-language summary — the full policy follows."
      highlights={[
        {
          icon: Fingerprint,
          text: (
            <>
              Pleed stores <strong>user and server IDs</strong> and the settings tied to them — only what it needs to
              work.
            </>
          ),
        },
        {
          icon: ShieldCheck,
          text: (
            <>
              Your data is <strong>never sold, traded or shared</strong> with third parties.
            </>
          ),
        },
        {
          icon: LogIn,
          text: (
            <>
              Dashboard sign-in uses <strong>Discord OAuth</strong> — Pleed never sees your Discord password.
            </>
          ),
        },
        {
          icon: Trash2,
          text: (
            <>
              <strong>Remove Pleed</strong> to clear your server’s data, or ask in the support server to delete
              yours.
            </>
          ),
        },
      ]}
      sections={SECTIONS}
      related={{
        href: "/terms",
        title: "Terms of Service",
        description: "The rules for inviting and using Pleed in your Discord servers.",
      }}
    />
  );
}
