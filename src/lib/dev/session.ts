"use client";

import { useSyncExternalStore } from "react";
import { useSession, type SessionContextValue, type UseSessionOptions } from "next-auth/react";

type MockSessionModule = typeof import("@/lib/mock/session");

/**
 * Development: the mock session from src/lib/mock (switchable with ?mock=…),
 * or the real NextAuth session when `?mock=off` / NEXT_PUBLIC_PLEED_MOCK=0.
 * `required: true` is only honoured by the real session.
 */
function createDevSessionHook(mock: MockSessionModule): typeof useSession {
  return function useSessionWithDevMocks<R extends boolean>(options?: UseSessionOptions<R>): SessionContextValue<R> {
    const mocked = useSyncExternalStore(
      mock.subscribeMockSession,
      mock.getMockSessionSnapshot,
      mock.getMockSessionServerSnapshot,
    );
    const real = useSession<R>(mocked ? undefined : options);
    return (mocked ?? real) as SessionContextValue<R>;
  };
}

/**
 * Drop-in replacement for next-auth's `useSession()` (same arguments, same
 * return shape). In production this IS `useSession`: the exact NODE_ENV
 * comparison is a build-time constant, so the bundler drops the dev branch
 * and never follows its `require` (the mock module is not in production
 * bundles). Keep using `signIn` / `signOut` from "next-auth/react" directly.
 */
export const usePleedSession: typeof useSession =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_PLEED_MOCK !== "0"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- conditional so production never bundles mocks
      createDevSessionHook(require("@/lib/mock/session") as MockSessionModule)
    : useSession;
