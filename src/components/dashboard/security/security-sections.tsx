import { Gauge, Scale, ShieldCheck } from "lucide-react";

import { Callout } from "@/components/ui/callout";
import { Skeleton } from "@/components/ui/skeleton";

/*
 * Static copy and building blocks shared by the loading skeleton and the
 * loaded editor, so both render the same section frames (no layout shift
 * when the config arrives).
 */

export const MASTER_SECTION = {
  icon: ShieldCheck,
  title: "Anti-nuke",
  description:
    "Watches your audit log for mass bans, kicks and deletions — the signs of a compromised staff account or a rogue bot — and stops whoever is responsible.",
} as const;

export const LIMITS_SECTION = {
  icon: Gauge,
  title: "Limits",
  description:
    "How many of each action one account can take within a minute before Pleed steps in. Lower limits react sooner; keep them above what your own staff do on a busy day.",
  disabledHint: "Anti-nuke is off, so these limits aren't enforced. Turn it on to change them.",
} as const;

export const PUNISHMENT_SECTION = {
  icon: Scale,
  title: "Punishment",
  description: "What happens to the member or bot that crosses a limit. Trusted admins are never punished.",
  disabledHint: "Anti-nuke is off, so nobody is punished. Turn it on to change this.",
} as const;

/** Body padding for sections whose content isn't a list of SettingRows. */
export const SECTION_BODY = "flex flex-col gap-4 px-5 py-5 md:px-6";

/** From docs/security.html: what anti-nuke needs to be able to act. */
export function PermissionNote() {
  return (
    <Callout tone="neutral" title="Pleed needs View Audit Log">
      Its highest role must also sit above the roles of anyone it may need to punish, or it can&apos;t act in time.
    </Callout>
  );
}

/** Stand-in for a Slider in a SettingRow: same grid, readout, track and range rows (`data-slider` gives it the slider column). */
export function SliderSkeleton() {
  return (
    <div data-slider="" className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
      <span />
      <Skeleton className="h-5 w-32" />
      <div className="col-span-2 flex h-11 items-center pointer-fine:h-8">
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="col-span-2 -mt-1 flex justify-between">
        <Skeleton className="my-0.5 h-3.5 w-10" />
        <Skeleton className="my-0.5 h-3.5 w-14" />
      </div>
    </div>
  );
}

/** Stand-in for one punishment radio card. */
export function OptionCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-surface-1 p-4">
      <Skeleton className="mt-px size-4.5 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/5" />
      </div>
    </div>
  );
}
