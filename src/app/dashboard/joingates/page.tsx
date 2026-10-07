import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { JoinGatesEditor } from "@/components/dashboard/joingates/join-gates-editor";
import { JoinGatesSkeleton } from "@/components/dashboard/joingates/join-gates-skeleton";
import { SITE_NAME } from "@/lib/site";

const TITLE = "Join gates";
const DESCRIPTION =
  "Hold new members in a verification channel until they press Verify, screen out brand-new accounts and kick anyone who never verifies.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/dashboard/joingates" },
  // Replaces the root openGraph object, so the shared fields are repeated here.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/dashboard/joingates",
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

/**
 * Settings page (DESIGN.md §3 page contract): the settings measure keeps each
 * control near its label, and the editor's SaveBar is the Container's last child.
 */
export default function JoinGatesPage() {
  return (
    <Container size="settings" className="flex flex-1 flex-col py-page">
      <JoinGatesEditor loading={<JoinGatesSkeleton />} />
    </Container>
  );
}
