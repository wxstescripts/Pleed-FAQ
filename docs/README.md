# Pleed Docs — drop-in for Pleed-FAQ

This is a full `docs/` folder generated from your `cogs/` export (600 public-facing
commands across 10 categories, owner/dev-only commands like `dev.py` and `benchmark.py`
excluded on purpose).

## How to install

1. Copy the `docs/` folder into the root of your `wxstescripts/Pleed-FAQ` repo,
   replacing/creating `docs/` there (your `index.html` nav already links to `docs/`).
2. It links to `../style.css`, `../assets/logo.png`, and `../assets/favicon.png` —
   the same paths your existing `index.html` and `commands.html` use — so it should
   pick up your site's theme automatically. It also ships its own `docs/docs.css`
   for the sidebar/tables, in case your `style.css` doesn't already have those classes.
3. Push it. GitHub Pages will pick up `docs/index.html` at `yoursite/docs/`.

## What's inside

- `docs/index.html` — landing page with a category grid
- `docs/getting-started.html` — invite, prefix, setup wizards, permissions
- `docs/moderation.html` — 134 commands (jail system, access control, aliases, automod, logging, roles)
- `docs/security.html` — 81 commands (AntiNuke, join gate, rate limiting, kick trap, fake perms)
- `docs/tickets.html` — 13 commands
- `docs/economy.html` — 81 commands (wallet, businesses, stock market, poker, leveling, giveaways)
- `docs/automation.html` — 38 commands (trigger/response automations, auto-react, custom commands)
- `docs/server-setup.html` — 34 commands (setup wizards, welcome/goodbye, update logger)
- `docs/voice.html` — 21 commands (VoiceMaster temp channels)
- `docs/utility.html` — 102 commands (snipe, highlights, lookups, image tools, emoji/stickers)
- `docs/fun.html` — 93 commands (games, music, Spotify, counters, webhooks, customization)

Each page has real tutorial-style walkthroughs plus a full, accurate command reference table
(usage syntax, aliases, prefix vs. slash badges) generated directly from your source, grouped
by subsystem so a 130-command category isn't just one giant flat list.

## Notes / things worth double-checking

- Default prefix is `!`, confirmed from `core/config.py`'s default row insert — update the
  copy in `getting-started.html` if that's changed.
- I excluded these files entirely as owner/dev-only tooling (hot-reload, file editing, DB
  benchmarking, self-tests, cross-guild debug stats): `core/dev.py`, `core/benchmark.py`,
  `core/selftest.py`, `core/status.py`, `core/command_search.py`, `core/file_deleter.py`,
  `core/file_uploader.py`. If any of those are actually meant to be public, let me know and
  I'll add a page for them.
- A few commands had no docstring/help text in the source (shown as "No description
  available." nowhere — I filled those in by inference in the prose, but the raw table cells
  for undocumented ones are best-effort; consider adding real `help=` strings in the cogs so
  future doc generations pick them up automatically).
- I couldn't fetch your actual `style.css` (GitHub blocked automated access to that file), so
  `docs.css` is a self-contained dark theme that reuses your existing class names (`nav`,
  `hero`, `card`, `footer`, etc.) for the shared chrome. If your real theme uses different
  colors, it'll still work but may look slightly different in the docs-specific bits (tables,
  sidebar) until you tweak `docs/docs.css`'s `:root` variables.
