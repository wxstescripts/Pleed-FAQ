"use client";

import type { ReactNode } from "react";

import { usePleedSession } from "@/lib/dev/session";
import { cn } from "@/lib/utils";

import { AppBar } from "./app-bar";
import { PaletteProvider } from "./command-palette";
import { DashboardDataProvider } from "./dashboard-data";
import { LoginGate } from "./login-gate";
import { Sidebar } from "./sidebar";
import { SessionSkeleton } from "./skeletons";
import { useSidebarRail } from "./use-shell-prefs";
import type { DashboardUser } from "./user-menu";

/**
 * The dashboard's auth gate and frame.
 *
 * Auth is exactly as strict as before: `usePleedSession()` is next-auth's
 * `useSession()` in production (the dev mock exists only under
 * NODE_ENV === "development"). While the session loads — always on the server
 * and the first client render — only a skeleton renders; without a session
 * only the login gate (real `signIn("discord")`); the pages (children) and
 * every API call render only for a signed-in user.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const { data: session, status } = usePleedSession();

  if (status === "loading") return <SessionSkeleton />;
  if (status === "unauthenticated" || !session) return <LoginGate />;

  return <SignedInShell user={session.user ?? {}}>{children}</SignedInShell>;
}

/**
 * Layout model (DESIGN.md "Dashboard page contract"):
 * - < 1024 px: sticky app bar (h-header) + drawer; the page column fills the rest of the screen.
 * - ≥ 1024 px: fixed sidebar (240 px, or the 64 px icon rail); the page column is padded past it.
 * The page column is a `flex flex-1 flex-col` <main> in a `min-h-dvh` flex column, with nothing
 * after the page, so each page's `<Container className="flex flex-1 flex-col py-page">` and its
 * SaveBar rest at the bottom of short pages. Pages centre their own Container (no stretched
 * content on 1920/2560).
 */
function SignedInShell({ user, children }: { user: DashboardUser; children: ReactNode }) {
  const { rail, setRail } = useSidebarRail();

  return (
    <DashboardDataProvider>
      <PaletteProvider>
        <div className="flex min-h-dvh flex-col">
          <a
            href="#main"
            className="fixed top-3 left-3 z-skip inline-flex min-h-11 -translate-y-[calc(100%+1rem)] items-center rounded-lg border border-line-strong bg-surface-2 px-4 py-2.5 type-label text-fg shadow-lg transition-transform duration-200 ease-standard focus-visible:translate-y-0 focus-visible:focus-ring"
          >
            Skip to content
          </a>
          <AppBar user={user} />
          <Sidebar user={user} rail={rail} onRailChange={setRail} />
          <main
            id="main"
            tabIndex={-1}
            className={cn("flex flex-1 flex-col outline-none", rail ? "lg:pl-sidebar-rail" : "lg:pl-sidebar")}
          >
            {children}
          </main>
        </div>
      </PaletteProvider>
    </DashboardDataProvider>
  );
}
