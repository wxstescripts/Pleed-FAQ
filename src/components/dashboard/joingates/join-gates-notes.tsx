import { ListChecks, MousePointerClick } from "lucide-react";
import type { ReactNode } from "react";

import { Callout } from "@/components/ui/callout";
import { DEFAULT_PREFIX } from "@/lib/site";

import { listFields, type IdField } from "./join-gates-model";

/** The bot command that posts (or refreshes) the Verify button — from docs/security.html. */
export const PANEL_COMMAND = `${DEFAULT_PREFIX}joingate panel`;

const ID_STEPS =
  "Turn on Developer Mode in Discord (User Settings → Advanced), then right-click a channel or role and choose Copy ID. A pasted mention works too.";

/** Inline command / code inside a setting description; dims with its row when the section is off. */
export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-xs border border-line bg-inset px-1 type-code whitespace-nowrap text-fg-secondary group-data-disabled/row:text-fg-disabled">
      {children}
    </code>
  );
}

/**
 * Top of the Verification card while the gate is on: how to copy an ID, or —
 * when a required ID is still empty — what's missing plus the same help.
 */
export function VerificationNote({ missing }: { missing: readonly IdField[] }) {
  if (missing.length > 0) {
    return (
      <Callout tone="warning" title="Finish setup so members can verify">
        <p>
          Still missing: the {listFields(missing)}. {ID_STEPS}
        </p>
      </Callout>
    );
  }
  return (
    <Callout tone="neutral" icon={MousePointerClick} title="Finding an ID">
      <p>{ID_STEPS}</p>
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
