# Dev mocks, session hook and API client — guide for dashboard builders

In development the dashboard runs **without a Discord login and without the API tunnels**:
`usePleedSession()` returns a mock signed-in user ("Dev Admin") and every `@/lib/api` call is
answered by an in-memory mock API with realistic latency. Query switches force the signed-out,
loading, empty and error states for review.

Production is untouched: there `usePleedSession` **is** next-auth's `useSession`, and the client
always calls the real API. The mock code sits behind `process.env.NODE_ENV === "development"`
(exact comparison, a build-time constant), so it is not shipped.

## When mocks are active

| Condition | Result |
|---|---|
| `next dev` (NODE_ENV `development`) | mocks ON by default |
| `NEXT_PUBLIC_PLEED_MOCK=0` in `.env.local` (restart dev server) | mocks OFF for everyone |
| `?mock=off` in the URL | mocks OFF for this browser tab (real API + real NextAuth session) |
| `next build` / production | mocks never exist |

The browser console prints one `[pleed mock] …` info line per page load saying which mode is active.

## Review switches (`?mock=`)

Add to any dashboard URL. The value is remembered for the tab (sessionStorage key `pleed:mock`),
so clicking around the sidebar keeps it. Switches combine with `,` or `+`.

| Switch | Effect |
|---|---|
| *(none)* | signed in as Dev Admin, populated fixtures, 400–700 ms latency |
| `empty` | a server Pleed just joined: no servers, zero stats, no auto-responders, every module off, blank IDs |
| `error` | every API call fails after the latency with `ApiError` kind `http`, status 503 |
| `savefail` | reads work, every save/create/delete fails (HTTP 500) — for save-error toasts |
| `slow` | session resolves after 1.5 s, API calls take 4.5–5.5 s — for skeletons/spinners |
| `loading` | API calls never resolve — screenshot-stable loading state |
| `signedout` | mock session is signed out — the login gate |
| `sessionloading` | mock session never resolves — the "checking your session" state |
| `noavatar` | mock user has `image: null` — the avatar's initials fallback |
| `off` | real API (tunnels) and real NextAuth session |
| `reset` (or `on`, or `?mock=`) | back to defaults, clears the remembered value |

Examples: `/dashboard?mock=empty`, `/dashboard/security?mock=error`, `/dashboard/automations?mock=empty+slow`.

With the QA tool (each run is a fresh browser, so nothing leaks between paths; use `+` to combine,
because `--paths` is comma-separated):

```bash
node shoot.mjs --paths "dashboard/security,dashboard/security?mock=loading,dashboard/security?mock=error,dashboard/security?mock=empty" --vp 390x844,1440x900 --mode fold --out ../shots/dash-security/r1
node shoot.mjs --paths "dashboard?mock=signedout,dashboard?mock=sessionloading,dashboard?mock=noavatar" --vp phones --out ../shots/dash-shell/gate
```

`slow` is timing-dependent; for screenshots of loading UI prefer `loading` / `sessionloading`.

## Fixtures (`src/lib/mock/fixtures.ts`)

Obviously fake on purpose — never present them as real usage figures.

- Stats `{ servers: 3, messages_today: 1234, actions_taken: 56 }`.
- **There is no member total.** `/api/stats` returns only `servers`, `messages_today` and
  `actions_taken`, and no endpoint returns a total member count. Honest options for a "members"
  figure: the sum of `servers[].members` labelled "across listed servers" (100% derived from
  `getServers()`), or a clearly marked Placeholder (`// PLACEHOLDER: replace with real data`).
  Never a perpetual "Loading…" and never an invented number.
- Servers: "Pleed Test Server" (Owner, 128), "Pleed Sandbox" (Administrator, 42), and "Pleed Staging Server With A Deliberately Long Name For Layout Testing" (Manage Server, 1024) — test truncation with it. IDs look like `100000000000000001`.
- Security: enabled, ban, thresholds 3/5/2/2. Join gates: enabled, all IDs filled (`2000…`/`3000…`), 7 days, 30 min, DM on. Automod: links/spam/invites on, punishment `timeout` (so the duration field shows), 10 min. Settings: prefix `!`, welcome channel set.
- Auto-responders: `hello`, `rules`, and one with a 58-character trigger without spaces plus a long reply — your list must wrap/ellipsize it without overflowing at 360 px.

Saves, creates and deletes mutate an in-memory copy, so "save → navigate away → come back" shows
the saved values. A full page reload restores the fixtures. `empty` and the default mode have
separate stores.

## Session: `usePleedSession`

```tsx
"use client";
import { signIn, signOut } from "next-auth/react"; // unchanged, real flow
import { usePleedSession } from "@/lib/dev/session";

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = usePleedSession(); // same shape as useSession()
  if (status === "loading") return <SessionSkeleton />;   // also the SSR/first-render state
  if (status === "unauthenticated" || !session) {
    return <LoginGate onLogin={() => signIn("discord")} />;
  }
  return <Shell user={session.user} onLogout={() => signOut()}>{children}</Shell>;
}
```

- Same arguments and return type as `useSession` (`{ data, status, update }`).
- The first render (server and hydration) is always `status: "loading"`, exactly like the real hook — design that state; it is also what `?mock=sessionloading` freezes.
- Mock user: `{ name: "Dev Admin", email: null, image: "https://cdn.discordapp.com/embed/avatars/0.png" }`,
  no tokens. Real users always have an `image` on `cdn.discordapp.com` (NextAuth's Discord provider
  falls back to these `embed/avatars/N.png` defaults), so render it with the shared `Avatar`
  (`next/image`, allowed by the `cdn.discordapp.com` remotePattern). Use `?mock=noavatar` to test
  the initials fallback (`image: null`) — keep handling it, `image` is optional in the type.
- `signIn`/`signOut` are the real next-auth functions — clicking Logout with mocks on runs the real sign-out request and reloads; you will still be the mock user afterwards. Use `?mock=signedout` to see the gate.
- `useSession({ required: true })` redirect behaviour is not simulated by the mock; the current layout doesn't use it.

## API client (`@/lib/api`)

Full request inventory: `src/lib/api/README.md`. Functions (all accept an optional `{ signal }`):

| Read | Write |
|---|---|
| `getStats()` → `PleedStats` | — |
| `getServers()` → `PleedServer[]` | — |
| `getSecurityConfig()` → `SecurityConfig` | `saveSecurityConfig(config)` |
| `getJoinGatesConfig()` → `JoinGatesConfig` | `saveJoinGatesConfig(config)` |
| `getAutomodConfig()` → `AutomodConfig` | `saveAutomodConfig(config)` |
| `getAutomations()` → `Automation[]` | `createAutomation({ trigger, payload })`, `deleteAutomation(id)` |
| `getSettings()` → `GuildSettings` | `saveSettings(settings)` |

Rules: don't call `fetch` for the Pleed API yourself, don't build URLs, don't add a guild
parameter (every page edits `MOCK_GUILD_ID` — contract), and save the **whole** object you loaded
(spread it to change fields) so unknown fields round-trip. Writes resolve to `void`; re-fetch or keep
your local copy.

### Hooks (`@/lib/api/hooks`, client components only)

```tsx
"use client";
import { useState } from "react";
import { getSecurityConfig, saveSecurityConfig, flagOn, toFlag, type SecurityConfig } from "@/lib/api";
import { usePleedMutation, usePleedQuery } from "@/lib/api/hooks";

export function SecurityEditor() {
  const query = usePleedQuery(getSecurityConfig);          // loads on mount, aborts on unmount
  const save = usePleedMutation(saveSecurityConfig);
  const [draft, setDraft] = useState<SecurityConfig | null>(null);
  const config = draft ?? query.data;

  if (query.status === "loading" && !query.data) return <SecuritySkeleton />;
  if (query.status === "error" && !query.data) {
    // Never fall back to default values here: saving defaults would overwrite the real config.
    return <ErrorState message={query.error?.message} onRetry={query.reload} />;
  }
  if (!config) return null;

  const dirty = draft !== null;
  async function onSave() {
    if (!draft) return;
    const result = await save.mutate(draft);                // never throws
    if (result.ok) { query.setData(draft); setDraft(null); toast.success("Saved"); }
    else toast.error(result.error.message);
  }

  return (
    <>
      <Switch
        checked={flagOn(config.enabled)}
        onCheckedChange={(on) => setDraft({ ...config, enabled: toFlag(on) })}
        aria-label="Anti-nuke protection"
      />
      <SaveBar visible={dirty} saving={save.status === "pending"} onSave={onSave} onDiscard={() => setDraft(null)} />
    </>
  );
}
```

- `usePleedQuery(fetcher)` → `{ status: "loading" | "success" | "error", data, error, reload, setData }`. `data` keeps the last good value during `reload()` and after a failed reload. Pass a client function directly; inline lambdas are fine too (no refetch loop).
- `usePleedMutation(fn)` → `{ mutate, status: "idle" | "pending" | "success" | "error", error, reset }`; `mutate(...args)` resolves to `{ ok: true, data } | { ok: false, error }`.
- Empty states are data-driven: `servers.length === 0`, `automations.length === 0`, a config with everything `0`/`""` (see `?mock=empty`).
- React Strict Mode runs effects twice in dev: you'll see two GETs, the first aborted. That's expected.

### Errors

`ApiError` has `kind` (`network | http | parse | aborted | unknown`), `status`, `endpoint`,
`retryable` and a short user-safe `message`. Show a retry action when `error.retryable`. Ignore
`isAbortError(error)`. Without the hooks:

```ts
import { getAutomations, isAbortError, isApiError } from "@/lib/api";

try {
  const list = await getAutomations({ signal });
} catch (error) {
  if (isAbortError(error)) return;
  if (isApiError(error) && error.kind === "http" && error.status === 404) { /* … */ }
  throw error;
}
```

## Files

| File | What |
|---|---|
| `src/lib/dev/session.ts` | `usePleedSession` |
| `src/lib/mock/settings.ts` | `?mock=` parsing + sessionStorage persistence, latency constants |
| `src/lib/mock/fixtures.ts` | populated + empty fixtures |
| `src/lib/mock/handler.ts` | mock API (latency, error modes, in-memory store); loaded only via dynamic import in dev |
| `src/lib/mock/session.ts` | mock session external store (no tokens) |

Production check (orchestrator, after `next build`): `grep -rl "Dev Admin\|pleed mock\|Pleed Test Server" .next/static` must print nothing.
