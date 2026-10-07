import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { SecurityEditor } from "@/components/dashboard/security/security-editor";
import { SITE_NAME } from "@/lib/site";

const TITLE = "Security & Anti-Nuke";
const DESCRIPTION =
  "Turn on Pleed's anti-nuke, set how many bans, kicks and channel or role deletions one account may make per minute, and choose what happens to whoever crosses a limit.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/dashboard/security" },
  // Setting openGraph replaces the root object, so the shared fields are repeated here.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/dashboard/security",
  },
};

/**
 * Settings page (DESIGN.md §3 dashboard page contract): the h1 and intro are
 * server-rendered; the editor below is the client island that loads, edits
 * and saves the config and owns the SaveBar (the Container's last child).
 */
export default function SecurityPage() {
  return (
    <Container size="settings" className="flex flex-1 flex-col py-page">
      <PageHeader
        title={TITLE}
        description="Stop a compromised staff account or a rogue bot before it wipes your server. Pleed watches the audit log and steps in the moment someone crosses your limits."
      />
      <SecurityEditor />
    </Container>
  );
}
