import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/shell/dashboard-shell";

/**
 * Defaults for every dashboard route (pages override title/description).
 * The shell is a client island: it checks the NextAuth session (provided for
 * /dashboard only by the root layout's SessionScope) and renders the login
 * gate, the session skeleton or the signed-in frame around the page.
 */
export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Configure Pleed's anti-nuke, join gates, auto-moderation and auto-responders for your Discord server — log in with Discord.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
