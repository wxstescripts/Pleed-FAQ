import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { JoinGatesEditor } from "@/components/dashboard/joingates/join-gates-editor";
import { SITE_NAME } from "@/lib/site";

const TITLE = "Join gates";
const DESCRIPTION =
  "Hold new members in a verification channel until they press Verify, keep brand-new raid accounts out and kick anyone who never verifies.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/dashboard/joingates" },
  // Setting openGraph replaces the root object, so the shared fields are repeated here.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/dashboard/joingates",
  },
};

/**
 * Settings page (DESIGN.md §3 dashboard page contract): the h1 and intro are
 * server-rendered; the editor is the client island that loads, edits and
 * saves the config and owns the SaveBar (the Container's last child).
 */
export default function JoinGatesPage() {
  return (
    <Container size="settings" className="flex flex-1 flex-col py-page">
      <PageHeader
        title={TITLE}
        description="New members wait in a verification channel until they press Verify. Screen out brand-new accounts and kick anyone who never verifies."
      />
      <JoinGatesEditor />
    </Container>
  );
}
