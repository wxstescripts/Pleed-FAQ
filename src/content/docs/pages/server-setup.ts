import type { DocsPageContent } from "../types";

// Guides curated from docs/server-setup.html; the reference is generated from the bot's cogs (see docs/README.md).
export const serverSetup: DocsPageContent = {
  slug: "server-setup",
  lead: "First-time configuration: the setup center, welcome and goodbye messages, invite tracking, and the update logger for announcing changes to your community.",
  sections: [
    {
      id: "the-setup-center",
      title: "The setup center",
      blocks: [
        { type: "p", text: "Rather than hunting for individual config commands, `!setup` opens a panel that links out to every setup flow. If you just want jail and mute infrastructure created quickly:" },
        {
          type: "commands",
          label: "Setup center commands",
          commands: [
            { usage: "!setupjail", description: "Creates the jail channel and role." },
            { usage: "!setupmute", description: "Creates the mute role and channel permissions." },
            { usage: "!setupall", description: "Runs both jail and mute setup together." },
            { usage: "!setupstatus", description: "Check what's already configured." },
            { usage: "!fixjailperms", description: "Re-apply jail role permission overwrites across every channel if something looks off." },
            { usage: "!jailroles [state]", description: "Toggle whether jailing a member also strips their existing roles." },
          ],
        },
      ],
    },
    {
      id: "welcome-and-goodbye-messages",
      title: "Welcome & goodbye messages",
      blocks: [
        { type: "p", text: "Configured under the `!messages` group:" },
        {
          type: "commands",
          label: "Welcome and goodbye message commands",
          commands: [
            { usage: "!messages welcomechannel <channel>", description: "Set where welcome messages post." },
            { usage: "!messages welcomemessage <text>", description: "Set the welcome message text." },
            { usage: "!messages welcometoggle <state>", description: "Turn welcome messages on/off." },
            { usage: "!messages testwelcome [member]", description: "Preview the welcome message." },
            { usage: "!messages goodbyechannel <channel>", description: "Set where goodbye messages post." },
            { usage: "!messages goodbyemessage <text>", description: "Set the goodbye message text." },
            { usage: "!messages goodbyetoggle <state>", description: "Turn goodbye messages on/off." },
            { usage: "!messages testgoodbye [member]", description: "Preview the goodbye message." },
          ],
        },
      ],
    },
    {
      id: "update-logger",
      title: "Update logger",
      blocks: [
        { type: "p", text: "Post polished, templated changelog announcements to your community. Set it up once with `/setup_updates <channel> [role] [footer]`, then either open the full builder with `/post_update` or fire off a fast one with `/quick_update`:" },
        { type: "code", title: "Quick update", code: "/quick_update <title> [overview] [added] [fixed] [improved] [removed] [notes]" },
        { type: "p", text: "Save reusable presets with `/save_update_template` and `/save_update_theme` (color, emoji, footer), review past posts with `/update_history`, and fix mistakes with `/edit_last_update` or `/delete_last_update`." },
      ],
    },
    {
      id: "invite-panel-and-announcements",
      title: "Invite panel & guild announcements",
      blocks: [
        { type: "p", text: "`!addbotpanel` / `!refreshbotpanel` manage an invite-tracking panel, and `!guildinform` / `!guildmessage <member>` handle server-wide announcement messaging." },
      ],
    },
  ],
  reference: {
    groups: [
      {
        id: "server-setup-wizard",
        title: "Server setup wizard",
        commands: [
          { usage: "!fixjailperms", description: "Re-apply jail role lockdown to all channels." },
          { usage: "!jailroles [state]", description: "Toggle or set role removal on jail (`!jailroles on/off`)." },
          { usage: "!setup", description: "Open the setup center panel.", aliases: ["setupcenter", "setups"] },
          { usage: "!setupall", description: "Create jail + mute setup together." },
          { usage: "!setupjail", description: "Create jail channels and role.", aliases: ["setme"] },
          { usage: "!setupmute", description: "Create mute roles and channels." },
          { usage: "!setupstatus", description: "Show current setup status." },
        ],
      },
      {
        id: "welcome-goodbye-commands",
        title: "Welcome & goodbye messages",
        commands: [
          { usage: "!messages", description: "Configure welcome and goodbye messages." },
          { usage: "!messages goodbyechannel <channel>", description: "Set the goodbye channel." },
          { usage: "!messages goodbyemessage <text>", description: "Set the goodbye message." },
          { usage: "!messages goodbyetoggle <state>", description: "Enable or disable goodbye messages." },
          { usage: "!messages testgoodbye [member]", description: "Send a test goodbye message." },
          { usage: "!messages testwelcome [member]", description: "Send a test welcome message." },
          { usage: "!messages welcomechannel <channel>", description: "Set the welcome channel." },
          { usage: "!messages welcomemessage <text>", description: "Set the welcome message." },
          { usage: "!messages welcometoggle <state>", description: "Enable or disable welcome messages." },
        ],
      },
      {
        id: "update-logger-commands",
        title: "Update logger",
        commands: [
          { usage: "/delete_last_update", description: "Delete the last posted update log." },
          { usage: "/edit_last_update", description: "Edit the last posted update log." },
          { usage: "/list_update_presets", description: "Show saved update logger themes and templates." },
          { usage: "/post_update [template_name] [theme_name] [ping_role_override] [attachment_1] [attachment_2] [attachment_3] [attachment_4]", description: "Open the update logger builder." },
          { usage: "/quick_update <title> [overview] [added] [fixed] [improved] [removed] [notes] [template_name] [theme_name] [ping_role_override]", description: "Post a quick update without opening the large modal." },
          { usage: "/save_update_template <template_name> [theme_name] [title_prefix] [added_label] [improved_label] [fixed_label] [removed_label] [notes_label] [overview_label]", description: "Save or update a reusable update template." },
          { usage: "/save_update_theme <theme_name> <color_hex> [emoji] [title_prefix] [footer_text]", description: "Save or update an update embed theme." },
          { usage: "/setup_updates <channel> [role] [footer]", description: "Set the channel and ping role for update logs." },
          { usage: "/update_config", description: "View the current update logger config." },
          { usage: "/update_history [limit]", description: "Show recent update history." },
          { usage: "/update_media_defaults [image_url] [thumbnail_url] [use_server_icon]", description: "Set default media URLs used in update posts." },
          { usage: "/update_toggle [auto_caps] [markers] [ping_enabled] [use_server_icon] [compact_mode] [title_prefix] [default_color]", description: "Change default update logger settings." },
        ],
      },
      {
        id: "invite-panel",
        title: "Invite panel",
        commands: [
          { usage: "!addbotpanel" },
          { usage: "!refreshbotpanel" },
        ],
      },
      {
        id: "guild-info-posting",
        title: "Guild info posting",
        commands: [
          { usage: "!guildinform" },
          { usage: "!guildmessage <member>", aliases: ["guilddm"] },
        ],
      },
      {
        id: "bot-config",
        title: "Bot config",
        commands: [
          { usage: "!prefix <new_prefix>" },
          { usage: "!setwelcome <channel>" },
        ],
      },
    ],
  },
};
