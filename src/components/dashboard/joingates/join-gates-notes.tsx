import { ListChecks, MousePointerClick } from "lucide-react";

import { Callout } from "@/components/ui/callout";
import { DEFAULT_PREFIX } from "@/lib/site";

import { listFields, type IdField } from "./join-gates-model";

/** The bot command that sends (or refreshes) the Verify button — from docs/security.html. */
export const PANEL_COMMAND = `${DEFAULT_PREFIX}joingate panel`;

const ID_HELP =
  "Turn on Developer Mode in Discord (User Settings → Advanced), then right-click a channel or role and choose Copy ID. A pasted mention works too.";

/** How to copy a channel or role ID. Top of the Verification card while the gate is on and set up. */
export function IdHelp() {
  return (
    <Callout tone="neutral" icon={MousePointerClick} title="Finding an ID">
      <p>{ID_HELP}</p>
    </Callout>
  );
}

/** The gate is on (in the draft) but can't work yet: say what's missing, plus how to copy IDs. */
export function MissingSetup({ missing }: { missing: readonly IdField[] }) {
  return (
    <Callout tone="warning" title="Finish setup so members can verify">
      <p>Still missing: the {listFields(missing)}.</p>
      <p>{ID_HELP}</p>
    </Callout>
  );
}

/** The gate is on for the server, and the draft turns it off. */
export function TurningOff() {
  return (
    <Callout tone="warning" title="The join gate turns off when you save">
      New members will get in without verifying. Your channel, roles and rules are kept for when you turn it back on.
    </Callout>
  );
}

/** Shown above the cards while nothing has been configured yet (a server Pleed just joined). */
export function GettingStarted() {
  return (
    <Callout tone="brand" icon={ListChecks} title="Set up the join gate in three steps">
      <ol className="flex list-decimal flex-col gap-1 pl-5 marker:text-fg-tertiary">
        <li>
          In Discord, create an unverified role that can only see your verification channel, and a verified role
          that unlocks the rest of the server.
        </li>
        <li>Turn on the verification gate below and paste the channel and role IDs.</li>
        <li>
          Save, then run <code>{PANEL_COMMAND}</code> in Discord to post the Verify button.
        </li>
      </ol>
    </Callout>
  );
}
