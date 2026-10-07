import type { DocsPageContent } from "../types";

export const gettingStarted: DocsPageContent = {
  slug: "getting-started",
  lead: "A quick walkthrough for adding Pleed to your server and getting it configured — from the invite to the setup wizards and the permissions each module needs.",
  sections: [
    {
      id: "invite-the-bot",
      title: "1. Invite the bot",
      blocks: [
        {
          type: "p",
          text: "Use the **Add to Discord** button below (it's on the homepage too), or go straight to the OAuth invite link. Grant **Administrator** (recommended for full moderation and anti-nuke coverage) or a curated set of permissions if you prefer to scope it down manually.",
        },
        { type: "invite" },
      ],
    },
    {
      id: "check-your-prefix",
      title: "2. Check your prefix",
      blocks: [
        {
          type: "p",
          text: "Pleed responds to prefix commands (default `!`) and slash commands (`/`). Both work side by side — use whichever is faster for a given command.",
        },
        { type: "code", title: "Example — change your prefix to ?", code: "!prefix ?" },
        {
          type: "commands",
          label: "Prefix and help commands",
          commands: [
            { usage: "!prefix <new_prefix>", description: "Change the server's command prefix." },
            { usage: "!help [command_name]", description: "Open the interactive help menu, or look up one command." },
            { usage: "!helpsetup", description: "Open the help panel configuration." },
            { usage: "!ai <question>", description: "Ask Pleed's built-in AI assistant a question." },
          ],
        },
      ],
    },
    {
      id: "run-the-setup-wizard",
      title: "3. Run the setup wizard",
      blocks: [
        {
          type: "p",
          text: "Most modules have their own guided setup command rather than a dozen manual config commands. Start with the server setup wizard, then layer on the specific modules you want:",
        },
        {
          type: "table",
          label: "Setup wizards",
          columns: ["Command", "What it sets up", "Guide"],
          rows: [
            ["`!setup`", "General first-time server configuration.", "[Server setup](/docs/server-setup)"],
            ["`!setupticket`", "Your first ticket panel.", "[Tickets](/docs/tickets)"],
            ["`!antinuke enable`", "Raid and nuke protection.", "[Security & anti-nuke](/docs/security)"],
            ["`!automationsetup`", "Toggles auto-moderation and automation features.", "[Automation](/docs/automation)"],
            ["`!setupvc [category]`", "VoiceMaster temporary voice channels.", "[Voice](/docs/voice)"],
          ],
        },
      ],
    },
    {
      id: "understand-permissions",
      title: "4. Understand permissions",
      blocks: [
        {
          type: "p",
          text: "Every command that changes server settings checks your Discord permissions before running (usually **Manage Server**, **Manage Roles**, **Manage Channels** or **Administrator**, depending on the command). If a command silently refuses to run, check that both you _and_ Pleed's role have the permission needed, and that Pleed's role sits above any roles it needs to manage.",
        },
        {
          type: "callout",
          tone: "warning",
          title: "Role hierarchy matters",
          text: "For moderation actions (ban, kick, timeout, jail, role management) Pleed's own role must be positioned above the target member's highest role in **Server Settings → Roles**, or the action will fail.",
        },
      ],
    },
    {
      id: "where-to-go-next",
      title: "Where to go next",
      blocks: [
        { type: "pages", slugs: ["security", "moderation", "automation", "tickets", "server-setup", "voice", "economy", "utility", "fun"] },
      ],
    },
  ],
};
