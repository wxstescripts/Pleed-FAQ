import { Hourglass, MessagesSquare, ShieldCheck } from "lucide-react";

/*
 * Static copy shared by the loading skeleton and the loaded editor, so both
 * render the same section frames, titles and row labels (nothing jumps when
 * the config arrives). Behaviour described here comes from the Join Gate
 * commands in docs/security.html.
 */

export const GATE_SECTION = {
  icon: ShieldCheck,
  title: "Verification gate",
  description: "New members get the unverified role and can only see the verification channel until they press Verify.",
  switchLabel: "Enable the verification gate",
  disabledHintOff: "The gate is off, so new members get in straight away. Turn it on to edit these settings.",
  disabledHintTurningOff: "Turn the gate back on to edit these settings.",
} as const;

export const SCREENING_SECTION = {
  icon: Hourglass,
  title: "Screening",
  description: "Keep brand-new accounts out and clear away members who never verify.",
  disabledHint: "Turn on the verification gate above to change these settings.",
} as const;

export const MESSAGES_SECTION = {
  icon: MessagesSquare,
  title: "Messages & logs",
  description: "Point new members to verification and keep a record for your staff.",
  disabledHint: "Turn on the verification gate above to change these settings.",
} as const;

export const ROWS = {
  verify_channel_id: {
    label: "Verification channel",
    description: "Where new members press Verify to get in.",
  },
  unverified_role_id: {
    label: "Unverified role",
    description: "Given to every new member until they verify. Let it see the verification channel only.",
  },
  verified_role_id: {
    label: "Verified role",
    description: "Given once a member verifies. It should unlock the rest of your server.",
  },
  bypass_role_id: {
    label: "Bypass role",
    description: "Members with this role skip the join gate.",
  },
  min_account_age_days: {
    label: "Minimum account age",
    /** Read after the label by screen readers: the field's unit is visual only. */
    unit: "in days",
    description: "Accounts younger than this can't verify. Raid waves tend to use brand-new accounts. 0 turns the check off.",
  },
  auto_kick_minutes: {
    label: "Auto-kick unverified members",
    unit: "after this many minutes",
    description: "Kick members who still haven't verified after this long. 0 never kicks.",
  },
  dm_on_join: {
    label: "DM new members",
    description:
      "Pleed sends each new member a direct message telling them how to verify. Members who block DMs from server members won't receive it.",
  },
  log_channel_id: {
    label: "Log channel",
    description: "Pleed posts join gate activity here, separate from your other logs.",
  },
} as const;

/** Body padding for content that isn't a SettingRow (callouts at the top of a card). */
export const SECTION_BODY = "flex flex-col gap-4 px-5 py-4 md:px-6 md:py-5";
