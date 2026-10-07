import type { DocsPageContent } from "../types";

export const tickets: DocsPageContent = {
  slug: "tickets",
  lead: "A full support-ticket system: panels members click to open a ticket, staff claiming, blacklists and transcript-friendly channel naming.",
  sections: [
    {
      id: "setting-up-your-first-panel",
      title: "Setting up your first panel",
      blocks: [
        {
          type: "steps",
          items: [
            "Run `!setupticket` and follow the interactive wizard — it asks for a channel to post the panel in and the categories/options members can choose from.",
            "Use `!panels` any time to see every panel configured in the server, and `!editpanel <panel_id>` to change options after the fact.",
            "Remove a panel entirely with `!ticketdeletepanel <panel_id>`.",
          ],
        },
      ],
    },
    {
      id: "working-a-ticket",
      title: "Working a ticket",
      blocks: [
        { type: "p", text: "Once a member opens a ticket, staff typically use:" },
        {
          type: "commands",
          label: "Commands for working a ticket",
          commands: [
            {
              usage: "!claim",
              description: "Take ownership of the ticket so other staff know it's being handled (`!unclaim` to release it).",
            },
            { usage: "!tadd <member>", description: "Add a participant to the ticket channel (`!tremove <member>` removes one)." },
            { usage: "!rename <new_name>", description: "Rename the ticket channel." },
            { usage: "!tinfo", description: "Show ticket metadata (opener, claim status, age)." },
            { usage: "!close [reason]", description: "Close out the ticket." },
          ],
        },
      ],
    },
    {
      id: "keeping-tickets-under-control",
      title: "Keeping tickets under control",
      blocks: [
        {
          type: "p",
          text: "Block repeat troublemakers from opening new tickets with `!tblacklist <target>` (accepts a user or a role) and lift it later with `!tunblacklist <target>`.",
        },
      ],
    },
  ],
  reference: {
    groups: [
      {
        id: "ticket-commands",
        title: "Tickets",
        commands: [
          { usage: "!claim", description: "Claim the current ticket." },
          { usage: "!close [reason]", description: "Close the current ticket." },
          {
            usage: "!editpanel <panel_id>",
            description: "Interactive wizard to edit an existing ticket panel, its options, support roles, and settings.",
            aliases: ["editpanels"],
          },
          { usage: "!panels", description: "List all ticket panels for this server." },
          { usage: "!rename <new_name>", description: "Rename the current ticket channel." },
          { usage: "!setupticket", description: "Interactive ticket system setup wizard.", aliases: ["ticketsetup"] },
          { usage: "!tadd <member>", description: "Add a user to the current ticket." },
          { usage: "!tblacklist <target>", description: "Blacklist a user or role from opening tickets. Mention a user or role." },
          { usage: "!ticketdeletepanel <panel_id>", description: "Delete a ticket panel and its options." },
          { usage: "!tinfo", description: "Show info about the current ticket." },
          { usage: "!tremove <member>", description: "Remove a user from the current ticket." },
          { usage: "!tunblacklist <target>", description: "Remove a user or role from the ticket blacklist." },
          { usage: "!unclaim", description: "Unclaim the current ticket." },
        ],
      },
    ],
  },
};
