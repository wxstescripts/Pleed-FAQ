"use client";

import { useEffect, useRef, useState } from "react";

import { getAutomations } from "@/lib/api";
import { usePleedQuery } from "@/lib/api/hooks";
import { SUPPORT_URL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

import { AutoRespondersSkeleton } from "./auto-responders-skeleton";
import { EMPTY_DRAFT, EXAMPLE_DRAFT, errorDetail, type ResponderDraft } from "./format";
import { RESPONDERS_STACK } from "./layout";
import { ResponderComposer } from "./responder-composer";
import { ResponderList } from "./responder-list";

/**
 * The auto-responders page body: loads the list once (GET), then shows the
 * composer (POST) and the list (DELETE). Loading → skeleton of the final
 * layout; a failed load → ErrorState with retry and nothing editable (no
 * creating against a list we couldn't read).
 */
export function AutoResponders() {
  const query = usePleedQuery(getAutomations);
  const [draft, setDraft] = useState<ResponderDraft>(EMPTY_DRAFT);
  const [retried, setRetried] = useState(false);
  const [refreshRetried, setRefreshRetried] = useState(false);
  const triggerRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // A retry from the error state moves focus to the list once it loaded
  // (the "Try again" button it was on is gone by then).
  const focusListOnLoad = useRef(false);

  const responders = query.data;
  const loaded = responders !== undefined;

  useEffect(() => {
    if (query.status === "success" && focusListOnLoad.current) {
      focusListOnLoad.current = false;
      headingRef.current?.focus();
    }
  }, [query.status]);

  function retry() {
    setRetried(true);
    focusListOnLoad.current = true;
    query.reload();
  }

  function retryRefresh() {
    setRefreshRetried(true);
    focusListOnLoad.current = true;
    query.reload();
  }

  if (!loaded) {
    // While a retry runs, keep the error on screen ("Retrying…" keeps keyboard focus).
    const failed = query.status === "error" || (retried && query.status === "loading");
    if (!failed) return <AutoRespondersSkeleton />;
    return (
      <ErrorState
        title="Couldn't load your auto-responders"
        description={`${query.error?.message ?? "The Pleed API didn't answer."} Nothing was changed. Try again in a moment.`}
        detail={errorDetail(query.error)}
        onRetry={retry}
        retrying={query.status === "loading"}
        headingAs="h2"
        actions={
          <Button variant="ghost" href={SUPPORT_URL}>
            Ask for help
          </Button>
        }
      />
    );
  }

  function fillExample() {
    setDraft(EXAMPLE_DRAFT);
    // After React has put the example into the field.
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
      triggerRef.current?.select();
    });
  }

  return (
    <div className={RESPONDERS_STACK}>
      <ResponderComposer
        draft={draft}
        onDraftChange={setDraft}
        existing={responders}
        onCreated={() => {
          setRefreshRetried(false);
          query.reload();
        }}
        triggerRef={triggerRef}
      />
      <ResponderList
        responders={responders}
        headingRef={headingRef}
        onDeleted={(id) => query.setData((list) => list?.filter((item) => item.id !== id))}
        onUseExample={fillExample}
        notice={
          // A re-fetch after a create failed: the list we have is still real, just maybe stale.
          query.status === "error" || (refreshRetried && query.status === "loading") ? (
            <ErrorState
              variant="inline"
              title="Couldn't refresh the list"
              description={`${query.error?.message ?? "The Pleed API didn't answer."} It may be missing your newest responder.`}
              onRetry={retryRefresh}
              retrying={query.status === "loading"}
            />
          ) : null
        }
      />
    </div>
  );
}
