"use client";

import dynamic from "next/dynamic";
import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

/*
 * NextAuth's SessionProvider fetches GET /api/auth/session on mount and on
 * every tab focus. Only the dashboard reads the session (usePleedSession),
 * so the provider — and the next-auth client it pulls in — is mounted for
 * /dashboard/** only, as a lazily loaded chunk. Marketing pages ship none of
 * it and make no session request; their "Log in" / "Add to Discord" call
 * signIn("discord") from "next-auth/react", which needs no provider.
 *
 * Do not add another SessionProvider (e.g. in dashboard/layout.tsx).
 */
const NextAuthProvider = dynamic(() =>
  import("@/components/NextAuthProvider").then((mod) => mod.NextAuthProvider),
);

/** Session-scoped segments (top-level routes under src/app). */
const SESSION_SEGMENTS = new Set(["dashboard"]);

export function SessionScope({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  if (segment && SESSION_SEGMENTS.has(segment)) {
    return <NextAuthProvider>{children}</NextAuthProvider>;
  }
  return children;
}
