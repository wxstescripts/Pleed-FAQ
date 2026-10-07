# Pleed API — request inventory and client

This folder is the only place the website talks to the Pleed Python API. Every request below is
**part of the contract**: same URL, method, headers and JSON body as the dashboard sent before the
client existed (verified by capturing the requests before and after the refactor — identical,
including header presence and body key order). Don't change them from page code.

```
src/lib/api/
  config.ts   MOCK_GUILD_ID + the two API hosts
  types.ts    request/response types (PleedStats, SecurityConfig, …), PleedEndpoint, RequestOptions
  errors.ts   ApiError (+ isApiError, isAbortError, toApiError)
  pleed.ts    one function per endpoint (+ pleedRequests: the exact request each one builds)
  flag.ts     flagOn / toFlag for the API's 0/1 booleans
  hooks.ts    usePleedQuery / usePleedMutation (client components; import from "@/lib/api/hooks")
  index.ts    barrel: import { getStats, ApiError, type SecurityConfig } from "@/lib/api"
```

How to use it from pages (loading/empty/error states, dev mocks): see `src/lib/dev/README.md`.

## Constants

| Constant | Value | Notes |
|---|---|---|
| `MOCK_GUILD_ID` | `"1484703029243416757"` | The one guild every settings page reads and writes (previously copied into 5 files). Same number as the bot's OAuth client ID. There is no guild selector; the client functions deliberately take no guild parameter. |
| `LOCALTUNNEL_API_BASE` | `https://purple-windows-report.loca.lt` | localtunnel. Every request sends `Bypass-Tunnel-Reminder: true` (skips localtunnel's interstitial page). Optional build-time override `NEXT_PUBLIC_PLEED_API_LOCALTUNNEL_URL`; unset = this URL. |
| `LOCALHOSTRUN_API_BASE` | `https://1b166fb77d23d0.lhr.life` | localhost.run. Requests do **not** send `Bypass-Tunnel-Reminder`. Optional override `NEXT_PUBLIC_PLEED_API_LHR_URL`; unset = this URL. |

Both hosts are ephemeral tunnels to the bot's local API; when the owner restarts a tunnel the
URL changes — set the override env var (or edit `config.ts`) rather than touching pages.

## Endpoints

`LT` = `https://purple-windows-report.loca.lt`, `LHR` = `https://1b166fb77d23d0.lhr.life`,
`{G}` = `MOCK_GUILD_ID`. "No headers" means `fetch(url)` with no init at all.

| # | Client function | Method | URL | Headers sent | Body | Response the UI reads |
|---|---|---|---|---|---|---|
| 1 | `getStats()` | GET | `LT/api/stats` | `Bypass-Tunnel-Reminder: true` | — | `{ servers, messages_today, actions_taken }` (numbers) — no member total (see below) |
| 2 | `getServers()` | GET | `LT/api/servers` | `Bypass-Tunnel-Reminder: true` | — | array of `{ id, name, role, members }` |
| 3 | `getSecurityConfig()` | GET | `LT/api/security/{G}` | `Bypass-Tunnel-Reminder: true` | — | `{ enabled, punishment, ban_threshold, kick_threshold, channel_delete_threshold, role_delete_threshold }` |
| 4 | `saveSecurityConfig(config)` | POST | `LT/api/security/{G}` | `Content-Type: application/json`, `Bypass-Tunnel-Reminder: true` | `JSON.stringify(config)` — the whole object | status only |
| 5 | `getJoinGatesConfig()` | GET | `LT/api/joingates/{G}` | `Bypass-Tunnel-Reminder: true` | — | `{ enabled, verify_channel_id, verified_role_id, unverified_role_id, min_account_age_days, auto_kick_minutes, dm_on_join, log_channel_id, bypass_role_id }` |
| 6 | `saveJoinGatesConfig(config)` | POST | `LT/api/joingates/{G}` | `Content-Type: application/json`, `Bypass-Tunnel-Reminder: true` | `JSON.stringify(config)` | status only |
| 7 | `getAutomodConfig()` | GET | `LHR/api/automod/{G}` | none | — | `{ anti_links, anti_spam, anti_caps, anti_invites, anti_mentions, bad_words_enabled, punishment, timeout_minutes }` |
| 8 | `saveAutomodConfig(config)` | POST | `LHR/api/automod/{G}` | `Content-Type: application/json` | `JSON.stringify(config)` | status only |
| 9 | `getAutomations()` | GET | `LHR/api/automations/{G}` | none | — | array of `{ id, trigger, payload, name?, match_type? }` |
| 10 | `createAutomation({ trigger, payload })` | POST | `LHR/api/automations/{G}` | `Content-Type: application/json` | `{"name":"","trigger":…,"payload":…,"match_type":"contains"}` (this key order) | status only (the UI re-fetches the list) |
| 11 | `deleteAutomation(id)` | DELETE | `LHR/api/automations/{G}` | `Content-Type: application/json` | `{"id":<number>}` | status only (the UI re-fetches the list) |
| 12 | `getSettings()` | GET | `LHR/api/settings/{G}` | none | — | `{ prefix, welcome_channel }` |
| 13 | `saveSettings(settings)` | POST | `LHR/api/settings/{G}` | `Content-Type: application/json` | `JSON.stringify(settings)` | status only |

Field semantics (from the current UI; the backend for these routes is not in this repo):

- `stats` has **no member total**, and no endpoint returns one. The old overview card "Total Members" showed a hard-coded "Loading..." that never resolved (also on `main`). Either derive it as the sum of `servers[].members`, labelled "across listed servers", or show a clearly marked Placeholder — never a perpetual loading state or an invented number.
- On/off fields are SQLite-style `0 | 1` (`Flag`), not booleans: `enabled`, `dm_on_join`, every `anti_*`, `bad_words_enabled`. Use `flagOn(v)` / `toFlag(bool)`.
- `security.punishment`: `"ban" | "kick" | "quarantine" | "alert"`. Thresholds are "per minute"; the UI ranges are 1–20 (ban, kick) and 1–10 (channel/role deletions).
- `automod.punishment`: `"delete" | "timeout" | "kick" | "ban"`; `timeout_minutes` only matters for `"timeout"`.
- Join-gate IDs are Discord snowflakes as strings; `""` = not set. `bypass_role_id` and `anti_mentions` are round-tripped but have no control in the current UI.
- `settings.prefix` is limited to 3 characters by the UI; `welcome_channel` may be `null`.
- `servers[].id` may arrive as a JSON number (snowflakes lose precision as numbers — treat it as an opaque key).
- Save bodies are whatever object you pass, stringified as-is. Pass the object you got from the GET (spread it to edit) so fields the UI doesn't know about are preserved, exactly as before.

## Errors

Every function throws `ApiError` (never a raw `TypeError`/`SyntaxError`):

| `kind` | When | Useful fields |
|---|---|---|
| `network` | no response (tunnel down, DNS, CORS, offline) | `retryable === true` |
| `http` | non-2xx response | `status`, `statusText`, `body` (first 500 chars); `retryable` for 5xx/408/429 |
| `parse` | 2xx but not JSON, or not the expected object/array | — |
| `aborted` | your `AbortSignal` fired | ignore it |
| `unknown` | anything else, wrapped | `cause` |

All errors also carry `endpoint` (e.g. `"security.save"`), `method` and `url`. `error.message` is a
short user-safe sentence ("Couldn't reach the Pleed API. It may be offline or restarting.").

Behaviour change vs. the old inline code (intentional, contract unchanged): non-2xx responses now
throw instead of being treated as success/ignored, so pages can show real error states.

## Other HTTP touchpoints (not in this client)

| What | Where | Notes |
|---|---|---|
| `GET /api/auth/session`, `/api/auth/csrf`, `/api/auth/signin/discord`, `/api/auth/callback/discord`, `/api/auth/signout` | NextAuth v4 (`src/app/api/auth/[...nextauth]/route.ts`, `SessionProvider` in `src/components/NextAuthProvider.tsx`) | Discord provider, scopes `identify guilds`. The session callback copies the Discord access token into the client-visible session (`session.accessToken`) — existing behaviour, flagged to the owner, not changed. |
| `signIn("discord")`, `signOut()` | `src/app/dashboard/layout.tsx` | Call them from `next-auth/react` directly; the dev session hook does not wrap them. |
| `GET /commands` | `api/commands_api.py` (Flask blueprint `commands_api`) | Returns a hard-coded 2-item list (`warn`, `ticket setup` with `name, category, description, permission, usage`). **Not used by the website**; the commands page reads `src/data/commands.json`. No client function on purpose. |

## Security notes for the owner (out of scope for the redesign — contracts are frozen)

- The tunnel endpoints are public and unauthenticated: anyone who knows the URL can read or POST any config for `MOCK_GUILD_ID`.
- The dashboard's auth gate is client-side only (`useSession` in the dashboard layout), and every signed-in user edits the same hard-coded guild.
