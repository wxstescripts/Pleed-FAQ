/**
 * Dev-only mock NextAuth session, exposed as a tiny external store for
 * `usePleedSession` (src/lib/dev/session.ts). Contains no tokens.
 */
import type { Session } from "next-auth";
import type { SessionContextValue } from "next-auth/react";
import { announceMockSettings, getMockSettings, MOCK_SLOW_SESSION_MS } from "./settings";

export const MOCK_SESSION: Session = {
  user: { name: "Dev Admin", email: null, image: null },
  expires: "2099-01-01T00:00:00.000Z",
};

const AUTHENTICATED: SessionContextValue = {
  data: MOCK_SESSION,
  status: "authenticated",
  update: async () => MOCK_SESSION,
};
const SIGNED_OUT: SessionContextValue = { data: null, status: "unauthenticated", update: async () => null };
const LOADING: SessionContextValue = { data: null, status: "loading", update: async () => null };

const listeners = new Set<() => void>();
let resolvedKey: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function scheduleSlowResolution() {
  const settings = getMockSettings();
  if (!settings.enabled || settings.latency !== "slow" || resolvedKey === settings.key || timer) return;
  timer = setTimeout(() => {
    timer = null;
    resolvedKey = settings.key;
    notify();
  }, MOCK_SLOW_SESSION_MS);
}

export function subscribeMockSession(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  scheduleSlowResolution();
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

/** `null` = mocks are off, use the real session. Otherwise a stable mock value. */
export function getMockSessionSnapshot(): SessionContextValue | null {
  const settings = getMockSettings();
  announceMockSettings(settings);
  if (!settings.enabled) return null;
  if (settings.session === "loading") return LOADING;
  if (settings.latency === "slow" && resolvedKey !== settings.key) return LOADING;
  return settings.session === "signedout" ? SIGNED_OUT : AUTHENTICATED;
}

/** During SSR and hydration the switches are unknown: defer to the real session (status "loading"). */
export function getMockSessionServerSnapshot(): SessionContextValue | null {
  return null;
}
