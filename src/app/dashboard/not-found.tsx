import { Compass } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { MODULE_PAGES } from "@/components/dashboard/shell/nav";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** `notFound()` inside a dashboard page: stays in the shell and points to every real page. */
export default function DashboardNotFound() {
  return (
    <Container size="settings" className="flex flex-1 flex-col py-page">
      <PageHeader title="Page not found" description="This dashboard page doesn't exist or has moved." />
      <EmptyState
        icon={Compass}
        headingAs="h2"
        title="Pick up from one of these"
        description="Every dashboard page is also in the navigation, and Ctrl + K searches them."
        actions={
          <>
            <Button href="/dashboard" variant="secondary">
              Go to overview
            </Button>
            {MODULE_PAGES.map((page) => (
              <Button key={page.href} href={page.href} variant="ghost">
                <page.icon aria-hidden="true" />
                {page.label}
              </Button>
            ))}
          </>
        }
      />
    </Container>
  );
}
