/**
 * Dev-only mock NextAuth session, exposed as a tiny external store for
 * `usePleedSession` (src/lib/dev/session.ts). Contains no tokens.
 */
import type { Session } from "next-auth";
import type { SessionContextValue } from "next-auth/react";
import { announceMockSettings, getMockSettings, MOCK_SLOW_SESSION_MS } from "./settings";

/**
 * Discord's public default avatar. NextAuth's Discord provider gives every real
 * user a cdn.discordapp.com image (their avatar, or one of these defaults), so
 * the mock does too: it exercises next/image + the cdn.discordapp.com
 * remotePattern in dev. `?mock=noavatar` switches to `image: null`.
 */
export const MOCK_AVATAR_URL = "https://cdn.discordapp.com/embed/avatars/0.png";

export const MOCK_SESSION: Session = {
  user: { name: "Dev Admin", email: null, image: MOCK_AVATAR_URL },
  expires: "2099-01-01T00:00:00.000Z",
};
export const MOCK_SESSION_NO_AVATAR: Session = {
  user: { ...MOCK_SESSION.user, image: null },
  expires: MOCK_SESSION.expires,
};

function authenticated(session: Session): SessionContextValue {
  return { data: session, status: "authenticated", update: async () => session };
}
const AUTHENTICATED = authenticated(MOCK_SESSION);
const AUTHENTICATED_NO_AVATAR = authenticated(MOCK_SESSION_NO_AVATAR);
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
  if (settings.session === "signedout") return SIGNED_OUT;
  return settings.avatar === "none" ? AUTHENTICATED_NO_AVATAR : AUTHENTICATED;
}

/** During SSR and hydration the switches are unknown: defer to the real session (status "loading"). */
export function getMockSessionServerSnapshot(): SessionContextValue | null {
  return null;
}
