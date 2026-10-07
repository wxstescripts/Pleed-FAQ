import type { Metadata } from "next";

import { Overview } from "@/components/dashboard/overview/overview";
import { SITE_NAME } from "@/lib/site";

const description =
  "Configure Pleed's anti-nuke, join gates, auto-moderation and auto-responders for your Discord server, and see live stats — log in with Discord.";

export const metadata: Metadata = {
  title: "Dashboard",
  description,
  alternates: { canonical: "/dashboard" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `Dashboard · ${SITE_NAME}`,
    description,
    url: "/dashboard",
  },
};

/** /dashboard — the overview. The shell (layout) handles the session; this renders only when signed in. */
export default function DashboardPage() {
  return <Overview />;
}
