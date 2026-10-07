import type { DocsPageContent } from "../types";

// Guides curated from docs/automation.html; the reference is generated from the bot's cogs (see docs/README.md).
export const automation: DocsPageContent = {
  slug: "automation",
  lead: "Build trigger-and-response rules without writing code: automations react to message content, reaction shortcuts respond to keywords with an emoji, and custom commands let you create your own server-specific commands.",
  sections: [
    {
      id: "automations",
      title: "Automations (trigger → response)",
      blocks: [
        { type: "p", text: "An automation matches messages against a trigger and fires a response — a reply, a reaction, or both — with fine-grained control over who and where it applies." },
        {
          type: "steps",
          items: [
            "Create one with `!automation addresponse <name> <data>` or `!automation addreaction <name> <data>`.",
            "Choose how strictly the trigger has to match (exact, contains, starts with, etc.) with `!automation match <automation_id> <match_type>`.",
            "Scope it to (or exclude it from) specific channels, roles or members with `!automation filters`, plus the dedicated `!filters channels/roles/users` and their `block*` counterparts.",
            "Stop a rule from firing on every single match with `!automation cooldown <automation_id> <seconds>` and `!automation chance <automation_id> <chance>`.",
            "Decide which rule wins when more than one matches the same message with `!automation priority`.",
            "See (or clear) how often each rule has triggered with `!automation stats` / `!automation resetstats`.",
          ],
        },
        { type: "p", text: "Manage the full list with `!automation list [category]`, inspect one with `!automation view <automation_id>`, duplicate one with `!automation clone`, and toggle individual rules on or off with `!automation enable` / `!automation disable` without deleting them." },
      ],
      subsections: [
        {
          id: "auto-reacts-and-auto-responses",
          title: "Auto-reacts & auto-responses (quick version)",
          blocks: [
            { type: "p", text: "For simple one-off cases you don't need the full automation builder:" },
            {
              type: "commands",
              label: "Quick auto-react and auto-response commands",
              commands: [
                { usage: "!reactadd <emoji> <trigger>", description: "React with an emoji whenever the trigger word appears (`!reacts` to list, `!reactdel` to remove)." },
                { usage: "!autorespond <trigger> <response>", description: "Reply with fixed text whenever the trigger appears (`!autoresponses` to list, `!autoresponddel` to remove)." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "custom-commands",
      title: "Custom commands",
      blocks: [
        { type: "p", text: "Create your own server-specific commands under your existing prefix:" },
        {
          type: "commands",
          label: "Custom command management",
          commands: [
            { usage: "!addcmd <name> <response>", description: "Create a custom command." },
            { usage: "!editcmd <name> <response>", description: "Edit a custom command." },
            { usage: "!delcmd <name>", description: "Remove a custom command." },
            { usage: "!testcmd <raw_text>", description: "Dry-run how a command body would parse before saving it." },
            { usage: "!listcmds", description: "Browse the custom commands that are already set up." },
            { usage: "!viewcmd <name>", description: "View one custom command." },
          ],
        },
      ],
    },
    {
      id: "automod",
      title: "AutoMod (spam & word filtering)",
      blocks: [
        { type: "callout", tone: "info", title: "AutoMod lives under Moderation", text: "It handles blocked words, per-category punishment escalation and strike tracking, separate from the trigger-based automations on this page. See [AutoMod commands](/docs/moderation#automod)." },
      ],
    },
  ],
  reference: {
    groups: [
      {
        id: "automation-rules",
        title: "Automation rules",
        commands: [
          { usage: "!automation", aliases: ["automations", "am"] },
          { usage: "!automation addreaction <name> <data>", aliases: ["addreact", "createreaction"] },
          { usage: "!automation addresponse <name> <data>", aliases: ["createresponse", "addauto"] },
          { usage: "!automation chance <automation_id> <chance>" },
          { usage: "!automation clear [category]" },
          { usage: "!automation clone <automation_id> <new_name>" },
          { usage: "!automation cooldown <automation_id> <seconds>" },
          { usage: "!automation delete <automation_id>", aliases: ["remove", "del"] },
          { usage: "!automation deleteafter <automation_id> <seconds>", aliases: ["autodelete"] },
          { usage: "!automation disable <automation_id>" },
          { usage: "!automation enable <automation_id>" },
          { usage: "!automation filters" },
          { usage: "!automation list [category]", aliases: ["ls"] },
          { usage: "!automation match <automation_id> <match_type>" },
          { usage: "!automation priority <automation_id> <priority>" },
          { usage: "!automation reply <automation_id> <state>" },
          { usage: "!automation resetstats" },
          { usage: "!automation stats" },
          { usage: "!automation view <automation_id>", aliases: ["info", "show"] },
          { usage: "!automationsetup", description: "Open the automation settings panel with toggle buttons.", aliases: ["autosetup", "amsettings"] },
          { usage: "!autorespond <trigger> <response>", aliases: ["auto", "respond"] },
          { usage: "!autoresponddel <trigger>", aliases: ["delauto", "removeresponse"] },
          { usage: "!autoresponses", aliases: ["autolist"] },
          { usage: "!filters blockchannels <automation_id> <action> <channels>" },
          { usage: "!filters blockroles <automation_id> <action> <roles>" },
          { usage: "!filters blockusers <automation_id> <action> <users>" },
          { usage: "!filters channels <automation_id> <action> <channels>" },
          { usage: "!filters roles <automation_id> <action> <roles>" },
          { usage: "!filters users <automation_id> <action> <users>" },
          { usage: "!reactadd <emoji> <trigger>", aliases: ["ar", "react"] },
          { usage: "!reactdel <trigger>", aliases: ["reactremove", "delreact"] },
          { usage: "!reacts", aliases: ["reactlist"] },
        ],
      },
      {
        id: "custom-commands-reference",
        title: "Custom commands",
        commands: [
          { usage: "!addcmd <name> <response>", description: "Create a custom script command.", aliases: ["addscript", "scriptadd"] },
          { usage: "!delcmd <name>", description: "Delete a custom command.", aliases: ["delscript", "removecmd"] },
          { usage: "!editcmd <name> <response>", description: "Edit an existing custom command.", aliases: ["editscript", "setcmd"] },
          { usage: "!listcmds", description: "List all custom commands in this server.", aliases: ["listscripts", "cmds"] },
          { usage: "!testcmd <raw_text>", description: "Test how a custom command parses.", aliases: ["testscript"] },
          { usage: "!viewcmd <name>", description: "View a custom command's response.", aliases: ["viewscript", "cmdinfo"] },
        ],
      },
    ],
  },
};
