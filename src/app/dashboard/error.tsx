"use client";

import { LayoutDashboard, LifeBuoy } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState } from "@/components/ui/states";
import { SUPPORT_URL } from "@/lib/site";

/**
 * A dashboard page crashed while rendering. Shown inside the shell, so the
 * sidebar/app bar still work. `retry` re-renders the page segment.
 */
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="settings" className="flex flex-1 flex-col py-page">
      <PageHeader
        title="Something went wrong"
        description="This page hit an error while loading. Your saved settings are not affected."
      />
      <ErrorState
        headingAs="h2"
        title="This page couldn't be displayed"
        description="Try again. If it keeps happening, tell us in the support server and include the reference below."
        detail={error.digest ? `Reference: ${error.digest}` : error.message || undefined}
        onRetry={retry}
        actions={
          <>
            <Button href="/dashboard" variant="ghost">
              <LayoutDashboard aria-hidden="true" />
              Go to overview
            </Button>
            <Button href={SUPPORT_URL} variant="ghost">
              <LifeBuoy aria-hidden="true" />
              Support server
            </Button>
          </>
        }
      />
    </Container>
  );
}
