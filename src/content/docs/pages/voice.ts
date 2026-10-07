import type { DocsPageContent } from "../types";

// Guides curated from docs/voice.html; the reference is generated from the bot's cogs (see docs/README.md).
export const voice: DocsPageContent = {
  slug: "voice",
  lead: "VoiceMaster gives every member their own temporary, fully controlled voice channel that's created on the fly and cleaned up automatically when it's empty.",
  sections: [
    {
      id: "setting-it-up",
      title: "Setting it up (staff)",
      blocks: [
        {
          type: "steps",
          items: [
            "`!setupvc [category]` creates the trigger channel members join to spawn their own voice channel, optionally inside a specific category.",
            "`!voicemaster category <category>` chooses where new temp channels get created.",
            "`!voicemaster name <template>` sets the default name template for new channels.",
            "`!voicemaster limit <amount>` sets the default member cap for new channels.",
            "`!voicemaster trigger <channel>` points at an existing channel as the trigger instead of creating a new one.",
          ],
        },
      ],
    },
    {
      id: "managing-your-own-channel",
      title: "Managing your own channel (members)",
      blocks: [
        { type: "p", text: "Once you join the trigger channel and get your own voice channel, it's yours to control with the `vc`-prefixed commands:" },
        {
          type: "commands",
          label: "Voice channel owner commands",
          commands: [
            { usage: "!vcrename <name>", description: "Rename your channel." },
            { usage: "!vclimit <amount>", description: "Set the member limit." },
            { usage: "!vcbitrate <kbps>", description: "Set the channel bitrate." },
            { usage: "!vclock", description: "Lock or unlock your channel to new joiners." },
            { usage: "!vchide", description: "Hide or unhide your channel from the channel list." },
            { usage: "!vcpermit <member>", description: "Let a specific member into a locked channel." },
            { usage: "!vcdeny <member>", description: "Deny a specific member." },
            { usage: "!vckick <member>", description: "Kick a member out of your channel." },
            { usage: "!vcmute <member>", description: "Server mute/unmute a member in your channel." },
            { usage: "!vctransfer <member>", description: "Hand channel ownership to someone else." },
            { usage: "!vcclaim", description: "Claim an abandoned temp channel if the owner left." },
            { usage: "!vcinfo", description: "View info about the current temp voice channel." },
          ],
        },
      ],
    },
  ],
  reference: {
    groups: [
      {
        id: "voicemaster",
        title: "VoiceMaster (temp channels)",
        commands: [
          { usage: "!setupvc [category]", description: "Setup the VoiceMaster trigger channel." },
          { usage: "!vcbitrate <kbps>", description: "Set the bitrate for your private voice channel." },
          { usage: "!vcclaim", description: "Claim an abandoned temp voice channel." },
          { usage: "!vcdeny <member>", description: "Deny a user from your voice channel." },
          { usage: "!vchide", description: "Hide your private voice channel." },
          { usage: "!vcinfo", description: "Show info about your current temp voice channel." },
          { usage: "!vckick <member>", description: "Kick a member from your voice channel." },
          { usage: "!vclimit <amount>", description: "Set the user limit for your private voice channel." },
          { usage: "!vclock", description: "Lock your private voice channel." },
          { usage: "!vcmute <member>", description: "Server mute a member in your voice channel." },
          { usage: "!vcpermit <member>", description: "Permit a user to join your locked voice channel." },
          { usage: "!vcrename <name>", description: "Rename your private voice channel." },
          { usage: "!vctransfer <member>", description: "Transfer your voice channel ownership." },
          { usage: "!vcunhide", description: "Unhide your private voice channel." },
          { usage: "!vcunlock", description: "Unlock your private voice channel." },
          { usage: "!vcunmute <member>", description: "Server unmute a member in your voice channel." },
          { usage: "!voicemaster", description: "Configure VoiceMaster." },
          { usage: "!voicemaster category <category>", description: "Set the category for created channels." },
          { usage: "!voicemaster limit <amount>", description: "Set the default user limit for created channels." },
          { usage: "!voicemaster name <template>", description: "Set the default channel name template." },
          { usage: "!voicemaster trigger <channel>", description: "Set the trigger channel manually." },
        ],
      },
    ],
  },
};
